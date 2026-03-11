# Research: Scaleway Object Storage MCP Tools

**Feature**: 012-object-storage | **Date**: 2026-03-11

## Technology Decisions

### S3-Compatible API (Not Scaleway SDK)

Unlike most Scaleway products that use the Scaleway REST API via `@scaleway/sdk-client`, Object Storage uses an S3-compatible API. The implementation communicates directly with S3 endpoints using standard HTTP fetch, not the SDK client.

Endpoint pattern:
```
https://s3.{region}.scw.cloud
```

Authentication uses custom headers rather than the standard Scaleway API auth:
```typescript
{
  "X-Auth-Token": secretKey,
  "X-Amz-Content-Sha256": "UNSIGNED-PAYLOAD",
  "Authorization": `SCW ${accessKey}:${secretKey}`
}
```

### S3 API Structure

The Scaleway Object Storage API is region-scoped (not zone-scoped like Instances). Supported regions: fr-par, nl-ams, pl-waw.

Key S3 operations used:
- `GET /` - List buckets (ListBuckets)
- `PUT /{bucket}` - Create bucket (CreateBucket)
- `DELETE /{bucket}` - Delete bucket (DeleteBucket)
- `HEAD /{bucket}` - Check bucket exists (HeadBucket)
- `GET /{bucket}?list-type=2` - List objects v2 (ListObjectsV2)
- `HEAD /{bucket}/{key}` - Get object metadata (HeadObject)
- `PUT /{bucket}/{key}` - Upload object (PutObject)
- `DELETE /{bucket}/{key}` - Delete object (DeleteObject)
- `GET /{bucket}?policy` - Get bucket policy (GetBucketPolicy)
- `PUT /{bucket}?policy` - Set bucket policy (PutBucketPolicy)
- `GET /{bucket}?lifecycle` - Get lifecycle config (GetBucketLifecycleConfiguration)
- `PUT /{bucket}?lifecycle` - Set lifecycle config (PutBucketLifecycleConfiguration)
- `GET /{bucket}?versioning` - Get versioning status (GetBucketVersioning)
- `PUT /{bucket}?versioning` - Set versioning status (PutBucketVersioning)

### XML Parsing Approach

S3 responses are XML. Rather than adding an XML parsing library, the implementation uses lightweight regex-based parsers for each response type:
- `parseListBucketsXml` - Extracts `<Bucket>` elements
- `parseListObjectsV2Xml` - Extracts `<Contents>` elements plus pagination tokens
- `parseVersioningXml` - Extracts `<Status>` from versioning response
- `parseKeyCount` - Extracts `<KeyCount>` for object counting
- `parseLifecycleXml` - Extracts `<Rule>` elements with expiration/transition configs
- `buildLifecycleXml` - Builds XML for lifecycle PUT requests

This keeps the server lightweight with zero additional dependencies.

### Pagination

Object listing uses S3-style continuation-token pagination (ListObjectsV2):
- Request: `continuation-token`, `max-keys` (1-1000, default 100)
- Response: `isTruncated`, `nextContinuationToken`, `keyCount`

Bucket listing does not support pagination (returns all buckets).

### Error Handling

All S3 API errors are caught and mapped through the shared `mapScalewayError` + `formatErrorResponse` pipeline. Special cases:
- Bucket policy 404 returns `{ policy: null }` (not an error)
- Lifecycle 404 returns `{ rules: [] }` (not an error)
- All other HTTP errors are mapped to structured MCP error responses

### Object Upload Limitation

Objects are uploaded via base64-encoded content in the MCP tool input. This is suitable for small text/config files only. Large file uploads should use presigned URLs or direct S3 client access (out of scope for MCP tools).

### Storage Classes

Scaleway supports three S3 storage classes:
- **STANDARD** - Default, for frequently accessed data
- **ONEZONE_IA** - Infrequent access, stored in a single AZ (lower cost)
- **GLACIER** - Cold storage for archival (lowest cost, retrieval delays)

### Bucket ACLs

Canned ACLs supported on bucket creation:
- `private` (default)
- `public-read`
- `public-read-write`
- `authenticated-read`
