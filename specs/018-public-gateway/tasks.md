# Tasks: Scaleway Public Gateway MCP Tools

**Input**: Design documents from `/specs/018-public-gateway/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Zod Schemas & Types)

**Purpose**: Define Zod schemas and TypeScript types for all entities

- [ ] T001 [US1] Define Zod schemas for gateway-related tool inputs in `src/tools/public-gateway/types.ts`
- [ ] T002 [P] [US2] Define Zod schemas for gateway network tool inputs in `src/tools/public-gateway/types.ts`
- [ ] T003 [P] [US3] Define Zod schemas for DHCP tool inputs in `src/tools/public-gateway/types.ts`
- [ ] T004 [P] [US4] Define Zod schemas for PAT rule tool inputs in `src/tools/public-gateway/types.ts`
- [ ] T005 [P] [US5] Define Zod schemas for IP tool inputs in `src/tools/public-gateway/types.ts`
- [ ] T006 [P] [US6] Define Zod schema for gateway types tool input in `src/tools/public-gateway/types.ts`

---

## Phase 2: Foundation (API Client Helpers)

**Purpose**: Create the Public Gateway-specific API helpers that wrap the shared client

- [ ] T007 Implement `buildUrl` (v2) and `buildV1Url` (v1) URL builder functions in `src/tools/public-gateway/handlers.ts`
- [ ] T008 Implement `toURLSearchParams` helper for query parameter construction in `src/tools/public-gateway/handlers.ts`
- [ ] T009 Implement `formatResponse` helper for MCP response wrapping in `src/tools/public-gateway/handlers.ts`

**Checkpoint**: API helpers ready, tool implementations can begin

---

## Phase 3: User Story 1 - Gateway CRUD (Priority: P1)

**Goal**: Full gateway lifecycle management via MCP tools

**Independent Test**: Create, list, get, update, delete gateways

### Implementation

- [ ] T010 [US1] Implement `handleListGateways` handler in `src/tools/public-gateway/handlers.ts`
- [ ] T011 [P] [US1] Implement `handleGetGateway` handler in `src/tools/public-gateway/handlers.ts`
- [ ] T012 [P] [US1] Implement `handleCreateGateway` handler in `src/tools/public-gateway/handlers.ts`
- [ ] T013 [P] [US1] Implement `handleUpdateGateway` handler in `src/tools/public-gateway/handlers.ts`
- [ ] T014 [P] [US1] Implement `handleDeleteGateway` handler in `src/tools/public-gateway/handlers.ts`
- [ ] T015 [US1] Register gateway tools in `src/tools/public-gateway/index.ts`

### Tests

- [ ] T016 [US1] Unit tests for gateway handlers in `tests/unit/tools/public-gateway/handlers.test.ts`
- [ ] T017 [US1] Contract tests for gateway tools in `tests/contract/tools/public-gateway/contract.test.ts`

**Checkpoint**: Gateway CRUD fully functional

---

## Phase 4: User Story 2 - Gateway Networks (Priority: P1)

**Goal**: Gateway-to-Private Network connection management via MCP tools

### Implementation

- [ ] T018 [US2] Implement gateway network handler functions (list, get, create, update, delete) in `src/tools/public-gateway/handlers.ts`
- [ ] T019 [US2] Register gateway network tools in `src/tools/public-gateway/index.ts`

### Tests

- [ ] T020 [US2] Unit tests for gateway network handlers in `tests/unit/tools/public-gateway/handlers.test.ts`
- [ ] T021 [US2] Contract tests for gateway network tools in `tests/contract/tools/public-gateway/contract.test.ts`

**Checkpoint**: Gateway network management fully functional

---

## Phase 5: User Story 3 - DHCP Configuration (Priority: P2)

**Goal**: DHCP CRUD via MCP tools (v1 API)

### Implementation

- [ ] T022 [US3] Implement DHCP handler functions (list, get, create, update, delete) in `src/tools/public-gateway/handlers.ts`
- [ ] T023 [US3] Register DHCP tools in `src/tools/public-gateway/index.ts`

### Tests

- [ ] T024 [US3] Unit tests for DHCP handlers in `tests/unit/tools/public-gateway/handlers.test.ts`
- [ ] T025 [US3] Contract tests for DHCP tools in `tests/contract/tools/public-gateway/contract.test.ts`

**Checkpoint**: DHCP management fully functional

---

## Phase 6: User Story 4 - PAT Rules (Priority: P2)

**Goal**: PAT rule CRUD via MCP tools

### Implementation

- [ ] T026 [US4] Implement PAT rule handler functions (list, get, create, update, delete) in `src/tools/public-gateway/handlers.ts`
- [ ] T027 [US4] Register PAT rule tools in `src/tools/public-gateway/index.ts`

### Tests

- [ ] T028 [US4] Unit tests for PAT rule handlers in `tests/unit/tools/public-gateway/handlers.test.ts`
- [ ] T029 [US4] Contract tests for PAT rule tools in `tests/contract/tools/public-gateway/contract.test.ts`

**Checkpoint**: PAT rule management fully functional

---

## Phase 7: User Story 5 & 6 - IPs and Gateway Types (Priority: P3)

**Goal**: IP management and gateway type listing via MCP tools

### Implementation

- [ ] T030 [US5] Implement IP handler functions (list, get, create, update, delete) in `src/tools/public-gateway/handlers.ts`
- [ ] T031 [P] [US6] Implement `handleListGatewayTypes` handler in `src/tools/public-gateway/handlers.ts`
- [ ] T032 [US5] [US6] Register IP and gateway type tools in `src/tools/public-gateway/index.ts`

### Tests

- [ ] T033 [US5] [US6] Unit tests for IP and gateway type handlers in `tests/unit/tools/public-gateway/handlers.test.ts`
- [ ] T034 [US5] [US6] Contract tests for IP and gateway type tools in `tests/contract/tools/public-gateway/contract.test.ts`

**Checkpoint**: IP and gateway type management fully functional

---

## Phase 8: Polish & Cross-Cutting

- [ ] T035 Update `tests/parity-matrix.json` with all Public Gateway API operations
- [ ] T036 Verify 100% code coverage
- [ ] T037 Run lint and type check

---

## Dependencies & Execution Order

- **Phase 1**: No dependencies - Zod schemas first
- **Phase 2**: Depends on Phase 1 (schemas needed for handlers)
- **Phase 3-7**: All depend on Phase 2 (API helpers). Can be done sequentially P1->P2->P3
- **Phase 8**: Depends on all implementation phases
