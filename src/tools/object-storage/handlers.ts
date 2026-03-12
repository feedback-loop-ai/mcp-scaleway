import { loadAuthConfig } from "../../shared/auth.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { signS3Request } from "../../shared/s3-signer.js";
import type {
	CreateBucketInput,
	DeleteBucketInput,
	DeleteObjectInput,
	GetBucketInfoInput,
	GetBucketLifecycleInput,
	GetBucketPolicyInput,
	GetBucketVersioningInput,
	GetObjectInfoInput,
	ListBucketsInput,
	ListObjectsInput,
	PutObjectInput,
	SetBucketLifecycleInput,
	SetBucketPolicyInput,
	SetBucketVersioningInput,
} from "./types.js";

function buildEndpoint(region: string): string {
	return `https://s3.${region}.scw.cloud`;
}

function buildSignedHeaders(params: {
	method: string;
	url: string;
	accessKey: string;
	secretKey: string;
	region: string;
	extraHeaders?: Record<string, string>;
	body?: string | Buffer;
}): Record<string, string> {
	return signS3Request({
		method: params.method,
		url: params.url,
		headers: params.extraHeaders ?? {},
		body: params.body,
		accessKey: params.accessKey,
		secretKey: params.secretKey,
		region: params.region,
	});
}

interface ToolResponse {
	[key: string]: unknown;
	content: Array<{ type: "text"; text: string }>;
	isError?: boolean;
}

