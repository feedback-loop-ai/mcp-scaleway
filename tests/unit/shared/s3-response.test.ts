/** Protocol: AWS S3 API ListBuckets, ListObjectsV2, GetBucketVersioning and GetBucketLifecycleConfiguration. */
import { describe, expect, it } from "vitest";
import {
	isS3MissingConfiguration,
	parseS3Xml,
	validateS3Response,
} from "../../../src/shared/s3-response.js";
import {
	parseLifecycleXml,
	parseListBucketsXml,
	parseListObjectsV2Xml,
} from "../../../src/tools/object-storage/handlers.js";

const base = "https://s3.fr-par.scw.cloud";
const item =
	"<Contents><ETag>&quot;tag&quot;</ETag><Size>12</Size><LastModified>2026-09-19T12:00:00Z</LastModified><Key>a&amp;b.txt</Key><Future>kept</Future></Contents>";

describe("S3 XML protocol parsing", () => {
	it("rejects missing pagination state and truncated pages without a token", () => {
		for (const body of [
			"<ListBucketResult/>",
			"<ListBucketResult><IsTruncated>true</IsTruncated></ListBucketResult>",
		]) {
			expect(() => parseS3Xml("ListBucketResult", body)).toThrow("invalid_schema");
		}
	});
	it("parses namespace prefixes, arbitrary element order and escaped text without dropping entries", () => {
		const xml = `<?xml version="1.0"?><s3:ListBucketResult xmlns:s3="http://s3.amazonaws.com/doc/2006-03-01/"><s3:Contents><s3:Size>5</s3:Size><s3:ETag>"tag2"</s3:ETag><s3:Key>two.txt</s3:Key><s3:LastModified>2026-09-19T12:00:00Z</s3:LastModified></s3:Contents>${item}<IsTruncated>true</IsTruncated><NextContinuationToken>a&amp;b</NextContinuationToken><FutureResponse>retained</FutureResponse></s3:ListBucketResult>`;
		const result = parseListObjectsV2Xml(xml);
		expect(result.objects.map((entry) => entry.key)).toEqual(["two.txt", "a&b.txt"]);
		expect(result.objects[1]).toMatchObject({ size: 12, etag: "tag", Future: "kept" });
		expect(result.nextContinuationToken).toBe("a&b");
		expect(result).toHaveProperty("FutureResponse", "retained");
	});
	it("preserves unknown bucket fields and missing optional creation dates", () => {
		const result = parseListBucketsXml(
			"<ListAllMyBucketsResult><Buckets><Bucket><Name>sample</Name><Future>kept</Future></Bucket></Buckets></ListAllMyBucketsResult>",
			"fr-par",
		);
		expect(result).toEqual([
			{ name: "sample", region: "fr-par", creationDate: undefined, Future: "kept" },
		]);
		expect(parseListBucketsXml("<ListAllMyBucketsResult/>", "fr-par")).toEqual([]);
	});
	it("preserves all lifecycle transitions and additional rule conditions", () => {
		const result = parseLifecycleXml(
			"<LifecycleConfiguration><Rule><Status>Enabled</Status><Filter><Prefix>logs/</Prefix></Filter><Transition><Days>7</Days><StorageClass>STANDARD_IA</StorageClass></Transition><Transition><Days>30</Days><StorageClass>GLACIER</StorageClass></Transition></Rule></LifecycleConfiguration>",
		);
		expect(result[0].Transitions).toHaveLength(2);
		expect(result[0].Transition).toEqual({ Days: 7, StorageClass: "STANDARD_IA" });
		expect(result[0]).toHaveProperty("Filter", { Prefix: "logs/" });
	});
	it.each([
		"",
		"<ListBucketResult><IsTruncated>false</IsTruncated>",
		"<Other/>",
		"<ListBucketResult/><Other/>",
		'<!DOCTYPE x [<!ENTITY secret SYSTEM "file:///private">]><ListBucketResult/>',
		"<!ENTITY injected 'value'><ListBucketResult/>",
	])("rejects malformed XML, wrong roots and entity declarations", (body) => {
		expect(() => parseS3Xml("ListBucketResult", body)).toThrow("invalid_xml");
	});
	it.each([
		"<ListBucketResult><Contents><Size>1</Size></Contents></ListBucketResult>",
		`<ListBucketResult><IsTruncated>false</IsTruncated>${item.replace("<Size>12</Size>", "<Size>-1</Size>")}</ListBucketResult>`,
		`<ListBucketResult><IsTruncated>false</IsTruncated>${item.replace("2026-09-19T12:00:00Z", "not-a-date")}</ListBucketResult>`,
		"<ListBucketResult><IsTruncated>false</IsTruncated><KeyCount>NaN</KeyCount></ListBucketResult>",
		"<ListBucketResult><IsTruncated>maybe</IsTruncated></ListBucketResult>",
	])("rejects malformed list entries and pagination instead of silently omitting them", (body) => {
		expect(() => parseS3Xml("ListBucketResult", body)).toThrow("invalid_schema");
	});
});

