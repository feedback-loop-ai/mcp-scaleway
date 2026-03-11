# Tasks: Scaleway VPC & Private Networks MCP Tools

**Input**: Design documents from `/specs/016-vpc/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Zod Schemas & Types)

**Purpose**: Define Zod schemas and TypeScript types for all VPC and Private Network entities

- [ ] T001 [US1] Define Zod schemas for VPC-related tool inputs in `src/tools/vpc/types.ts`
- [ ] T002 [P] [US2] Define Zod schemas for Private Network tool inputs in `src/tools/vpc/types.ts`
- [ ] T003 [P] [US2] Define TypeScript interfaces for Vpc, PrivateNetwork, Subnet response types in `src/tools/vpc/types.ts`

---

## Phase 2: Foundation (API Client Helper)

**Purpose**: Create the VPC-specific handler functions that wrap the shared client

- [ ] T004 Implement VPC API helper constants and shared utilities (VPC_API_V2 base path, getClient, formatSuccess) in `src/tools/vpc/handlers.ts`

**Checkpoint**: API helper ready, tool implementations can begin

---

## Phase 3: User Story 1 - VPC CRUD (Priority: P1)

**Goal**: Full VPC lifecycle management via MCP tools

**Independent Test**: Create, list, get, update, delete VPCs

### Implementation

- [ ] T005 [US1] Implement `handleListVpcs` handler with pagination and filtering in `src/tools/vpc/handlers.ts`
- [ ] T006 [P] [US1] Implement `handleGetVpc` handler in `src/tools/vpc/handlers.ts`
- [ ] T007 [P] [US1] Implement `handleCreateVpc` handler in `src/tools/vpc/handlers.ts`
- [ ] T008 [P] [US1] Implement `handleUpdateVpc` handler in `src/tools/vpc/handlers.ts`
- [ ] T009 [P] [US1] Implement `handleDeleteVpc` handler in `src/tools/vpc/handlers.ts`
- [ ] T010 [US1] Register VPC tools in `src/tools/vpc/index.ts`

### Tests

- [ ] T011 [US1] Unit tests for VPC handlers in `tests/unit/tools/vpc/handlers.test.ts`
- [ ] T012 [US1] Contract tests for VPC tools in `tests/contract/tools/vpc/contract.test.ts`

**Checkpoint**: VPC CRUD fully functional

---

## Phase 4: User Story 2 - Private Network CRUD (Priority: P1)

**Goal**: Full Private Network lifecycle management via MCP tools

### Implementation

- [ ] T013 [US2] Implement `handleListPrivateNetworks` handler with pagination and filtering in `src/tools/vpc/handlers.ts`
- [ ] T014 [P] [US2] Implement `handleGetPrivateNetwork` handler in `src/tools/vpc/handlers.ts`
- [ ] T015 [P] [US2] Implement `handleCreatePrivateNetwork` handler with optional subnets in `src/tools/vpc/handlers.ts`
- [ ] T016 [P] [US2] Implement `handleUpdatePrivateNetwork` handler in `src/tools/vpc/handlers.ts`
- [ ] T017 [P] [US2] Implement `handleDeletePrivateNetwork` handler in `src/tools/vpc/handlers.ts`
- [ ] T018 [US2] Register Private Network tools in `src/tools/vpc/index.ts`

### Tests

- [ ] T019 [US2] Unit tests for Private Network handlers in `tests/unit/tools/vpc/handlers.test.ts`
- [ ] T020 [US2] Contract tests for Private Network tools in `tests/contract/tools/vpc/contract.test.ts`

**Checkpoint**: Private Network CRUD fully functional

---

## Phase 5: User Story 3 - Subnet Management (Priority: P2)

**Goal**: CIDR subnet specification on create and update operations

- [ ] T021 [US3] Verify subnet CIDR handling in create private network handler
- [ ] T022 [P] [US3] Verify subnet CIDR update in update private network handler
- [ ] T023 [US3] Unit tests for subnet-specific edge cases

**Checkpoint**: Subnet management verified

---

## Phase 6: Polish & Cross-Cutting

- [ ] T024 Update `tests/parity-matrix.json` with all VPC API operations
- [ ] T025 Verify 100% code coverage
- [ ] T026 Run lint and type check

---

## Dependencies & Execution Order

- **Phase 1**: No dependencies - Zod schemas first
- **Phase 2**: Depends on Phase 1 (schemas needed for handlers)
- **Phase 3-4**: Both depend on Phase 2 (API helper). Phase 4 can start after Phase 3 or in parallel.
- **Phase 5**: Depends on Phase 4 (private network handlers must exist)
- **Phase 6**: Depends on all implementation phases
