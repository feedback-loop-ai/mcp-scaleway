# Tasks: Scaleway IAM MCP Tools

**Input**: Design documents from `/specs/023-iam/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Schemas & Types)

**Purpose**: Define Zod schemas and TypeScript types for all IAM entities and tool inputs

- [ ] T001 [US1] Define Zod schemas for user-related tool inputs in `src/tools/iam/types.ts`
- [ ] T002 [P] [US2] Define Zod schemas for application-related tool inputs in `src/tools/iam/types.ts`
- [ ] T003 [P] [US3] Define Zod schemas for API key tool inputs in `src/tools/iam/types.ts`
- [ ] T004 [P] [US4] Define Zod schemas for policy and rule tool inputs in `src/tools/iam/types.ts`
- [ ] T005 [P] [US5] Define Zod schemas for group and membership tool inputs in `src/tools/iam/types.ts`
- [ ] T006 [P] [US6] Define Zod schemas for permission set tool inputs in `src/tools/iam/types.ts`

---

## Phase 2: Foundation (Handler Helpers)

**Purpose**: Create the IAM-specific handler helpers that wrap the shared client

- [ ] T007 Implement `jsonResponse` and `buildParams` helper functions in `src/tools/iam/handlers.ts`
- [ ] T008 Implement `getClient` helper in `src/tools/iam/index.ts`

**Checkpoint**: Handler helpers ready, tool implementations can begin

---

## Phase 3: User Story 1 - User Management (Priority: P1)

**Goal**: Full user lifecycle management via MCP tools

**Independent Test**: Create, list, get, update, delete users

### Implementation

- [ ] T009 [US1] Implement `handleListUsers` handler in `src/tools/iam/handlers.ts`
- [ ] T010 [P] [US1] Implement `handleGetUser` handler in `src/tools/iam/handlers.ts`
- [ ] T011 [P] [US1] Implement `handleCreateUser` handler in `src/tools/iam/handlers.ts`
- [ ] T012 [P] [US1] Implement `handleUpdateUser` handler in `src/tools/iam/handlers.ts`
- [ ] T013 [P] [US1] Implement `handleDeleteUser` handler in `src/tools/iam/handlers.ts`
- [ ] T014 [US1] Register user tools in `src/tools/iam/index.ts`

### Tests

- [ ] T015 [US1] Unit tests for user handlers in `tests/unit/tools/iam/handlers.test.ts`
- [ ] T016 [US1] Contract tests for user tools in `tests/contract/tools/iam/contract.test.ts`

**Checkpoint**: User management fully functional

---

## Phase 4: User Story 2 - Application Management (Priority: P1)

**Goal**: Application CRUD via MCP tools

### Implementation

- [ ] T017 [US2] Implement application handler functions (list, get, create, update, delete) in `src/tools/iam/handlers.ts`
- [ ] T018 [US2] Register application tools in `src/tools/iam/index.ts`

### Tests

- [ ] T019 [US2] Unit tests for application handlers in `tests/unit/tools/iam/handlers.test.ts`
- [ ] T020 [US2] Contract tests for application tools in `tests/contract/tools/iam/contract.test.ts`

**Checkpoint**: Application management fully functional

---

## Phase 5: User Story 3 - API Key Management (Priority: P1)

**Goal**: API key CRUD via MCP tools

### Implementation

- [ ] T021 [US3] Implement API key handler functions (list, get, create, update, delete) in `src/tools/iam/handlers.ts`
- [ ] T022 [US3] Register API key tools in `src/tools/iam/index.ts`

### Tests

- [ ] T023 [US3] Unit tests for API key handlers in `tests/unit/tools/iam/handlers.test.ts`
- [ ] T024 [US3] Contract tests for API key tools in `tests/contract/tools/iam/contract.test.ts`

**Checkpoint**: API key management fully functional

---

## Phase 6: User Story 4 - Policy & Rule Management (Priority: P2)

**Goal**: Policy and rule CRUD via MCP tools

### Implementation

- [ ] T025 [US4] Implement policy handler functions (list, get, create, update, delete) in `src/tools/iam/handlers.ts`
- [ ] T026 [P] [US4] Implement rule handler functions (list, create, update, delete) in `src/tools/iam/handlers.ts`
- [ ] T027 [US4] Register policy and rule tools in `src/tools/iam/index.ts`

### Tests

- [ ] T028 [US4] Unit tests for policy and rule handlers in `tests/unit/tools/iam/handlers.test.ts`
- [ ] T029 [US4] Contract tests for policy and rule tools in `tests/contract/tools/iam/contract.test.ts`

**Checkpoint**: Policy and rule management fully functional

---

## Phase 7: User Story 5 - Group Management (Priority: P2)

**Goal**: Group CRUD and membership management via MCP tools

### Implementation

- [ ] T030 [US5] Implement group handler functions (list, get, create, update, delete) in `src/tools/iam/handlers.ts`
- [ ] T031 [P] [US5] Implement group membership handlers (add_member, remove_member) in `src/tools/iam/handlers.ts`
- [ ] T032 [US5] Register group tools in `src/tools/iam/index.ts`

### Tests

- [ ] T033 [US5] Unit tests for group handlers in `tests/unit/tools/iam/handlers.test.ts`
- [ ] T034 [US5] Contract tests for group tools in `tests/contract/tools/iam/contract.test.ts`

**Checkpoint**: Group management fully functional

---

## Phase 8: User Story 6 - Permission Sets (Priority: P3)

**Goal**: Permission set discovery via MCP tools

### Implementation

- [ ] T035 [US6] Implement `handleListPermissionSets` handler in `src/tools/iam/handlers.ts`
- [ ] T036 [US6] Register permission set tool in `src/tools/iam/index.ts`

### Tests

- [ ] T037 [US6] Unit tests for permission set handler in `tests/unit/tools/iam/handlers.test.ts`
- [ ] T038 [US6] Contract tests for permission set tool in `tests/contract/tools/iam/contract.test.ts`

**Checkpoint**: Permission set discovery fully functional

---

## Phase 9: Polish & Cross-Cutting

- [ ] T039 Update `tests/parity-matrix.json` with all IAM API operations
- [ ] T040 Verify 100% code coverage
- [ ] T041 Run lint and type check

---

## Dependencies & Execution Order

- **Phase 1**: No dependencies - Zod schemas first
- **Phase 2**: Depends on Phase 1 (schemas needed for handlers)
- **Phase 3-8**: All depend on Phase 2 (handler helpers). Can be done sequentially P1->P2->P3
- **Phase 9**: Depends on all implementation phases
