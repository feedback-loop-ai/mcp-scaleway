# Feature Specification: Scaleway Account MCP Tools

**Feature Branch**: `035-account`
**Created**: 2026-03-11
**Status**: Approved
**Input**: Implement MCP tools for the Scaleway Account API (Project management)

## User Scenarios & Testing

### User Story 1 - Project CRUD (Priority: P1)

As an AI agent, I need to list, get, create, update, and delete Scaleway projects so that I can manage organizational structure programmatically.

**Why this priority**: Projects are the fundamental organizational unit in Scaleway. All resources belong to a project, making project management essential for any infrastructure automation.

**Independent Test**: Can be fully tested by creating a project, listing it, getting it, updating it, and deleting it.

**Acceptance Scenarios**:

1. **Given** valid credentials, **When** I call `scaleway_account_list_projects`, **Then** I receive a paginated list of projects with total_count
2. **Given** a valid project_id, **When** I call `scaleway_account_get_project`, **Then** I receive the full project object
3. **Given** valid parameters (name, description, organization_id), **When** I call `scaleway_account_create_project`, **Then** a new project is created and returned
4. **Given** a valid project_id and updated fields (name, description), **When** I call `scaleway_account_update_project`, **Then** the project is updated and returned
5. **Given** a valid project_id of an empty project, **When** I call `scaleway_account_delete_project`, **Then** the project is deleted

---

### Edge Cases

- Invalid UUID format for project_id returns a structured validation error
- Project not found (404) returns a `not_found` error type
- Deleting a non-empty project (with resources) returns a structured error with actionable message
- Missing required fields (e.g., no description on create) returns `invalid_input` error
- Pagination with page > total pages returns empty projects array
- Name exceeds 64 characters returns validation error
- Description exceeds 200 characters returns validation error

## Requirements

### Functional Requirements

- **FR-001**: System MUST list projects with pagination (page, page_size) and filtering (name, organization_id, project_ids, order_by)
- **FR-002**: System MUST get a single project by project_id
- **FR-003**: System MUST create a project with name, description, and optional organization_id
- **FR-004**: System MUST update a project's name and/or description by project_id
- **FR-005**: System MUST delete a project by project_id (project must be empty)
- **FR-006**: All tools MUST validate inputs using Zod schemas
- **FR-007**: All Scaleway API errors MUST be mapped to structured MCP error responses
- **FR-008**: All list operations MUST support standard pagination (page, page_size, total_count)

### Key Entities

- **Project**: Organizational unit with id, name, organization_id, description, created_at, updated_at

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 5 MCP tools are registered and callable via the MCP protocol
- **SC-002**: 100% line and branch code coverage across all account tool files
- **SC-003**: All tools map to documented Scaleway Account API endpoints
- **SC-004**: Contract tests validate request/response shapes for every tool
- **SC-005**: Parity matrix includes all Account API operations

## Clarifications

**Resolved decisions from self-clarification:**

- **Locality**: Global API. No zone or region parameter required
- **Pagination**: Standard Scaleway page/page_size with total_count in responses
- **Auth**: SCW_ACCESS_KEY + SCW_SECRET_KEY + SCW_DEFAULT_PROJECT_ID (via shared auth module)
- **Tool naming**: `scaleway_account_{action}_{resource}` pattern (e.g., `scaleway_account_list_projects`)
- **Error handling**: Use shared `mapScalewayError` + `formatErrorResponse` from `src/shared/errors.ts`
- **Client**: Use shared `createScalewayClient` from `src/shared/client.ts` with `loadAuthConfig` from `src/shared/auth.ts`
- **SDK**: Use `@scaleway/sdk-account` with `Accountv3.ProjectAPI` class
- **Order by**: created_at_asc, created_at_desc, name_asc, name_desc
- **Project constraints**: Name max 64 chars, description max 200 chars, project must be empty before deletion
