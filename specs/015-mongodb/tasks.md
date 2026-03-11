# Tasks: Scaleway Managed MongoDB MCP Tools

**Input**: Design documents from `/specs/015-mongodb/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Zod Schemas & Types)

**Purpose**: Define Zod schemas and TypeScript types for all entities

- [ ] T001 [US1] Define Zod schemas for instance-related tool inputs in `src/tools/mongodb/types.ts`
- [ ] T002 [P] [US2] Define Zod schemas for user-related tool inputs in `src/tools/mongodb/types.ts`
- [ ] T003 [P] [US3] Define Zod schemas for snapshot-related tool inputs in `src/tools/mongodb/types.ts`
- [ ] T004 [P] [US4] Define Zod schemas for node type and version tool inputs in `src/tools/mongodb/types.ts`

---

## Phase 2: Foundation (API Client Helper)

**Purpose**: Create the MongoDB-specific API helper that wraps the shared client

- [ ] T005 Implement MongoDB API helper functions in `src/tools/mongodb/handlers.ts` (HTTP request wrappers for all MongoDB API endpoints)

**Checkpoint**: API helper ready, tool implementations can begin

---

## Phase 3: User Story 1 - Instance CRUD (Priority: P1)

**Goal**: Full instance lifecycle management via MCP tools

**Independent Test**: Create, list, get, update, delete instances

### Implementation

- [ ] T006 [US1] Implement `scaleway_mongodb_list_instances` handler in `src/tools/mongodb/handlers.ts`
- [ ] T007 [P] [US1] Implement `scaleway_mongodb_get_instance` handler in `src/tools/mongodb/handlers.ts`
- [ ] T008 [P] [US1] Implement `scaleway_mongodb_create_instance` handler in `src/tools/mongodb/handlers.ts`
- [ ] T009 [P] [US1] Implement `scaleway_mongodb_update_instance` handler in `src/tools/mongodb/handlers.ts`
- [ ] T010 [P] [US1] Implement `scaleway_mongodb_delete_instance` handler in `src/tools/mongodb/handlers.ts`
- [ ] T011 [US1] Register instance tools in `src/tools/mongodb/index.ts`

### Tests

- [ ] T012 [US1] Unit tests for instance handlers in `tests/unit/tools/mongodb/handlers.test.ts`
- [ ] T013 [US1] Contract tests for instance tools in `tests/contract/tools/mongodb/contract.test.ts`

**Checkpoint**: Instance CRUD fully functional

---

## Phase 4: User Story 2 - User Management (Priority: P2)

**Goal**: User CRUD on MongoDB instances via MCP tools

### Implementation

- [ ] T014 [US2] Implement user handler functions (list, create, update, delete) in `src/tools/mongodb/handlers.ts`
- [ ] T015 [US2] Register user tools in `src/tools/mongodb/index.ts`

### Tests

- [ ] T016 [US2] Unit tests for user handlers in `tests/unit/tools/mongodb/handlers.test.ts`
- [ ] T017 [US2] Contract tests for user tools in `tests/contract/tools/mongodb/contract.test.ts`

**Checkpoint**: User management fully functional

---

## Phase 5: User Story 3 - Snapshot Management (Priority: P2)

**Goal**: Snapshot CRUD and restore via MCP tools

### Implementation

- [ ] T018 [US3] Implement snapshot handler functions (list, create, restore, delete) in `src/tools/mongodb/handlers.ts`
- [ ] T019 [US3] Register snapshot tools in `src/tools/mongodb/index.ts`

### Tests

- [ ] T020 [US3] Unit tests for snapshot handlers in `tests/unit/tools/mongodb/handlers.test.ts`
- [ ] T021 [US3] Contract tests for snapshot tools in `tests/contract/tools/mongodb/contract.test.ts`

**Checkpoint**: Snapshot management fully functional

---

## Phase 6: User Story 4 - Node Types & Versions (Priority: P3)

**Goal**: Discovery endpoints for node types and MongoDB versions

### Implementation

- [ ] T022 [US4] Implement node type and version handler functions in `src/tools/mongodb/handlers.ts`
- [ ] T023 [US4] Register node type and version tools in `src/tools/mongodb/index.ts`

### Tests

- [ ] T024 [US4] Unit tests for node type and version handlers in `tests/unit/tools/mongodb/handlers.test.ts`
- [ ] T025 [US4] Contract tests for node type and version tools in `tests/contract/tools/mongodb/contract.test.ts`

**Checkpoint**: Discovery endpoints fully functional

---

## Phase 7: Polish & Cross-Cutting

- [ ] T026 Update `tests/parity-matrix.json` with all MongoDB API operations
- [ ] T027 Verify 100% code coverage
- [ ] T028 Run lint and type check

---

## Dependencies & Execution Order

- **Phase 1**: No dependencies - Zod schemas first
- **Phase 2**: Depends on Phase 1 (schemas needed for handlers)
- **Phase 3-6**: All depend on Phase 2 (API helper). Can be done sequentially P1->P2->P3
- **Phase 7**: Depends on all implementation phases
