# Feature Specification: Scaleway Serverless Jobs MCP Tools

**Feature Branch**: `009-jobs`
**Created**: 2026-03-11
**Status**: Approved
**Input**: Implement MCP tools for the Scaleway Serverless Jobs API (regional compute)

## User Scenarios & Testing

### User Story 1 - Job Definition CRUD (Priority: P1)

As an AI agent, I need to list, get, create, update, and delete Scaleway Serverless Job definitions so that I can manage containerized batch workloads programmatically.

**Why this priority**: Job definitions are the core resource of the Serverless Jobs API. They define what container image to run, resource limits, and optional cron schedules. Every job run references a definition.

**Independent Test**: Can be fully tested by creating a definition, listing it, getting it, updating it, and deleting it.

**Acceptance Scenarios**:

1. **Given** valid credentials and region, **When** I call `scaleway_jobs_list_definitions`, **Then** I receive a paginated list of job definitions with total_count
2. **Given** a valid job_definition_id and region, **When** I call `scaleway_jobs_get_definition`, **Then** I receive the full job definition object
3. **Given** valid parameters (name, cpu_limit, memory_limit, image_uri), **When** I call `scaleway_jobs_create_definition`, **Then** a new job definition is created and returned
4. **Given** a valid job_definition_id and partial update fields, **When** I call `scaleway_jobs_update_definition`, **Then** the definition is updated and the updated object is returned
5. **Given** a valid job_definition_id and region, **When** I call `scaleway_jobs_delete_definition`, **Then** the definition is deleted and a confirmation is returned

---

### User Story 2 - Job Run Management (Priority: P1)

As an AI agent, I need to start, list, get, and stop job runs so that I can execute and monitor batch workloads.

**Why this priority**: Job runs are the execution instances of job definitions. Starting, monitoring, and stopping runs is the primary operational workflow.

**Independent Test**: Can be tested by starting a run from an existing definition, listing runs, getting run details, and stopping a run.

**Acceptance Scenarios**:

1. **Given** a valid job_definition_id and region, **When** I call `scaleway_jobs_start`, **Then** a new job run is created and returned with state "queued"
2. **Given** valid credentials and region, **When** I call `scaleway_jobs_list_runs`, **Then** I receive a paginated list of job runs with total_count
3. **Given** a valid job_run_id and region, **When** I call `scaleway_jobs_get_run`, **Then** I receive the full job run object including state, timing, and exit code
4. **Given** a running job_run_id and region, **When** I call `scaleway_jobs_stop_run`, **Then** the job run is stopped and the updated object is returned

---

### Edge Cases

- Invalid region format (e.g., "invalid-region") returns a structured validation error
- Job definition not found (404) returns a `not_found` error type
- Quota exceeded returns a structured error with actionable message
- Missing required fields (e.g., no image_uri on create) returns `invalid_input` error
- Stopping an already-stopped job returns appropriate error
- Pagination with page > total pages returns empty items array
- Rate limiting (429) returns a `rate_limited` error type
- Invalid UUID format rejected by Zod schema validation

## Requirements

### Functional Requirements

- **FR-001**: System MUST list job definitions with pagination (page, page_size) and optional project_id filtering
- **FR-002**: System MUST get a single job definition by ID and region
- **FR-003**: System MUST create a job definition with name, cpu_limit, memory_limit, image_uri, and optional fields (command, description, environment_variables, job_timeout, project_id, cron_schedule)
- **FR-004**: System MUST update a job definition with partial fields via PATCH
- **FR-005**: System MUST delete a job definition by ID and region
- **FR-006**: System MUST start a job run from a job definition, with optional command and environment_variables overrides
- **FR-007**: System MUST list job runs with pagination and optional filtering by job_definition_id and project_id
- **FR-008**: System MUST get a single job run by ID and region
- **FR-009**: System MUST stop a running job run by ID and region
- **FR-010**: All tools MUST validate inputs using Zod schemas
- **FR-011**: All Scaleway API errors MUST be mapped to structured MCP error responses
- **FR-012**: All list operations MUST support standard pagination (page, page_size, total_count)
- **FR-013**: All tools MUST accept an optional region parameter (regional API locality)

### Key Entities

- **JobDefinition**: Container job template with id, name, cpu_limit, memory_limit, image_uri, command, description, environment_variables, job_timeout, project_id, cron_schedule, created_at, updated_at
- **JobRun**: Execution instance with id, job_definition_id, state (unknown_state, queued, scheduled, running, succeeded, failed, canceled, internal_error), command, environment_variables, exit_code, started_at, terminated_at, created_at
- **CronSchedule**: Recurring execution config with schedule (cron expression) and timezone (IANA timezone)

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 9 MCP tools are registered and callable via the MCP protocol
- **SC-002**: 100% line and branch code coverage across all jobs tool files
- **SC-003**: All tools map to documented Scaleway API endpoints
- **SC-004**: Contract tests validate request/response shapes for every tool
- **SC-005**: Parity matrix includes all Serverless Jobs API operations

## Clarifications

**Resolved decisions from self-clarification:**

- **Locality**: Regional API. Supported regions: fr-par, nl-ams, pl-waw
- **API Version**: v1alpha2
- **Pagination**: Standard Scaleway page/page_size with total_count in responses
- **Auth**: SCW_ACCESS_KEY + SCW_SECRET_KEY + SCW_DEFAULT_PROJECT_ID (via shared auth module)
- **Tool naming**: `scaleway_jobs_{action}_{resource}` pattern (e.g., `scaleway_jobs_list_definitions`)
- **Error handling**: Use shared `mapScalewayError` + `formatErrorResponse` from `src/shared/errors.ts`
- **Client**: Use shared `createScalewayClient` from `src/shared/client.ts` with `loadAuthConfig` from `src/shared/auth.ts`
- **Resource limits**: cpu_limit in millicores (e.g., 1000 = 1 vCPU), memory_limit in MiB
- **Job timeout**: Duration string format (e.g., "3600s")
- **Cron schedule**: Optional recurring execution with cron expression and IANA timezone
- **Job run states**: unknown_state, queued, scheduled, running, succeeded, failed, canceled, internal_error
