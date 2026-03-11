# Feature Specification: Scaleway Managed MongoDB MCP Tools

**Feature Branch**: `015-mongodb`
**Created**: 2026-03-11
**Status**: Approved
**Input**: Implement MCP tools for the Scaleway Managed MongoDB API (regional managed database)

## User Scenarios & Testing

### User Story 1 - Instance CRUD (Priority: P1)

As an AI agent, I need to list, get, create, update, and delete MongoDB instances so that I can manage managed database clusters programmatically.

**Why this priority**: Instances are the core resource of the MongoDB API. Every other resource (users, snapshots) exists within or relates to an instance.

**Independent Test**: Can be fully tested by creating an instance, listing it, getting it, updating it, and deleting it.

**Acceptance Scenarios**:

1. **Given** valid credentials and region, **When** I call `scaleway_mongodb_list_instances`, **Then** I receive a paginated list of instances with total_count
2. **Given** a valid instance_id and region, **When** I call `scaleway_mongodb_get_instance`, **Then** I receive the full instance object
3. **Given** valid parameters (name, version, node_type, node_number, user_name, password), **When** I call `scaleway_mongodb_create_instance`, **Then** a new instance is created and returned
4. **Given** a valid instance_id and region, **When** I call `scaleway_mongodb_update_instance`, **Then** the instance name/tags are updated
5. **Given** a valid instance_id and region, **When** I call `scaleway_mongodb_delete_instance`, **Then** the instance is deleted

---

### User Story 2 - User Management (Priority: P2)

As an AI agent, I need to list, create, update, and delete users on a MongoDB instance so that I can manage database access control.

**Why this priority**: Users control authentication and authorization on instances, essential for production use.

**Independent Test**: Can be tested by creating a user, listing users, updating the password, and deleting the user.

**Acceptance Scenarios**:

1. **Given** a valid instance_id and region, **When** I call `scaleway_mongodb_list_users`, **Then** I receive a paginated list of users with total_count
2. **Given** valid parameters (instance_id, name, password), **When** I call `scaleway_mongodb_create_user`, **Then** a new user is created
3. **Given** valid parameters (instance_id, name, password), **When** I call `scaleway_mongodb_update_user`, **Then** the user password is updated
4. **Given** valid parameters (instance_id, name), **When** I call `scaleway_mongodb_delete_user`, **Then** the user is deleted

---

### User Story 3 - Snapshot Management (Priority: P2)

As an AI agent, I need to list, create, restore, and delete snapshots of MongoDB instances so that I can manage backups and disaster recovery.

**Why this priority**: Snapshots provide backup and restore capabilities, critical for data protection.

**Independent Test**: Can be tested by creating a snapshot, listing snapshots, and deleting a snapshot.

**Acceptance Scenarios**:

1. **Given** valid credentials and region, **When** I call `scaleway_mongodb_list_snapshots`, **Then** I receive a paginated list of snapshots with total_count
2. **Given** a valid instance_id and snapshot name, **When** I call `scaleway_mongodb_create_snapshot`, **Then** a snapshot is created
3. **Given** a valid snapshot_id and restore parameters, **When** I call `scaleway_mongodb_restore_snapshot`, **Then** a new instance is created from the snapshot
4. **Given** a valid snapshot_id and region, **When** I call `scaleway_mongodb_delete_snapshot`, **Then** the snapshot is deleted

---

### User Story 4 - Node Types & Versions (Priority: P3)

As an AI agent, I need to list available node types and MongoDB versions so that I can make informed decisions when creating instances.

**Why this priority**: Discovery endpoints that support instance creation decisions.

**Independent Test**: Can be tested by listing node types and versions independently.

**Acceptance Scenarios**:

1. **Given** valid credentials and region, **When** I call `scaleway_mongodb_list_node_types`, **Then** I receive a paginated list of node types
2. **Given** valid credentials and region, **When** I call `scaleway_mongodb_list_versions`, **Then** I receive a paginated list of available MongoDB versions

---

### Edge Cases

- Invalid region format returns a structured validation error
- Instance not found (404) returns a `not_found` error type
- Quota exceeded returns a structured error with actionable message
- Missing required fields (e.g., no node_type on create) returns `invalid_input` error
- Duplicate user creation returns appropriate conflict error
- Pagination with page > total pages returns empty items array
- Empty tag arrays and filter combinations handled correctly
- Snapshot restore with invalid node_type returns validation error

## Requirements

### Functional Requirements

- **FR-001**: System MUST list instances with pagination (page, page_size) and filtering (name, tags, project_id, organization_id, order_by)
- **FR-002**: System MUST get a single instance by ID and region
- **FR-003**: System MUST create an instance with name, version, node_type, node_number, user_name, password, and optional volume config
- **FR-004**: System MUST update an instance name and/or tags
- **FR-005**: System MUST delete an instance by ID and region
- **FR-006**: System MUST list, create, update, and delete users on an instance
- **FR-007**: System MUST list, create, restore, and delete snapshots
- **FR-008**: System MUST list available node types with pagination and optional include_disabled_types filter
- **FR-009**: System MUST list available MongoDB versions with pagination and optional version filter
- **FR-010**: All tools MUST validate inputs using Zod schemas
- **FR-011**: All Scaleway API errors MUST be mapped to structured MCP error responses
- **FR-012**: All list operations MUST support standard pagination (page, page_size, total_count)
- **FR-013**: All tools MUST accept a region parameter (regional API locality)

### Key Entities

- **Instance**: Managed MongoDB cluster with id, name, status, version, node_type, node_number, region, project_id, tags, volume, endpoints, created_at, updated_at
- **User**: Database user with name and password on an instance
- **Snapshot**: Instance backup with id, name, status, instance_id, instance_name, size, expires_at, created_at, updated_at, region
- **NodeType**: Available instance type with name, description, specs (cpu, memory, storage), availability, disabled status
- **Version**: Available MongoDB version string with availability info

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 15 MCP tools are registered and callable via the MCP protocol
- **SC-002**: 100% line and branch code coverage across all MongoDB tool files
- **SC-003**: All tools map to documented Scaleway API endpoints
- **SC-004**: Contract tests validate request/response shapes for every tool
- **SC-005**: Parity matrix includes all MongoDB API operations

## Clarifications

**Resolved decisions from self-clarification:**

- **Locality**: Regional API. Supported regions: fr-par, nl-ams, pl-waw
- **API Version**: v1alpha1 (alpha API)
- **Pagination**: Standard Scaleway page/page_size with total_count in responses
- **Auth**: SCW_ACCESS_KEY + SCW_SECRET_KEY + SCW_DEFAULT_PROJECT_ID (via shared auth module)
- **Tool naming**: `scaleway_mongodb_{action}_{resource}` pattern (e.g., `scaleway_mongodb_list_instances`)
- **Error handling**: Use shared `mapScalewayError` + `formatErrorResponse` from `src/shared/errors.ts`
- **Client**: Use shared `createScalewayClient` from `src/shared/client.ts` with `loadAuthConfig` from `src/shared/auth.ts`
- **Volume types**: sbs_5k and sbs_15k (Scaleway Block Storage)
- **Instance statuses**: unknown_status, ready, provisioning, configuring, deleting, error, initializing, locked, snapshotting
- **Snapshot statuses**: unknown_status, creating, ready, restoring, deleting, error, locked
- **User management**: Users are scoped to instances, identified by name (not UUID)
