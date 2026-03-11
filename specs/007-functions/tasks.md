# Tasks: Scaleway Serverless Functions MCP Tools

**Input**: Design documents from `/specs/007-functions/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Zod Schemas)

**Purpose**: Define Zod schemas and TypeScript types for all entities and tool inputs

- [ ] T001 [US1] Define Zod schemas for namespace-related tool inputs in `src/tools/functions/types.ts`
- [ ] T002 [P] [US2] Define Zod schemas for function-related tool inputs in `src/tools/functions/types.ts`
- [ ] T003 [P] [US3] Define Zod schemas for cron-related tool inputs in `src/tools/functions/types.ts`
- [ ] T004 [P] [US4] Define Zod schemas for domain and token tool inputs in `src/tools/functions/types.ts`

---

## Phase 2: Foundation (API Client Helper)

**Purpose**: Create the Functions-specific API helper that wraps the shared client

- [ ] T005 Implement Functions API helper functions in `src/tools/functions/handlers.ts` (HTTP request wrappers for all Functions API endpoints via `client.fetch`)

**Checkpoint**: API helper ready, tool implementations can begin

---

## Phase 3: User Story 1 - Namespace CRUD (Priority: P1)

**Goal**: Full namespace lifecycle management via MCP tools

**Independent Test**: Create, list, get, update, delete namespaces

### Implementation

- [ ] T006 [US1] Implement `handleListNamespaces` handler in `src/tools/functions/handlers.ts`
- [ ] T007 [P] [US1] Implement `handleGetNamespace` handler in `src/tools/functions/handlers.ts`
- [ ] T008 [P] [US1] Implement `handleCreateNamespace` handler in `src/tools/functions/handlers.ts`
- [ ] T009 [P] [US1] Implement `handleUpdateNamespace` handler in `src/tools/functions/handlers.ts`
- [ ] T010 [P] [US1] Implement `handleDeleteNamespace` handler in `src/tools/functions/handlers.ts`
- [ ] T011 [US1] Register namespace tools in `src/tools/functions/index.ts`

### Tests

- [ ] T012 [US1] Unit tests for namespace handlers in `tests/unit/tools/functions/handlers.test.ts`
- [ ] T013 [US1] Contract tests for namespace tools in `tests/contract/tools/functions/contract.test.ts`

**Checkpoint**: Namespace CRUD fully functional

---

## Phase 4: User Story 2 - Function CRUD & Deploy (Priority: P1)

**Goal**: Function lifecycle management including deployment via MCP tools

### Implementation

- [ ] T014 [US2] Implement function handler functions (list, get, create, update, delete, deploy) in `src/tools/functions/handlers.ts`
- [ ] T015 [US2] Register function tools in `src/tools/functions/index.ts`

### Tests

- [ ] T016 [US2] Unit tests for function handlers in `tests/unit/tools/functions/handlers.test.ts`
- [ ] T017 [US2] Contract tests for function tools in `tests/contract/tools/functions/contract.test.ts`

**Checkpoint**: Function CRUD & deploy fully functional

---

## Phase 5: User Story 3 - Cron Triggers (Priority: P2)

**Goal**: Cron trigger management via MCP tools

### Implementation

- [ ] T018 [US3] Implement cron handler functions (list, create, update, delete) in `src/tools/functions/handlers.ts`
- [ ] T019 [US3] Register cron tools in `src/tools/functions/index.ts`

### Tests

- [ ] T020 [US3] Unit tests for cron handlers in `tests/unit/tools/functions/handlers.test.ts`
- [ ] T021 [US3] Contract tests for cron tools in `tests/contract/tools/functions/contract.test.ts`

**Checkpoint**: Cron trigger management fully functional

---

## Phase 6: User Story 4 - Domains & Tokens (Priority: P3)

**Goal**: Custom domain and access token management via MCP tools

### Implementation

- [ ] T022 [US4] Implement domain handler functions (list, create, delete) in `src/tools/functions/handlers.ts`
- [ ] T023 [P] [US4] Implement token handler functions (create, delete) in `src/tools/functions/handlers.ts`
- [ ] T024 [US4] Register domain and token tools in `src/tools/functions/index.ts`

### Tests

- [ ] T025 [US4] Unit tests for domain and token handlers in `tests/unit/tools/functions/handlers.test.ts`
- [ ] T026 [US4] Contract tests for domain and token tools in `tests/contract/tools/functions/contract.test.ts`

**Checkpoint**: Domain and token management fully functional

---

## Phase 7: Polish & Cross-Cutting

- [ ] T027 Update `tests/parity-matrix.json` with all 19 Functions API operations
- [ ] T028 Verify 100% code coverage
- [ ] T029 Run lint and type check

---

## Dependencies & Execution Order

- **Phase 1**: No dependencies - Zod schemas first
- **Phase 2**: Depends on Phase 1 (schemas needed for handlers)
- **Phase 3-6**: All depend on Phase 2 (API helper). Can be done sequentially P1->P2->P3
- **Phase 7**: Depends on all implementation phases
