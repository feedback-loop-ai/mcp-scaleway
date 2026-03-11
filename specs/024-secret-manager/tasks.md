# Tasks: Scaleway Secret Manager MCP Tools

**Input**: Design documents from `/specs/024-secret-manager/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Zod Schemas & Types)

**Purpose**: Define Zod schemas and TypeScript types for all entities

- [ ] T001 [US1] Define Zod schemas for secret CRUD tool inputs in `src/tools/secret-manager/types.ts`
- [ ] T002 [P] [US2] Define Zod schemas for secret version tool inputs in `src/tools/secret-manager/types.ts`
- [ ] T003 [P] [US3] Define Zod schemas for protect/unprotect tool inputs in `src/tools/secret-manager/types.ts`
- [ ] T004 [P] [US4] Define Zod schemas for tag listing and ownership tool inputs in `src/tools/secret-manager/types.ts`

---

## Phase 2: Foundation (API Client Helper)

**Purpose**: Create the Secret Manager API helper using @scaleway/sdk-secret

- [ ] T005 Implement `getApi()` helper function in `src/tools/secret-manager/handlers.ts` (instantiates Secretv1beta1.API with shared client)
- [ ] T006 Implement `formatSuccess()` helper function in `src/tools/secret-manager/handlers.ts`

**Checkpoint**: API helper ready, tool implementations can begin

---

## Phase 3: User Story 1 - Secret CRUD (Priority: P1)

**Goal**: Full secret lifecycle management via MCP tools

**Independent Test**: Create, list, get, update, delete secrets

### Implementation

- [ ] T007 [US1] Implement `handleListSecrets` handler in `src/tools/secret-manager/handlers.ts`
- [ ] T008 [P] [US1] Implement `handleGetSecret` handler in `src/tools/secret-manager/handlers.ts`
- [ ] T009 [P] [US1] Implement `handleCreateSecret` handler in `src/tools/secret-manager/handlers.ts`
- [ ] T010 [P] [US1] Implement `handleUpdateSecret` handler in `src/tools/secret-manager/handlers.ts`
- [ ] T011 [P] [US1] Implement `handleDeleteSecret` handler in `src/tools/secret-manager/handlers.ts`
- [ ] T012 [US1] Register secret CRUD tools in `src/tools/secret-manager/index.ts`

### Tests

- [ ] T013 [US1] Unit tests for secret CRUD handlers in `tests/unit/tools/secret-manager/handlers.test.ts`
- [ ] T014 [US1] Contract tests for secret CRUD tools in `tests/contract/tools/secret-manager/contract.test.ts`

**Checkpoint**: Secret CRUD fully functional

---

## Phase 4: User Story 2 - Secret Versions (Priority: P1)

**Goal**: Secret version lifecycle management via MCP tools

### Implementation

- [ ] T015 [US2] Implement `handleListSecretVersions` handler in `src/tools/secret-manager/handlers.ts`
- [ ] T016 [P] [US2] Implement `handleGetSecretVersion` handler in `src/tools/secret-manager/handlers.ts`
- [ ] T017 [P] [US2] Implement `handleCreateSecretVersion` handler in `src/tools/secret-manager/handlers.ts`
- [ ] T018 [P] [US2] Implement `handleAccessSecretVersion` handler in `src/tools/secret-manager/handlers.ts`
- [ ] T019 [P] [US2] Implement `handleDisableSecretVersion` handler in `src/tools/secret-manager/handlers.ts`
- [ ] T020 [P] [US2] Implement `handleEnableSecretVersion` handler in `src/tools/secret-manager/handlers.ts`
- [ ] T021 [P] [US2] Implement `handleDestroySecretVersion` handler in `src/tools/secret-manager/handlers.ts`
- [ ] T022 [US2] Register secret version tools in `src/tools/secret-manager/index.ts`

### Tests

- [ ] T023 [US2] Unit tests for secret version handlers in `tests/unit/tools/secret-manager/handlers.test.ts`
- [ ] T024 [US2] Contract tests for secret version tools in `tests/contract/tools/secret-manager/contract.test.ts`

**Checkpoint**: Secret version management fully functional

---

## Phase 5: User Story 3 - Protection (Priority: P2)

**Goal**: Secret protection/unprotection via MCP tools

### Implementation

- [ ] T025 [US3] Implement `handleProtectSecret` and `handleUnprotectSecret` handlers in `src/tools/secret-manager/handlers.ts`
- [ ] T026 [US3] Register protect/unprotect tools in `src/tools/secret-manager/index.ts`

### Tests

- [ ] T027 [US3] Unit tests for protect/unprotect handlers in `tests/unit/tools/secret-manager/handlers.test.ts`
- [ ] T028 [US3] Contract tests for protect/unprotect tools in `tests/contract/tools/secret-manager/contract.test.ts`

**Checkpoint**: Secret protection fully functional

---

## Phase 6: User Story 4 - Tags and Ownership (Priority: P3)

**Goal**: Tag listing and ownership management via MCP tools

### Implementation

- [ ] T029 [US4] Implement `handleListTags` handler in `src/tools/secret-manager/handlers.ts`
- [ ] T030 [P] [US4] Implement `handleAddSecretOwner` handler in `src/tools/secret-manager/handlers.ts`
- [ ] T031 [US4] Register tag and ownership tools in `src/tools/secret-manager/index.ts`

### Tests

- [ ] T032 [US4] Unit tests for tag and ownership handlers in `tests/unit/tools/secret-manager/handlers.test.ts`
- [ ] T033 [US4] Contract tests for tag and ownership tools in `tests/contract/tools/secret-manager/contract.test.ts`

**Checkpoint**: Tag and ownership management fully functional

---

## Phase 7: Polish & Cross-Cutting

- [ ] T034 Update `tests/parity-matrix.json` with all Secret Manager API operations
- [ ] T035 Verify 100% code coverage
- [ ] T036 Run lint and type check

---

## Dependencies & Execution Order

- **Phase 1**: No dependencies - Zod schemas first
- **Phase 2**: Depends on Phase 1 (schemas needed for handlers)
- **Phase 3-6**: All depend on Phase 2 (API helper). Can be done sequentially P1->P1->P2->P3
- **Phase 7**: Depends on all implementation phases
