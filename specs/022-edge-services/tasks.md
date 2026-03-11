# Tasks: Scaleway Edge Services MCP Tools

**Input**: Design documents from `/specs/022-edge-services/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Zod Schemas & Types)

**Purpose**: Define Zod schemas and TypeScript types for all Edge Services entities

- [ ] T001 [US1] Define Zod schemas for pipeline-related tool inputs in `src/tools/edge-services/types.ts`
- [ ] T002 [P] [US2] Define Zod schemas for DNS stage tool inputs in `src/tools/edge-services/types.ts`
- [ ] T003 [P] [US2] Define Zod schemas for TLS stage tool inputs in `src/tools/edge-services/types.ts`
- [ ] T004 [P] [US2] Define Zod schemas for cache stage tool inputs in `src/tools/edge-services/types.ts`
- [ ] T005 [P] [US2] Define Zod schemas for backend stage tool inputs in `src/tools/edge-services/types.ts`
- [ ] T006 [P] [US3] Define Zod schemas for purge request tool inputs in `src/tools/edge-services/types.ts`

---

## Phase 2: Foundation (API Client Helper)

**Purpose**: Set up the Edge Services API wrapper using `@scaleway/sdk-edge-services`

- [ ] T007 Implement `getApi()` helper function in `src/tools/edge-services/handlers.ts` (instantiates SDK API class with shared client)

**Checkpoint**: API helper ready, tool implementations can begin

---

## Phase 3: User Story 1 - Pipeline CRUD (Priority: P1)

**Goal**: Full pipeline lifecycle management via MCP tools

**Independent Test**: Create, list, get, update, delete pipelines

### Implementation

- [ ] T008 [US1] Implement `handleListPipelines` handler in `src/tools/edge-services/handlers.ts`
- [ ] T009 [P] [US1] Implement `handleGetPipeline` handler in `src/tools/edge-services/handlers.ts`
- [ ] T010 [P] [US1] Implement `handleCreatePipeline` handler in `src/tools/edge-services/handlers.ts`
- [ ] T011 [P] [US1] Implement `handleUpdatePipeline` handler in `src/tools/edge-services/handlers.ts`
- [ ] T012 [P] [US1] Implement `handleDeletePipeline` handler in `src/tools/edge-services/handlers.ts`
- [ ] T013 [US1] Register pipeline tools in `src/tools/edge-services/index.ts`

### Tests

- [ ] T014 [US1] Unit tests for pipeline handlers in `tests/unit/tools/edge-services/handlers.test.ts`
- [ ] T015 [US1] Contract tests for pipeline tools in `tests/contract/tools/edge-services/contract.test.ts`

**Checkpoint**: Pipeline CRUD fully functional

---

## Phase 4: User Story 2 - Stage Management (Priority: P2)

**Goal**: DNS, TLS, cache, and backend stage CRUD via MCP tools

### DNS Stage Implementation

- [ ] T016 [US2] Implement DNS stage handlers (list, get, create, update, delete) in `src/tools/edge-services/handlers.ts`
- [ ] T017 [US2] Register DNS stage tools in `src/tools/edge-services/index.ts`

### TLS Stage Implementation

- [ ] T018 [P] [US2] Implement TLS stage handlers (list, get, create, update, delete) in `src/tools/edge-services/handlers.ts`
- [ ] T019 [US2] Register TLS stage tools in `src/tools/edge-services/index.ts`

### Cache Stage Implementation

- [ ] T020 [P] [US2] Implement cache stage handlers (list, get, create, update, delete) in `src/tools/edge-services/handlers.ts`
- [ ] T021 [US2] Register cache stage tools in `src/tools/edge-services/index.ts`

### Backend Stage Implementation

- [ ] T022 [P] [US2] Implement backend stage handlers (list, get, create, update, delete) in `src/tools/edge-services/handlers.ts`
- [ ] T023 [US2] Register backend stage tools in `src/tools/edge-services/index.ts`

### Tests

- [ ] T024 [US2] Unit tests for all stage handlers in `tests/unit/tools/edge-services/handlers.test.ts`
- [ ] T025 [US2] Contract tests for all stage tools in `tests/contract/tools/edge-services/contract.test.ts`

**Checkpoint**: All stage types fully functional

---

## Phase 5: User Story 3 - Cache Purging (Priority: P2)

**Goal**: Cache purge request management via MCP tools

### Implementation

- [ ] T026 [US3] Implement purge handlers (purge cache, list purge requests, get purge request) in `src/tools/edge-services/handlers.ts`
- [ ] T027 [US3] Register purge request tools in `src/tools/edge-services/index.ts`

### Tests

- [ ] T028 [US3] Unit tests for purge handlers in `tests/unit/tools/edge-services/handlers.test.ts`
- [ ] T029 [US3] Contract tests for purge tools in `tests/contract/tools/edge-services/contract.test.ts`

**Checkpoint**: Cache purging fully functional

---

## Phase 6: Polish & Cross-Cutting

- [ ] T030 Update `tests/parity-matrix.json` with all 28 Edge Services API operations
- [ ] T031 Verify 100% code coverage
- [ ] T032 Run lint and type check

---

## Dependencies & Execution Order

- **Phase 1**: No dependencies - Zod schemas first
- **Phase 2**: Depends on Phase 1 (schemas needed for handlers)
- **Phase 3**: Depends on Phase 2 (API helper). Pipeline CRUD first as foundation
- **Phase 4**: Depends on Phase 3 (pipelines must exist to create stages)
- **Phase 5**: Depends on Phase 3 (pipelines must exist for purge requests)
- **Phase 6**: Depends on all implementation phases
