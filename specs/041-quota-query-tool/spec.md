# Feature Specification: Quota Query Tool

**Feature Branch**: `041-quota-query-tool`
**Created**: 2026-03-13
**Status**: Draft
**Input**: User description: "Add a tool for querying quotas."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - List Project Quotas (Priority: P1)

An AI assistant user asks the MCP server to list all quotas for a Scaleway project. The system returns a comprehensive list of resource quotas showing the resource name, current usage, and maximum allowed limit for each product area.

**Why this priority**: This is the core value of the feature — users need visibility into their project-level resource limits and current consumption to plan capacity and avoid quota-exceeded errors.

**Independent Test**: Can be fully tested by invoking the list quotas tool with a project ID and verifying it returns quota entries with resource names, current usage, and limits.

**Acceptance Scenarios**:

1. **Given** a valid Scaleway authentication and project, **When** the user requests to list all quotas, **Then** the system returns a paginated list of quota entries showing resource name, current usage, and limit for each resource type.
2. **Given** a valid authentication, **When** the user requests quotas with pagination parameters, **Then** the system returns the requested page of results with correct total count.
3. **Given** invalid or expired credentials, **When** the user requests quotas, **Then** the system returns a clear authentication error with actionable guidance.

---

### User Story 2 - Get Quota for a Specific Resource (Priority: P2)

An AI assistant user asks the MCP server about the quota for a specific resource type (e.g., number of Instances allowed in a region). The system returns the quota details for that specific resource, including current usage and limit.

**Why this priority**: Targeted lookups are the natural follow-up after listing all quotas — users typically want to check whether they have headroom for a specific resource before provisioning.

**Independent Test**: Can be fully tested by invoking the get quota tool with a specific resource name and verifying it returns the quota details for that resource.

**Acceptance Scenarios**:

1. **Given** a valid authentication, **When** the user requests the quota for a specific resource (e.g., "instances"), **Then** the system returns the quota details for that resource including current usage and limit.
2. **Given** a valid authentication, **When** the user requests a quota for a non-existent resource name, **Then** the system returns a clear error indicating the resource was not found.

---

### Edge Cases

- What happens when the user's project has no custom quotas set? The system returns default quota values.
- What happens when the Scaleway API returns a rate limit error? The server surfaces the error with actionable guidance (e.g., retry after delay).
- What happens when the user does not specify a region filter? The system returns quotas across all regions by default.
- What happens when the project has many quota entries? The system supports pagination to handle large result sets.

### Out of Scope

- Requesting quota increases (write operations) — this tool is strictly read-only for querying current quota state.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST expose an MCP tool to list all quotas for a Scaleway project, returning resource name, current usage, and maximum limit for each quota entry.
- **FR-002**: System MUST support pagination when listing quotas (page number and page size parameters).
- **FR-002a**: System MUST accept an optional region filter parameter when listing quotas. When omitted, quotas across all regions are returned.
- **FR-003**: System MUST expose an MCP tool to retrieve quota details for a specific resource type within a project.
- **FR-004**: System MUST return clear, actionable error messages when authentication fails, the resource is not found, or rate limits are hit.
- **FR-005**: System MUST follow the existing tool registration and handler patterns established in the project (consistent error handling and response formatting).
- **FR-006**: System MUST achieve 100% line and branch test coverage with contract tests validating request shape, response shape, pagination, auth, and error codes.

### Key Entities

- **Quota**: A resource limit entry representing an allowed maximum for a specific Scaleway resource within a project. Key attributes: resource name, current usage count, maximum limit, project ID.
- **Project**: The Scaleway project context under which quotas are scoped and queried.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can retrieve a full list of their project quotas in a single tool invocation (with pagination for large sets).
- **SC-002**: Users can query the quota for a specific resource type and receive usage and limit information.
- **SC-003**: All quota tool invocations return results or actionable error messages — no silent failures.
- **SC-004**: 100% line and branch test coverage is maintained, with contract tests covering all exposed endpoints.

## Assumptions

- Scaleway exposes project-scoped quotas via their Account API. The exact endpoint path MUST be confirmed during the planning phase and documented in `specs/scaleway-api/` before implementation begins.
- Quotas are scoped at the project level, consistent with how other tools in this MCP server operate.
- The tool will use the raw HTTP client pattern (similar to the Kubernetes tools) since there is no dedicated quota SDK package.
- Pagination follows the standard Scaleway pattern (page/page_size query parameters, total_count in response).

## Clarifications

### Session 2026-03-13

- Q: What is the primary quota scoping model — organization-level, project-scoped, or both? → A: Project-scoped (quotas queried per project, consistent with existing tools).
- Q: Should the list quotas tool accept an optional region filter, or always return all regions? → A: Return all regions by default, with an optional region filter parameter.
- Q: How should the implementation discover the correct Scaleway quota API endpoint? → A: Confirm the API endpoint during planning phase and add API spec to `specs/scaleway-api/` before implementation.
- Q: Should requesting quota increases be in scope or out of scope? → A: Out of scope — this tool is read-only (query quotas only).
