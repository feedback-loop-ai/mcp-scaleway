# Feature Specification: Scaleway Object Storage MCP Tools

**Feature Branch**: `012-object-storage`
**Created**: 2026-03-11
**Status**: Approved
**Input**: Implement MCP tools for Scaleway Object Storage (S3-compatible)

## User Scenarios & Testing

### User Story 1 - Bucket Management (Priority: P1)

As an AI agent, I need to list, create, delete, and inspect S3 buckets so that I can manage object storage infrastructure programmatically.

**Why this priority**: Buckets are the fundamental container for all objects. Every other operation (objects, policies, lifecycle) depends on buckets existing.

**Independent Test**: Can be fully tested by creating a bucket, listing buckets, getting bucket info, and deleting the bucket.

**Acceptance Scenarios**:

1. **Given** valid credentials, **When** I call `scaleway_object_storage_list_buckets`, **Then** I receive a list of buckets with name, region, and creation date
2. **Given** a valid bucket name and region, **When** I call `scaleway_object_storage_create_bucket`, **Then** the bucket is created and a success message is returned
3. **Given** an existing empty bucket name, **When** I call `scaleway_object_storage_delete_bucket`, **Then** the bucket is deleted
4. **Given** an existing bucket name, **When** I call `scaleway_object_storage_get_bucket_info`, **Then** I receive bucket details including versioning status and object count

---

### User Story 2 - Object Operations (Priority: P1)

As an AI agent, I need to list, upload, inspect, and delete objects in buckets so that I can manage stored files programmatically.

**Why this priority**: Objects are the primary data stored in buckets. CRUD operations on objects are the core use case.

**Independent Test**: Can be tested by uploading an object, listing objects, getting object info, and deleting the object.

**Acceptance Scenarios**:

1. **Given** an existing bucket, **When** I call `scaleway_object_storage_list_objects`, **Then** I receive a paginated list of objects with key, size, lastModified, and etag
2. **Given** a bucket and key, **When** I call `scaleway_object_storage_put_object` with base64 content, **Then** the object is uploaded and an etag is returned
3. **Given** a bucket and key, **When** I call `scaleway_object_storage_get_object_info`, **Then** I receive object metadata (size, content-type, etag, custom metadata)
4. **Given** a bucket and key, **When** I call `scaleway_object_storage_delete_object`, **Then** the object is deleted

---

### User Story 3 - Bucket Policies (Priority: P2)

As an AI agent, I need to get and set bucket policies so that I can manage access control on S3 buckets.

**Why this priority**: Policies control who can access bucket contents, essential for production use.

**Independent Test**: Can be tested by setting a policy, getting it, and verifying the JSON matches.

**Acceptance Scenarios**:

1. **Given** an existing bucket, **When** I call `scaleway_object_storage_get_bucket_policy`, **Then** I receive the JSON policy or null if none is set
2. **Given** an existing bucket and a valid JSON policy string, **When** I call `scaleway_object_storage_set_bucket_policy`, **Then** the policy is applied

---

### User Story 4 - Lifecycle & Versioning (Priority: P3)

As an AI agent, I need to manage lifecycle rules and versioning on buckets so that I can automate object expiration and maintain object history.

**Why this priority**: Lifecycle and versioning are advanced features that extend bucket functionality for cost optimization and data protection.

**Independent Test**: Can be tested by enabling versioning, setting lifecycle rules, and reading them back.

**Acceptance Scenarios**:

1. **Given** an existing bucket, **When** I call `scaleway_object_storage_get_bucket_lifecycle`, **Then** I receive the lifecycle rules or an empty array
2. **Given** an existing bucket and lifecycle rules, **When** I call `scaleway_object_storage_set_bucket_lifecycle`, **Then** the rules are applied
3. **Given** an existing bucket, **When** I call `scaleway_object_storage_get_bucket_versioning`, **Then** I receive the versioning status (Enabled, Suspended, Disabled)
4. **Given** an existing bucket and a status, **When** I call `scaleway_object_storage_set_bucket_versioning`, **Then** the versioning status is updated

---

### Edge Cases

- Invalid region (e.g., "us-east-1") returns a structured validation error
- Bucket not found (404) returns a `not_found` error type
- Bucket not empty on delete returns a structured error with actionable message
- Missing required fields (e.g., no bucket name on create) returns `invalid_input` error
- Object not found (404) on HEAD returns appropriate error
- ListObjectsV2 pagination with continuation tokens handled correctly
- Bucket policy 404 returns null policy (not an error)
- Lifecycle 404 returns empty rules array (not an error)

## Requirements

### Functional Requirements

- **FR-001**: System MUST list all buckets in a region
- **FR-002**: System MUST create a bucket with name, region, and optional ACL
- **FR-003**: System MUST delete a bucket by name and region
- **FR-004**: System MUST get bucket info including versioning status and object count
- **FR-005**: System MUST list objects in a bucket with prefix filtering and continuation-token pagination
- **FR-006**: System MUST get object metadata via HEAD request (no content transfer)
- **FR-007**: System MUST upload small objects with base64-encoded content
- **FR-008**: System MUST delete objects by bucket and key
- **FR-009**: System MUST get and set bucket policies (JSON)
- **FR-010**: System MUST get and set lifecycle rules (expiration, transitions)
- **FR-011**: System MUST get and set bucket versioning status
- **FR-012**: All tools MUST validate inputs using Zod schemas
- **FR-013**: All S3 API errors MUST be mapped to structured MCP error responses
- **FR-014**: All tools MUST accept an optional region parameter (defaults to fr-par)

### Key Entities

- **Bucket**: S3 bucket with name, region, creationDate
- **BucketInfo**: Extended bucket info with name, region, creationDate, objectCount, size, versioning
- **S3Object**: Object in a bucket with key, size, lastModified, storageClass, etag
- **ObjectInfo**: Extended object metadata with key, size, lastModified, storageClass, etag, contentType, metadata
- **BucketPolicy**: JSON policy document with Version and Statement array
- **LifecycleRule**: Rule with ID, Status, Prefix, Expiration, Transition
- **VersioningStatus**: Enum of Enabled, Suspended, Disabled

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 14 MCP tools are registered and callable via the MCP protocol
- **SC-002**: 100% line and branch code coverage across all object storage tool files
- **SC-003**: All tools map to documented S3-compatible API operations
- **SC-004**: Contract tests validate request/response shapes for every tool
- **SC-005**: Parity matrix includes all Object Storage API operations

## Clarifications

**Resolved decisions from self-clarification:**

- **Locality**: Regional API. Supported regions: fr-par, nl-ams, pl-waw
- **Pagination**: S3-style continuation-token pagination for ListObjectsV2; no pagination for ListBuckets
- **Auth**: SCW_ACCESS_KEY + SCW_SECRET_KEY (via shared auth module), uses S3-compatible auth headers
- **Tool naming**: `scaleway_object_storage_{action}` pattern (e.g., `scaleway_object_storage_list_buckets`)
- **Error handling**: Use shared `mapScalewayError` + `formatErrorResponse` from `src/shared/errors.ts`
- **Client**: Direct HTTP to S3 endpoints (`s3.{region}.scw.cloud`), not using SDK client
- **Protocol**: S3-compatible API with XML request/response bodies parsed via regex helpers
- **Storage classes**: STANDARD, ONEZONE_IA, GLACIER
- **ACL options**: private, public-read, public-read-write, authenticated-read
- **Versioning states**: Enabled, Suspended (settable); Disabled (read-only default)
