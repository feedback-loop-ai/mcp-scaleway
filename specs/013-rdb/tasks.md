# Tasks: Scaleway Managed Database (RDB) MCP Tools

**Input**: Design documents from `/specs/013-rdb/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Zod Schemas & Types)

**Purpose**: Define Zod schemas and TypeScript types for all entities and input shapes

- [ ] T001 [US1] Define Zod schemas for instance-related tool inputs in `src/tools/rdb/types.ts`
- [ ] T002 [P] [US2] Define Zod schemas for database and user tool inputs in `src/tools/rdb/types.ts`
- [ ] T003 [P] [US3] Define Zod schemas for backup tool inputs in `src/tools/rdb/types.ts`
- [ ] T004 [P] [US4] Define Zod schemas for endpoint and ACL tool inputs in `src/tools/rdb/types.ts`
- [ ] T005 [P] [US5] Define Zod schemas for snapshot tool inputs in `src/tools/rdb/types.ts`
- [ ] T006 [P] [US6] Define Zod schemas for reference data tool inputs in `src/tools/rdb/types.ts`

---

## Phase 2: Foundation (API Client Helper)

**Purpose**: Create the RDB-specific API helper that wraps the shared client

- [ ] T007 Implement RDB API helper functions in `src/tools/rdb/handlers.ts` (getApiUrl, getConfig, successResponse, apiRequest)

**Checkpoint**: API helper ready, tool implementations can begin

---

## Phase 3: User Story 1 - Instance CRUD & Upgrade (Priority: P1)

**Goal**: Full instance lifecycle management via MCP tools

**Independent Test**: Create, list, get, update, upgrade, delete instances

### Implementation

- [ ] T008 [US1] Implement `scaleway_rdb_list_instances` handler in `src/tools/rdb/handlers.ts`
- [ ] T009 [P] [US1] Implement `scaleway_rdb_get_instance` handler in `src/tools/rdb/handlers.ts`
- [ ] T010 [P] [US1] Implement `scaleway_rdb_create_instance` handler in `src/tools/rdb/handlers.ts`
- [ ] T011 [P] [US1] Implement `scaleway_rdb_update_instance` handler in `src/tools/rdb/handlers.ts`
- [ ] T012 [P] [US1] Implement `scaleway_rdb_delete_instance` handler in `src/tools/rdb/handlers.ts`
- [ ] T013 [P] [US1] Implement `scaleway_rdb_upgrade_instance` handler in `src/tools/rdb/handlers.ts`
- [ ] T014 [US1] Register instance tools in `src/tools/rdb/index.ts`

### Tests

- [ ] T015 [US1] Unit tests for instance handlers in `tests/unit/tools/rdb/handlers.test.ts`
- [ ] T016 [US1] Contract tests for instance tools in `tests/contract/tools/rdb/contract.test.ts`

**Checkpoint**: Instance CRUD & upgrade fully functional

---

## Phase 4: User Story 2 - Database & User Management (Priority: P1)

**Goal**: Database and user CRUD via MCP tools

### Implementation

- [ ] T017 [US2] Implement database handler functions (list, create, delete) in `src/tools/rdb/handlers.ts`
- [ ] T018 [P] [US2] Implement user handler functions (list, create, update, delete) in `src/tools/rdb/handlers.ts`
- [ ] T019 [US2] Register database and user tools in `src/tools/rdb/index.ts`

### Tests

- [ ] T020 [US2] Unit tests for database and user handlers in `tests/unit/tools/rdb/handlers.test.ts`
- [ ] T021 [US2] Contract tests for database and user tools in `tests/contract/tools/rdb/contract.test.ts`

**Checkpoint**: Database and user management fully functional

---

## Phase 5: User Story 3 - Backup & Restore (Priority: P2)

**Goal**: Backup creation, listing, and restoration via MCP tools

### Implementation

- [ ] T022 [US3] Implement backup handler functions (list, create, restore) in `src/tools/rdb/handlers.ts`
- [ ] T023 [US3] Register backup tools in `src/tools/rdb/index.ts`

### Tests

- [ ] T024 [US3] Unit tests for backup handlers in `tests/unit/tools/rdb/handlers.test.ts`
- [ ] T025 [US3] Contract tests for backup tools in `tests/contract/tools/rdb/contract.test.ts`

**Checkpoint**: Backup management fully functional

---

## Phase 6: User Story 4 - Endpoints & ACL Rules (Priority: P2)

**Goal**: Endpoint and ACL rule management via MCP tools

### Implementation

- [ ] T026 [US4] Implement endpoint handler functions (list, create, delete) in `src/tools/rdb/handlers.ts`
- [ ] T027 [P] [US4] Implement ACL handler functions (list, add, delete) in `src/tools/rdb/handlers.ts`
- [ ] T028 [US4] Register endpoint and ACL tools in `src/tools/rdb/index.ts`

### Tests

- [ ] T029 [US4] Unit tests for endpoint and ACL handlers in `tests/unit/tools/rdb/handlers.test.ts`
- [ ] T030 [US4] Contract tests for endpoint and ACL tools in `tests/contract/tools/rdb/contract.test.ts`

**Checkpoint**: Endpoint and ACL management fully functional

---

## Phase 7: User Story 5 - Snapshots (Priority: P3)

**Goal**: Snapshot creation, listing, and restoration via MCP tools

### Implementation

- [ ] T031 [US5] Implement snapshot handler functions (list, create, restore) in `src/tools/rdb/handlers.ts`
- [ ] T032 [US5] Register snapshot tools in `src/tools/rdb/index.ts`

### Tests

- [ ] T033 [US5] Unit tests for snapshot handlers in `tests/unit/tools/rdb/handlers.test.ts`
- [ ] T034 [US5] Contract tests for snapshot tools in `tests/contract/tools/rdb/contract.test.ts`

**Checkpoint**: Snapshot management fully functional

---

## Phase 8: User Story 6 - Reference Data (Priority: P3)

**Goal**: Node type and database engine listing via MCP tools

### Implementation

- [ ] T035 [US6] Implement reference handler functions (list_node_types, list_database_engines) in `src/tools/rdb/handlers.ts`
- [ ] T036 [US6] Register reference tools in `src/tools/rdb/index.ts`

### Tests

- [ ] T037 [US6] Unit tests for reference handlers in `tests/unit/tools/rdb/handlers.test.ts`
- [ ] T038 [US6] Contract tests for reference tools in `tests/contract/tools/rdb/contract.test.ts`

**Checkpoint**: Reference data tools fully functional

---

## Phase 9: Polish & Cross-Cutting

- [ ] T039 Update `tests/parity-matrix.json` with all RDB API operations
- [ ] T040 Verify 100% code coverage
- [ ] T041 Run lint and type check

---

## Dependencies & Execution Order

- **Phase 1**: No dependencies - Zod schemas first
- **Phase 2**: Depends on Phase 1 (schemas needed for handlers)
- **Phase 3-8**: All depend on Phase 2 (API helper). Can be done sequentially by priority P1->P2->P3
- **Phase 9**: Depends on all implementation phases
