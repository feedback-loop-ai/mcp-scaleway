# Feature Specification: Scaleway Managed Database (RDB) MCP Tools

**Feature Branch**: `013-rdb`
**Created**: 2026-03-11
**Status**: Approved
**Input**: Implement MCP tools for the Scaleway Managed Database (RDB) API (regional managed PostgreSQL/MySQL)

## User Scenarios & Testing

### User Story 1 - Instance CRUD & Upgrade (Priority: P1)

As an AI agent, I need to list, get, create, update, delete, and upgrade Managed Database instances so that I can manage database infrastructure programmatically.

**Why this priority**: RDB instances are the core resource. Every other resource (databases, users, backups, endpoints, ACLs, snapshots) exists within or supports an instance.

**Independent Test**: Can be fully tested by creating an instance, listing it, updating it, upgrading it, and deleting it.

**Acceptance Scenarios**:

1. **Given** valid credentials and region, **When** I call `scaleway_rdb_list_instances`, **Then** I receive a paginated list of instances with total_count
2. **Given** a valid instance_id and region, **When** I call `scaleway_rdb_get_instance`, **Then** I receive the full instance object including endpoints, volume, and backup schedule
3. **Given** valid parameters (name, engine, node_type, region), **When** I call `scaleway_rdb_create_instance`, **Then** a new managed database instance is created and returned
4. **Given** a valid instance_id and update fields, **When** I call `scaleway_rdb_update_instance`, **Then** the instance is updated with new name, tags, or backup schedule
5. **Given** a valid instance_id and region, **When** I call `scaleway_rdb_delete_instance`, **Then** the instance is permanently deleted
6. **Given** a valid instance_id and upgrade parameters, **When** I call `scaleway_rdb_upgrade_instance`, **Then** the instance is upgraded (node type, volume, or engine version)

---

### User Story 2 - Database & User Management (Priority: P1)

As an AI agent, I need to manage databases and users within an RDB instance so that I can set up application schemas and access control.

**Why this priority**: Databases and users are required for any application to use the managed database.

**Independent Test**: Can be tested by creating a database and user, listing them, updating the user, and deleting both.

**Acceptance Scenarios**:

1. **Given** a valid instance_id and region, **When** I call `scaleway_rdb_list_databases`, **Then** I receive a paginated list of databases
2. **Given** a valid instance_id and name, **When** I call `scaleway_rdb_create_database`, **Then** a new database is created
3. **Given** a valid instance_id and database name, **When** I call `scaleway_rdb_delete_database`, **Then** the database is deleted
4. **Given** a valid instance_id and region, **When** I call `scaleway_rdb_list_users`, **Then** I receive a paginated list of users
5. **Given** a valid instance_id, name, and password, **When** I call `scaleway_rdb_create_user`, **Then** a new user is created
6. **Given** a valid instance_id and username, **When** I call `scaleway_rdb_update_user`, **Then** the user password or admin status is updated
7. **Given** a valid instance_id and username, **When** I call `scaleway_rdb_delete_user`, **Then** the user is deleted

---

### User Story 3 - Backup & Restore (Priority: P2)

As an AI agent, I need to manage backups so that I can create point-in-time recovery points and restore databases.

**Why this priority**: Backups are essential for data protection but are supplementary to instance/database management.

**Independent Test**: Can be tested by creating a backup, listing backups, and restoring a backup.

**Acceptance Scenarios**:

1. **Given** valid credentials and region, **When** I call `scaleway_rdb_list_backups`, **Then** I receive a paginated list of database backups
2. **Given** a valid instance_id and backup name, **When** I call `scaleway_rdb_create_backup`, **Then** a new backup is created
3. **Given** a valid backup_id and target instance_id, **When** I call `scaleway_rdb_restore_backup`, **Then** the backup is restored to the target instance

---

### User Story 4 - Endpoints & ACL Rules (Priority: P2)

As an AI agent, I need to manage endpoints and ACL rules so that I can control network connectivity and access to database instances.

**Why this priority**: Endpoints and ACLs control how applications connect to databases and are essential for production use.

**Independent Test**: Can be tested by listing endpoints, creating a private network endpoint, managing ACL rules, and deleting the endpoint.

**Acceptance Scenarios**:

1. **Given** a valid instance_id, **When** I call `scaleway_rdb_list_endpoints`, **Then** I receive the list of endpoints for the instance
2. **Given** a valid instance_id and endpoint spec, **When** I call `scaleway_rdb_create_endpoint`, **Then** a new endpoint is created
3. **Given** a valid endpoint_id, **When** I call `scaleway_rdb_delete_endpoint`, **Then** the endpoint is deleted
4. **Given** a valid instance_id, **When** I call `scaleway_rdb_list_acl_rules`, **Then** I receive a paginated list of ACL rules
5. **Given** a valid instance_id and rules, **When** I call `scaleway_rdb_add_acl_rules`, **Then** the ACL rules are added
6. **Given** a valid instance_id and IP ranges, **When** I call `scaleway_rdb_delete_acl_rules`, **Then** the ACL rules are removed

---

### User Story 5 - Snapshots (Priority: P3)

As an AI agent, I need to manage instance snapshots so that I can create full instance copies and restore from them.

**Why this priority**: Snapshots provide full instance-level recovery and cloning, extending backup capabilities.

