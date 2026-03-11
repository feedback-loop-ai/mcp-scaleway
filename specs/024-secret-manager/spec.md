# Feature Specification: Scaleway Secret Manager MCP Tools

**Feature Branch**: `024-secret-manager`
**Created**: 2026-03-11
**Status**: Approved
**Input**: Implement MCP tools for the Scaleway Secret Manager API (regional secret storage)

## User Scenarios & Testing

### User Story 1 - Secret CRUD (Priority: P1)

As an AI agent, I need to list, get, create, update, and delete secrets so that I can manage sensitive data programmatically.

**Why this priority**: Secrets are the core resource of the Secret Manager API. Versions, protection, and ownership all depend on secrets existing.

**Independent Test**: Can be fully tested by creating a secret, listing it, getting it, updating it, and deleting it.

**Acceptance Scenarios**:

1. **Given** valid credentials and region, **When** I call `scaleway_secret_manager_list_secrets`, **Then** I receive a paginated list of secrets with total_count
2. **Given** a valid secretId and region, **When** I call `scaleway_secret_manager_get_secret`, **Then** I receive the full secret object
3. **Given** valid parameters (name, projectId, type, region), **When** I call `scaleway_secret_manager_create_secret`, **Then** a new secret is created and returned
4. **Given** a valid secretId and updated fields, **When** I call `scaleway_secret_manager_update_secret`, **Then** the secret metadata is updated
5. **Given** a valid secretId and region, **When** I call `scaleway_secret_manager_delete_secret`, **Then** the secret and all its versions are deleted

---

### User Story 2 - Secret Version Management (Priority: P1)

As an AI agent, I need to create, list, get, access, enable, disable, and destroy secret versions so that I can manage secret payloads and their lifecycle.

**Why this priority**: Versions hold the actual sensitive data. Without version management, secrets are metadata-only.

**Independent Test**: Can be tested by creating a version, listing versions, accessing data, disabling, enabling, and destroying.

**Acceptance Scenarios**:

1. **Given** a valid secretId, **When** I call `scaleway_secret_manager_list_secret_versions`, **Then** I receive a paginated list of versions
2. **Given** a valid secretId and revision, **When** I call `scaleway_secret_manager_get_secret_version`, **Then** I receive the version metadata
3. **Given** a valid secretId and base64-encoded data, **When** I call `scaleway_secret_manager_create_secret_version`, **Then** a new version is created
4. **Given** a valid secretId and revision, **When** I call `scaleway_secret_manager_access_secret_version`, **Then** I receive the base64-encoded secret payload
5. **Given** a valid secretId and revision, **When** I call `scaleway_secret_manager_disable_secret_version`, **Then** the version is disabled
6. **Given** a valid secretId and revision of a disabled version, **When** I call `scaleway_secret_manager_enable_secret_version`, **Then** the version is re-enabled
7. **Given** a valid secretId and revision, **When** I call `scaleway_secret_manager_destroy_secret_version`, **Then** the version and its data are permanently deleted

---

### User Story 3 - Secret Protection (Priority: P2)

As an AI agent, I need to protect and unprotect secrets so that I can prevent accidental deletion.

**Why this priority**: Protection is a safety mechanism that gates deletion, important for production use.

**Independent Test**: Can be tested by protecting a secret, attempting delete (should fail), then unprotecting and deleting.

**Acceptance Scenarios**:

1. **Given** a valid secretId, **When** I call `scaleway_secret_manager_protect_secret`, **Then** the secret's protected flag is set to true
2. **Given** a protected secretId, **When** I call `scaleway_secret_manager_unprotect_secret`, **Then** the secret can be deleted

---

### User Story 4 - Tags and Ownership (Priority: P3)

As an AI agent, I need to list tags and add secret owners so that I can organize secrets and grant cross-product access.

**Why this priority**: Tags and ownership are supplementary features that enhance secret organization and cross-product integration.

**Independent Test**: Can be tested by listing tags and adding an owner to a secret.

**Acceptance Scenarios**:

1. **Given** valid credentials and region, **When** I call `scaleway_secret_manager_list_tags`, **Then** I receive a paginated list of tags
2. **Given** a valid secretId and product, **When** I call `scaleway_secret_manager_add_secret_owner`, **Then** the product is granted access to the secret

