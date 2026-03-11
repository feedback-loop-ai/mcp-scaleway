# Feature Specification: Scaleway NATS Messaging MCP Tools

**Feature Branch**: `026-nats`
**Created**: 2026-03-11
**Status**: Approved
**Input**: Implement MCP tools for the Scaleway NATS Messaging API (regional messaging service)

## User Scenarios & Testing

### User Story 1 - NATS Account CRUD (Priority: P1)

As an AI agent, I need to list, get, create, update, and delete NATS accounts so that I can manage messaging infrastructure programmatically.

**Why this priority**: NATS accounts are the core resource. Credentials and messaging depend on accounts existing first.

**Independent Test**: Can be fully tested by creating an account, listing it, getting it, updating it, and deleting it.

**Acceptance Scenarios**:

1. **Given** valid credentials and region, **When** I call `scaleway_nats_list_accounts`, **Then** I receive a paginated list of NATS accounts with total_count
2. **Given** a valid nats_account_id and region, **When** I call `scaleway_nats_get_account`, **Then** I receive the full NATS account object
3. **Given** valid parameters (name, region), **When** I call `scaleway_nats_create_account`, **Then** a new NATS account is created and returned
4. **Given** a valid nats_account_id, region, and name, **When** I call `scaleway_nats_update_account`, **Then** the account is updated and returned
5. **Given** a valid nats_account_id and region, **When** I call `scaleway_nats_delete_account`, **Then** the account is deleted

---

### User Story 2 - NATS Credentials Management (Priority: P1)

As an AI agent, I need to list, get, create, and delete NATS credentials so that I can manage authentication for NATS accounts.

**Why this priority**: Credentials are required for any client to connect to a NATS account. Without credentials, accounts are unusable.

**Independent Test**: Can be tested by creating credentials for an account, listing them, getting them, and deleting them.

**Acceptance Scenarios**:

1. **Given** a valid nats_account_id and region, **When** I call `scaleway_nats_list_credentials`, **Then** I receive a paginated list of credentials with total_count
2. **Given** a valid nats_credentials_id and region, **When** I call `scaleway_nats_get_credentials`, **Then** I receive the full credentials object
3. **Given** a valid nats_account_id, region, and name, **When** I call `scaleway_nats_create_credentials`, **Then** new credentials are created and returned (including the credentials content)
4. **Given** a valid nats_credentials_id and region, **When** I call `scaleway_nats_delete_credentials`, **Then** the credentials are deleted

---

### Edge Cases

- Invalid region format (e.g., "invalid-region") returns a structured validation error
- NATS account not found (404) returns a `not_found` error type
- Missing required fields (e.g., no name on create) returns `invalid_input` error
- Pagination with page > total pages returns empty items array
- Deleting a NATS account with active credentials returns appropriate error
- Creating credentials for a non-existent account returns `not_found` error

## Requirements

### Functional Requirements

- **FR-001**: System MUST list NATS accounts with pagination (page, page_size) and filtering (project_id, name, order_by)
- **FR-002**: System MUST get a single NATS account by ID and region
- **FR-003**: System MUST create a NATS account with name and optional project_id
- **FR-004**: System MUST update a NATS account name by ID and region
- **FR-005**: System MUST delete a NATS account by ID and region
- **FR-006**: System MUST list NATS credentials for an account with pagination and ordering
- **FR-007**: System MUST get NATS credentials by ID and region
- **FR-008**: System MUST create NATS credentials with nats_account_id and name
- **FR-009**: System MUST delete NATS credentials by ID and region
- **FR-010**: All tools MUST validate inputs using Zod schemas
- **FR-011**: All Scaleway API errors MUST be mapped to structured MCP error responses
- **FR-012**: All list operations MUST support standard pagination (page, page_size, total_count)
- **FR-013**: All tools MUST accept a region parameter (regional API locality)

### Key Entities

- **NatsAccount**: Messaging account with id, name, endpoint, project_id, region, status, created_at, updated_at
- **NatsCredentials**: Authentication credentials with id, name, nats_account_id, created_at, updated_at, checksum
- **NatsCredentialsContent**: Credentials with embedded content (returned on create) - extends NatsCredentials with credentials.content

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 9 MCP tools are registered and callable via the MCP protocol
- **SC-002**: 100% line and branch code coverage across all NATS tool files
- **SC-003**: All tools map to documented Scaleway API endpoints
- **SC-004**: Contract tests validate request/response shapes for every tool
- **SC-005**: Parity matrix includes all NATS Messaging API operations

## Clarifications

**Resolved decisions from self-clarification:**

- **Locality**: Regional API. Supported regions: fr-par, nl-ams, pl-waw
- **API Version**: v1beta1 (MNQ - Messaging and Queuing)
- **API Prefix**: `mnq/v1beta1/regions/{region}/`
- **Pagination**: Standard Scaleway page/page_size with total_count in responses
- **Auth**: SCW_ACCESS_KEY + SCW_SECRET_KEY + SCW_DEFAULT_PROJECT_ID (via shared auth module)
- **Tool naming**: `scaleway_nats_{action}_{resource}` pattern (e.g., `scaleway_nats_list_accounts`)
- **Error handling**: Use shared `mapScalewayError` + `formatErrorResponse` from `src/shared/errors.ts`
- **Client**: Use shared `createScalewayClient` from `src/shared/client.ts` with `loadAuthConfig` from `src/shared/auth.ts`
- **Account statuses**: unknown_status, ready, error, creating, deleting
- **Ordering**: created_at_asc, created_at_desc, updated_at_asc, updated_at_desc, name_asc, name_desc
