# Tasks: Scaleway IoT Hub MCP Tools

**Input**: Design documents from `/specs/033-iot/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Zod Schemas)

**Purpose**: Define Zod schemas and TypeScript types for all entities

- [ ] T001 [US1] Define Zod schemas for hub-related tool inputs in `src/tools/iot/types.ts`
- [ ] T002 [P] [US2] Define Zod schemas for device-related tool inputs in `src/tools/iot/types.ts`
- [ ] T003 [P] [US3] Define Zod schemas for route-related tool inputs in `src/tools/iot/types.ts`
- [ ] T004 [P] [US4] Define Zod schemas for network-related tool inputs in `src/tools/iot/types.ts`

---

## Phase 2: Foundation (API Client Helper)

**Purpose**: Create the IoT-specific API helper that wraps direct HTTP calls

- [ ] T005 Implement `scalewayFetch`, `getIotApiUrl`, `getRegion`, and `successResponse` helpers in `src/tools/iot/handlers.ts`

**Checkpoint**: API helper ready, tool implementations can begin

---

## Phase 3: User Story 1 - Hub CRUD & Lifecycle (Priority: P1)

**Goal**: Full hub lifecycle management via MCP tools

**Independent Test**: Create, list, get, enable, disable, manage CA, delete hubs

### Implementation

- [ ] T006 [US1] Implement `handleListHubs` handler in `src/tools/iot/handlers.ts`
- [ ] T007 [P] [US1] Implement `handleGetHub` handler in `src/tools/iot/handlers.ts`
- [ ] T008 [P] [US1] Implement `handleCreateHub` handler in `src/tools/iot/handlers.ts`
- [ ] T009 [P] [US1] Implement `handleUpdateHub` handler in `src/tools/iot/handlers.ts`
- [ ] T010 [P] [US1] Implement `handleDeleteHub` handler in `src/tools/iot/handlers.ts`
- [ ] T011 [P] [US1] Implement `handleEnableHub` and `handleDisableHub` handlers in `src/tools/iot/handlers.ts`
- [ ] T012 [P] [US1] Implement `handleGetHubCA` and `handleSetHubCA` handlers in `src/tools/iot/handlers.ts`
- [ ] T013 [US1] Register hub tools in `src/tools/iot/index.ts`

### Tests

- [ ] T014 [US1] Unit tests for hub handlers in `tests/unit/tools/iot/handlers.test.ts`
- [ ] T015 [US1] Contract tests for hub tools in `tests/contract/tools/iot/contract.test.ts`

**Checkpoint**: Hub CRUD & lifecycle fully functional

---

## Phase 4: User Story 2 - Device Management (Priority: P1)

**Goal**: Device CRUD, lifecycle, certificates, and metrics via MCP tools

### Implementation

- [ ] T016 [US2] Implement device CRUD handlers (list, get, create, update, delete) in `src/tools/iot/handlers.ts`
- [ ] T017 [P] [US2] Implement device lifecycle handlers (enable, disable) in `src/tools/iot/handlers.ts`
- [ ] T018 [P] [US2] Implement device certificate handlers (get, renew, set) in `src/tools/iot/handlers.ts`
- [ ] T019 [P] [US2] Implement `handleGetDeviceMetrics` handler in `src/tools/iot/handlers.ts`
- [ ] T020 [US2] Register device tools in `src/tools/iot/index.ts`

### Tests

- [ ] T021 [US2] Unit tests for device handlers in `tests/unit/tools/iot/handlers.test.ts`
- [ ] T022 [US2] Contract tests for device tools in `tests/contract/tools/iot/contract.test.ts`

**Checkpoint**: Device management fully functional

---

## Phase 5: User Story 3 - Route Management (Priority: P2)

**Goal**: Route CRUD with S3/DB/REST backends via MCP tools

### Implementation

- [ ] T023 [US3] Implement route handler functions (list, get, create, update, delete) in `src/tools/iot/handlers.ts`
- [ ] T024 [P] [US3] Implement `buildRouteConfigBody` helper in `src/tools/iot/handlers.ts`
- [ ] T025 [US3] Register route tools in `src/tools/iot/index.ts`

### Tests

- [ ] T026 [US3] Unit tests for route handlers in `tests/unit/tools/iot/handlers.test.ts`
- [ ] T027 [US3] Contract tests for route tools in `tests/contract/tools/iot/contract.test.ts`

**Checkpoint**: Route management fully functional

---

## Phase 6: User Story 4 - Network Management (Priority: P3)

**Goal**: Network CRUD via MCP tools

### Implementation

- [ ] T028 [US4] Implement network handler functions (list, get, create, delete) in `src/tools/iot/handlers.ts`
- [ ] T029 [US4] Register network tools in `src/tools/iot/index.ts`

### Tests

- [ ] T030 [US4] Unit tests for network handlers in `tests/unit/tools/iot/handlers.test.ts`
- [ ] T031 [US4] Contract tests for network tools in `tests/contract/tools/iot/contract.test.ts`

**Checkpoint**: Network management fully functional

---

## Phase 7: Polish & Cross-Cutting

- [ ] T032 Update `tests/parity-matrix.json` with all IoT Hub API operations
- [ ] T033 Verify 100% code coverage
- [ ] T034 Run lint and type check

---

## Dependencies & Execution Order

- **Phase 1**: No dependencies - Zod schemas first
- **Phase 2**: Depends on Phase 1 (schemas needed for handlers)
- **Phase 3-6**: All depend on Phase 2 (API helper). Can be done sequentially P1->P2->P3
- **Phase 7**: Depends on all implementation phases
