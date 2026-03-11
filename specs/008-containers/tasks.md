# Tasks: Scaleway Serverless Containers MCP Tools

**Input**: Design documents from `/specs/008-containers/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Zod Schemas & Types)

**Purpose**: Define Zod schemas and TypeScript types for all entities

- [ ] T001 [US-008-01] Define Zod schemas for namespace-related tool inputs in `src/tools/containers/types.ts`
- [ ] T002 [P] [US-008-06] Define Zod schemas for container-related tool inputs in `src/tools/containers/types.ts`
- [ ] T003 [P] [US-008-12] Define Zod schemas for cron-related tool inputs in `src/tools/containers/types.ts`
- [ ] T004 [P] [US-008-16] Define Zod schemas for domain and token tool inputs in `src/tools/containers/types.ts`

---

## Phase 2: Foundation (API Client Helper)

**Purpose**: Create the Containers-specific API helper that wraps the shared client

- [ ] T005 Implement `apiRequest`, `getRegion`, `baseUrl`, `toSnakeCase`, and `formatResponse` helpers in `src/tools/containers/handlers.ts`

**Checkpoint**: API helper ready, tool implementations can begin

---

## Phase 3: User Story - Namespace CRUD (Priority: P1)

**Goal**: Full namespace lifecycle management via MCP tools

**Independent Test**: Create, list, get, update, delete namespaces

### Implementation

- [ ] T006 [US-008-01] Implement `handleListNamespaces` handler in `src/tools/containers/handlers.ts`
- [ ] T007 [P] [US-008-02] Implement `handleGetNamespace` handler in `src/tools/containers/handlers.ts`
- [ ] T008 [P] [US-008-03] Implement `handleCreateNamespace` handler in `src/tools/containers/handlers.ts`
- [ ] T009 [P] [US-008-04] Implement `handleUpdateNamespace` handler in `src/tools/containers/handlers.ts`
- [ ] T010 [P] [US-008-05] Implement `handleDeleteNamespace` handler in `src/tools/containers/handlers.ts`
- [ ] T011 [US-008-01] Register namespace tools in `src/tools/containers/index.ts`

### Tests

- [ ] T012 [US-008-01] Unit tests for namespace handlers in `tests/unit/tools/containers/handlers.test.ts`
- [ ] T013 [US-008-01] Contract tests for namespace tools in `tests/contract/tools/containers/contract.test.ts`

**Checkpoint**: Namespace CRUD fully functional

---

## Phase 4: User Story - Container CRUD & Deploy (Priority: P1)

**Goal**: Full container lifecycle management including deployment via MCP tools

### Implementation

- [ ] T014 [US-008-06] Implement `handleListContainers` handler in `src/tools/containers/handlers.ts`
- [ ] T015 [P] [US-008-07] Implement `handleGetContainer` handler in `src/tools/containers/handlers.ts`
- [ ] T016 [P] [US-008-08] Implement `handleCreateContainer` handler in `src/tools/containers/handlers.ts`
- [ ] T017 [P] [US-008-09] Implement `handleUpdateContainer` handler in `src/tools/containers/handlers.ts`
- [ ] T018 [P] [US-008-10] Implement `handleDeleteContainer` handler in `src/tools/containers/handlers.ts`
- [ ] T019 [P] [US-008-11] Implement `handleDeployContainer` handler in `src/tools/containers/handlers.ts`
- [ ] T020 [US-008-06] Register container tools in `src/tools/containers/index.ts`

### Tests

- [ ] T021 [US-008-06] Unit tests for container handlers in `tests/unit/tools/containers/handlers.test.ts`
- [ ] T022 [US-008-06] Contract tests for container tools in `tests/contract/tools/containers/contract.test.ts`

**Checkpoint**: Container CRUD & deploy fully functional

---

## Phase 5: User Story - Cron Triggers (Priority: P2)

**Goal**: Cron trigger CRUD via MCP tools

### Implementation

- [ ] T023 [US-008-12] Implement `handleListCrons` handler in `src/tools/containers/handlers.ts`
- [ ] T024 [P] [US-008-13] Implement `handleCreateCron` handler in `src/tools/containers/handlers.ts`
- [ ] T025 [P] [US-008-14] Implement `handleUpdateCron` handler in `src/tools/containers/handlers.ts`
- [ ] T026 [P] [US-008-15] Implement `handleDeleteCron` handler in `src/tools/containers/handlers.ts`
- [ ] T027 [US-008-12] Register cron tools in `src/tools/containers/index.ts`

### Tests

- [ ] T028 [US-008-12] Unit tests for cron handlers in `tests/unit/tools/containers/handlers.test.ts`
- [ ] T029 [US-008-12] Contract tests for cron tools in `tests/contract/tools/containers/contract.test.ts`

**Checkpoint**: Cron trigger management fully functional

---

## Phase 6: User Story - Domains & Tokens (Priority: P3)

**Goal**: Domain mapping and token management via MCP tools

### Implementation

- [ ] T030 [US-008-16] Implement `handleListDomains` handler in `src/tools/containers/handlers.ts`
- [ ] T031 [P] [US-008-17] Implement `handleCreateDomain` handler in `src/tools/containers/handlers.ts`
- [ ] T032 [P] [US-008-18] Implement `handleDeleteDomain` handler in `src/tools/containers/handlers.ts`
- [ ] T033 [US-008-19] Implement `handleCreateToken` handler in `src/tools/containers/handlers.ts`
- [ ] T034 [P] [US-008-20] Implement `handleDeleteToken` handler in `src/tools/containers/handlers.ts`
- [ ] T035 [US-008-16] Register domain and token tools in `src/tools/containers/index.ts`

### Tests

- [ ] T036 [US-008-16] Unit tests for domain and token handlers in `tests/unit/tools/containers/handlers.test.ts`
- [ ] T037 [US-008-16] Contract tests for domain and token tools in `tests/contract/tools/containers/contract.test.ts`

**Checkpoint**: Domain and token management fully functional

---

## Phase 7: Polish & Cross-Cutting

- [ ] T038 Update `tests/parity-matrix.json` with all Containers API operations
- [ ] T039 Verify 100% code coverage
- [ ] T040 Run lint and type check

---

## Dependencies & Execution Order

- **Phase 1**: No dependencies - Zod schemas first
- **Phase 2**: Depends on Phase 1 (schemas needed for handlers)
- **Phase 3-6**: All depend on Phase 2 (API helper). Execute sequentially P1->P2->P3
- **Phase 7**: Depends on all implementation phases
