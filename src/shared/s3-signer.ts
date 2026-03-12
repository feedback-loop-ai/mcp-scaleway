import { createHash, createHmac } from "node:crypto";

function hmacSha256(key: Buffer | string, data: string): Buffer {
	return createHmac("sha256", key).update(data, "utf8").digest();
}

function sha256Hex(data: string | Buffer): string {
	return createHash("sha256").update(data).digest("hex");
}

function getSigningKey(secretKey: string, dateStamp: string, region: string): Buffer {
	const kDate = hmacSha256(`AWS4${secretKey}`, dateStamp);
	const kRegion = hmacSha256(kDate, region);
	const kService = hmacSha256(kRegion, "s3");
	return hmacSha256(kService, "aws4_request");
}

export interface S3SignParams {
	method: string;
	url: string;
	headers: Record<string, string>;
	body?: string | Buffer;
	accessKey: string;
	secretKey: string;
	region: string;
}

export function signS3Request(params: S3SignParams): Record<string, string> {
	const { method, url, accessKey, secretKey, region } = params;
	const parsedUrl = new URL(url);
	const now = new Date();
	const dateStamp = now.toISOString().replace(/[-:]/g, "").slice(0, 8);
	const amzDate = `${dateStamp}T${now.toISOString().replace(/[-:]/g, "").slice(9, 15)}Z`;

	const payloadHash = params.body ? sha256Hex(params.body) : sha256Hex("");

	const headers: Record<string, string> = {
		...params.headers,
		host: parsedUrl.host,
		"x-amz-date": amzDate,
		"x-amz-content-sha256": payloadHash,
	};

	// Build canonical headers (sorted, lowercase)
	// Create a lowercase-keyed map for canonical header values
	const lowerHeaders: Record<string, string> = {};
	for (const [k, v] of Object.entries(headers)) {
		lowerHeaders[k.toLowerCase()] = v;
	}
	const sortedHeaderKeys = Object.keys(lowerHeaders).sort();
	const canonicalHeaders = sortedHeaderKeys.map((k) => `${k}:${lowerHeaders[k]}\n`).join("");
	const signedHeaders = sortedHeaderKeys.join(";");

	// Build canonical query string
	const queryParams = [...parsedUrl.searchParams.entries()].sort(([a], [b]) => a.localeCompare(b));
	const canonicalQueryString = queryParams
		.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
		.join("&");

	// Canonical URI - use the pathname (always starts with / for valid URLs)
	const canonicalUri = parsedUrl.pathname;

	const canonicalRequest = [
		method,
		canonicalUri,
		canonicalQueryString,
		canonicalHeaders,
		signedHeaders,
		payloadHash,
	].join("\n");

	const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
	const stringToSign = [
		"AWS4-HMAC-SHA256",
		amzDate,
		credentialScope,
		sha256Hex(canonicalRequest),
	].join("\n");

	const signingKey = getSigningKey(secretKey, dateStamp, region);
	const signature = hmacSha256(signingKey, stringToSign).toString("hex");

	const authorization = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

	return {
		...params.headers,
		host: parsedUrl.host,
		"x-amz-date": amzDate,
		"x-amz-content-sha256": payloadHash,
		Authorization: authorization,
	};
}