describe("S3 success response boundaries", () => {
	it("validates each documented XML response family", async () => {
		for (const [path, body] of [
			["/", "<ListAllMyBucketsResult><Buckets/></ListAllMyBucketsResult>"],
			[
				"/bucket?list-type=2",
				`<ListBucketResult><IsTruncated>false</IsTruncated>${item}</ListBucketResult>`,
			],
			["/bucket?versioning", "<VersioningConfiguration/>"],
			["/bucket?lifecycle", "<LifecycleConfiguration/>"],
		])
			await expect(
				validateS3Response(new URL(base + path), "GET", new Response(body)),
			).resolves.toBeUndefined();
	});
	it("checks exact statuses and bodyless mutations", async () => {
		for (const [path, method, status] of [
			["/bucket", "PUT", 200],
			["/bucket/object", "PUT", 200],
			["/bucket", "DELETE", 204],
			["/bucket?versioning", "PUT", 200],
			["/bucket?lifecycle", "PUT", 200],
			["/bucket?policy", "PUT", 204],
			["/bucket", "HEAD", 200],
		] as const) {
			await expect(
				validateS3Response(
					new URL(base + path),
					method,
					new Response(null, { status, headers: { etag: "tag" } }),
				),
			).resolves.toBeUndefined();
		}
		await expect(
			validateS3Response(new URL(base), "GET", new Response("", { status: 201 })),
		).rejects.toThrow("unexpected_status");
		await expect(
			validateS3Response(new URL(`${base}/bucket`), "PUT", new Response("unexpected")),
		).rejects.toThrow("invalid_body");
	});
	it("checks object HEAD metadata before numeric defaults can fabricate values", async () => {
		await expect(
			validateS3Response(new URL(`${base}/bucket/key`), "PUT", new Response(null)),
		).rejects.toThrow("invalid_schema");
		const headers = {
			"content-length": "12",
			etag: '"tag"',
			"last-modified": "Sat, 19 Sep 2026 12:00:00 GMT",
		};
		await expect(
			validateS3Response(new URL(`${base}/bucket/key`), "HEAD", new Response(null, { headers })),
		).resolves.toBeUndefined();
		for (const bad of [
			{ ...headers, "content-length": "invalid" },
			{ ...headers, etag: "" },
			{ ...headers, "last-modified": "not-a-date" },
			{ "content-length": "12", etag: '"tag"' },
		])
			await expect(
				validateS3Response(
					new URL(`${base}/bucket/key`),
					"HEAD",
					new Response(null, { headers: bad }),
				),
			).rejects.toThrow("invalid_schema");
	});
	it("validates bucket policy statements and sanitizes malformed JSON", async () => {
		for (const statement of [
			{ Effect: "Allow", Action: "s3:GetObject", Resource: "arn:example" },
			[{ Effect: "Deny", NotAction: ["s3:ListBucket"], NotResource: ["arn:example"] }],
		]) {
			await expect(
				validateS3Response(
					new URL(`${base}/bucket?policy`),
					"GET",
					Response.json({ Version: "2012-10-17", Statement: statement, Future: true }),
				),
			).resolves.toBeUndefined();
		}
		await expect(
			validateS3Response(new URL(`${base}/bucket?policy`), "GET", new Response("private")),
		).rejects.toThrow("invalid_json");
		await expect(
			validateS3Response(
				new URL(`${base}/bucket?policy`),
				"GET",
				Response.json({ private: "value" }),
			),
		).rejects.toThrow("invalid_schema");
	});
});

describe("S3 missing configurations", () => {
	it("accepts only matching documented absence codes", async () => {
		for (const [query, code] of [
			["policy", "NoSuchBucketPolicy"],
			["lifecycle", "NoSuchLifecycleConfiguration"],
		]) {
			expect(
				await isS3MissingConfiguration(
					new URL(`${base}/bucket?${query}`),
					new Response(`<Error><Code>${code}</Code></Error>`, { status: 404 }),
				),
			).toBe(true);
		}
	});
	it("does not treat missing buckets, authorization errors or malformed XML as empty policies", async () => {
		for (const [query, status, body] of [
			["policy", 403, "<Error><Code>NoSuchBucketPolicy</Code></Error>"],
			["", 404, "<Error><Code>NoSuchBucketPolicy</Code></Error>"],
			["policy", 404, "<Error><Code>NoSuchBucket</Code></Error>"],
			["policy", 404, "not-xml"],
			["policy", 404, "<!DOCTYPE Error><Error><Code>NoSuchBucketPolicy</Code></Error>"],
			["policy", 404, "<Other/>"],
			["policy", 404, "<Error><Message>missing code</Message></Error>"],
		] as const)
			expect(
				await isS3MissingConfiguration(
					new URL(`${base}/bucket?${query}`),
					new Response(body, { status }),
				),
			).toBe(false);
	});
});
