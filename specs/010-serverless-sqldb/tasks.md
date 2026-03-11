# Tasks: Scaleway Serverless SQL DB MCP Tools

**Input**: Design documents from `/specs/010-serverless-sqldb/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Zod Schemas & Types)

**Purpose**: Define Zod schemas and TypeScript types for all entities and tool inputs

- [ ] T001 [US1] Define Zod schemas for Database entity and database-related tool inputs in `src/tools/serverless-sqldb/types.ts`
- [ ] T002 [P] [US2] Define Zod schemas for DatabaseBackup entity and backup-related tool inputs in `src/tools/serverless-sqldb/types.ts`
- [ ] T003 Define enum schemas (DatabaseStatus, DatabaseBackupStatus, order-by enums) in `src/tools/serverless-sqldb/types.ts`

---

## Phase 2: Foundation (API Client Helper)

**Purpose**: Create the Serverless SQL DB-specific handler functions that wrap the shared client

- [ ] T004 Implement shared helper functions (getClient, resolveRegion, jsonResponse) in `src/tools/serverless-sqldb/handlers.ts`

**Checkpoint**: API helper ready, tool implementations can begin

---

## Phase 3: User Story 1 - Database CRUD & Scaling (Priority: P1)

**Goal**: Full database lifecycle management via MCP tools

**Independent Test**: Create, list, get, update, delete databases

### Implementation

- [ ] T005 [US1] Implement `handleListDatabases` handler in `src/tools/serverless-sqldb/handlers.ts`
- [ ] T006 [P] [US1] Implement `handleGetDatabase` handler in `src/tools/serverless-sqldb/handlers.ts`
- [ ] T007 [P] [US1] Implement `handleCreateDatabase` handler in `src/tools/serverless-sqldb/handlers.ts`
- [ ] T008 [P] [US1] Implement `handleUpdateDatabase` handler in `src/tools/serverless-sqldb/handlers.ts`
- [ ] T009 [P] [US1] Implement `handleDeleteDatabase` handler in `src/tools/serverless-sqldb/handlers.ts`
- [ ] T010 [US1] Register database tools in `src/tools/serverless-sqldb/index.ts`

### Tests

- [ ] T011 [US1] Unit tests for database handlers in `tests/unit/tools/serverless-sqldb/handlers.test.ts`
- [ ] T012 [US1] Contract tests for database tools in `tests/contract/tools/serverless-sqldb/contract.test.ts`

**Checkpoint**: Database CRUD & scaling fully functional

---

## Phase 4: User Story 2 - Backup Management (Priority: P2)

**Goal**: Backup list, get, export, and restore via MCP tools

### Implementation

- [ ] T013 [US2] Implement backup handler functions (list, get, export) in `src/tools/serverless-sqldb/handlers.ts`
- [ ] T014 [P] [US2] Implement `handleRestoreDatabase` handler in `src/tools/serverless-sqldb/handlers.ts`
- [ ] T015 [US2] Register backup tools in `src/tools/serverless-sqldb/index.ts`

### Tests

- [ ] T016 [US2] Unit tests for backup handlers in `tests/unit/tools/serverless-sqldb/handlers.test.ts`
- [ ] T017 [US2] Contract tests for backup tools in `tests/contract/tools/serverless-sqldb/contract.test.ts`

**Checkpoint**: Backup management fully functional

---

## Phase 5: Polish & Cross-Cutting

- [ ] T018 Update `tests/parity-matrix.json` with all Serverless SQL DB API operations
- [ ] T019 Verify 100% code coverage
- [ ] T020 Run lint and type check

---

## Dependencies & Execution Order

- **Phase 1**: No dependencies - Zod schemas first
- **Phase 2**: Depends on Phase 1 (schemas needed for handlers)
- **Phase 3-4**: All depend on Phase 2 (API helper). Can be done sequentially P1->P2
- **Phase 5**: Depends on all implementation phases
