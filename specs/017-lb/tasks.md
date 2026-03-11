# Tasks: Scaleway Load Balancer MCP Tools

**Input**: Design documents from `/specs/017-lb/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Zod Schemas)

**Purpose**: Define Zod schemas and TypeScript types for all LB entities

- [ ] T001 [US1] Define Zod schemas for LB-related tool inputs in `src/tools/lb/types.ts` (ListLbsParams, GetLbParams, CreateLbParams, UpdateLbParams, DeleteLbParams, MigrateLbParams)
- [ ] T002 [P] [US2] Define Zod schemas for frontend tool inputs in `src/tools/lb/types.ts` (ListFrontendsParams, GetFrontendParams, CreateFrontendParams, UpdateFrontendParams, DeleteFrontendParams)
- [ ] T003 [P] [US3] Define Zod schemas for backend tool inputs in `src/tools/lb/types.ts` (ListBackendsParams, GetBackendParams, CreateBackendParams, UpdateBackendParams, DeleteBackendParams, AddBackendServersParams, RemoveBackendServersParams, SetBackendServersParams)
- [ ] T004 [P] [US4] Define Zod schemas for route tool inputs in `src/tools/lb/types.ts` (ListRoutesParams, GetRouteParams, CreateRouteParams, UpdateRouteParams, DeleteRouteParams)
- [ ] T005 [P] [US5] Define Zod schemas for certificate tool inputs in `src/tools/lb/types.ts` (ListCertificatesParams, GetCertificateParams, CreateCertificateParams, UpdateCertificateParams, DeleteCertificateParams)
- [ ] T006 [P] [US6] Define Zod schemas for stats and types tool inputs in `src/tools/lb/types.ts` (GetLbStatsParams, ListLbTypesParams)

---

## Phase 2: Foundation (Handler Helpers)

**Purpose**: Create the LB-specific handler helpers that wrap the shared client

- [ ] T007 Implement shared handler helpers in `src/tools/lb/handlers.ts` (getClient, resolveZone, jsonResponse, buildUrlParams)

**Checkpoint**: Handler helpers ready, tool implementations can begin

---

## Phase 3: User Story 1 - LB CRUD & Migration (Priority: P1)

**Goal**: Full load balancer lifecycle management via MCP tools

**Independent Test**: Create, list, get, update, migrate, delete LBs

### Implementation

- [ ] T008 [US1] Implement `handleListLbs` handler in `src/tools/lb/handlers.ts`
- [ ] T009 [P] [US1] Implement `handleGetLb` handler in `src/tools/lb/handlers.ts`
- [ ] T010 [P] [US1] Implement `handleCreateLb` handler in `src/tools/lb/handlers.ts`
- [ ] T011 [P] [US1] Implement `handleUpdateLb` handler in `src/tools/lb/handlers.ts`
- [ ] T012 [P] [US1] Implement `handleDeleteLb` handler in `src/tools/lb/handlers.ts`
- [ ] T013 [P] [US1] Implement `handleMigrateLb` handler in `src/tools/lb/handlers.ts`
- [ ] T014 [US1] Register LB tools in `src/tools/lb/index.ts`

### Tests

- [ ] T015 [US1] Unit tests for LB handlers in `tests/unit/tools/lb/handlers.test.ts`
- [ ] T016 [US1] Contract tests for LB tools in `tests/contract/tools/lb/contract.test.ts`

**Checkpoint**: LB CRUD & migration fully functional

---

## Phase 4: User Story 2 - Frontend Management (Priority: P1)

**Goal**: Frontend CRUD via MCP tools

### Implementation

- [ ] T017 [US2] Implement frontend handler functions (list, get, create, update, delete) in `src/tools/lb/handlers.ts`
- [ ] T018 [US2] Register frontend tools in `src/tools/lb/index.ts`

### Tests

- [ ] T019 [US2] Unit tests for frontend handlers in `tests/unit/tools/lb/handlers.test.ts`
- [ ] T020 [US2] Contract tests for frontend tools in `tests/contract/tools/lb/contract.test.ts`

**Checkpoint**: Frontend management fully functional

---

## Phase 5: User Story 3 - Backend Management (Priority: P1)

**Goal**: Backend CRUD and server pool management via MCP tools

### Implementation

- [ ] T021 [US3] Implement backend handler functions (list, get, create, update, delete) in `src/tools/lb/handlers.ts`
- [ ] T022 [P] [US3] Implement server pool handler functions (add, remove, set) in `src/tools/lb/handlers.ts`
- [ ] T023 [US3] Register backend tools in `src/tools/lb/index.ts`

### Tests

- [ ] T024 [US3] Unit tests for backend handlers in `tests/unit/tools/lb/handlers.test.ts`
- [ ] T025 [US3] Contract tests for backend tools in `tests/contract/tools/lb/contract.test.ts`

**Checkpoint**: Backend management fully functional

---

## Phase 6: User Story 4 - Route Management (Priority: P2)

**Goal**: Route CRUD via MCP tools

### Implementation

- [ ] T026 [US4] Implement route handler functions (list, get, create, update, delete) in `src/tools/lb/handlers.ts`
- [ ] T027 [US4] Register route tools in `src/tools/lb/index.ts`

### Tests

- [ ] T028 [US4] Unit tests for route handlers in `tests/unit/tools/lb/handlers.test.ts`
- [ ] T029 [US4] Contract tests for route tools in `tests/contract/tools/lb/contract.test.ts`

**Checkpoint**: Route management fully functional

---

## Phase 7: User Story 5 - Certificate Management (Priority: P2)

**Goal**: Certificate CRUD via MCP tools

### Implementation

- [ ] T030 [US5] Implement certificate handler functions (list, get, create, update, delete) in `src/tools/lb/handlers.ts`
- [ ] T031 [US5] Register certificate tools in `src/tools/lb/index.ts`

### Tests

- [ ] T032 [US5] Unit tests for certificate handlers in `tests/unit/tools/lb/handlers.test.ts`
- [ ] T033 [US5] Contract tests for certificate tools in `tests/contract/tools/lb/contract.test.ts`

**Checkpoint**: Certificate management fully functional

---

## Phase 8: User Story 6 - Stats & Types (Priority: P3)

**Goal**: LB statistics and type listing via MCP tools

### Implementation

- [ ] T034 [US6] Implement stats and types handler functions in `src/tools/lb/handlers.ts`
- [ ] T035 [US6] Register stats and types tools in `src/tools/lb/index.ts`

### Tests

- [ ] T036 [US6] Unit tests for stats and types handlers in `tests/unit/tools/lb/handlers.test.ts`
- [ ] T037 [US6] Contract tests for stats and types tools in `tests/contract/tools/lb/contract.test.ts`

**Checkpoint**: Stats & types fully functional

---

## Phase 9: Polish & Cross-Cutting

- [ ] T038 Update `tests/parity-matrix.json` with all LB API operations
- [ ] T039 Verify 100% code coverage
- [ ] T040 Run lint and type check

---

## Dependencies & Execution Order

- **Phase 1**: No dependencies - Zod schemas first
- **Phase 2**: Depends on Phase 1 (schemas needed for handlers)
- **Phase 3-8**: All depend on Phase 2 (handler helpers). Can be done sequentially P1->P2->P3
- **Phase 9**: Depends on all implementation phases
