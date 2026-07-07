# Scaleway Object Storage (S3-Compatible) API Reference

Endpoint format: `https://s3.{region}.scw.cloud`

Regions: `fr-par`, `nl-ams`, `pl-waw`

Official references:
- https://www.scaleway.com/en/docs/object-storage/api-cli/using-api-call-list/
- S3 API operations follow the AWS S3 REST API specification (Scaleway is
  S3-compatible).

## Authentication

Object Storage uses the **S3 protocol with AWS Signature Version 4** (not the
`X-Auth-Token` JSON-API scheme). Requests are signed by `src/shared/s3-signer.ts`
using the Scaleway access key / secret key pair:

- `Authorization: AWS4-HMAC-SHA256 Credential=<access_key>/<date>/<region>/s3/aws4_request, SignedHeaders=..., Signature=...`
- `x-amz-date`, `x-amz-content-sha256` headers
- Service name `s3`, region = Scaleway region.

Requests and responses use **XML** (except bucket policy, which is JSON).

## Bucket Operations

### List Buckets — `scaleway_object_storage_list_buckets`
`GET /`
- Response XML: `<ListAllMyBucketsResult><Buckets><Bucket><Name>…</Name>
  <CreationDate>…</CreationDate></Bucket>…</Buckets></ListAllMyBucketsResult>`
- Parsed to `{ buckets: [{ name, region, creationDate }] }`

### Create Bucket — `scaleway_object_storage_create_bucket`
`PUT /{bucket}`
- Optional header: `x-amz-acl` (canned ACL: `private`, `public-read`,
  `public-read-write`, `authenticated-read`)
- Response: 200, empty body

### Delete Bucket — `scaleway_object_storage_delete_bucket`
`DELETE /{bucket}`
- Bucket must be empty. Response: 204

### Get Bucket Info — `scaleway_object_storage_get_bucket_info`
Composite of three S3 calls:
- `HEAD /{bucket}` — existence + `Date` header
- `GET /{bucket}?versioning` — versioning status
- `GET /{bucket}?list-type=2&max-keys=0` — `<KeyCount>` for object count
- Returns `{ name, region, creationDate, objectCount, size, versioning }`
  (`size` is 0 — the S3 API does not expose total bucket size in one call)

## Object Operations

### List Objects — `scaleway_object_storage_list_objects`
`GET /{bucket}?list-type=2`
- Query: `prefix`, `delimiter`, `max-keys` (1–1000), `continuation-token`
- Response XML: `<ListBucketResult>` with `<IsTruncated>`, `<KeyCount>`,
  `<NextContinuationToken>`, and repeated `<Contents><Key><LastModified><ETag>
  <Size><StorageClass></Contents>`
- Parsed to `{ objects: [{ key, size, lastModified, etag, storageClass? }],
  isTruncated, nextContinuationToken?, keyCount }`
- **Pagination: continuation-token based** (not page numbers).

### Get Object Info — `scaleway_object_storage_get_object_info`
`HEAD /{bucket}/{key}`
- Response headers: `Content-Length`, `Last-Modified`, `x-amz-storage-class`,
  `ETag`, `Content-Type`, `x-amz-meta-*`
- Returns `{ key, size, lastModified, storageClass?, etag, contentType?, metadata? }`

### Put Object — `scaleway_object_storage_put_object`
`PUT /{bucket}/{key}`
- Optional headers: `Content-Type`, `x-amz-storage-class`, `x-amz-meta-*`
- Body: raw bytes (from base64-decoded `contentBase64`, or empty)
- Response: `ETag` header

### Delete Object — `scaleway_object_storage_delete_object`
`DELETE /{bucket}/{key}`
- Response: 204

## Bucket Policy (JSON)

### Get Bucket Policy — `scaleway_object_storage_get_bucket_policy`
`GET /{bucket}?policy`
- Response: JSON policy `{ Version, Statement[] }`. 404 → `{ policy: null }`.

### Set Bucket Policy — `scaleway_object_storage_set_bucket_policy`
`PUT /{bucket}?policy`
- Body: JSON policy document (`Content-Type: application/json`)

## Bucket Lifecycle (XML)

### Get Bucket Lifecycle — `scaleway_object_storage_get_bucket_lifecycle`
`GET /{bucket}?lifecycle`
- Response XML: `<LifecycleConfiguration><Rule><ID><Status><Prefix>
  <Expiration><Days|Date></Expiration><Transition><Days><StorageClass>
  </Transition></Rule>…</LifecycleConfiguration>`. 404 → `{ rules: [] }`.

### Set Bucket Lifecycle — `scaleway_object_storage_set_bucket_lifecycle`
`PUT /{bucket}?lifecycle`
- Body: `LifecycleConfiguration` XML (`Content-Type: application/xml`)
- Rule: `{ ID?, Status (Enabled|Disabled), Prefix?, Expiration?: { Days?, Date? },
  Transition?: { Days?, StorageClass? } }`

## Bucket Versioning (XML)

### Get Bucket Versioning — `scaleway_object_storage_get_bucket_versioning`
`GET /{bucket}?versioning`
- Response XML: `<VersioningConfiguration><Status>Enabled|Suspended</Status>
  </VersioningConfiguration>` (absent Status → `Disabled`)

### Set Bucket Versioning — `scaleway_object_storage_set_bucket_versioning`
`PUT /{bucket}?versioning`
- Body: `<VersioningConfiguration><Status>Enabled|Suspended</Status>
  </VersioningConfiguration>` (`Content-Type: application/xml`)

## Storage Classes

Scaleway-supported classes: `STANDARD`, `ONEZONE_IA`, `GLACIER`.
(AWS classes `INTELLIGENT_TIERING`, `DEEP_ARCHIVE` are **not** supported.)

## Error Codes (S3 HTTP status)

- 400: Malformed request / invalid XML
- 403: SignatureDoesNotMatch / AccessDenied (auth failure)
- 404: NoSuchBucket / NoSuchKey / NoSuchLifecycleConfiguration /
  NoSuchBucketPolicy (mapped to empty/`null` results where applicable)
- 409: BucketNotEmpty / BucketAlreadyExists
- 500: InternalError
