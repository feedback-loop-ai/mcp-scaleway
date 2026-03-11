# Tasks: Scaleway Serverless Jobs MCP Tools

**Input**: Design documents from `/specs/009-jobs/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Zod Schemas & Types)

**Purpose**: Define Zod schemas and TypeScript types for all job entities

- [ ] T001 [US1] Define Zod schemas for job definition tool inputs in `src/tools/jobs/types.ts`
- [ ] T002 [P] [US2] Define Zod schemas for job run tool inputs in `src/tools/jobs/types.ts`
- [ ] T003 [P] Define JobRunState enum and shared field schemas (EnvironmentVariables, CronSchedule) in `src/tools/jobs/types.ts`

---

## Phase 2: Foundation (API Client Helper)

**Purpose**: Create the Jobs-specific API helper that wraps the shared client

- [ ] T004 Implement `buildJobsUrl()` and `getRegion()` helper functions in `src/tools/jobs/handlers.ts`
- [ ] T005 Implement `getClient()` wrapper in `src/tools/jobs/handlers.ts`

**Checkpoint**: API helpers ready, tool implementations can begin

---

## Phase 3: User Story 1 - Job Definition CRUD (Priority: P1)

**Goal**: Full job definition lifecycle management via MCP tools

**Independent Test**: Create, list, get, update, delete job definitions

### Implementation

- [ ] T006 [US1] Implement `handleListJobDefinitions` handler in `src/tools/jobs/handlers.ts`
- [ ] T007 [P] [US1] Implement `handleGetJobDefinition` handler in `src/tools/jobs/handlers.ts`
- [ ] T008 [P] [US1] Implement `handleCreateJobDefinition` handler in `src/tools/jobs/handlers.ts`
- [ ] T009 [P] [US1] Implement `handleUpdateJobDefinition` handler in `src/tools/jobs/handlers.ts`
- [ ] T010 [P] [US1] Implement `handleDeleteJobDefinition` handler in `src/tools/jobs/handlers.ts`
- [ ] T011 [US1] Register job definition tools in `src/tools/jobs/index.ts`

### Tests

- [ ] T012 [US1] Unit tests for job definition handlers in `tests/unit/tools/jobs.test.ts`
- [ ] T013 [US1] Contract tests for job definition tools in `tests/contract/jobs.test.ts`

**Checkpoint**: Job definition CRUD fully functional

---

## Phase 4: User Story 2 - Job Run Management (Priority: P1)

**Goal**: Job run lifecycle management via MCP tools

### Implementation

- [ ] T014 [US2] Implement `handleStartJob` handler in `src/tools/jobs/handlers.ts`
- [ ] T015 [P] [US2] Implement `handleListJobRuns` handler in `src/tools/jobs/handlers.ts`
- [ ] T016 [P] [US2] Implement `handleGetJobRun` handler in `src/tools/jobs/handlers.ts`
- [ ] T017 [P] [US2] Implement `handleStopJobRun` handler in `src/tools/jobs/handlers.ts`
- [ ] T018 [US2] Register job run tools in `src/tools/jobs/index.ts`

### Tests

- [ ] T019 [US2] Unit tests for job run handlers in `tests/unit/tools/jobs.test.ts`
- [ ] T020 [US2] Contract tests for job run tools in `tests/contract/jobs.test.ts`

**Checkpoint**: Job run management fully functional

---

## Phase 5: Polish & Cross-Cutting

- [ ] T021 Update `tests/parity-matrix.json` with all Serverless Jobs API operations
- [ ] T022 Verify 100% code coverage
- [ ] T023 Run lint and type check

---

## Dependencies & Execution Order

- **Phase 1**: No dependencies - Zod schemas first
- **Phase 2**: Depends on Phase 1 (schemas needed for handlers)
- **Phase 3-4**: Both depend on Phase 2 (API helpers). Can be done sequentially US1->US2
- **Phase 5**: Depends on all implementation phases
