# Feature Specification: Scaleway Marketplace MCP Tools

**Feature Branch**: `037-marketplace`
**Created**: 2026-03-11
**Status**: Approved
**Input**: Implement MCP tools for the Scaleway Marketplace API v2 (global image catalog)

## User Scenarios & Testing

### User Story 1 - Image Browsing (Priority: P1)

As an AI agent, I need to list and get marketplace images so that I can discover available OS images and applications for provisioning Scaleway instances.

**Why this priority**: Images are the primary resource of the Marketplace API. Users need to browse and inspect images before creating instances.

**Independent Test**: Can be fully tested by listing images with filters and getting a specific image by ID.

**Acceptance Scenarios**:

1. **Given** valid credentials, **When** I call `scaleway_marketplace_list_images`, **Then** I receive a paginated list of images with total_count
2. **Given** valid credentials and filters (arch, category, includeEol), **When** I call `scaleway_marketplace_list_images`, **Then** I receive only matching images
3. **Given** a valid image UUID, **When** I call `scaleway_marketplace_get_image`, **Then** I receive the full image object with name, description, logo, categories, and label

---

### User Story 2 - Local Image Discovery (Priority: P1)

As an AI agent, I need to list and get local images so that I can find zone-specific image variants and their compatible instance types.

**Why this priority**: Local images map marketplace images to specific zones and architectures, required for instance creation.

**Independent Test**: Can be tested by listing local images with filters and getting a specific local image by ID.

**Acceptance Scenarios**:

1. **Given** valid credentials, **When** I call `scaleway_marketplace_list_local_images`, **Then** I receive a paginated list of local images with total_count
2. **Given** filters (zone, arch, imageId, versionId, imageLabel, type), **When** I call `scaleway_marketplace_list_local_images`, **Then** I receive only matching local images
3. **Given** a valid local image UUID, **When** I call `scaleway_marketplace_get_local_image`, **Then** I receive the local image with compatible commercial types and zone

---

### User Story 3 - Category Browsing (Priority: P2)

As an AI agent, I need to list and get categories so that I can understand how marketplace images are organized.

**Why this priority**: Categories provide organizational context but are not required for image selection.

**Independent Test**: Can be tested by listing categories and getting a specific category by ID.

**Acceptance Scenarios**:

1. **Given** valid credentials, **When** I call `scaleway_marketplace_list_categories`, **Then** I receive a paginated list of categories with total_count
2. **Given** a valid category UUID, **When** I call `scaleway_marketplace_get_category`, **Then** I receive the category with name and description

---

### User Story 4 - Version Management (Priority: P3)

As an AI agent, I need to list and get image versions so that I can find specific releases of marketplace images.

**Why this priority**: Versions are supplementary metadata; most users work with the latest version implicitly.

**Independent Test**: Can be tested by listing versions for a known image and getting a specific version by ID.

**Acceptance Scenarios**:

1. **Given** valid credentials and a parent image UUID, **When** I call `scaleway_marketplace_list_versions`, **Then** I receive a paginated list of versions with total_count
2. **Given** a valid version UUID, **When** I call `scaleway_marketplace_get_version`, **Then** I receive the version with name and timestamps

---

### Edge Cases

- Invalid image UUID (404) returns a `not_found` error type
- Invalid category UUID (404) returns a `not_found` error type
- Missing required `imageId` on `list_versions` returns `invalid_input` error
- Pagination with page > total pages returns empty items array
- `includeEol=true` includes end-of-life images; `false` (default) excludes them
- Unknown `orderBy` value returns a validation error
- Invalid `type` enum value on `list_local_images` returns a validation error

## Requirements

### Functional Requirements

- **FR-001**: System MUST list marketplace images with pagination (page, page_size) and filtering (arch, category, includeEol, orderBy)
- **FR-002**: System MUST get a single marketplace image by UUID
- **FR-003**: System MUST list local images with pagination and filtering (zone, arch, imageId, versionId, imageLabel, type, orderBy)
- **FR-004**: System MUST get a single local image by UUID
- **FR-005**: System MUST list categories with pagination
- **FR-006**: System MUST get a single category by UUID
- **FR-007**: System MUST list versions for a given image UUID with pagination and ordering
- **FR-008**: System MUST get a single version by UUID
- **FR-009**: All tools MUST validate inputs using Zod schemas
- **FR-010**: All Scaleway API errors MUST be mapped to structured MCP error responses
- **FR-011**: All list operations MUST support standard pagination (page, page_size, total_count)

### Key Entities

- **Image**: Marketplace image with id, name, description, logo, categories, label, createdAt, updatedAt, validUntil
- **LocalImage**: Zone-specific image variant with id, compatibleCommercialTypes, arch, zone, label, type
- **Version**: Image release with id, name, createdAt, updatedAt, publishedAt
- **Category**: Image grouping with id, name, description

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 8 MCP tools are registered and callable via the MCP protocol
- **SC-002**: 100% line and branch code coverage across all marketplace tool files
- **SC-003**: All tools map to documented Scaleway Marketplace API v2 endpoints
- **SC-004**: Contract tests validate request/response shapes for every tool
- **SC-005**: Parity matrix includes all Marketplace API operations

## Clarifications

**Resolved decisions from self-clarification:**

- **Locality**: Global API. No region or zone scoping at the API level (local images have a zone field for filtering)
- **Pagination**: Standard Scaleway page/page_size with total_count in responses
- **Auth**: SCW_ACCESS_KEY + SCW_SECRET_KEY (via shared auth module). No project scoping needed
- **Tool naming**: `scaleway_marketplace_{action}_{resource}` pattern (e.g., `scaleway_marketplace_list_images`)
- **Error handling**: Use shared `mapScalewayError` + `formatErrorResponse` from `src/shared/errors.ts`
- **Client**: Use shared `createScalewayClient` from `src/shared/client.ts` with `loadAuthConfig` from `src/shared/auth.ts`
- **Base URL**: `/marketplace/v2` - all endpoints are prefixed with this path
- **Read-only API**: The Marketplace API is read-only; there are no create, update, or delete operations
- **Local image types**: `unknown_type`, `instance_local`, `instance_sbs`
