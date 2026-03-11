# Tool Contracts: Scaleway Object Storage MCP Tools

**Feature**: 012-object-storage | **Date**: 2026-03-11

## Bucket Tools

### scaleway_object_storage_list_buckets

**S3 API**: `GET /` (ListBuckets)

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | enum | no | fr-par | S3 region (fr-par, nl-ams, pl-waw) |

**Output**: `{ buckets: Bucket[] }`

---

### scaleway_object_storage_create_bucket

**S3 API**: `PUT /{bucket}` (CreateBucket)

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| name | string | yes | - | Bucket name (3-63 chars, DNS-compatible) |
| region | enum | no | fr-par | S3 region |
| acl | enum | no | - | Canned ACL (private, public-read, public-read-write, authenticated-read) |

**Output**: `{ message: string }`

---

### scaleway_object_storage_delete_bucket

**S3 API**: `DELETE /{bucket}` (DeleteBucket)

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Bucket name to delete |
| region | enum | no | S3 region |

**Output**: `{ message: string }`

---

### scaleway_object_storage_get_bucket_info

**S3 API**: `HEAD /{bucket}` + `GET /{bucket}?versioning` + `GET /{bucket}?list-type=2&max-keys=0` (HeadBucket + GetBucketVersioning + ListObjectsV2)

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Bucket name |
| region | enum | no | S3 region |

**Output**: `{ name, region, creationDate, objectCount, size, versioning }`

---

## Object Tools

### scaleway_object_storage_list_objects

**S3 API**: `GET /{bucket}?list-type=2` (ListObjectsV2)

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| bucket | string | yes | - | Bucket name |
| region | enum | no | fr-par | S3 region |
| prefix | string | no | - | Filter objects by key prefix |
| delimiter | string | no | - | Delimiter for grouping (e.g., "/") |
| maxKeys | number | no | 100 | Max objects to return (1-1000) |
| continuationToken | string | no | - | Pagination token from previous response |

**Output**: `{ objects: S3Object[], isTruncated: boolean, nextContinuationToken?: string, keyCount: number }`

---

### scaleway_object_storage_get_object_info

**S3 API**: `HEAD /{bucket}/{key}` (HeadObject)

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| bucket | string | yes | Bucket name |
| key | string | yes | Object key |
| region | enum | no | S3 region |

**Output**: `{ key, size, lastModified, storageClass?, etag, contentType?, metadata? }`

---

### scaleway_object_storage_put_object

**S3 API**: `PUT /{bucket}/{key}` (PutObject)

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| bucket | string | yes | Bucket name |
| key | string | yes | Object key (path) |
| region | enum | no | S3 region |
| contentType | string | no | Content-Type for the object |
| contentBase64 | string | no | Base64-encoded content (small files only) |
| metadata | Record<string, string> | no | User-defined metadata |
| storageClass | enum | no | STANDARD, ONEZONE_IA, GLACIER |

**Output**: `{ message: string, etag: string }`

---

### scaleway_object_storage_delete_object

**S3 API**: `DELETE /{bucket}/{key}` (DeleteObject)

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| bucket | string | yes | Bucket name |
| key | string | yes | Object key to delete |
| region | enum | no | S3 region |

**Output**: `{ message: string }`

---

## Bucket Policy Tools

### scaleway_object_storage_get_bucket_policy

**S3 API**: `GET /{bucket}?policy` (GetBucketPolicy)

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| bucket | string | yes | Bucket name |
| region | enum | no | S3 region |

**Output**: `{ policy: object | null, message?: string }`

**Note**: Returns `{ policy: null, message: "No bucket policy set" }` when no policy exists (404).

---

### scaleway_object_storage_set_bucket_policy

**S3 API**: `PUT /{bucket}?policy` (PutBucketPolicy)

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| bucket | string | yes | Bucket name |
| region | enum | no | S3 region |
| policy | string | yes | JSON policy document as a string |

**Output**: `{ message: string }`

---

## Lifecycle Tools

### scaleway_object_storage_get_bucket_lifecycle

**S3 API**: `GET /{bucket}?lifecycle` (GetBucketLifecycleConfiguration)

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| bucket | string | yes | Bucket name |
| region | enum | no | S3 region |

**Output**: `{ rules: LifecycleRule[], message?: string }`

**Note**: Returns `{ rules: [], message: "No lifecycle configuration set" }` when no config exists (404).

---

### scaleway_object_storage_set_bucket_lifecycle

**S3 API**: `PUT /{bucket}?lifecycle` (PutBucketLifecycleConfiguration)

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| bucket | string | yes | Bucket name |
| region | enum | no | S3 region |
| rules | LifecycleRule[] | yes | Lifecycle rules to apply (min 1) |

**Output**: `{ message: string }`

---

## Versioning Tools

### scaleway_object_storage_get_bucket_versioning

**S3 API**: `GET /{bucket}?versioning` (GetBucketVersioning)

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| bucket | string | yes | Bucket name |
| region | enum | no | S3 region |

**Output**: `{ bucket: string, versioning: "Enabled" | "Suspended" | "Disabled" }`

---

### scaleway_object_storage_set_bucket_versioning

**S3 API**: `PUT /{bucket}?versioning` (PutBucketVersioning)

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| bucket | string | yes | Bucket name |
| region | enum | no | S3 region |
| status | enum | yes | Enabled, Suspended |

**Output**: `{ message: string }`