**Independent Test**: Can be tested by creating a snapshot, listing snapshots, and restoring a snapshot to a new instance.

**Acceptance Scenarios**:

1. **Given** valid credentials and region, **When** I call `scaleway_rdb_list_snapshots`, **Then** I receive a paginated list of snapshots
2. **Given** a valid instance_id and name, **When** I call `scaleway_rdb_create_snapshot`, **Then** a snapshot is created
3. **Given** a valid snapshot_id and instance_name, **When** I call `scaleway_rdb_restore_snapshot`, **Then** a new instance is created from the snapshot

---

### User Story 6 - Reference Data (Priority: P3)

As an AI agent, I need to list available node types and database engines so that I can make informed decisions when creating or upgrading instances.

**Why this priority**: Reference data supports instance creation/upgrade but is not a core CRUD operation.

**Independent Test**: Can be tested by listing node types and database engines.

**Acceptance Scenarios**:

1. **Given** valid credentials and region, **When** I call `scaleway_rdb_list_node_types`, **Then** I receive the list of available node types
2. **Given** valid credentials and region, **When** I call `scaleway_rdb_list_database_engines`, **Then** I receive the list of available engines and versions

---

### Edge Cases

- Invalid region format returns a structured validation error
- Instance not found (404) returns a `not_found` error type
- Quota exceeded returns a structured error with actionable message
- Missing required fields (e.g., no engine on create) returns `invalid_input` error
- Deleting an instance that is already deleting returns appropriate error
- Pagination with page > total pages returns empty items array
- Creating a user with a duplicate name returns a conflict error
- ACL rule with invalid CIDR notation returns validation error

## Requirements

### Functional Requirements

- **FR-001**: System MUST list RDB instances with pagination (page, page_size) and filtering (name, tags, project, order_by)
- **FR-002**: System MUST get a single RDB instance by ID and region
- **FR-003**: System MUST create an RDB instance with name, engine, node_type, and optional HA/volume/backup configuration
- **FR-004**: System MUST update an RDB instance name, tags, and backup schedule settings
- **FR-005**: System MUST delete an RDB instance by ID and region
- **FR-006**: System MUST upgrade an RDB instance node type, volume, or engine version
- **FR-007**: System MUST list, create, and delete databases within an instance
- **FR-008**: System MUST list, create, update, and delete users within an instance
- **FR-009**: System MUST list, create, and restore backups
- **FR-010**: System MUST list, create, and delete endpoints for an instance
- **FR-011**: System MUST list, add, and delete ACL rules for an instance
- **FR-012**: System MUST list, create, and restore snapshots
- **FR-013**: System MUST list available node types and database engines
- **FR-014**: All tools MUST validate inputs using Zod schemas
- **FR-015**: All Scaleway API errors MUST be mapped to structured MCP error responses
- **FR-016**: All list operations MUST support standard pagination (page, page_size, total_count)
- **FR-017**: All tools MUST accept a region parameter (regional API locality)

### Key Entities

- **Instance**: Managed database with id, name, engine, node_type, status, region, project_id, is_ha_cluster, volume, endpoints, backup_schedule, tags, created_at
- **Database**: Logical database with name, owner, managed, size
- **User**: Database user with name, is_admin
- **Backup**: Database backup with id, instance_id, name, status, size, created_at, expires_at, database_name
- **Endpoint**: Connection endpoint with id, ip, port, name
- **ACL Rule**: Network access rule with ip, port, protocol, direction, action, description
- **Snapshot**: Instance snapshot with id, instance_id, name, status, size, created_at, expires_at, node_type
- **NodeType**: Available node type with name, stock_status, vcpus, memory, disabled
- **DatabaseEngine**: Database engine with name, default_version, versions (with settings)

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 26 MCP tools are registered and callable via the MCP protocol
- **SC-002**: 100% line and branch code coverage across all RDB tool files
- **SC-003**: All tools map to documented Scaleway RDB API endpoints
- **SC-004**: Contract tests validate request/response shapes for every tool
- **SC-005**: Parity matrix includes all RDB API operations

## Clarifications

**Resolved decisions from self-clarification:**

- **Locality**: Regional API. Supported regions: fr-par, nl-ams, pl-waw
- **Pagination**: Standard Scaleway page/page_size with total_count in responses
- **Auth**: SCW_ACCESS_KEY + SCW_SECRET_KEY + SCW_DEFAULT_PROJECT_ID (via shared auth module)
- **Tool naming**: `scaleway_rdb_{action}_{resource}` pattern (e.g., `scaleway_rdb_list_instances`)
- **Error handling**: Use shared `mapScalewayError` + `formatErrorResponse` from `src/shared/errors.ts`
- **Client**: Use shared `createScalewayClient` from `src/shared/client.ts` with `loadAuthConfig` from `src/shared/auth.ts`
- **SDK**: Uses `@scaleway/sdk-client` with direct HTTP calls to the RDB API via the client's fetch method
- **Engines**: PostgreSQL and MySQL are the supported database engines
- **Volume types**: lssd (local SSD) and bssd (block SSD)
- **Node types**: db-dev-s, db-play2-pico, and various production node types
- **Endpoints**: Derive from the instance object; support public, private network, and load balancer types
- **ACL rules**: Control network access by IP range (CIDR notation)
- **Snapshots vs Backups**: Backups are database-level (can target a specific database), snapshots are instance-level (full instance copy)
