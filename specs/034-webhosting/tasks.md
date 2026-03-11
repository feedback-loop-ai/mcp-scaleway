# Tasks: Scaleway Web Hosting MCP Tools

**Input**: Design documents from `/specs/034-webhosting/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Schemas & Types)

**Purpose**: Define Zod schemas and TypeScript types for all entities and tool inputs

- [ ] T001 [US1] Define Zod schemas for hosting-related tool inputs in `src/tools/webhosting/types.ts` (ListHostingsInput, GetHostingInput, CreateHostingInput, UpdateHostingInput, DeleteHostingInput, RestoreHostingInput)
- [ ] T002 [P] [US2] Define Zod schemas for DNS-related tool inputs in `src/tools/webhosting/types.ts` (GetDnsRecordsInput)
- [ ] T003 [P] [US3] Define Zod schemas for offer and control panel tool inputs in `src/tools/webhosting/types.ts` (ListOffersInput, ListControlPanelsInput)
- [ ] T004 [P] Define Zod schemas for response entities in `src/tools/webhosting/types.ts` (Hosting, Offer, ControlPanel, DnsRecord, NameServer, enums)

---

## Phase 2: Foundation (API Client Helper)

**Purpose**: Create the Web Hosting-specific handler infrastructure

- [ ] T005 Implement shared handler helpers in `src/tools/webhosting/handlers.ts` (getClient, resolveRegion, formatSuccess)

**Checkpoint**: Handler infrastructure ready, tool implementations can begin

---

## Phase 3: User Story 1 - Hosting CRUD & Lifecycle (Priority: P1)

**Goal**: Full hosting lifecycle management via MCP tools

**Independent Test**: Create, list, get, update, delete, restore hostings

### Implementation

- [ ] T006 [US1] Implement `handleListHostings` handler in `src/tools/webhosting/handlers.ts`
- [ ] T007 [P] [US1] Implement `handleGetHosting` handler in `src/tools/webhosting/handlers.ts`
- [ ] T008 [P] [US1] Implement `handleCreateHosting` handler in `src/tools/webhosting/handlers.ts`
- [ ] T009 [P] [US1] Implement `handleUpdateHosting` handler in `src/tools/webhosting/handlers.ts`
- [ ] T010 [P] [US1] Implement `handleDeleteHosting` handler in `src/tools/webhosting/handlers.ts`
- [ ] T011 [P] [US1] Implement `handleRestoreHosting` handler in `src/tools/webhosting/handlers.ts`
- [ ] T012 [US1] Register hosting tools in `src/tools/webhosting/index.ts`

### Tests

- [ ] T013 [US1] Unit tests for hosting handlers in `tests/unit/tools/webhosting/handlers.test.ts`
- [ ] T014 [US1] Contract tests for hosting tools in `tests/contract/tools/webhosting/contract.test.ts`

**Checkpoint**: Hosting CRUD & lifecycle fully functional

---

## Phase 4: User Story 2 - DNS Records (Priority: P2)

**Goal**: DNS record retrieval via MCP tools

### Implementation

- [ ] T015 [US2] Implement `handleGetDnsRecords` handler in `src/tools/webhosting/handlers.ts`
- [ ] T016 [US2] Register DNS record tool in `src/tools/webhosting/index.ts`

### Tests

- [ ] T017 [US2] Unit tests for DNS handler in `tests/unit/tools/webhosting/handlers.test.ts`
- [ ] T018 [US2] Contract tests for DNS tool in `tests/contract/tools/webhosting/contract.test.ts`

**Checkpoint**: DNS record retrieval fully functional

---

## Phase 5: User Story 3 - Offers & Control Panels (Priority: P3)

**Goal**: Offer and control panel listing via MCP tools

### Implementation

- [ ] T019 [US3] Implement `handleListOffers` handler in `src/tools/webhosting/handlers.ts`
- [ ] T020 [P] [US3] Implement `handleListControlPanels` handler in `src/tools/webhosting/handlers.ts`
- [ ] T021 [US3] Register offer and control panel tools in `src/tools/webhosting/index.ts`

### Tests

- [ ] T022 [US3] Unit tests for offer and control panel handlers in `tests/unit/tools/webhosting/handlers.test.ts`
- [ ] T023 [US3] Contract tests for offer and control panel tools in `tests/contract/tools/webhosting/contract.test.ts`

**Checkpoint**: Offer and control panel listing fully functional

---

## Phase 6: Polish & Cross-Cutting

- [ ] T024 Update `tests/parity-matrix.json` with all Web Hosting API operations
- [ ] T025 Verify 100% code coverage
- [ ] T026 Run lint and type check

---

## Dependencies & Execution Order

- **Phase 1**: No dependencies - Zod schemas first
- **Phase 2**: Depends on Phase 1 (schemas needed for handlers)
- **Phase 3-5**: All depend on Phase 2 (handler infrastructure). Can be done sequentially P1->P2->P3
- **Phase 6**: Depends on all implementation phases
