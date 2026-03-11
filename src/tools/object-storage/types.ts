import { z } from "zod";

// --- Shared schemas ---

export const S3_REGIONS = ["fr-par", "nl-ams", "pl-waw"] as const;

export const S3Region = z
	.enum(S3_REGIONS)
	.describe("Scaleway Object Storage region (S3-compatible endpoint)");
export type S3Region = z.infer<typeof S3Region>;

export const StorageClass = z
	.enum(["STANDARD", "ONEZONE_IA", "GLACIER"])
	.describe("S3 storage class");
export type StorageClass = z.infer<typeof StorageClass>;

// --- Bucket schemas ---

export const Bucket = z.object({
	name: z.string().describe("Bucket name"),
	region: S3Region,
	creationDate: z.string().describe("ISO 8601 creation date"),
});
export type Bucket = z.infer<typeof Bucket>;

export const BucketInfo = z.object({
	name: z.string().describe("Bucket name"),
	region: S3Region,
	creationDate: z.string().describe("ISO 8601 creation date"),
	objectCount: z.number().int().nonnegative().describe("Number of objects in bucket"),
	size: z.number().nonnegative().describe("Total bucket size in bytes"),
	versioning: z.enum(["Enabled", "Suspended", "Disabled"]).describe("Versioning status"),
});
export type BucketInfo = z.infer<typeof BucketInfo>;

// --- Object schemas ---

export const S3Object = z.object({
	key: z.string().describe("Object key (path)"),
	size: z.number().nonnegative().describe("Object size in bytes"),
	lastModified: z.string().describe("ISO 8601 last modified date"),
	storageClass: StorageClass.optional().describe("Storage class"),
	etag: z.string().describe("Object ETag"),
});
export type S3Object = z.infer<typeof S3Object>;

export const ObjectInfo = z.object({
	key: z.string().describe("Object key (path)"),
	size: z.number().nonnegative().describe("Object size in bytes"),
	lastModified: z.string().describe("ISO 8601 last modified date"),
	storageClass: StorageClass.optional().describe("Storage class"),
	etag: z.string().describe("Object ETag"),
	contentType: z.string().optional().describe("Content-Type of the object"),
	metadata: z.record(z.string()).optional().describe("User-defined metadata"),
});
export type ObjectInfo = z.infer<typeof ObjectInfo>;

// --- Input schemas for tool parameters ---

export const ListBucketsInput = z.object({
	region: S3Region.optional().describe("Region to list buckets in. Defaults to fr-par"),
});

export const CreateBucketInput = z.object({
	name: z.string().min(3).max(63).describe("Bucket name (3-63 chars, DNS-compatible)"),
	region: S3Region.optional().describe("Region for the bucket. Defaults to fr-par"),
	acl: z
		.enum(["private", "public-read", "public-read-write", "authenticated-read"])
		.optional()
		.describe("Canned ACL for the bucket"),
});

export const DeleteBucketInput = z.object({
	name: z.string().describe("Bucket name to delete"),
	region: S3Region.optional().describe("Region of the bucket. Defaults to fr-par"),
});

export const GetBucketInfoInput = z.object({
	name: z.string().describe("Bucket name"),
	region: S3Region.optional().describe("Region of the bucket. Defaults to fr-par"),
});

export const ListObjectsInput = z.object({
	bucket: z.string().describe("Bucket name"),
	region: S3Region.optional().describe("Region of the bucket. Defaults to fr-par"),
	prefix: z.string().optional().describe("Filter objects by key prefix"),
	delimiter: z.string().optional().describe("Delimiter for grouping (e.g., '/')"),
	maxKeys: z
		.number()
		.int()
		.min(1)
		.max(1000)
		.optional()
		.default(100)
		.describe("Max objects to return"),
	continuationToken: z.string().optional().describe("Token for pagination from previous response"),
});

export const GetObjectInfoInput = z.object({
	bucket: z.string().describe("Bucket name"),
	key: z.string().describe("Object key"),
	region: S3Region.optional().describe("Region of the bucket. Defaults to fr-par"),
});

export const PutObjectInput = z.object({
	bucket: z.string().describe("Bucket name"),
	key: z.string().describe("Object key (path)"),
	region: S3Region.optional().describe("Region of the bucket. Defaults to fr-par"),
	contentType: z.string().optional().describe("Content-Type for the object"),
	contentBase64: z
		.string()
		.optional()
		.describe("Base64-encoded content. For small text/config files only"),
	metadata: z.record(z.string()).optional().describe("User-defined metadata"),
	storageClass: StorageClass.optional().describe("Storage class for the object"),
});

export const DeleteObjectInput = z.object({
	bucket: z.string().describe("Bucket name"),
	key: z.string().describe("Object key to delete"),
	region: S3Region.optional().describe("Region of the bucket. Defaults to fr-par"),
});

// --- Bucket Policy ---

export const BucketPolicy = z.object({
	Version: z.string().describe("Policy version (e.g., '2012-10-17')"),
	Statement: z.array(z.record(z.unknown())).describe("Policy statements"),
});
export type BucketPolicy = z.infer<typeof BucketPolicy>;

export const GetBucketPolicyInput = z.object({
	bucket: z.string().describe("Bucket name"),
	region: S3Region.optional().describe("Region of the bucket. Defaults to fr-par"),
});

export const SetBucketPolicyInput = z.object({
	bucket: z.string().describe("Bucket name"),
	region: S3Region.optional().describe("Region of the bucket. Defaults to fr-par"),
	policy: z.string().describe("JSON policy document as a string"),
});

// --- Lifecycle ---

export const LifecycleRule = z.object({
	ID: z.string().optional().describe("Rule identifier"),
	Status: z.enum(["Enabled", "Disabled"]).describe("Rule status"),
	Prefix: z.string().optional().describe("Key prefix filter"),
	Expiration: z
		.object({
			Days: z.number().int().positive().optional().describe("Expire after N days"),
			Date: z.string().optional().describe("Expire on specific date"),
		})
		.optional()
		.describe("Expiration configuration"),
	Transition: z
		.object({
			Days: z.number().int().positive().optional().describe("Transition after N days"),
			StorageClass: StorageClass.optional().describe("Target storage class"),
		})
		.optional()
		.describe("Transition configuration"),
});
export type LifecycleRule = z.infer<typeof LifecycleRule>;

export const GetBucketLifecycleInput = z.object({
	bucket: z.string().describe("Bucket name"),
	region: S3Region.optional().describe("Region of the bucket. Defaults to fr-par"),
});

export const SetBucketLifecycleInput = z.object({
	bucket: z.string().describe("Bucket name"),
	region: S3Region.optional().describe("Region of the bucket. Defaults to fr-par"),
	rules: z.array(LifecycleRule).min(1).describe("Lifecycle rules to apply"),
});

// --- Versioning ---

export const VersioningStatus = z.enum(["Enabled", "Suspended"]).describe("Versioning status");
export type VersioningStatus = z.infer<typeof VersioningStatus>;

export const GetBucketVersioningInput = z.object({
	bucket: z.string().describe("Bucket name"),
	region: S3Region.optional().describe("Region of the bucket. Defaults to fr-par"),
});

export const SetBucketVersioningInput = z.object({
	bucket: z.string().describe("Bucket name"),
	region: S3Region.optional().describe("Region of the bucket. Defaults to fr-par"),
	status: VersioningStatus.describe("Versioning status to set"),
});
