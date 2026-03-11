# Tasks: Scaleway Container Registry MCP Tools

**Input**: Design documents from `/specs/006-registry/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Schemas & Types)

**Purpose**: Define Zod schemas and TypeScript types for all entities and tool inputs

- [ ] T001 [US1] Define Zod schemas for Namespace entity and namespace-related tool inputs in `src/tools/registry/types.ts`
- [ ] T002 [P] [US2] Define Zod schemas for Image entity and image-related tool inputs in `src/tools/registry/types.ts`
- [ ] T003 [P] [US3] Define Zod schemas for Tag entity and tag-related tool inputs in `src/tools/registry/types.ts`

---

## Phase 2: Foundation (Handler Helpers)

**Purpose**: Create the Registry-specific helper functions that support all handlers

- [ ] T004 Implement `buildPath`, `successResponse`, and `toUrlParams` helper functions in `src/tools/registry/handlers.ts`

**Checkpoint**: Helper functions ready, handler implementations can begin

---

## Phase 3: User Story 1 - Namespace CRUD (Priority: P1)

**Goal**: Full namespace lifecycle management via MCP tools

**Independent Test**: Create, list, get, update, delete namespaces

### Implementation

- [ ] T005 [US1] Implement `handleListNamespaces` handler in `src/tools/registry/handlers.ts`
- [ ] T006 [P] [US1] Implement `handleGetNamespace` handler in `src/tools/registry/handlers.ts`
- [ ] T007 [P] [US1] Implement `handleCreateNamespace` handler in `src/tools/registry/handlers.ts`
- [ ] T008 [P] [US1] Implement `handleUpdateNamespace` handler in `src/tools/registry/handlers.ts`
- [ ] T009 [P] [US1] Implement `handleDeleteNamespace` handler in `src/tools/registry/handlers.ts`
- [ ] T010 [US1] Register namespace tools in `src/tools/registry/index.ts`

### Tests

- [ ] T011 [US1] Unit tests for namespace handlers in `tests/unit/tools/registry/handlers.test.ts`
- [ ] T012 [US1] Contract tests for namespace tools in `tests/contract/tools/registry/contract.test.ts`

**Checkpoint**: Namespace CRUD fully functional

---

## Phase 4: User Story 2 - Image Management (Priority: P1)

**Goal**: Image list, get, update, delete via MCP tools

### Implementation

- [ ] T013 [US2] Implement image handler functions (list, get, update, delete) in `src/tools/registry/handlers.ts`
- [ ] T014 [US2] Register image tools in `src/tools/registry/index.ts`

### Tests

- [ ] T015 [US2] Unit tests for image handlers in `tests/unit/tools/registry/handlers.test.ts`
- [ ] T016 [US2] Contract tests for image tools in `tests/contract/tools/registry/contract.test.ts`

**Checkpoint**: Image management fully functional

---

## Phase 5: User Story 3 - Tag Management (Priority: P1)

**Goal**: Tag list, get, delete via MCP tools

### Implementation

- [ ] T017 [US3] Implement tag handler functions (list, get, delete) in `src/tools/registry/handlers.ts`
- [ ] T018 [US3] Register tag tools in `src/tools/registry/index.ts`

### Tests

- [ ] T019 [US3] Unit tests for tag handlers in `tests/unit/tools/registry/handlers.test.ts`
- [ ] T020 [US3] Contract tests for tag tools in `tests/contract/tools/registry/contract.test.ts`

**Checkpoint**: Tag management fully functional

---

## Phase 6: Polish & Cross-Cutting

- [ ] T021 Update `tests/parity-matrix.json` with all 12 Container Registry API operations
- [ ] T022 Verify 100% code coverage
- [ ] T023 Run lint and type check

---

## Dependencies & Execution Order

- **Phase 1**: No dependencies - Zod schemas first
- **Phase 2**: Depends on Phase 1 (schemas needed for handlers)
- **Phase 3-5**: All depend on Phase 2 (helper functions). Can be done sequentially US1->US2->US3
- **Phase 6**: Depends on all implementation phases
