import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	handleCreateBucket,
	handleDeleteBucket,
	handleDeleteObject,
	handleGetBucketInfo,
	handleGetBucketLifecycle,
	handleGetBucketPolicy,
	handleGetBucketVersioning,
	handleGetObjectInfo,
	handleListBuckets,
	handleListObjects,
	handlePutObject,
	handleSetBucketLifecycle,
	handleSetBucketPolicy,
	handleSetBucketVersioning,
} from "./handlers.js";
import {
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

export function registerObjectStorageTools(server: McpServer): void {
	// P1: Bucket management
	server.tool(
		"scaleway_object_storage_list_buckets",
		"List all S3 buckets in a Scaleway region",
		ListBucketsInput.shape,
		async (params) => handleListBuckets(params),
	);

	server.tool(
		"scaleway_object_storage_create_bucket",
		"Create a new S3 bucket in Scaleway Object Storage",
		CreateBucketInput.shape,
		async (params) => handleCreateBucket(params),
	);

	server.tool(
		"scaleway_object_storage_delete_bucket",
		"Delete an S3 bucket (must be empty)",
		DeleteBucketInput.shape,
		async (params) => handleDeleteBucket(params),
	);

	server.tool(
		"scaleway_object_storage_get_bucket_info",
		"Get detailed information about a bucket including versioning and object count",
		GetBucketInfoInput.shape,
		async (params) => handleGetBucketInfo(params),
	);

	// P1: Object operations
	server.tool(
		"scaleway_object_storage_list_objects",
		"List objects in a bucket with optional prefix filtering and pagination",
		ListObjectsInput.shape,
		async (params) => handleListObjects(params),
	);

	server.tool(
		"scaleway_object_storage_get_object_info",
		"Get metadata for a specific object (HEAD request, no content transfer)",
		GetObjectInfoInput.shape,
		async (params) => handleGetObjectInfo(params),
	);

	server.tool(
		"scaleway_object_storage_put_object",
		"Upload a small object (base64-encoded content) or create an empty object placeholder",
		PutObjectInput.shape,
		async (params) => handlePutObject(params),
	);

	server.tool(
		"scaleway_object_storage_delete_object",
		"Delete an object from a bucket",
		DeleteObjectInput.shape,
		async (params) => handleDeleteObject(params),
	);

	// P2: Bucket policies
	server.tool(
		"scaleway_object_storage_get_bucket_policy",
		"Get the bucket policy (JSON) for an S3 bucket",
		GetBucketPolicyInput.shape,
		async (params) => handleGetBucketPolicy(params),
	);

	server.tool(
		"scaleway_object_storage_set_bucket_policy",
		"Set or replace the bucket policy (JSON) on an S3 bucket",
		SetBucketPolicyInput.shape,
		async (params) => handleSetBucketPolicy(params),
	);

	// P3: Lifecycle rules
	server.tool(
		"scaleway_object_storage_get_bucket_lifecycle",
		"Get lifecycle rules configured on a bucket",
		GetBucketLifecycleInput.shape,
		async (params) => handleGetBucketLifecycle(params),
	);

	server.tool(
		"scaleway_object_storage_set_bucket_lifecycle",
		"Set lifecycle rules on a bucket (expiration, transitions)",
		SetBucketLifecycleInput.shape,
		async (params) => handleSetBucketLifecycle(params),
	);

	// P3: Versioning
	server.tool(
		"scaleway_object_storage_get_bucket_versioning",
		"Get the versioning status of a bucket",
		GetBucketVersioningInput.shape,
		async (params) => handleGetBucketVersioning(params),
	);

	server.tool(
		"scaleway_object_storage_set_bucket_versioning",
		"Enable or suspend versioning on a bucket",
		SetBucketVersioningInput.shape,
		async (params) => handleSetBucketVersioning(params),
	);
}
