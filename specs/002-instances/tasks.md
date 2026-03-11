# Tasks: Scaleway Instances MCP Tools

**Input**: Design documents from `/specs/002-instances/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Define Zod schemas and TypeScript types for all entities

- [ ] T001 [US1] Define Zod schemas for server-related tool inputs in `src/tools/instances/types.ts`
- [ ] T002 [P] [US2] Define Zod schemas for volume-related tool inputs in `src/tools/instances/types.ts`
- [ ] T003 [P] [US3] Define Zod schemas for security-group tool inputs in `src/tools/instances/types.ts`
- [ ] T004 [P] [US4] Define Zod schemas for IP and snapshot tool inputs in `src/tools/instances/types.ts`

---

## Phase 2: Foundation (API Client Helper)

**Purpose**: Create the Instances-specific API helper that wraps the shared client

- [ ] T005 Implement Instances API helper functions in `src/tools/instances/handlers.ts` (HTTP request wrappers for all Instances API endpoints)

**Checkpoint**: API helper ready, tool implementations can begin

---

## Phase 3: User Story 1 - Server CRUD & Actions (Priority: P1)

**Goal**: Full server lifecycle management via MCP tools

**Independent Test**: Create, list, get, action, delete servers

### Implementation

- [ ] T006 [US1] Implement `scaleway_instances_list_servers` handler in `src/tools/instances/handlers.ts`
- [ ] T007 [P] [US1] Implement `scaleway_instances_get_server` handler in `src/tools/instances/handlers.ts`
- [ ] T008 [P] [US1] Implement `scaleway_instances_create_server` handler in `src/tools/instances/handlers.ts`
- [ ] T009 [P] [US1] Implement `scaleway_instances_delete_server` handler in `src/tools/instances/handlers.ts`
- [ ] T010 [P] [US1] Implement `scaleway_instances_server_action` handler in `src/tools/instances/handlers.ts`
- [ ] T011 [US1] Register server tools in `src/tools/instances/index.ts`

### Tests

- [ ] T012 [US1] Unit tests for server handlers in `tests/unit/tools/instances/handlers.test.ts`
- [ ] T013 [US1] Contract tests for server tools in `tests/contract/tools/instances/contract.test.ts`

**Checkpoint**: Server CRUD & actions fully functional

---

## Phase 4: User Story 2 - Volume Management (Priority: P2)

**Goal**: Volume CRUD via MCP tools

### Implementation

- [ ] T014 [US2] Implement volume handler functions (list, get, create, delete) in `src/tools/instances/handlers.ts`
- [ ] T015 [US2] Register volume tools in `src/tools/instances/index.ts`

### Tests

- [ ] T016 [US2] Unit tests for volume handlers in `tests/unit/tools/instances/handlers.test.ts`
- [ ] T017 [US2] Contract tests for volume tools in `tests/contract/tools/instances/contract.test.ts`

**Checkpoint**: Volume management fully functional

---

## Phase 5: User Story 3 - Security Groups (Priority: P2)

**Goal**: Security group CRUD via MCP tools

### Implementation

- [ ] T018 [US3] Implement security group handler functions in `src/tools/instances/handlers.ts`
- [ ] T019 [US3] Register security group tools in `src/tools/instances/index.ts`

### Tests

- [ ] T020 [US3] Unit tests for security group handlers in `tests/unit/tools/instances/handlers.test.ts`
- [ ] T021 [US3] Contract tests for security group tools in `tests/contract/tools/instances/contract.test.ts`

**Checkpoint**: Security group management fully functional

---

## Phase 6: User Story 4 - IPs and Snapshots (Priority: P3)

**Goal**: IP and snapshot management via MCP tools

### Implementation

- [ ] T022 [US4] Implement IP handler functions (list, create, delete, attach) in `src/tools/instances/handlers.ts`
- [ ] T023 [P] [US4] Implement snapshot handler functions (list, create, delete) in `src/tools/instances/handlers.ts`
- [ ] T024 [US4] Register IP and snapshot tools in `src/tools/instances/index.ts`

### Tests

- [ ] T025 [US4] Unit tests for IP and snapshot handlers in `tests/unit/tools/instances/handlers.test.ts`
- [ ] T026 [US4] Contract tests for IP and snapshot tools in `tests/contract/tools/instances/contract.test.ts`

**Checkpoint**: IP and snapshot management fully functional

---

## Phase 7: Polish & Cross-Cutting

- [ ] T027 Update `tests/parity-matrix.json` with all Instances API operations
- [ ] T028 Verify 100% code coverage
- [ ] T029 Run lint and type check

---

## Dependencies & Execution Order

- **Phase 1**: No dependencies - Zod schemas first
- **Phase 2**: Depends on Phase 1 (schemas needed for handlers)
- **Phase 3-6**: All depend on Phase 2 (API helper). Can be done sequentially P1->P2->P3
- **Phase 7**: Depends on all implementation phases
