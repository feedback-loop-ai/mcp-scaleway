# Feature Specification: Scaleway Block Storage MCP Tools

**Feature Branch**: `011-block-storage`
**Created**: 2026-03-11
**Status**: Approved
**Input**: Implement MCP tools for the Scaleway Block Storage API (zoned block volumes and snapshots)

## User Scenarios & Testing

### User Story 1 - Volume CRUD (Priority: P1)

As an AI agent, I need to list, get, create, update, and delete block storage volumes so that I can manage persistent storage for Scaleway instances.

**Why this priority**: Volumes are the core resource of the Block Storage API. Every other resource (snapshots, volume types) exists to support volumes.

**Independent Test**: Can be fully tested by creating a volume, listing it, getting it, updating it, and deleting it.

**Acceptance Scenarios**:

1. **Given** valid credentials and zone, **When** I call `scaleway_block_storage_list_volumes`, **Then** I receive a paginated list of volumes with total_count
2. **Given** a valid volumeId and zone, **When** I call `scaleway_block_storage_get_volume`, **Then** I receive the full volume object
3. **Given** valid parameters (name, fromEmpty or fromSnapshot), **When** I call `scaleway_block_storage_create_volume`, **Then** a new volume is created and returned
4. **Given** a valid volumeId and zone, **When** I call `scaleway_block_storage_update_volume`, **Then** the volume is updated (name, size, perfIops, tags)
5. **Given** a valid volumeId and zone, **When** I call `scaleway_block_storage_delete_volume`, **Then** the volume is deleted

---

### User Story 2 - Snapshot Management (Priority: P2)

As an AI agent, I need to list, get, create, update, and delete block storage snapshots so that I can create and manage point-in-time backups of volumes.

**Why this priority**: Snapshots depend on volumes and provide backup/restore capabilities.

**Independent Test**: Can be tested by creating a snapshot from a volume, listing it, getting it, updating it, and deleting it.

**Acceptance Scenarios**:

1. **Given** valid credentials and zone, **When** I call `scaleway_block_storage_list_snapshots`, **Then** I receive a paginated list of snapshots with total_count
2. **Given** a valid snapshotId and zone, **When** I call `scaleway_block_storage_get_snapshot`, **Then** I receive the full snapshot object
3. **Given** valid parameters (name, volumeId), **When** I call `scaleway_block_storage_create_snapshot`, **Then** a new snapshot is created from the volume
4. **Given** a valid snapshotId and zone, **When** I call `scaleway_block_storage_update_snapshot`, **Then** the snapshot is updated (name, tags)
5. **Given** a valid snapshotId and zone, **When** I call `scaleway_block_storage_delete_snapshot`, **Then** the snapshot is deleted

---

### User Story 3 - Volume Type Discovery (Priority: P3)

As an AI agent, I need to list available block storage volume types so that I can choose the right storage tier when creating volumes.

**Why this priority**: Volume types are read-only reference data used to inform volume creation decisions.

**Independent Test**: Can be tested by listing volume types and verifying the response contains type specifications.

**Acceptance Scenarios**:

1. **Given** valid credentials and zone, **When** I call `scaleway_block_storage_list_volume_types`, **Then** I receive a paginated list of volume types with pricing and specs

---

### Edge Cases

- Invalid zone format (e.g., "invalid-zone") returns a structured validation error
- Volume not found (404) returns a `not_found` error type
- Snapshot of a non-existent volume returns a structured error
- Missing required fields (e.g., no name on create) returns `invalid_input` error
- Attempting to shrink a volume (size decrease) returns appropriate error
- Pagination with page > total pages returns empty items array
- Volume in use cannot be deleted; returns structured error

## Requirements

### Functional Requirements

- **FR-001**: System MUST list volumes with pagination (page, pageSize) and filtering (name, projectId, status)
- **FR-002**: System MUST get a single volume by volumeId and zone
- **FR-003**: System MUST create a volume from empty (with size) or from a snapshot
- **FR-004**: System MUST update a volume (name, size, perfIops, tags)
- **FR-005**: System MUST delete a volume by volumeId and zone
- **FR-006**: System MUST list snapshots with pagination and filtering (name, projectId, volumeId, status)
- **FR-007**: System MUST get a single snapshot by snapshotId and zone
- **FR-008**: System MUST create a snapshot from a volume with name and tags
- **FR-009**: System MUST update a snapshot (name, tags)
- **FR-010**: System MUST delete a snapshot by snapshotId and zone
- **FR-011**: System MUST list available volume types with pricing and specs
- **FR-012**: All tools MUST validate inputs using Zod schemas
- **FR-013**: All Scaleway API errors MUST be mapped to structured MCP error responses
- **FR-014**: All list operations MUST support standard pagination (page, pageSize, total_count)
- **FR-015**: All tools MUST accept a zone parameter (zoned API locality)

### Key Entities

- **Volume**: Block storage volume with id, name, type (b_ssd, sbs_5k, sbs_15k), size, zone, status, specs (perfIops, class), projectId, tags, parentSnapshotId, createdAt, updatedAt
- **Snapshot**: Volume backup with id, name, volumeId, size, zone, status, projectId, tags, class (standard, instant), parentVolume, createdAt, updatedAt
- **VolumeTypeInfo**: Storage tier with name, pricing (pricePerHour), snapshotPricing, specs (minSize, maxSize, minIops, maxIops)

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 11 MCP tools are registered and callable via the MCP protocol
- **SC-002**: 100% line and branch code coverage across all block storage tool files
- **SC-003**: All tools map to documented Scaleway Block Storage API endpoints
- **SC-004**: Contract tests validate request/response shapes for every tool
- **SC-005**: Parity matrix includes all Block Storage API operations

## Clarifications

**Resolved decisions from self-clarification:**

- **API version**: `block/v1alpha1` (alpha API)
- **Locality**: Zoned API. Supported zones: fr-par-1, fr-par-2, fr-par-3, nl-ams-1, nl-ams-2, pl-waw-1, pl-waw-2, pl-waw-3
- **Pagination**: Standard Scaleway page/pageSize with total_count in responses
- **Auth**: SCW_ACCESS_KEY + SCW_SECRET_KEY + SCW_DEFAULT_PROJECT_ID (via shared auth module)
- **Tool naming**: `scaleway_block_storage_{action}_{resource}` pattern (e.g., `scaleway_block_storage_list_volumes`)
- **Error handling**: Use shared `mapScalewayError` + `formatErrorResponse` from `src/shared/errors.ts`
- **Client**: Use shared `createScalewayClient` from `src/shared/client.ts` with `loadAuthConfig` from `src/shared/auth.ts`
- **Volume creation**: Supports two modes -- fromEmpty (new blank volume with size) or fromSnapshot (clone from snapshot)
- **Volume types**: b_ssd, sbs_5k (5000 IOPS), sbs_15k (15000 IOPS)
- **Snapshot classes**: standard, instant
- **Volume statuses**: unknown_status, creating, available, in_use, deleting, deleted, resizing, error, snapshotting, locked
