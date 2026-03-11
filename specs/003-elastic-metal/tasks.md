# Tasks: Scaleway Elastic Metal MCP Tools

**Input**: Design documents from `/specs/003-elastic-metal/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create types and shared module structure

- [ ] T001 [P] Create Zod schemas and TypeScript types in `src/tools/elastic-metal/types.ts`
- [ ] T002 [P] Create handler module skeleton in `src/tools/elastic-metal/handlers.ts`

**Checkpoint**: Types and module skeleton ready

---

## Phase 2: User Story 1 - Server CRUD (Priority: P1)

**Goal**: Full server lifecycle management (list, get, create, delete)

**Independent Test**: Create server, list it, get details, delete it

### Tests for User Story 1

- [ ] T003 [P] [US1] Unit tests for list_servers, get_server, create_server, delete_server handlers in `tests/unit/tools/elastic-metal/handlers.test.ts`
- [ ] T004 [P] [US1] Contract tests for server CRUD tools in `tests/contract/tools/elastic-metal/contract.test.ts`

### Implementation for User Story 1

- [ ] T005 [US1] Implement list_servers handler in `src/tools/elastic-metal/handlers.ts`
- [ ] T006 [US1] Implement get_server handler in `src/tools/elastic-metal/handlers.ts`
- [ ] T007 [US1] Implement create_server handler in `src/tools/elastic-metal/handlers.ts`
- [ ] T008 [US1] Implement delete_server handler in `src/tools/elastic-metal/handlers.ts`
- [ ] T009 [US1] Register list_servers, get_server, create_server, delete_server tools in `src/tools/elastic-metal/index.ts`

**Checkpoint**: Server CRUD fully functional and tested

---

## Phase 3: User Story 2 - Server Actions (Priority: P1)

**Goal**: Server operations (install, reboot, start, stop)

**Independent Test**: Install OS, perform power cycle

### Tests for User Story 2

- [ ] T010 [P] [US2] Unit tests for install, reboot, start, stop handlers in `tests/unit/tools/elastic-metal/handlers.test.ts`
- [ ] T011 [P] [US2] Contract tests for server action tools in `tests/contract/tools/elastic-metal/contract.test.ts`

### Implementation for User Story 2

- [ ] T012 [US2] Implement install_server handler in `src/tools/elastic-metal/handlers.ts`
- [ ] T013 [US2] Implement reboot_server handler in `src/tools/elastic-metal/handlers.ts`
- [ ] T014 [US2] Implement start_server handler in `src/tools/elastic-metal/handlers.ts`
- [ ] T015 [US2] Implement stop_server handler in `src/tools/elastic-metal/handlers.ts`
- [ ] T016 [US2] Register install, reboot, start, stop tools in `src/tools/elastic-metal/index.ts`

**Checkpoint**: Server actions fully functional and tested

---

## Phase 4: User Story 3 - Offers, OS, BMC (Priority: P2)

**Goal**: List offers, list OSes, get BMC access

**Independent Test**: List available offers and OSes, request BMC access

### Tests for User Story 3

- [ ] T017 [P] [US3] Unit tests for list_offers, list_oss, get_bmc_access handlers
- [ ] T018 [P] [US3] Contract tests for offers/OS/BMC tools

### Implementation for User Story 3

- [ ] T019 [US3] Implement list_offers handler
- [ ] T020 [US3] Implement list_oss handler
- [ ] T021 [US3] Implement get_bmc_access handler
- [ ] T022 [US3] Register list_offers, list_oss, get_bmc_access tools in index.ts

**Checkpoint**: Offers, OS, and BMC tools functional

---

## Phase 5: User Story 4 - Flexible IPs (Priority: P3)

**Goal**: Flexible IP management (list, create, delete)

**Independent Test**: Create IP, list IPs, delete IP

### Tests for User Story 4

- [ ] T023 [P] [US4] Unit tests for list_ips, create_ip, delete_ip handlers
- [ ] T024 [P] [US4] Contract tests for IP tools

### Implementation for User Story 4

- [ ] T025 [US4] Implement list_ips handler
- [ ] T026 [US4] Implement create_ip handler
- [ ] T027 [US4] Implement delete_ip handler
- [ ] T028 [US4] Register list_ips, create_ip, delete_ip tools in index.ts

**Checkpoint**: All 14 tools implemented and tested

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T029 Update parity-matrix.json with all Elastic Metal operations
- [ ] T030 Verify 100% code coverage
- [ ] T031 Run lint and type check
- [ ] T032 Final spec-implementation consistency review

---

## Dependencies & Execution Order

### Phase Dependencies
- **Phase 1**: No dependencies - types and skeleton
- **Phase 2 (US1)**: Depends on Phase 1
- **Phase 3 (US2)**: Depends on Phase 1 (can run in parallel with Phase 2)
- **Phase 4 (US3)**: Depends on Phase 1
- **Phase 5 (US4)**: Depends on Phase 1
- **Phase 6**: Depends on all user stories complete

### Within Each User Story
- Types defined first (Phase 1)
- Tests written alongside implementation
- Handlers before registration
- Registration completes the tool
