# Feature Specification: Scaleway Serverless SQL DB MCP Tools

**Feature Branch**: `010-serverless-sqldb`
**Created**: 2026-03-11
**Status**: Approved
**Input**: Implement MCP tools for the Scaleway Serverless SQL Database API (regional, auto-scaling PostgreSQL)

## User Scenarios & Testing

### User Story 1 - Database CRUD & Scaling (Priority: P1)

As an AI agent, I need to list, get, create, update, and delete Serverless SQL Databases so that I can manage auto-scaling PostgreSQL instances programmatically.

**Why this priority**: Databases are the core resource of the Serverless SQL DB API. Backup operations depend on existing databases.

**Independent Test**: Can be fully tested by creating a database, listing it, getting it, updating CPU limits, and deleting it.

**Acceptance Scenarios**:

1. **Given** valid credentials and region, **When** I call `scaleway_serverless_sqldb_list_databases`, **Then** I receive a paginated list of databases with total_count
2. **Given** a valid database_id and region, **When** I call `scaleway_serverless_sqldb_get_database`, **Then** I receive the full database object
3. **Given** valid parameters (name, cpu_min, cpu_max, region), **When** I call `scaleway_serverless_sqldb_create_database`, **Then** a new database is created and returned
4. **Given** a valid database_id and updated CPU limits, **When** I call `scaleway_serverless_sqldb_update_database`, **Then** the database scaling limits are updated
5. **Given** a valid database_id and region, **When** I call `scaleway_serverless_sqldb_delete_database`, **Then** the database is deleted and returned

---

### User Story 2 - Backup Management (Priority: P2)

As an AI agent, I need to list, get, export, and restore database backups so that I can manage data protection and disaster recovery for Serverless SQL Databases.

**Why this priority**: Backups depend on existing databases and are essential for data safety but secondary to core CRUD.

**Independent Test**: Can be tested by creating a database, listing its backups, getting a specific backup, exporting it, and restoring from it.

**Acceptance Scenarios**:

1. **Given** a valid database_id and region, **When** I call `scaleway_serverless_sqldb_list_database_backups`, **Then** I receive a paginated list of backups with total_count
2. **Given** a valid backup_id and region, **When** I call `scaleway_serverless_sqldb_get_database_backup`, **Then** I receive the full backup object
3. **Given** a valid backup_id and region, **When** I call `scaleway_serverless_sqldb_export_database_backup`, **Then** I receive the backup with a download URL
4. **Given** a valid database_id and backup_id, **When** I call `scaleway_serverless_sqldb_restore_database`, **Then** the database is restored from the backup

---

### Edge Cases

- Invalid region format returns a structured validation error
- Database not found (404) returns a `not_found` error type
- Missing required fields (e.g., no name on create) returns `invalid_input` error
- cpu_min > cpu_max returns a validation error from the API
- Backup not found (404) returns a `not_found` error type
- Pagination with page > total pages returns empty items array
- Restoring a database that is not in `ready` state returns an appropriate error

## Requirements

### Functional Requirements

- **FR-001**: System MUST list databases with pagination (page, page_size) and filtering (name, project_id, organization_id, order_by)
- **FR-002**: System MUST get a single database by ID and region
- **FR-003**: System MUST create a database with name, cpu_min, cpu_max, and optional project_id and from_backup_id
- **FR-004**: System MUST update a database's cpu_min and/or cpu_max
- **FR-005**: System MUST delete a database by ID and region
- **FR-006**: System MUST list backups for a database with pagination (page, page_size) and filtering (project_id, organization_id, order_by)
- **FR-007**: System MUST get a single backup by ID and region
- **FR-008**: System MUST export a backup to obtain a download URL
- **FR-009**: System MUST restore a database from a backup
- **FR-010**: All tools MUST validate inputs using Zod schemas
- **FR-011**: All Scaleway API errors MUST be mapped to structured MCP error responses
- **FR-012**: All list operations MUST support standard pagination (page, page_size, total_count)
- **FR-013**: All tools MUST accept a region parameter (regional API locality)

### Key Entities

- **Database**: Serverless SQL Database with id, name, status, endpoint, organization_id, project_id, region, created_at, cpu_min, cpu_max, cpu_current, started, engine_major_version
- **DatabaseBackup**: Backup with id, status, organization_id, project_id, database_id, created_at, expires_at, size, db_size, download_url, download_url_expires_at, region

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 9 MCP tools are registered and callable via the MCP protocol
- **SC-002**: 100% line and branch code coverage across all serverless-sqldb tool files
- **SC-003**: All tools map to documented Scaleway API endpoints
- **SC-004**: Contract tests validate request/response shapes for every tool
- **SC-005**: Parity matrix includes all Serverless SQL DB API operations

## Clarifications

**Resolved decisions from self-clarification:**

- **Locality**: Regional API. Supported regions: fr-par, nl-ams, pl-waw
- **API version**: v1alpha1 (alpha API)
- **Pagination**: Standard Scaleway page/page_size with total_count in responses
- **Auth**: SCW_ACCESS_KEY + SCW_SECRET_KEY + SCW_DEFAULT_PROJECT_ID (via shared auth module)
- **Tool naming**: `scaleway_serverless_sqldb_{action}` pattern (e.g., `scaleway_serverless_sqldb_list_databases`)
- **Error handling**: Use shared `mapScalewayError` + `formatErrorResponse` from `src/shared/errors.ts`
- **Client**: Use shared `createScalewayClient` from `src/shared/client.ts` with `loadAuthConfig` from `src/shared/auth.ts`
- **CPU scaling**: cpu_min and cpu_max define the auto-scaling range for vCPU allocation
- **Backup restore**: Can restore into an existing database or create a new database from a backup via from_backup_id
- **Order-by options**: Databases support created_at_asc/desc, name_asc/desc; Backups support created_at_asc/desc