function formatSuccess(data: unknown): ToolResponse {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

export async function handleListBuckets(input: {
	region?: string;
}): Promise<ToolResponse> {
	try {
		const config = loadAuthConfig();
		const region = input.region ?? config.defaultRegion;
		const url = buildEndpoint(region);
		const headers = buildSignedHeaders({
			method: "GET",
			url,
			accessKey: config.accessKey,
			secretKey: config.secretKey,
			region,
		});

		const response = await fetch(url, { method: "GET", headers });

		if (!response.ok) {
			const errText = await response.text();
			return formatErrorResponse(
				mapScalewayError(Object.assign(new Error(errText), { statusCode: response.status })),
			);
		}

		const xml = await response.text();
		const buckets = parseListBucketsXml(xml, region);
		return formatSuccess({ buckets });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateBucket(input: {
	name: string;
	region?: string;
	acl?: string;
}): Promise<ToolResponse> {
	try {
		const config = loadAuthConfig();
		const region = input.region ?? config.defaultRegion;
		const url = `${buildEndpoint(region)}/${input.name}`;
		const extraHeaders: Record<string, string> = {};
		if (input.acl) {
			extraHeaders["x-amz-acl"] = input.acl;
		}
		const headers = buildSignedHeaders({
			method: "PUT",
			url,
			accessKey: config.accessKey,
			secretKey: config.secretKey,
			region,
			extraHeaders,
		});

		const response = await fetch(url, {
			method: "PUT",
			headers,
		});

		if (!response.ok) {
			const errText = await response.text();
			return formatErrorResponse(
				mapScalewayError(Object.assign(new Error(errText), { statusCode: response.status })),
			);
		}

		return formatSuccess({ message: `Bucket '${input.name}' created in ${region}` });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteBucket(input: {
	name: string;
	region?: string;
}): Promise<ToolResponse> {
	try {
		const config = loadAuthConfig();
		const region = input.region ?? config.defaultRegion;
		const url = `${buildEndpoint(region)}/${input.name}`;
		const headers = buildSignedHeaders({
			method: "DELETE",
			url,
			accessKey: config.accessKey,
			secretKey: config.secretKey,
			region,
		});

		const response = await fetch(url, {
			method: "DELETE",
			headers,
		});

		if (!response.ok) {
			const errText = await response.text();
			return formatErrorResponse(
				mapScalewayError(Object.assign(new Error(errText), { statusCode: response.status })),
			);
		}

		return formatSuccess({ message: `Bucket '${input.name}' deleted` });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetBucketInfo(input: {
	name: string;
	region?: string;
}): Promise<ToolResponse> {
	try {
		const config = loadAuthConfig();
		const region = input.region ?? config.defaultRegion;
		const baseUrl = `${buildEndpoint(region)}/${input.name}`;

		// HEAD bucket for existence + get versioning and object count via list
		const headHeaders = buildSignedHeaders({
			method: "HEAD",
			url: baseUrl,
			accessKey: config.accessKey,
			secretKey: config.secretKey,
			region,
		});
		const headResponse = await fetch(baseUrl, {
			method: "HEAD",
			headers: headHeaders,
		});

		if (!headResponse.ok) {
			const errText = "Bucket not found or access denied";
			return formatErrorResponse(
				mapScalewayError(Object.assign(new Error(errText), { statusCode: headResponse.status })),
			);
		}

		// Get versioning status
		const versioningUrl = `${baseUrl}?versioning`;
		const versioningHeaders = buildSignedHeaders({
			method: "GET",
			url: versioningUrl,
			accessKey: config.accessKey,
			secretKey: config.secretKey,
			region,
		});
		const versioningResponse = await fetch(versioningUrl, {
			method: "GET",
			headers: versioningHeaders,
		});
		const versioningXml = versioningResponse.ok ? await versioningResponse.text() : "";
		const versioning = parseVersioningXml(versioningXml);

		// Get object count via listing
		const listUrl = `${baseUrl}?list-type=2&max-keys=0`;
		const listHeaders = buildSignedHeaders({
			method: "GET",
			url: listUrl,
			accessKey: config.accessKey,
			secretKey: config.secretKey,
			region,
		});
		const listResponse = await fetch(listUrl, {
			method: "GET",
			headers: listHeaders,
		});
		const listXml = listResponse.ok ? await listResponse.text() : "";
		const objectCount = parseKeyCount(listXml);

		const bucketInfo = {
			name: input.name,
			region,
			creationDate: headResponse.headers.get("date") ?? new Date().toISOString(),
			objectCount,
			size: 0, // S3 API does not expose total size in a single call
			versioning,
		};

		return formatSuccess(bucketInfo);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleListObjects(input: {
	bucket: string;
	region?: string;
	prefix?: string;
	delimiter?: string;
	maxKeys?: number;
	continuationToken?: string;
}): Promise<ToolResponse> {
	try {
		const config = loadAuthConfig();
		const region = input.region ?? config.defaultRegion;

		const params = new URLSearchParams({ "list-type": "2" });
		if (input.prefix) params.set("prefix", input.prefix);
		if (input.delimiter) params.set("delimiter", input.delimiter);
		if (input.maxKeys !== undefined) params.set("max-keys", String(input.maxKeys));
		if (input.continuationToken) params.set("continuation-token", input.continuationToken);

		const url = `${buildEndpoint(region)}/${input.bucket}?${params.toString()}`;
		const headers = buildSignedHeaders({
			method: "GET",
			url,
			accessKey: config.accessKey,
			secretKey: config.secretKey,
			region,
		});

		const response = await fetch(url, {
			method: "GET",
			headers,
		});

		if (!response.ok) {
			const errText = await response.text();
			return formatErrorResponse(
				mapScalewayError(Object.assign(new Error(errText), { statusCode: response.status })),
			);
		}

		const xml = await response.text();
		const result = parseListObjectsV2Xml(xml);
		return formatSuccess(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetObjectInfo(input: {
	bucket: string;
	key: string;
	region?: string;
}): Promise<ToolResponse> {
	try {
		const config = loadAuthConfig();
		const region = input.region ?? config.defaultRegion;
		const url = `${buildEndpoint(region)}/${input.bucket}/${encodeURIComponent(input.key)}`;
		const headers = buildSignedHeaders({
			method: "HEAD",
			url,
			accessKey: config.accessKey,
			secretKey: config.secretKey,
			region,
		});

		const response = await fetch(url, {
			method: "HEAD",
			headers,
		});

		if (!response.ok) {
			const errText = "Object not found or access denied";
			return formatErrorResponse(
				mapScalewayError(Object.assign(new Error(errText), { statusCode: response.status })),
			);
		}

		const objectInfo = {
			key: input.key,
			size: Number(response.headers.get("content-length") ?? 0),
			lastModified: response.headers.get("last-modified") ?? "",
			storageClass: response.headers.get("x-amz-storage-class") ?? undefined,
			etag: (response.headers.get("etag") ?? "").replace(/"/g, ""),
			contentType: response.headers.get("content-type") ?? undefined,
			metadata: extractMetadata(response.headers),
		};

		return formatSuccess(objectInfo);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handlePutObject(input: {
	bucket: string;
	key: string;
	region?: string;
	contentType?: string;
	contentBase64?: string;
	metadata?: Record<string, string>;
	storageClass?: string;
}): Promise<ToolResponse> {
	try {
		const config = loadAuthConfig();
		const region = input.region ?? config.defaultRegion;
		const url = `${buildEndpoint(region)}/${input.bucket}/${encodeURIComponent(input.key)}`;
		const extraHeaders: Record<string, string> = {};

		if (input.contentType) extraHeaders["Content-Type"] = input.contentType;
		if (input.storageClass) extraHeaders["x-amz-storage-class"] = input.storageClass;
		if (input.metadata) {
			for (const [k, v] of Object.entries(input.metadata)) {
				extraHeaders[`x-amz-meta-${k}`] = v;
			}
		}

		const body = input.contentBase64 ? Buffer.from(input.contentBase64, "base64") : undefined;

		const headers = buildSignedHeaders({
			method: "PUT",
			url,
			accessKey: config.accessKey,
			secretKey: config.secretKey,
			region,
			extraHeaders,
			body,
		});

		const response = await fetch(url, {
			method: "PUT",
			headers,
			body,
		});

		if (!response.ok) {
			const errText = await response.text();
			return formatErrorResponse(
				mapScalewayError(Object.assign(new Error(errText), { statusCode: response.status })),
			);
		}

		const etag = (response.headers.get("etag") ?? "").replace(/"/g, "");
		return formatSuccess({
			message: `Object '${input.key}' uploaded to bucket '${input.bucket}'`,
			etag,
		});
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteObject(input: {
	bucket: string;
	key: string;
	region?: string;
}): Promise<ToolResponse> {
	try {
		const config = loadAuthConfig();
		const region = input.region ?? config.defaultRegion;
		const url = `${buildEndpoint(region)}/${input.bucket}/${encodeURIComponent(input.key)}`;
		const headers = buildSignedHeaders({
			method: "DELETE",
			url,
			accessKey: config.accessKey,
			secretKey: config.secretKey,
			region,
		});

		const response = await fetch(url, {
			method: "DELETE",
			headers,
		});

		if (!response.ok) {
			const errText = await response.text();
			return formatErrorResponse(
				mapScalewayError(Object.assign(new Error(errText), { statusCode: response.status })),
			);
		}

		return formatSuccess({
			message: `Object '${input.key}' deleted from bucket '${input.bucket}'`,
		});
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetBucketPolicy(input: {
	bucket: string;
	region?: string;
}): Promise<ToolResponse> {
	try {
		const config = loadAuthConfig();
		const region = input.region ?? config.defaultRegion;
		const url = `${buildEndpoint(region)}/${input.bucket}?policy`;
		const headers = buildSignedHeaders({
			method: "GET",
			url,
			accessKey: config.accessKey,
			secretKey: config.secretKey,
			region,
		});

		const response = await fetch(url, {
			method: "GET",
			headers,
		});

		if (!response.ok) {
			if (response.status === 404) {
				return formatSuccess({ policy: null, message: "No bucket policy set" });
			}
			const errText = await response.text();
			return formatErrorResponse(
				mapScalewayError(Object.assign(new Error(errText), { statusCode: response.status })),
			);
		}

		const policy = await response.json();
		return formatSuccess({ policy });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleSetBucketPolicy(input: {
	bucket: string;
	region?: string;
	policy: string;
}): Promise<ToolResponse> {
	try {
		const config = loadAuthConfig();
		const region = input.region ?? config.defaultRegion;
		const url = `${buildEndpoint(region)}/${input.bucket}?policy`;
		const headers = buildSignedHeaders({
			method: "PUT",
			url,
			accessKey: config.accessKey,
			secretKey: config.secretKey,
			region,
			extraHeaders: { "Content-Type": "application/json" },
			body: input.policy,
		});

		const response = await fetch(url, {
			method: "PUT",
			headers,
			body: input.policy,
		});

		if (!response.ok) {
			const errText = await response.text();
			return formatErrorResponse(
				mapScalewayError(Object.assign(new Error(errText), { statusCode: response.status })),
			);
		}

		return formatSuccess({ message: `Bucket policy set on '${input.bucket}'` });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetBucketLifecycle(input: {
	bucket: string;
	region?: string;
}): Promise<ToolResponse> {
	try {
		const config = loadAuthConfig();
		const region = input.region ?? config.defaultRegion;
		const url = `${buildEndpoint(region)}/${input.bucket}?lifecycle`;
		const headers = buildSignedHeaders({
			method: "GET",
			url,
			accessKey: config.accessKey,
			secretKey: config.secretKey,
			region,
		});

		const response = await fetch(url, {
			method: "GET",
			headers,
		});

		if (!response.ok) {
			if (response.status === 404) {
				return formatSuccess({ rules: [], message: "No lifecycle configuration set" });
			}
			const errText = await response.text();
			return formatErrorResponse(
				mapScalewayError(Object.assign(new Error(errText), { statusCode: response.status })),
			);
		}

		const xml = await response.text();
		const rules = parseLifecycleXml(xml);
		return formatSuccess({ rules });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleSetBucketLifecycle(input: {
	bucket: string;
	region?: string;
	rules: Array<{
		ID?: string;
		Status: string;
		Prefix?: string;
		Expiration?: { Days?: number; Date?: string };
		Transition?: { Days?: number; StorageClass?: string };
	}>;
}): Promise<ToolResponse> {
	try {
		const config = loadAuthConfig();
		const region = input.region ?? config.defaultRegion;
		const url = `${buildEndpoint(region)}/${input.bucket}?lifecycle`;
		const xml = buildLifecycleXml(input.rules);
		const headers = buildSignedHeaders({
			method: "PUT",
			url,
			accessKey: config.accessKey,
			secretKey: config.secretKey,
			region,
			extraHeaders: { "Content-Type": "application/xml" },
			body: xml,
		});

		const response = await fetch(url, {
			method: "PUT",
			headers,
			body: xml,
		});

		if (!response.ok) {
			const errText = await response.text();
			return formatErrorResponse(
				mapScalewayError(Object.assign(new Error(errText), { statusCode: response.status })),
			);
		}

		return formatSuccess({
			message: `Lifecycle configuration set on '${input.bucket}'`,
		});
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetBucketVersioning(input: {
	bucket: string;
	region?: string;
}): Promise<ToolResponse> {
	try {
		const config = loadAuthConfig();
		const region = input.region ?? config.defaultRegion;
		const url = `${buildEndpoint(region)}/${input.bucket}?versioning`;
		const headers = buildSignedHeaders({
			method: "GET",
			url,
			accessKey: config.accessKey,
			secretKey: config.secretKey,
			region,
		});

		const response = await fetch(url, {
			method: "GET",
			headers,
		});

		if (!response.ok) {
			const errText = await response.text();
			return formatErrorResponse(
				mapScalewayError(Object.assign(new Error(errText), { statusCode: response.status })),
			);
		}

		const xml = await response.text();
		const status = parseVersioningXml(xml);
		return formatSuccess({ bucket: input.bucket, versioning: status });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleSetBucketVersioning(input: {
	bucket: string;
	region?: string;
	status: string;
}): Promise<ToolResponse> {
	try {
		const config = loadAuthConfig();
		const region = input.region ?? config.defaultRegion;
		const url = `${buildEndpoint(region)}/${input.bucket}?versioning`;
		const xml = `<?xml version="1.0" encoding="UTF-8"?><VersioningConfiguration><Status>${input.status}</Status></VersioningConfiguration>`;
		const headers = buildSignedHeaders({
			method: "PUT",
			url,
			accessKey: config.accessKey,
			secretKey: config.secretKey,
			region,
			extraHeaders: { "Content-Type": "application/xml" },
			body: xml,
		});

		const response = await fetch(url, {
			method: "PUT",
			headers,
			body: xml,
		});

		if (!response.ok) {
			const errText = await response.text();
			return formatErrorResponse(
				mapScalewayError(Object.assign(new Error(errText), { statusCode: response.status })),
			);
		}

		return formatSuccess({
			message: `Versioning set to '${input.status}' on bucket '${input.bucket}'`,
		});
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- XML parsing helpers ---

export function parseListBucketsXml(
	xml: string,
	region: string,
): Array<{ name: string; region: string; creationDate: string }> {
	const buckets: Array<{ name: string; region: string; creationDate: string }> = [];
	const bucketRegex = /<Bucket>([\s\S]*?)<\/Bucket>/g;
	let match = bucketRegex.exec(xml);
	while (match) {
		const inner = match[1];
		const name = /<Name>([^<]+)<\/Name>/.exec(inner)?.[1];
		const creationDate = /<CreationDate>([^<]+)<\/CreationDate>/.exec(inner)?.[1];
		if (name) {
			buckets.push({ name, region, creationDate: creationDate ?? "" });
		}
		match = bucketRegex.exec(xml);
	}
	return buckets;
}

export function parseListObjectsV2Xml(xml: string): {
	objects: Array<{
		key: string;
		size: number;
		lastModified: string;
		storageClass: string | undefined;
		etag: string;
	}>;
	isTruncated: boolean;
	nextContinuationToken: string | undefined;
	keyCount: number;
} {
	const objects: Array<{
		key: string;
		size: number;
		lastModified: string;
		storageClass: string | undefined;
		etag: string;
	}> = [];
	const contentRegex =
		/<Contents>\s*<Key>([^<]+)<\/Key>\s*<LastModified>([^<]+)<\/LastModified>\s*<ETag>"?([^<"]+)"?<\/ETag>\s*<Size>(\d+)<\/Size>(?:\s*<StorageClass>([^<]+)<\/StorageClass>)?\s*<\/Contents>/g;
	let match = contentRegex.exec(xml);
	while (match) {
		objects.push({
			key: match[1],
			lastModified: match[2],
			etag: match[3],
			size: Number(match[4]),
			storageClass: match[5] ?? undefined,
		});
		match = contentRegex.exec(xml);
	}

	const isTruncated = /<IsTruncated>true<\/IsTruncated>/i.test(xml);
	const tokenMatch = /<NextContinuationToken>([^<]+)<\/NextContinuationToken>/.exec(xml);
	const keyCountMatch = /<KeyCount>(\d+)<\/KeyCount>/.exec(xml);

	return {
		objects,
		isTruncated,
		nextContinuationToken: tokenMatch?.[1],
		keyCount: keyCountMatch ? Number(keyCountMatch[1]) : objects.length,
	};
}

export function parseVersioningXml(xml: string): "Enabled" | "Suspended" | "Disabled" {
	const statusMatch = /<Status>([^<]+)<\/Status>/.exec(xml);
	if (!statusMatch) return "Disabled";
	const status = statusMatch[1];
	if (status === "Enabled" || status === "Suspended") return status;
	return "Disabled";
}

export function parseKeyCount(xml: string): number {
	const match = /<KeyCount>(\d+)<\/KeyCount>/.exec(xml);
	return match ? Number(match[1]) : 0;
}

export function parseLifecycleXml(xml: string): Array<{
	ID: string | undefined;
	Status: string;
	Prefix: string | undefined;
	Expiration: { Days?: number; Date?: string } | undefined;
	Transition: { Days?: number; StorageClass?: string } | undefined;
}> {
	const rules: Array<{
		ID: string | undefined;
		Status: string;
		Prefix: string | undefined;
		Expiration: { Days?: number; Date?: string } | undefined;
		Transition: { Days?: number; StorageClass?: string } | undefined;
	}> = [];

	const ruleRegex = /<Rule>([\s\S]*?)<\/Rule>/g;
	let ruleMatch = ruleRegex.exec(xml);
	while (ruleMatch) {
		const ruleXml = ruleMatch[1];
		const id = /<ID>([^<]+)<\/ID>/.exec(ruleXml)?.[1];
		const status = /<Status>([^<]+)<\/Status>/.exec(ruleXml)?.[1] ?? "Disabled";
		const prefix = /<Prefix>([^<]*)<\/Prefix>/.exec(ruleXml)?.[1];

		let expiration: { Days?: number; Date?: string } | undefined;
		const expMatch = /<Expiration>([\s\S]*?)<\/Expiration>/.exec(ruleXml);
		if (expMatch) {
			expiration = {};
			const days = /<Days>(\d+)<\/Days>/.exec(expMatch[1]);
			const date = /<Date>([^<]+)<\/Date>/.exec(expMatch[1]);
			if (days) expiration.Days = Number(days[1]);
			if (date) expiration.Date = date[1];
		}

		let transition: { Days?: number; StorageClass?: string } | undefined;
		const transMatch = /<Transition>([\s\S]*?)<\/Transition>/.exec(ruleXml);
		if (transMatch) {
			transition = {};
			const days = /<Days>(\d+)<\/Days>/.exec(transMatch[1]);
			const sc = /<StorageClass>([^<]+)<\/StorageClass>/.exec(transMatch[1]);
			if (days) transition.Days = Number(days[1]);
			if (sc) transition.StorageClass = sc[1];
		}

		rules.push({
			ID: id,
			Status: status,
			Prefix: prefix,
			Expiration: expiration,
			Transition: transition,
		});
		ruleMatch = ruleRegex.exec(xml);
	}

	return rules;
}

export function buildLifecycleXml(
	rules: Array<{
		ID?: string;
		Status: string;
		Prefix?: string;
		Expiration?: { Days?: number; Date?: string };
		Transition?: { Days?: number; StorageClass?: string };
	}>,
): string {
	let xml = '<?xml version="1.0" encoding="UTF-8"?><LifecycleConfiguration>';
	for (const rule of rules) {
		xml += "<Rule>";
		if (rule.ID) xml += `<ID>${rule.ID}</ID>`;
		xml += `<Status>${rule.Status}</Status>`;
		if (rule.Prefix !== undefined) xml += `<Prefix>${rule.Prefix}</Prefix>`;
		if (rule.Expiration) {
			xml += "<Expiration>";
			if (rule.Expiration.Days) xml += `<Days>${rule.Expiration.Days}</Days>`;
			if (rule.Expiration.Date) xml += `<Date>${rule.Expiration.Date}</Date>`;
			xml += "</Expiration>";
		}
		if (rule.Transition) {
			xml += "<Transition>";
			if (rule.Transition.Days) xml += `<Days>${rule.Transition.Days}</Days>`;
			if (rule.Transition.StorageClass)
				xml += `<StorageClass>${rule.Transition.StorageClass}</StorageClass>`;
			xml += "</Transition>";
		}
		xml += "</Rule>";
	}
	xml += "</LifecycleConfiguration>";
	return xml;
}

export function extractMetadata(headers: Headers): Record<string, string> | undefined {
	const metadata: Record<string, string> = {};
	headers.forEach((value, key) => {
		if (key.startsWith("x-amz-meta-")) {
			metadata[key.replace("x-amz-meta-", "")] = value;
		}
	});
	return Object.keys(metadata).length > 0 ? metadata : undefined;
}
