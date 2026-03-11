# Tasks: Scaleway SNS (Topics & Events) MCP Tools

**Input**: Design documents from `/specs/028-sns/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Schemas & Types)

**Purpose**: Define Zod schemas and TypeScript types for all SNS entities and tool inputs

- [ ] T001 [US1] Define Zod schemas for SNS service tool inputs (ActivateSns, DeactivateSns, GetSnsInfo) in `src/tools/sns/types.ts`
- [ ] T002 [US2] Define Zod schemas for SNS credentials tool inputs (List, Get, Create, Update, Delete) in `src/tools/sns/types.ts`
- [ ] T003 Define Zod schemas for response types (SnsInfo, SnsCredentials, SnsPermissions) in `src/tools/sns/types.ts`
- [ ] T004 Define enums (SnsInfoStatus, ListSnsCredentialsOrderBy) in `src/tools/sns/types.ts`

---

## Phase 2: Foundation (API Client Helper)

**Purpose**: Create the SNS-specific API helper that wraps the shared client

- [ ] T005 Implement `getSnsApi()` helper function in `src/tools/sns/handlers.ts` (instantiates SnsAPI from @scaleway/sdk-mnq)
- [ ] T006 Implement `formatSnsInfo()` and `formatSnsCredentials()` response formatters in `src/tools/sns/handlers.ts`
- [ ] T007 Implement `jsonResponse()` utility in `src/tools/sns/handlers.ts`

**Checkpoint**: API helper ready, tool implementations can begin

---

## Phase 3: User Story 1 - SNS Service Activation (Priority: P1)

**Goal**: SNS service lifecycle management via MCP tools

**Independent Test**: Activate, get info, deactivate SNS

### Implementation

- [ ] T008 [US1] Implement `handleActivateSns` handler in `src/tools/sns/handlers.ts`
- [ ] T009 [P] [US1] Implement `handleDeactivateSns` handler in `src/tools/sns/handlers.ts`
- [ ] T010 [P] [US1] Implement `handleGetSnsInfo` handler in `src/tools/sns/handlers.ts`
- [ ] T011 [US1] Register service tools (activate, deactivate, get_info) in `src/tools/sns/index.ts`

### Tests

- [ ] T012 [US1] Unit tests for service handlers in `tests/unit/tools/sns/handlers.test.ts`
- [ ] T013 [US1] Contract tests for service tools in `tests/contract/tools/sns/contract.test.ts`

**Checkpoint**: SNS service activation fully functional

---

## Phase 4: User Story 2 - Credentials Management (Priority: P1)

**Goal**: SNS credentials CRUD via MCP tools

### Implementation

- [ ] T014 [US2] Implement `handleListSnsCredentials` handler in `src/tools/sns/handlers.ts`
- [ ] T015 [P] [US2] Implement `handleGetSnsCredentials` handler in `src/tools/sns/handlers.ts`
- [ ] T016 [P] [US2] Implement `handleCreateSnsCredentials` handler in `src/tools/sns/handlers.ts`
- [ ] T017 [P] [US2] Implement `handleUpdateSnsCredentials` handler in `src/tools/sns/handlers.ts`
- [ ] T018 [P] [US2] Implement `handleDeleteSnsCredentials` handler in `src/tools/sns/handlers.ts`
- [ ] T019 [US2] Register credentials tools (list, get, create, update, delete) in `src/tools/sns/index.ts`

### Tests

- [ ] T020 [US2] Unit tests for credentials handlers in `tests/unit/tools/sns/handlers.test.ts`
- [ ] T021 [US2] Contract tests for credentials tools in `tests/contract/tools/sns/contract.test.ts`

**Checkpoint**: Credentials management fully functional

---

## Phase 5: Polish & Cross-Cutting

- [ ] T022 Update `tests/parity-matrix.json` with all SNS API operations
- [ ] T023 Verify 100% code coverage
- [ ] T024 Run lint and type check

---

## Dependencies & Execution Order

- **Phase 1**: No dependencies - Zod schemas first
- **Phase 2**: Depends on Phase 1 (schemas needed for handlers)
- **Phase 3-4**: Both depend on Phase 2 (API helper). Phase 3 (service) before Phase 4 (credentials) due to activation dependency
- **Phase 5**: Depends on all implementation phases
