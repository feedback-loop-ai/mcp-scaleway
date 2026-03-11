# Data Model: Scaleway Object Storage MCP Tools

**Feature**: 012-object-storage | **Date**: 2026-03-11

## Entities

### Bucket

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Bucket name (3-63 chars, DNS-compatible) |
| region | enum | yes | S3 region (fr-par, nl-ams, pl-waw) |
| creationDate | string (ISO 8601) | yes | Creation timestamp |

### BucketInfo

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Bucket name |
| region | enum | yes | S3 region |
| creationDate | string (ISO 8601) | yes | Creation timestamp |
| objectCount | number (int, >= 0) | yes | Number of objects in bucket |
| size | number (>= 0) | yes | Total bucket size in bytes |
| versioning | enum | yes | Enabled, Suspended, Disabled |

### S3Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| key | string | yes | Object key (path) |
| size | number (>= 0) | yes | Object size in bytes |
| lastModified | string (ISO 8601) | yes | Last modification timestamp |
| storageClass | enum/undefined | no | STANDARD, ONEZONE_IA, GLACIER |
| etag | string | yes | Object ETag (MD5 hash) |

### ObjectInfo

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| key | string | yes | Object key (path) |
| size | number (>= 0) | yes | Object size in bytes |
| lastModified | string | yes | Last modification timestamp |
| storageClass | enum/undefined | no | STANDARD, ONEZONE_IA, GLACIER |
| etag | string | yes | Object ETag |
| contentType | string/undefined | no | Content-Type of the object |
| metadata | Record<string, string>/undefined | no | User-defined x-amz-meta-* headers |

### BucketPolicy

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Version | string | yes | Policy version (e.g., "2012-10-17") |
| Statement | array of objects | yes | Policy statements |

### LifecycleRule

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| ID | string/undefined | no | Rule identifier |
| Status | enum | yes | Enabled, Disabled |
| Prefix | string/undefined | no | Key prefix filter |
| Expiration | object/undefined | no | Expiration config (Days and/or Date) |
| Expiration.Days | number (int, > 0)/undefined | no | Expire after N days |
| Expiration.Date | string/undefined | no | Expire on specific ISO 8601 date |
| Transition | object/undefined | no | Transition config (Days and/or StorageClass) |
| Transition.Days | number (int, > 0)/undefined | no | Transition after N days |
| Transition.StorageClass | enum/undefined | no | Target storage class |

### VersioningStatus

| Value | Description |
|-------|-------------|
| Enabled | Versioning is active, all object versions are preserved |
| Suspended | Versioning is paused, new objects get null version ID |
| Disabled | Versioning was never enabled (read-only state) |

### StorageClass

| Value | Description |
|-------|-------------|
| STANDARD | Default storage class for frequently accessed data |
| ONEZONE_IA | Infrequent access, single availability zone |
| GLACIER | Cold storage for archival data |

### ListObjectsV2 Response

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| objects | S3Object[] | yes | List of objects matching query |
| isTruncated | boolean | yes | Whether more results are available |
| nextContinuationToken | string/undefined | no | Token for next page (present when isTruncated is true) |
| keyCount | number | yes | Number of keys returned in this response |
