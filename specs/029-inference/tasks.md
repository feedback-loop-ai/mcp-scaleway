# Tasks: Scaleway Managed Inference MCP Tools

**Input**: Design documents from `/specs/029-inference/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Schemas & Types)

**Purpose**: Define Zod schemas and TypeScript types for all entities and tool inputs

- [ ] T001 [US1] Define Zod schemas for deployment-related tool inputs in `src/tools/inference/types.ts`
- [ ] T002 [P] [US1] Define Zod schemas for endpoint-related tool inputs in `src/tools/inference/types.ts`
- [ ] T003 [P] [US2] Define Zod schemas for model-related tool inputs in `src/tools/inference/types.ts`
- [ ] T004 [P] [US2] Define Zod schemas for node type tool inputs in `src/tools/inference/types.ts`
- [ ] T005 [P] [US3] Define Zod schemas for EULA tool inputs in `src/tools/inference/types.ts`

---

## Phase 2: Foundation (API Client Helper)

**Purpose**: Create the Inference-specific API helper that wraps the shared client

- [ ] T006 Implement `apiCall` helper and utility functions (`jsonResponse`, `getClient`, `buildUrlParams`) in `src/tools/inference/handlers.ts`

**Checkpoint**: API helper ready, tool implementations can begin

---

## Phase 3: User Story 1 - Deployment CRUD & Events (Priority: P1)

**Goal**: Full deployment lifecycle management via MCP tools

**Independent Test**: Create, list, get, update, delete deployments; list events

### Implementation

- [ ] T007 [US1] Implement `handleListDeployments` handler in `src/tools/inference/handlers.ts`
- [ ] T008 [P] [US1] Implement `handleGetDeployment` handler in `src/tools/inference/handlers.ts`
- [ ] T009 [P] [US1] Implement `handleCreateDeployment` handler in `src/tools/inference/handlers.ts`
- [ ] T010 [P] [US1] Implement `handleUpdateDeployment` handler in `src/tools/inference/handlers.ts`
- [ ] T011 [P] [US1] Implement `handleDeleteDeployment` handler in `src/tools/inference/handlers.ts`
- [ ] T012 [P] [US1] Implement `handleListDeploymentEvents` handler in `src/tools/inference/handlers.ts`
- [ ] T013 [US1] Register deployment tools in `src/tools/inference/index.ts`

### Tests

- [ ] T014 [US1] Unit tests for deployment handlers in `tests/unit/tools/inference/handlers.test.ts`
- [ ] T015 [US1] Contract tests for deployment tools in `tests/contract/tools/inference/contract.test.ts`

**Checkpoint**: Deployment CRUD & events fully functional

---

## Phase 4: User Story 1 (cont.) - Endpoint Management (Priority: P1)

**Goal**: Endpoint CRUD via MCP tools

### Implementation

- [ ] T016 [US1] Implement endpoint handler functions (list, create, update, delete) in `src/tools/inference/handlers.ts`
- [ ] T017 [US1] Register endpoint tools in `src/tools/inference/index.ts`

### Tests

- [ ] T018 [US1] Unit tests for endpoint handlers in `tests/unit/tools/inference/handlers.test.ts`
- [ ] T019 [US1] Contract tests for endpoint tools in `tests/contract/tools/inference/contract.test.ts`

**Checkpoint**: Endpoint management fully functional

---

## Phase 5: User Story 2 - Models & Node Types (Priority: P2)

**Goal**: Model and node type discovery via MCP tools

### Implementation

- [ ] T020 [US2] Implement model handler functions (list, get) in `src/tools/inference/handlers.ts`
- [ ] T021 [P] [US2] Implement `handleListNodeTypes` handler in `src/tools/inference/handlers.ts`
- [ ] T022 [US2] Register model and node type tools in `src/tools/inference/index.ts`

### Tests

- [ ] T023 [US2] Unit tests for model and node type handlers in `tests/unit/tools/inference/handlers.test.ts`
- [ ] T024 [US2] Contract tests for model and node type tools in `tests/contract/tools/inference/contract.test.ts`

**Checkpoint**: Model and node type discovery fully functional

---

## Phase 6: User Story 3 - EULA Management (Priority: P3)

**Goal**: EULA retrieval and acceptance via MCP tools

### Implementation

- [ ] T025 [US3] Implement EULA handler functions (get, accept) in `src/tools/inference/handlers.ts`
- [ ] T026 [US3] Register EULA tools in `src/tools/inference/index.ts`

### Tests

- [ ] T027 [US3] Unit tests for EULA handlers in `tests/unit/tools/inference/handlers.test.ts`
- [ ] T028 [US3] Contract tests for EULA tools in `tests/contract/tools/inference/contract.test.ts`

**Checkpoint**: EULA management fully functional

---

## Phase 7: Polish & Cross-Cutting

- [ ] T029 Update `tests/parity-matrix.json` with all Inference API operations
- [ ] T030 Verify 100% code coverage
- [ ] T031 Run lint and type check

---

## Dependencies & Execution Order

- **Phase 1**: No dependencies - Zod schemas first
- **Phase 2**: Depends on Phase 1 (schemas needed for handlers)
- **Phase 3-6**: All depend on Phase 2 (API helper). Execute sequentially P1->P2->P3
- **Phase 7**: Depends on all implementation phases
