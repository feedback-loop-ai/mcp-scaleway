# Tasks: Scaleway IPAM MCP Tools

**Input**: Design documents from `/specs/021-ipam/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Schemas & Types)

**Purpose**: Define Zod schemas and TypeScript types for all IPAM entities and tool inputs

- [ ] T001 [US1-5] Define Zod schemas for enums (ResourceType, ListIPsOrderBy) in `src/tools/ipam/types.ts`
- [ ] T002 [P] [US1-5] Define Zod schemas for nested objects (Source, Resource, Reverse, CustomResource) in `src/tools/ipam/types.ts`
- [ ] T003 [P] [US1-5] Define Zod schemas for all tool inputs (ListIPsInput, GetIPInput, BookIPInput, ReleaseIPInput, UpdateIPInput) in `src/tools/ipam/types.ts`

---

## Phase 2: Foundation (API Client Helper)

**Purpose**: Create the IPAM-specific API helper that wraps the shared client

- [ ] T004 Implement `ipamUrl` helper and `buildUrlParams` utility in `src/tools/ipam/handlers.ts`

**Checkpoint**: API helper ready, tool implementations can begin

---

## Phase 3: User Story 1 - List & Get IPs (Priority: P1)

**Goal**: IP listing with filtering and individual IP retrieval

**Independent Test**: List and get IPs

### Implementation

- [ ] T005 [US1] Implement `handleListIPs` handler in `src/tools/ipam/handlers.ts`
- [ ] T006 [P] [US2] Implement `handleGetIP` handler in `src/tools/ipam/handlers.ts`

### Tests

- [ ] T007 [US1] Unit tests for list/get handlers in `tests/unit/tools/ipam/handlers.test.ts`
- [ ] T008 [US1] Contract tests for list/get tools in `tests/contract/tools/ipam/contract.test.ts`

**Checkpoint**: IP listing and retrieval fully functional

---

## Phase 4: User Story 3 & 4 - Book & Release IPs (Priority: P1)

**Goal**: IP reservation and release via MCP tools

### Implementation

- [ ] T009 [US3] Implement `handleBookIP` handler in `src/tools/ipam/handlers.ts`
- [ ] T010 [P] [US4] Implement `handleReleaseIP` handler in `src/tools/ipam/handlers.ts`

### Tests

- [ ] T011 [US3] Unit tests for book/release handlers in `tests/unit/tools/ipam/handlers.test.ts`
- [ ] T012 [US3] Contract tests for book/release tools in `tests/contract/tools/ipam/contract.test.ts`

**Checkpoint**: IP booking and release fully functional

---

## Phase 5: User Story 5 - Update IP (Priority: P2)

**Goal**: IP metadata updates (tags, reverse DNS)

### Implementation

- [ ] T013 [US5] Implement `handleUpdateIP` handler in `src/tools/ipam/handlers.ts`

### Tests

- [ ] T014 [US5] Unit tests for update handler in `tests/unit/tools/ipam/handlers.test.ts`
- [ ] T015 [US5] Contract tests for update tool in `tests/contract/tools/ipam/contract.test.ts`

**Checkpoint**: IP update fully functional

---

## Phase 6: Tool Registration

- [ ] T016 [US1-5] Register all 5 IPAM tools in `src/tools/ipam/index.ts` via `registerIpamTools`

---

## Phase 7: Polish & Cross-Cutting

- [ ] T017 Update `tests/parity-matrix.json` with all IPAM API operations
- [ ] T018 Verify 100% code coverage
- [ ] T019 Run lint and type check

---

## Dependencies & Execution Order

- **Phase 1**: No dependencies - Zod schemas first
- **Phase 2**: Depends on Phase 1 (schemas needed for handlers)
- **Phase 3-5**: All depend on Phase 2 (API helper). Execute sequentially P1 then P2
- **Phase 6**: Depends on Phases 3-5 (all handlers must exist)
- **Phase 7**: Depends on all implementation phases
