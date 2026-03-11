# Feature Specification: Scaleway Key Manager MCP Tools

**Feature Branch**: `025-key-manager`
**Created**: 2026-03-11
**Status**: Approved
**Input**: Implement MCP tools for the Scaleway Key Manager API (regional KMS)

## User Scenarios & Testing

### User Story 1 - Key CRUD & Lifecycle (Priority: P1)

As an AI agent, I need to list, get, create, update, delete, rotate, protect, unprotect, enable, and disable cryptographic keys so that I can manage encryption key lifecycle programmatically.

**Why this priority**: Keys are the core resource of the Key Manager API. All cryptographic operations depend on keys existing and being in the correct state.

**Independent Test**: Can be fully tested by creating a key, listing it, getting it, updating metadata, rotating, protecting/unprotecting, enabling/disabling, and deleting it.

**Acceptance Scenarios**:

1. **Given** valid credentials and region, **When** I call `scaleway_key_manager_list_keys`, **Then** I receive a paginated list of keys with total_count
2. **Given** a valid key_id and region, **When** I call `scaleway_key_manager_get_key`, **Then** I receive the full key object with metadata
3. **Given** valid parameters (name, usage, region), **When** I call `scaleway_key_manager_create_key`, **Then** a new key is created and returned
4. **Given** a valid key_id and update fields, **When** I call `scaleway_key_manager_update_key`, **Then** the key metadata is updated
5. **Given** a valid key_id and region, **When** I call `scaleway_key_manager_delete_key`, **Then** the key is permanently deleted
6. **Given** a valid key_id and region, **When** I call `scaleway_key_manager_rotate_key`, **Then** new key material is generated
7. **Given** a valid key_id and region, **When** I call `scaleway_key_manager_protect_key`, **Then** the key is protected from deletion
8. **Given** a valid key_id and region, **When** I call `scaleway_key_manager_unprotect_key`, **Then** deletion protection is removed
9. **Given** a valid key_id and region, **When** I call `scaleway_key_manager_enable_key`, **Then** the key is enabled for operations
10. **Given** a valid key_id and region, **When** I call `scaleway_key_manager_disable_key`, **Then** the key is disabled

---

### User Story 2 - Cryptographic Operations (Priority: P1)

As an AI agent, I need to encrypt data, decrypt ciphertext, and generate data encryption keys so that I can perform envelope encryption and data protection workflows.

**Why this priority**: Cryptographic operations are the primary use case of KMS keys once created.

**Independent Test**: Can be tested by creating a key, encrypting plaintext, decrypting the result, and generating a data key.

**Acceptance Scenarios**:

1. **Given** a valid key_id and base64-encoded plaintext, **When** I call `scaleway_key_manager_encrypt`, **Then** I receive the encrypted ciphertext
2. **Given** a valid key_id and ciphertext, **When** I call `scaleway_key_manager_decrypt`, **Then** I receive the decrypted plaintext
3. **Given** a valid key_id and algorithm, **When** I call `scaleway_key_manager_generate_data_key`, **Then** I receive an encrypted data key (and optionally its plaintext)

---

### Edge Cases

- Invalid region format returns a structured validation error
- Key not found (404) returns a `not_found` error type
- Encrypting with a disabled key returns an appropriate error
- Deleting a protected key returns an error indicating protection is active
- Plaintext exceeding 64KB limit returns a validation error
- Invalid UUID for key_id returns a structured validation error
- Pagination with page > total pages returns empty items array
- Missing required fields return `invalid_input` error

## Requirements

### Functional Requirements

- **FR-001**: System MUST list keys with pagination (page, pageSize) and filtering (name, tags, usage, organizationId, projectId, orderBy, scheduledForDeletion)
- **FR-002**: System MUST get a single key by ID and region
- **FR-003**: System MUST create a key with optional name, usage, description, tags, rotationPolicy, unprotected flag, and origin
- **FR-004**: System MUST update a key's name, description, tags, and rotationPolicy
- **FR-005**: System MUST delete a key by ID and region
- **FR-006**: System MUST rotate a key by ID and region
- **FR-007**: System MUST protect a key by ID and region
- **FR-008**: System MUST unprotect a key by ID and region
- **FR-009**: System MUST enable a key by ID and region
- **FR-010**: System MUST disable a key by ID and region
- **FR-011**: System MUST encrypt plaintext using a key (max 64KB, with optional associated data)
- **FR-012**: System MUST decrypt ciphertext using a key (with optional associated data)
- **FR-013**: System MUST generate a data encryption key from a key (with algorithm and withoutPlaintext options)
- **FR-014**: All tools MUST validate inputs using Zod schemas
- **FR-015**: All Scaleway API errors MUST be mapped to structured MCP error responses
- **FR-016**: All list operations MUST support standard pagination (page, pageSize, totalCount)
- **FR-017**: All tools MUST accept an optional region parameter (regional API locality)

### Key Entities

- **Key**: Cryptographic key with id, name, state, usage, description, tags, origin, rotationPolicy, createdAt, updatedAt, rotatedAt, protected, locked
- **EncryptResponse**: Encrypted output with keyId, ciphertext
- **DecryptResponse**: Decrypted output with keyId, plaintext
- **DataKey**: Generated data key with dataKey (encrypted), plaintext (optional)

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 13 MCP tools are registered and callable via the MCP protocol
- **SC-002**: 100% line and branch code coverage across all key manager tool files
- **SC-003**: All tools map to documented Scaleway Key Manager API endpoints
- **SC-004**: Contract tests validate request/response shapes for every tool
- **SC-005**: Parity matrix includes all Key Manager API operations

## Clarifications

**Resolved decisions from self-clarification:**

- **Locality**: Regional API. Supported regions: fr-par, nl-ams, pl-waw
- **API version**: v1alpha1 (pre-GA)
- **Pagination**: Standard Scaleway page/pageSize with totalCount in responses
- **Auth**: SCW_ACCESS_KEY + SCW_SECRET_KEY + SCW_DEFAULT_PROJECT_ID (via shared auth module)
- **Tool naming**: `scaleway_key_manager_{action}` pattern (e.g., `scaleway_key_manager_list_keys`)
- **Error handling**: Use shared `mapScalewayError` + `formatErrorResponse` from `src/shared/errors.ts`
- **Client**: Use shared `createScalewayClient` from `src/shared/client.ts` with `loadAuthConfig` from `src/shared/auth.ts`
- **SDK**: Use `@scaleway/sdk-key-manager` with `KeyManagerv1alpha1.API` class
- **Key usage types**: symmetric_encryption (aes_256_gcm), asymmetric_encryption (RSA-OAEP variants), asymmetric_signing (EC/RSA-PSS/RSA-PKCS1 variants)
- **Key origins**: scaleway_kms (generated by Scaleway) or external (imported)
- **Key states**: enabled, disabled, pending_key_material, scheduled_for_deletion
- **Rotation policy**: rotationPeriod (min 24h, max 876000h) + nextRotationAt (ISO 8601)
- **Data key algorithm**: aes_256_gcm for symmetric encryption
