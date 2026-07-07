# Feature Specification: File Storage Vertical

**Feature Branch**: `042-file-storage`
**Created**: 2026-07-07
**Status**: Implemented
**Input**: Build the Scaleway File Storage vertical — managed network filesystems (POSIX
file systems attachable to Instances), currently in Beta.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manage File Systems (Priority: P1)

An AI assistant user manages Scaleway File Storage file systems: listing existing ones,
inspecting a specific file system, creating a new one with a chosen size, resizing or
renaming it, and deleting it when detached.

**Why this priority**: CRUD over file systems is the core value of the vertical — without
it, users cannot provision or manage shared network storage.

**Independent Test**: Invoke the list/get/create/update/delete tools against a region and
verify each returns the expected file system entity or confirmation.

**Acceptance Scenarios**:

1. **Given** valid credentials, **When** the user lists file systems in a region, **Then** the system returns a paginated list with name, size, status, and attachment count for each.
2. **Given** valid credentials, **When** the user creates a file system with a name and size, **Then** the system returns the new file system with status `creating`.
3. **Given** a file system ID, **When** the user updates its size upward, **Then** the system returns the updated file system (resize).
4. **Given** a detached file system ID, **When** the user deletes it, **Then** the system confirms deletion.
5. **Given** invalid credentials, **When** any tool is invoked, **Then** the system returns a clear authentication error.

---

### User Story 2 - Inspect Attachments (Priority: P2)

An AI assistant user lists the attachments linking file systems to compute resources, to
understand which resources depend on a given file system before resizing or deleting it.

**Why this priority**: Deletion requires a detached file system, so users need visibility
into attachments to safely operate on storage.

**Independent Test**: Invoke the list attachments tool with a file system filter and verify
it returns attachment entities with resource ID, resource type, and zone.

**Acceptance Scenarios**:

1. **Given** valid credentials, **When** the user lists attachments filtered by file system ID, **Then** the system returns attachments showing the attached resource and its zone.
2. **Given** a file system with no attachments, **When** the user lists its attachments, **Then** the system returns an empty list with total count 0.

---

### Edge Cases

- Deleting an attached file system fails at the API — the error is surfaced to the user.
- Size is expressed in bytes; the API enforces product min/max limits, surfaced as invalid_input.
- Large result sets are handled via standard page/page_size pagination.
- `zone` on an attachment may be null.

### Out of Scope

- **Attach / detach** operations: these are performed via the Instance API
  (`/instance/v1/zones/{zone}/servers/{server_id}/attach-filesystem` and detach), not the
  File Storage API. They belong to the `instances` tool area. The File Storage API only
  exposes *listing* attachments, which this vertical covers.
- Filesystem-type / catalog listing: not present in the verified v1alpha1 SDK surface, so
  not implemented (would be inventing an endpoint).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST expose a tool to list file systems in a region with pagination and optional filters (project, organization, name, tags, order).
- **FR-002**: System MUST expose a tool to get a single file system by ID.
- **FR-003**: System MUST expose a tool to create a file system (name + size in bytes, optional project and tags).
- **FR-004**: System MUST expose a tool to update a file system (rename, resize, replace tags).
- **FR-005**: System MUST expose a tool to delete a detached file system by ID.
- **FR-006**: System MUST expose a tool to list attachments with pagination and optional filters (file system, resource, resource type, zone).
- **FR-007**: System MUST return clear, actionable errors for auth failure, not-found, invalid input, and rate limiting.
- **FR-008**: System MUST follow existing tool registration and handler patterns (shared client, error mapping, paginated response envelope).
- **FR-009**: System MUST achieve 100% line and branch coverage with contract tests validating request shape, response shape, pagination, auth, and error codes.

### Key Entities

- **FileSystem**: A managed network filesystem. Attributes: id, name, size (bytes), status, project_id, organization_id, tags, number_of_attachments, region, timestamps.
- **Attachment**: A link between a file system and a compute resource. Attributes: id, filesystem_id, resource_id, resource_type, zone.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can perform full CRUD over file systems in a single tool invocation each.
- **SC-002**: Users can list attachments to understand dependencies before mutating storage.
- **SC-003**: All invocations return results or actionable errors — no silent failures.
- **SC-004**: 100% line and branch coverage maintained with contract tests covering all six tools.

## Assumptions

- API slug `file`, version `v1alpha1`, region-scoped, verified via the official reference and the Scaleway Go SDK definition.
- `size` is serialized as an integer number of bytes.
- Pagination follows the standard Scaleway pattern (page/page_size, total_count).
- Attach/detach live under the Instance API and are therefore out of scope for this vertical.

## Clarifications

### Session 2026-07-07

- Q: Does the File Storage API own attach/detach? → A: No — attach/detach are Instance API operations; File Storage only lists attachments. Documented as Out of Scope.
- Q: Is there a filesystem-types catalog endpoint? → A: Not in the verified v1alpha1 SDK surface; excluded to avoid inventing endpoints.