---

### Edge Cases

- Invalid region format returns a structured validation error
- Secret not found (404) returns a `not_found` error type
- Deleting a protected secret returns a structured error with actionable message
- Missing required fields (e.g., no name on create) returns `invalid_input` error
- Accessing a disabled version returns appropriate error
- Destroying an already-deleted version returns appropriate error
- Pagination with page > total pages returns empty items array
- Empty tag arrays and filter combinations handled correctly
- Base64-encoded data validation on version creation

## Requirements

### Functional Requirements

- **FR-001**: System MUST list secrets with pagination (page, pageSize) and filtering (name, tags, type, path, ephemeral, orderBy, projectId, organizationId)
- **FR-002**: System MUST get a single secret by ID and region
- **FR-003**: System MUST create a secret with name, projectId, tags, description, type, path, ephemeralPolicy, and isProtected
- **FR-004**: System MUST update a secret's metadata (name, tags, description, path, ephemeralPolicy)
- **FR-005**: System MUST delete a secret by ID and region
- **FR-006**: System MUST list secret versions with pagination and status filtering
- **FR-007**: System MUST get a secret version by secretId and revision
- **FR-008**: System MUST create a secret version with base64-encoded data, optional description, disablePrevious flag, and dataCrc32
- **FR-009**: System MUST access a secret version's payload by secretId and revision
- **FR-010**: System MUST disable a secret version by secretId and revision
- **FR-011**: System MUST enable a secret version by secretId and revision
- **FR-012**: System MUST destroy (permanently delete) a secret version by secretId and revision
- **FR-013**: System MUST protect a secret by ID
- **FR-014**: System MUST unprotect a secret by ID
- **FR-015**: System MUST list tags with pagination and projectId filtering
- **FR-016**: System MUST add an owner (Scaleway product) to a secret
- **FR-017**: All tools MUST validate inputs using Zod schemas
- **FR-018**: All Scaleway API errors MUST be mapped to structured MCP error responses
- **FR-019**: All list operations MUST support standard pagination (page, pageSize, totalCount)
- **FR-020**: All tools MUST accept an optional region parameter (regional API locality)

### Key Entities

- **Secret**: Metadata container with id, name, status, tags, description, type, path, ephemeralPolicy, protected, versionCount, region, projectId, createdAt, updatedAt
- **SecretVersion**: Versioned payload with secretId, revision, status, description, createdAt, updatedAt, ephemeral policy state
- **EphemeralPolicy**: Expiration policy with timeToLive, expiresOnceAccessed, action (delete/disable)
- **Tag**: String label associated with secrets for organization
- **Product**: Scaleway product that can own a secret (edge_services, s2s_vpn)

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 16 MCP tools are registered and callable via the MCP protocol
- **SC-002**: 100% line and branch code coverage across all secret manager tool files
- **SC-003**: All tools map to documented Scaleway API endpoints
- **SC-004**: Contract tests validate request/response shapes for every tool
- **SC-005**: Parity matrix includes all Secret Manager API operations

## Clarifications

**Resolved decisions from self-clarification:**

- **Locality**: Regional API. Supported regions: fr-par, nl-ams, pl-waw
- **Pagination**: Standard Scaleway page/pageSize with totalCount in responses
- **Auth**: SCW_ACCESS_KEY + SCW_SECRET_KEY + SCW_DEFAULT_PROJECT_ID (via shared auth module)
- **Tool naming**: `scaleway_secret_manager_{action}` pattern (e.g., `scaleway_secret_manager_list_secrets`)
- **Error handling**: Use shared `mapScalewayError` + `formatErrorResponse` from `src/shared/errors.ts`
- **Client**: Use shared `createScalewayClient` from `src/shared/client.ts` with `loadAuthConfig` from `src/shared/auth.ts`
- **SDK**: Use `@scaleway/sdk-secret` with `Secretv1beta1.API` class
- **Secret types**: opaque, certificate, key_value, basic_credentials, database_credentials, ssh_key
- **Version revisions**: Can be numeric (1, 2, ...), 'latest', or 'latest_enabled'
- **Protection**: Protected secrets cannot be deleted; must be unprotected first
- **Ephemeral policy**: Controls automatic version expiration via timeToLive, expiresOnceAccessed, and action
