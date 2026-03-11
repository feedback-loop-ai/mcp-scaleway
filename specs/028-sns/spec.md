# Feature Specification: Scaleway SNS (Topics & Events) MCP Tools

**Feature Branch**: `028-sns`
**Created**: 2026-03-11
**Status**: Approved
**Input**: Implement MCP tools for the Scaleway Topics and Events (SNS) API (regional messaging)

## User Scenarios & Testing

### User Story 1 - SNS Service Activation (Priority: P1)

As an AI agent, I need to activate, deactivate, and check the status of the Scaleway Topics and Events (SNS) service so that I can manage the messaging infrastructure for a project.

**Why this priority**: SNS must be activated before any credentials or topics can be created. This is the gateway to all other SNS operations.

**Independent Test**: Can be fully tested by activating SNS, getting info, and deactivating it.

**Acceptance Scenarios**:

1. **Given** valid credentials and a project ID, **When** I call `scaleway_sns_activate`, **Then** the SNS service is activated and the SNS info (status, endpoint URL) is returned
2. **Given** an activated SNS service, **When** I call `scaleway_sns_get_info`, **Then** I receive the service status, endpoint URL, and timestamps
3. **Given** an activated SNS service with no topics or credentials, **When** I call `scaleway_sns_deactivate`, **Then** the service is deactivated

---

### User Story 2 - SNS Credentials Management (Priority: P1)

As an AI agent, I need to create, list, get, update, and delete SNS credentials so that I can manage access to the Topics and Events service with granular permissions.

**Why this priority**: Credentials are required to interact with SNS topics and subscriptions. Without credentials, the service cannot be used.

**Independent Test**: Can be tested by creating credentials, listing them, getting by ID, updating permissions, and deleting them.

**Acceptance Scenarios**:

1. **Given** an activated SNS service, **When** I call `scaleway_sns_list_credentials`, **Then** I receive a paginated list of credentials with total_count
2. **Given** a valid credentials ID, **When** I call `scaleway_sns_get_credentials`, **Then** I receive the full credentials object with permissions
3. **Given** valid parameters (name, permissions), **When** I call `scaleway_sns_create_credentials`, **Then** new credentials are created with access key and secret key
4. **Given** a valid credentials ID and updated fields, **When** I call `scaleway_sns_update_credentials`, **Then** the credentials name or permissions are updated
5. **Given** a valid credentials ID, **When** I call `scaleway_sns_delete_credentials`, **Then** the credentials are deleted and active connections are closed

---

### Edge Cases

- Invalid region format returns a structured validation error
- Credentials not found (404) returns a `not_found` error type
- Deactivating SNS with existing topics/credentials returns an appropriate error
- Missing required fields (e.g., no snsCredentialsId on get) returns `invalid_input` error
- Pagination with page > total pages returns empty items array
- Creating credentials without activating SNS first returns an error

## Requirements

### Functional Requirements

- **FR-001**: System MUST activate SNS for a project in a region
- **FR-002**: System MUST deactivate SNS for a project in a region
- **FR-003**: System MUST get SNS activation info (status, endpoint URL, timestamps)
- **FR-004**: System MUST list SNS credentials with pagination (page, page_size) and ordering
- **FR-005**: System MUST get SNS credentials by ID
- **FR-006**: System MUST create SNS credentials with name and granular permissions (canPublish, canReceive, canManage)
- **FR-007**: System MUST update SNS credentials name and/or permissions
- **FR-008**: System MUST delete SNS credentials by ID
- **FR-009**: All tools MUST validate inputs using Zod schemas
- **FR-010**: All Scaleway API errors MUST be mapped to structured MCP error responses
- **FR-011**: All list operations MUST support standard pagination (page, page_size, total_count)
- **FR-012**: All tools MUST accept an optional region parameter (regional API locality)

### Key Entities

- **SnsInfo**: Service status with projectId, region, createdAt, updatedAt, status (unknown_status, enabled, disabled), snsEndpointUrl
- **SnsCredentials**: Access credentials with id, name, projectId, region, createdAt, updatedAt, accessKey, secretKey, secretChecksum, permissions
- **SnsPermissions**: Granular permissions with canPublish, canReceive, canManage

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 8 MCP tools are registered and callable via the MCP protocol
- **SC-002**: 100% line and branch code coverage across all SNS tool files
- **SC-003**: All tools map to documented Scaleway API endpoints
- **SC-004**: Contract tests validate request/response shapes for every tool
- **SC-005**: Parity matrix includes all SNS API operations

## Clarifications

**Resolved decisions from self-clarification:**

- **Locality**: Regional API. Supported regions: fr-par, nl-ams, pl-waw
- **Pagination**: Standard Scaleway page/page_size with total_count in responses (only for list_credentials)
- **Auth**: SCW_ACCESS_KEY + SCW_SECRET_KEY + SCW_DEFAULT_PROJECT_ID (via shared auth module)
- **Tool naming**: `scaleway_sns_{action}` pattern (e.g., `scaleway_sns_activate`, `scaleway_sns_list_credentials`)
- **Error handling**: Use shared `mapScalewayError` + `formatErrorResponse` from `src/shared/errors.ts`
- **Client**: Use shared `createScalewayClient` from `src/shared/client.ts` with `loadAuthConfig` from `src/shared/auth.ts`
- **SDK**: Use `@scaleway/sdk-mnq` with the `SnsAPI` class. The SDK uses a class-based API pattern
- **Permissions model**: Three granular flags - canPublish (publish messages), canReceive (configure subscriptions), canManage (manage topics/subscriptions)
- **Service lifecycle**: Must activate before creating credentials; must delete all credentials before deactivating
