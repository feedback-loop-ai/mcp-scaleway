# Tasks: Scaleway Transactional Email (TEM) MCP Tools

**Input**: Design documents from `/specs/032-tem/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Zod Schemas)

**Purpose**: Define Zod schemas and TypeScript types for all entities

- [ ] T001 [US1] Define Zod schemas for domain-related tool inputs in `src/tools/tem/types.ts`
- [ ] T002 [P] [US2] Define Zod schemas for email-related tool inputs in `src/tools/tem/types.ts`
- [ ] T003 [P] [US3] Define Zod schemas for statistics tool inputs in `src/tools/tem/types.ts`
- [ ] T004 [P] [US4] Define Zod schemas for webhook-related tool inputs in `src/tools/tem/types.ts`

---

## Phase 2: Foundation (API Client Helper)

**Purpose**: Create the TEM-specific API helper that wraps the shared client

- [ ] T005 Implement TEM API helper functions in `src/tools/tem/handlers.ts` (HTTP request wrappers for all TEM API endpoints, region resolution, URL param building)

**Checkpoint**: API helper ready, tool implementations can begin

---

## Phase 3: User Story 1 - Domain Management (Priority: P1)

**Goal**: Full domain lifecycle management via MCP tools

**Independent Test**: Create, list, get, check, verify status, revoke domains

### Implementation

- [ ] T006 [US1] Implement `scaleway_tem_list_domains` handler in `src/tools/tem/handlers.ts`
- [ ] T007 [P] [US1] Implement `scaleway_tem_get_domain` handler in `src/tools/tem/handlers.ts`
- [ ] T008 [P] [US1] Implement `scaleway_tem_create_domain` handler in `src/tools/tem/handlers.ts`
- [ ] T009 [P] [US1] Implement `scaleway_tem_revoke_domain` handler in `src/tools/tem/handlers.ts`
- [ ] T010 [P] [US1] Implement `scaleway_tem_check_domain` handler in `src/tools/tem/handlers.ts`
- [ ] T011 [P] [US1] Implement `scaleway_tem_get_domain_last_status` handler in `src/tools/tem/handlers.ts`
- [ ] T012 [US1] Register domain tools in `src/tools/tem/index.ts`

### Tests

- [ ] T013 [US1] Unit tests for domain handlers in `tests/unit/tools/tem/handlers.test.ts`
- [ ] T014 [US1] Contract tests for domain tools in `tests/contract/tools/tem/contract.test.ts`

**Checkpoint**: Domain management fully functional

---

## Phase 4: User Story 2 - Email Sending & Management (Priority: P1)

**Goal**: Email CRUD and sending via MCP tools

### Implementation

- [ ] T015 [US2] Implement `scaleway_tem_list_emails` handler in `src/tools/tem/handlers.ts`
- [ ] T016 [P] [US2] Implement `scaleway_tem_get_email` handler in `src/tools/tem/handlers.ts`
- [ ] T017 [P] [US2] Implement `scaleway_tem_create_email` handler in `src/tools/tem/handlers.ts`
- [ ] T018 [P] [US2] Implement `scaleway_tem_cancel_email` handler in `src/tools/tem/handlers.ts`
- [ ] T019 [US2] Register email tools in `src/tools/tem/index.ts`

### Tests

- [ ] T020 [US2] Unit tests for email handlers in `tests/unit/tools/tem/handlers.test.ts`
- [ ] T021 [US2] Contract tests for email tools in `tests/contract/tools/tem/contract.test.ts`

**Checkpoint**: Email management fully functional

---

## Phase 5: User Story 3 - Statistics (Priority: P2)

**Goal**: Email statistics retrieval via MCP tools

### Implementation

- [ ] T022 [US3] Implement `scaleway_tem_get_statistics` handler in `src/tools/tem/handlers.ts`
- [ ] T023 [US3] Register statistics tool in `src/tools/tem/index.ts`

### Tests

- [ ] T024 [US3] Unit tests for statistics handler in `tests/unit/tools/tem/handlers.test.ts`
- [ ] T025 [US3] Contract tests for statistics tool in `tests/contract/tools/tem/contract.test.ts`

**Checkpoint**: Statistics retrieval fully functional

---

## Phase 6: User Story 4 - Webhook Management (Priority: P2)

**Goal**: Webhook CRUD via MCP tools

### Implementation

- [ ] T026 [US4] Implement webhook handler functions (list, create, update, delete) in `src/tools/tem/handlers.ts`
- [ ] T027 [US4] Register webhook tools in `src/tools/tem/index.ts`

### Tests

- [ ] T028 [US4] Unit tests for webhook handlers in `tests/unit/tools/tem/handlers.test.ts`
- [ ] T029 [US4] Contract tests for webhook tools in `tests/contract/tools/tem/contract.test.ts`

**Checkpoint**: Webhook management fully functional

---

## Phase 7: Polish & Cross-Cutting

- [ ] T030 Update `tests/parity-matrix.json` with all TEM API operations
- [ ] T031 Verify 100% code coverage
- [ ] T032 Run lint and type check

---

## Dependencies & Execution Order

- **Phase 1**: No dependencies - Zod schemas first
- **Phase 2**: Depends on Phase 1 (schemas needed for handlers)
- **Phase 3-6**: All depend on Phase 2 (API helper). Can be done sequentially P1->P2
- **Phase 7**: Depends on all implementation phases
