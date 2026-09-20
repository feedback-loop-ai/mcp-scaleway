import { XMLParser, XMLValidator } from "fast-xml-parser";
import { z } from "zod";
import { UpstreamResponseError } from "./response-validation.js";

const xmlParser = new XMLParser({
	ignoreAttributes: true,
	ignoreDeclaration: true,
	removeNSPrefix: true,
	parseTagValue: false,
	trimValues: false,
	isArray: (name) => ["Bucket", "Contents", "CommonPrefixes", "Rule", "Transition"].includes(name),
});
const unsigned = z
	.string()
	.regex(/^\d+$/)
	.transform(Number)
	.pipe(z.number().int().nonnegative().safe());
const timestamp = z.string().datetime({ offset: true });
const owner = z
	.object({ ID: z.string().optional(), DisplayName: z.string().optional() })
	.passthrough();
const bucket = z
	.object({ Name: z.string().min(1), CreationDate: timestamp.optional() })
	.passthrough();
const object = z
	.object({
		Key: z.string().min(1),
		Size: unsigned,
		LastModified: timestamp,
		ETag: z.string(),
		StorageClass: z.string().optional(),
		Owner: owner.optional(),
	})
	.passthrough();
const expiration = z
	.object({
		Days: unsigned.optional(),
		Date: timestamp.optional(),
		ExpiredObjectDeleteMarker: z.enum(["true", "false"]).optional(),
	})
	.passthrough();
const transition = z
	.object({ Days: unsigned.optional(), Date: timestamp.optional(), StorageClass: z.string() })
	.passthrough();
const rule = z
	.object({
		ID: z.string().optional(),
		Status: z.enum(["Enabled", "Disabled"]),
		Prefix: z.string().optional(),
		Expiration: expiration.optional(),
		Transition: z.array(transition).optional(),
	})
	.passthrough();
function emptyXmlObject<T extends z.ZodTypeAny>(schema: T) {
	return z.preprocess((value) => (value === "" ? {} : value), schema);
}
export const s3XmlSchemas = {
	ListAllMyBucketsResult: emptyXmlObject(
		z
			.object({
				Buckets: emptyXmlObject(
					z.object({ Bucket: z.array(bucket).optional() }).passthrough(),
				).optional(),
				Owner: owner.optional(),
			})
			.passthrough(),
	),
	ListBucketResult: emptyXmlObject(
		z
			.object({
				Name: z.string().optional(),
				Contents: z.array(object).optional(),
				CommonPrefixes: z.array(z.object({ Prefix: z.string() }).passthrough()).optional(),
				IsTruncated: z.enum(["true", "false"]),
				KeyCount: unsigned.optional(),
				MaxKeys: unsigned.optional(),
				NextContinuationToken: z.string().optional(),
			})
			.passthrough()
			.superRefine((value, context) => {
				if (value.IsTruncated === "true" && !value.NextContinuationToken)
					context.addIssue({ code: z.ZodIssueCode.custom, message: "Missing continuation token" });
			}),
	),
	VersioningConfiguration: emptyXmlObject(
		z
			.object({
				Status: z.enum(["Enabled", "Suspended"]).optional(),
				MFADelete: z.enum(["Enabled", "Disabled"]).optional(),
			})
			.passthrough(),
	),
	LifecycleConfiguration: emptyXmlObject(
		z.object({ Rule: z.array(rule).optional() }).passthrough(),
	),
};
export type S3XmlKind = keyof typeof s3XmlSchemas;

/** Only the documented missing-configuration codes mean an empty configuration. */
export async function isS3MissingConfiguration(url: URL, response: Response): Promise<boolean> {
	if (response.status !== 404) return false;
	const expected = url.searchParams.has("policy")
		? "NoSuchBucketPolicy"
		: url.searchParams.has("lifecycle")
			? "NoSuchLifecycleConfiguration"
			: undefined;
	if (!expected) return false;
	const body = await response.clone().text();
	if (/<!DOCTYPE|<!ENTITY/i.test(body) || XMLValidator.validate(body) !== true) return false;
	return xmlParser.parse(body)?.Error?.Code === expected;
}

/** S3 XML is not positional; validate every entry before projecting an MCP result. */
export function parseS3Xml<K extends S3XmlKind>(
	kind: K,
	xml: string,
): z.output<(typeof s3XmlSchemas)[K]> {
	if (/<!DOCTYPE|<!ENTITY/i.test(xml) || XMLValidator.validate(xml) !== true) {
		throw new UpstreamResponseError("invalid_xml");
	}
	const parsed = xmlParser.parse(xml) as Record<string, unknown>;
	if (Object.keys(parsed).length !== 1 || !(kind in parsed))
		throw new UpstreamResponseError("invalid_xml");
	const result = s3XmlSchemas[kind].safeParse(parsed[kind]);
	if (!result.success) throw new UpstreamResponseError("invalid_schema");
	return result.data as z.output<(typeof s3XmlSchemas)[K]>;
}

const policyStatement = z
	.object({
		Effect: z.enum(["Allow", "Deny"]),
		Action: z.union([z.string(), z.array(z.string())]).optional(),
		NotAction: z.union([z.string(), z.array(z.string())]).optional(),
		Resource: z.union([z.string(), z.array(z.string())]).optional(),
		NotResource: z.union([z.string(), z.array(z.string())]).optional(),
	})
	.passthrough();
const policy = z
	.object({
		Version: z.string().optional(),
		Statement: z.union([policyStatement, z.array(policyStatement)]),
	})
	.passthrough();

export async function validateS3Response(
	url: URL,
	method: string,
	response: Response,
): Promise<void> {
	const body = await response.clone().text();
	const expectedStatus =
		method === "DELETE" || (method === "PUT" && url.searchParams.has("policy")) ? 204 : 200;
	if (response.status !== expectedStatus) throw new UpstreamResponseError("unexpected_status");
	if (method !== "GET") {
		if (body !== "") throw new UpstreamResponseError("invalid_body");
		if (method === "PUT" && url.pathname.split("/").length > 2 && !response.headers.get("etag"))
			throw new UpstreamResponseError("invalid_schema");
		if (method === "HEAD" && url.pathname.split("/").length > 2) {
			if (
				!unsigned.safeParse(response.headers.get("content-length")).success ||
				!response.headers.get("etag") ||
				!Number.isFinite(Date.parse(response.headers.get("last-modified") ?? ""))
			) {
				throw new UpstreamResponseError("invalid_schema");
			}
		}
		return;
	}
	if (url.searchParams.has("policy")) {
		let value: unknown;
		try {
			value = JSON.parse(body);
		} catch {
			throw new UpstreamResponseError("invalid_json");
		}
		if (!policy.safeParse(value).success) throw new UpstreamResponseError("invalid_schema");
		return;
	}
	const kind =
		url.pathname === "/"
			? "ListAllMyBucketsResult"
			: url.searchParams.has("versioning")
				? "VersioningConfiguration"
				: url.searchParams.has("lifecycle")
					? "LifecycleConfiguration"
					: "ListBucketResult";
	parseS3Xml(kind, body);
}
