# Tasks: Scaleway Block Storage MCP Tools

**Input**: Design documents from `/specs/011-block-storage/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Zod Schemas & Types)

**Purpose**: Define Zod schemas and TypeScript types for all entities

- [ ] T001 [US1] Define Zod schemas for volume-related tool inputs in `src/tools/block-storage/types.ts`
- [ ] T002 [P] [US2] Define Zod schemas for snapshot-related tool inputs in `src/tools/block-storage/types.ts`
- [ ] T003 [P] [US3] Define Zod schemas for volume-type tool inputs in `src/tools/block-storage/types.ts`

---

## Phase 2: Foundation (API Client Helper)

**Purpose**: Create the Block Storage-specific API helper that wraps the shared client

- [ ] T004 Implement Block Storage API helper functions in `src/tools/block-storage/handlers.ts` (getBlockStorageUrl, resolveZone, toUrlParams)

**Checkpoint**: API helper ready, tool implementations can begin

---

## Phase 3: User Story 1 - Volume CRUD (Priority: P1)

**Goal**: Full volume lifecycle management via MCP tools

**Independent Test**: Create, list, get, update, delete volumes

### Implementation

- [ ] T005 [US1] Implement `scaleway_block_storage_list_volumes` handler in `src/tools/block-storage/handlers.ts`
- [ ] T006 [P] [US1] Implement `scaleway_block_storage_get_volume` handler in `src/tools/block-storage/handlers.ts`
- [ ] T007 [P] [US1] Implement `scaleway_block_storage_create_volume` handler in `src/tools/block-storage/handlers.ts`
- [ ] T008 [P] [US1] Implement `scaleway_block_storage_update_volume` handler in `src/tools/block-storage/handlers.ts`
- [ ] T009 [P] [US1] Implement `scaleway_block_storage_delete_volume` handler in `src/tools/block-storage/handlers.ts`
- [ ] T010 [US1] Register volume tools in `src/tools/block-storage/index.ts`

### Tests

- [ ] T011 [US1] Unit tests for volume handlers in `tests/unit/tools/block-storage/handlers.test.ts`
- [ ] T012 [US1] Contract tests for volume tools in `tests/contract/tools/block-storage/contract.test.ts`

**Checkpoint**: Volume CRUD fully functional

---

## Phase 4: User Story 2 - Snapshot Management (Priority: P2)

**Goal**: Snapshot CRUD via MCP tools

### Implementation

- [ ] T013 [US2] Implement snapshot handler functions (list, get, create, update, delete) in `src/tools/block-storage/handlers.ts`
- [ ] T014 [US2] Register snapshot tools in `src/tools/block-storage/index.ts`

### Tests

- [ ] T015 [US2] Unit tests for snapshot handlers in `tests/unit/tools/block-storage/handlers.test.ts`
- [ ] T016 [US2] Contract tests for snapshot tools in `tests/contract/tools/block-storage/contract.test.ts`

**Checkpoint**: Snapshot management fully functional

---

## Phase 5: User Story 3 - Volume Type Discovery (Priority: P3)

**Goal**: List available volume types and their specifications

### Implementation

- [ ] T017 [US3] Implement `scaleway_block_storage_list_volume_types` handler in `src/tools/block-storage/handlers.ts`
- [ ] T018 [US3] Register volume type tool in `src/tools/block-storage/index.ts`

### Tests

- [ ] T019 [US3] Unit tests for volume type handler in `tests/unit/tools/block-storage/handlers.test.ts`
- [ ] T020 [US3] Contract tests for volume type tool in `tests/contract/tools/block-storage/contract.test.ts`

**Checkpoint**: Volume type discovery fully functional

---

## Phase 6: Polish & Cross-Cutting

- [ ] T021 Update `tests/parity-matrix.json` with all Block Storage API operations
- [ ] T022 Verify 100% code coverage
- [ ] T023 Run lint and type check

---

## Dependencies & Execution Order

- **Phase 1**: No dependencies - Zod schemas first
- **Phase 2**: Depends on Phase 1 (schemas needed for handlers)
- **Phase 3-5**: All depend on Phase 2 (API helper). Can be done sequentially P1->P2->P3
- **Phase 6**: Depends on all implementation phases
