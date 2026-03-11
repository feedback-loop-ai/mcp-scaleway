# Tasks: Scaleway NATS Messaging MCP Tools

**Input**: Design documents from `/specs/026-nats/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Zod Schemas & Types)

**Purpose**: Define Zod schemas and TypeScript types for all entities

- [ ] T001 [US1] Define Zod schemas for NATS account entities (NatsAccount, NatsAccountStatus) in `src/tools/nats/types.ts`
- [ ] T002 [P] [US2] Define Zod schemas for NATS credentials entities (NatsCredentials, NatsCredentialsContent) in `src/tools/nats/types.ts`
- [ ] T003 [P] [US1] Define Zod schemas for account tool inputs (List, Get, Create, Update, Delete params) in `src/tools/nats/types.ts`
- [ ] T004 [P] [US2] Define Zod schemas for credentials tool inputs (List, Get, Create, Delete params) in `src/tools/nats/types.ts`

---

## Phase 2: Foundation (API Client Helper)

**Purpose**: Create the NATS-specific API helper that wraps the shared client

- [ ] T005 Implement NATS API helper functions in `src/tools/nats/handlers.ts` (getClient, jsonResponse, API prefix constant)

**Checkpoint**: API helper ready, tool implementations can begin

---

## Phase 3: User Story 1 - NATS Account CRUD (Priority: P1)

**Goal**: Full NATS account lifecycle management via MCP tools

**Independent Test**: Create, list, get, update, delete NATS accounts

### Implementation

- [ ] T006 [US1] Implement `handleListNatsAccounts` handler in `src/tools/nats/handlers.ts`
- [ ] T007 [P] [US1] Implement `handleGetNatsAccount` handler in `src/tools/nats/handlers.ts`
- [ ] T008 [P] [US1] Implement `handleCreateNatsAccount` handler in `src/tools/nats/handlers.ts`
- [ ] T009 [P] [US1] Implement `handleUpdateNatsAccount` handler in `src/tools/nats/handlers.ts`
- [ ] T010 [P] [US1] Implement `handleDeleteNatsAccount` handler in `src/tools/nats/handlers.ts`
- [ ] T011 [US1] Register account tools in `src/tools/nats/index.ts`

### Tests

- [ ] T012 [US1] Unit tests for account handlers in `tests/unit/tools/nats/handlers.test.ts`
- [ ] T013 [US1] Contract tests for account tools in `tests/contract/tools/nats/contract.test.ts`

**Checkpoint**: NATS account CRUD fully functional

---

## Phase 4: User Story 2 - NATS Credentials Management (Priority: P1)

**Goal**: NATS credentials lifecycle management via MCP tools

### Implementation

- [ ] T014 [US2] Implement `handleListNatsCredentials` handler in `src/tools/nats/handlers.ts`
- [ ] T015 [P] [US2] Implement `handleGetNatsCredentials` handler in `src/tools/nats/handlers.ts`
- [ ] T016 [P] [US2] Implement `handleCreateNatsCredentials` handler in `src/tools/nats/handlers.ts`
- [ ] T017 [P] [US2] Implement `handleDeleteNatsCredentials` handler in `src/tools/nats/handlers.ts`
- [ ] T018 [US2] Register credentials tools in `src/tools/nats/index.ts`

### Tests

- [ ] T019 [US2] Unit tests for credentials handlers in `tests/unit/tools/nats/handlers.test.ts`
- [ ] T020 [US2] Contract tests for credentials tools in `tests/contract/tools/nats/contract.test.ts`

**Checkpoint**: NATS credentials management fully functional

---

## Phase 5: Polish & Cross-Cutting

- [ ] T021 Update `tests/parity-matrix.json` with all NATS Messaging API operations
- [ ] T022 Verify 100% code coverage
- [ ] T023 Run lint and type check

---

## Dependencies & Execution Order

- **Phase 1**: No dependencies - Zod schemas first
- **Phase 2**: Depends on Phase 1 (schemas needed for handlers)
- **Phase 3-4**: Both depend on Phase 2 (API helper). Can be done sequentially US1->US2
- **Phase 5**: Depends on all implementation phases
