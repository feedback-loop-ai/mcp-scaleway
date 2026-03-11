# Tasks: Scaleway SQS (Queues) MCP Tools

**Input**: Design documents from `/specs/027-sqs/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Zod Schemas & Types)

**Purpose**: Define Zod schemas and TypeScript types for all SQS entities and tool inputs

- [ ] T001 [US1] Define Zod enums for SqsStatus and SqsCredentialsOrderBy in `src/tools/sqs/types.ts`
- [ ] T002 [P] [US1] Define Zod schema for SqsPermissions in `src/tools/sqs/types.ts`
- [ ] T003 [P] [US1] Define Zod response schemas (SqsInfo, SqsCredentials) in `src/tools/sqs/types.ts`
- [ ] T004 [P] [US1] Define Zod input schemas for all 8 tools in `src/tools/sqs/types.ts`

---

## Phase 2: Foundation (Handler Functions)

**Purpose**: Implement handler functions that call the Scaleway SQS management API

- [ ] T005 Implement shared `getClient()` and `formatResponse()` helpers in `src/tools/sqs/handlers.ts`

**Checkpoint**: API helper ready, tool implementations can begin

---

## Phase 3: User Story 1 - Activate/Deactivate SQS (Priority: P1)

**Goal**: Enable and disable SQS service for a project

**Independent Test**: Activate, get info, deactivate

### Implementation

- [ ] T006 [US1] Implement `handleActivateSqs` handler in `src/tools/sqs/handlers.ts`
- [ ] T007 [P] [US1] Implement `handleDeactivateSqs` handler in `src/tools/sqs/handlers.ts`
- [ ] T008 [US2] Implement `handleGetSqsInfo` handler in `src/tools/sqs/handlers.ts`

### Tests

- [ ] T009 [US1] Unit tests for activate/deactivate/get-info handlers in `tests/unit/tools/sqs.test.ts`
- [ ] T010 [US1] Contract tests for activate/deactivate/get-info tools in `tests/contract/tools/sqs.contract.test.ts`

**Checkpoint**: Service management fully functional

---

## Phase 4: User Story 2 - Credentials CRUD (Priority: P1)

**Goal**: Full credentials lifecycle management via MCP tools

### Implementation

- [ ] T011 [US2] Implement `handleCreateSqsCredentials` handler in `src/tools/sqs/handlers.ts`
- [ ] T012 [P] [US2] Implement `handleDeleteSqsCredentials` handler in `src/tools/sqs/handlers.ts`
- [ ] T013 [P] [US2] Implement `handleGetSqsCredentials` handler in `src/tools/sqs/handlers.ts`
- [ ] T014 [P] [US2] Implement `handleListSqsCredentials` handler in `src/tools/sqs/handlers.ts`
- [ ] T015 [P] [US2] Implement `handleUpdateSqsCredentials` handler in `src/tools/sqs/handlers.ts`

### Tests

- [ ] T016 [US2] Unit tests for credentials handlers in `tests/unit/tools/sqs.test.ts`
- [ ] T017 [US2] Contract tests for credentials tools in `tests/contract/tools/sqs.contract.test.ts`

**Checkpoint**: Credentials CRUD fully functional

---

## Phase 5: Tool Registration

**Purpose**: Register all 8 SQS tools with the MCP server

- [ ] T018 [US1,US2] Register all SQS tools in `src/tools/sqs/index.ts` via `registerSqsTools()`

---

## Phase 6: Polish & Cross-Cutting

- [ ] T019 Update `tests/parity-matrix.json` with all SQS API operations
- [ ] T020 Verify 100% code coverage
- [ ] T021 Run lint and type check

---

## Dependencies & Execution Order

- **Phase 1**: No dependencies - Zod schemas first
- **Phase 2**: Depends on Phase 1 (schemas needed for handlers)
- **Phase 3-4**: Both depend on Phase 2 (API helper). Phase 3 before Phase 4 (service must be activated before credentials)
- **Phase 5**: Depends on Phases 3-4 (all handlers implemented)
- **Phase 6**: Depends on all implementation phases
