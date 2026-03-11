# Tasks: Scaleway Cockpit (Observability) MCP Tools

**Input**: Design documents from `/specs/031-cockpit/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Schemas & Types)

**Purpose**: Define Zod schemas and TypeScript types for all entities and tool inputs

- [ ] T001 [US1] Define Zod schemas for Cockpit entity types (Cockpit, CockpitEndpoint, CockpitStatus) in `src/tools/cockpit/types.ts`
- [ ] T002 [P] [US2] Define Zod schemas for DataSource and DataSourceType in `src/tools/cockpit/types.ts`
- [ ] T003 [P] [US1] Define Zod schemas for Token and TokenScope in `src/tools/cockpit/types.ts`
- [ ] T004 [P] [US3] Define Zod schemas for GrafanaUser and GrafanaUserRole in `src/tools/cockpit/types.ts`
- [ ] T005 [P] [US4] Define Zod schemas for ContactPoint, AlertManager in `src/tools/cockpit/types.ts`
- [ ] T006 [P] Define all tool input schemas (Get/Activate/Deactivate Cockpit, CRUD data sources, CRUD tokens, CRUD Grafana users, alert manager, contact points, managed alerts) in `src/tools/cockpit/types.ts`

---

## Phase 2: Foundation (Handler Helpers)

**Purpose**: Create shared helpers used across all Cockpit handlers

- [ ] T007 Implement `resolveRegion` and `formatSuccess` helpers in `src/tools/cockpit/handlers.ts`

**Checkpoint**: Helpers ready, handler implementations can begin

---

## Phase 3: User Story 1 - Cockpit Lifecycle & Tokens (Priority: P1)

**Goal**: Get/activate/deactivate Cockpit and manage tokens

**Independent Test**: Activate Cockpit, get info, create token, list tokens, delete token, deactivate Cockpit

### Implementation

- [ ] T008 [US1] Implement `handleGetCockpit` handler in `src/tools/cockpit/handlers.ts`
- [ ] T009 [P] [US1] Implement `handleActivateCockpit` handler in `src/tools/cockpit/handlers.ts`
- [ ] T010 [P] [US1] Implement `handleDeactivateCockpit` handler in `src/tools/cockpit/handlers.ts`
- [ ] T011 [US1] Implement `handleListTokens` handler in `src/tools/cockpit/handlers.ts`
- [ ] T012 [P] [US1] Implement `handleCreateToken` handler in `src/tools/cockpit/handlers.ts`
- [ ] T013 [P] [US1] Implement `handleDeleteToken` handler in `src/tools/cockpit/handlers.ts`
- [ ] T014 [US1] Register Cockpit lifecycle and token tools in `src/tools/cockpit/index.ts`

### Tests

- [ ] T015 [US1] Unit tests for Cockpit and token handlers in `tests/unit/tools/cockpit/handlers.test.ts`
- [ ] T016 [US1] Contract tests for Cockpit and token tools in `tests/contract/tools/cockpit/contract.test.ts`

**Checkpoint**: Cockpit lifecycle & token management fully functional

---

## Phase 4: User Story 2 - Data Source Management (Priority: P2)

**Goal**: Data source CRUD via MCP tools

### Implementation

- [ ] T017 [US2] Implement data source handler functions (list, create, delete) in `src/tools/cockpit/handlers.ts`
- [ ] T018 [US2] Register data source tools in `src/tools/cockpit/index.ts`

### Tests

- [ ] T019 [US2] Unit tests for data source handlers in `tests/unit/tools/cockpit/handlers.test.ts`
- [ ] T020 [US2] Contract tests for data source tools in `tests/contract/tools/cockpit/contract.test.ts`

**Checkpoint**: Data source management fully functional

---

## Phase 5: User Story 3 - Grafana User Management (Priority: P2)

**Goal**: Grafana user CRUD and password reset via MCP tools

### Implementation

- [ ] T021 [US3] Implement Grafana user handler functions (list, create, delete, reset password) in `src/tools/cockpit/handlers.ts`
- [ ] T022 [US3] Register Grafana user tools in `src/tools/cockpit/index.ts`

### Tests

- [ ] T023 [US3] Unit tests for Grafana user handlers in `tests/unit/tools/cockpit/handlers.test.ts`
- [ ] T024 [US3] Contract tests for Grafana user tools in `tests/contract/tools/cockpit/contract.test.ts`

**Checkpoint**: Grafana user management fully functional

---

## Phase 6: User Story 4 - Alert Manager & Contact Points (Priority: P3)

**Goal**: Alert manager controls, contact point management, and managed alerts via MCP tools

### Implementation

- [ ] T025 [US4] Implement alert manager handler functions (get, enable, disable) in `src/tools/cockpit/handlers.ts`
- [ ] T026 [P] [US4] Implement contact point handler functions (list, create, delete) in `src/tools/cockpit/handlers.ts`
- [ ] T027 [P] [US4] Implement managed alerts handler functions (list contact points, enable, disable) in `src/tools/cockpit/handlers.ts`
- [ ] T028 [US4] Register alert manager, contact point, and managed alerts tools in `src/tools/cockpit/index.ts`

### Tests

- [ ] T029 [US4] Unit tests for alert manager, contact point, and managed alerts handlers in `tests/unit/tools/cockpit/handlers.test.ts`
- [ ] T030 [US4] Contract tests for alert manager, contact point, and managed alerts tools in `tests/contract/tools/cockpit/contract.test.ts`

**Checkpoint**: Alert manager & contact points fully functional

---

## Phase 7: Polish & Cross-Cutting

- [ ] T031 Update `tests/parity-matrix.json` with all Cockpit API operations
- [ ] T032 Verify 100% code coverage
- [ ] T033 Run lint and type check

---

## Dependencies & Execution Order

- **Phase 1**: No dependencies - Zod schemas first
- **Phase 2**: Depends on Phase 1 (schemas needed for handlers)
- **Phase 3-6**: All depend on Phase 2 (handler helpers). Execute sequentially P1->P2->P2->P3
- **Phase 7**: Depends on all implementation phases
