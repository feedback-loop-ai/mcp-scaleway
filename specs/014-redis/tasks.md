# Tasks: Scaleway Managed Redis MCP Tools

**Input**: Design documents from `/specs/014-redis/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Zod Schemas & Types)

**Purpose**: Define Zod schemas and TypeScript types for all entities and tool inputs

- [ ] T001 [US1] Define Zod schemas for cluster-related tool inputs in `src/tools/redis/types.ts`
- [ ] T002 [P] [US2] Define Zod schemas for metrics and certificate tool inputs in `src/tools/redis/types.ts`
- [ ] T003 [P] [US3] Define Zod schemas for ACL rule tool inputs in `src/tools/redis/types.ts`
- [ ] T004 [P] [US4] Define Zod schemas for endpoint tool inputs in `src/tools/redis/types.ts`
- [ ] T005 [P] [US5] Define Zod schemas for discovery tool inputs (node types, versions) in `src/tools/redis/types.ts`
- [ ] T006 Define Zod schemas for response entities (RedisCluster, RedisACLRule, RedisEndpoint, RedisNodeType, RedisVersion, RedisClusterMetrics) in `src/tools/redis/types.ts`

---

## Phase 2: Foundation (Handlers Infrastructure)

**Purpose**: Create the Redis-specific handler helpers (client init, region resolution, response formatting)

- [ ] T007 Implement shared helpers (getClient, regionOrDefault, formatResponse) in `src/tools/redis/handlers.ts`

**Checkpoint**: Handler infrastructure ready, tool implementations can begin

---

## Phase 3: User Story 1 - Cluster CRUD (Priority: P1)

**Goal**: Full cluster lifecycle management via MCP tools

**Independent Test**: Create, list, get, update, delete clusters

### Implementation

- [ ] T008 [US1] Implement `handleListClusters` handler in `src/tools/redis/handlers.ts`
- [ ] T009 [P] [US1] Implement `handleGetCluster` handler in `src/tools/redis/handlers.ts`
- [ ] T010 [P] [US1] Implement `handleCreateCluster` handler in `src/tools/redis/handlers.ts`
- [ ] T011 [P] [US1] Implement `handleUpdateCluster` handler in `src/tools/redis/handlers.ts`
- [ ] T012 [P] [US1] Implement `handleDeleteCluster` handler in `src/tools/redis/handlers.ts`
- [ ] T013 [US1] Register cluster tools in `src/tools/redis/index.ts`

### Tests

- [ ] T014 [US1] Unit tests for cluster handlers in `tests/unit/tools/redis/handlers.test.ts`
- [ ] T015 [US1] Contract tests for cluster tools in `tests/contract/tools/redis/contract.test.ts`

**Checkpoint**: Cluster CRUD fully functional

---

## Phase 4: User Story 2 - Metrics & Certificates (Priority: P2)

**Goal**: Cluster observability and TLS management via MCP tools

### Implementation

- [ ] T016 [US2] Implement `handleGetClusterMetrics` handler in `src/tools/redis/handlers.ts`
- [ ] T017 [P] [US2] Implement `handleGetClusterCertificate` handler in `src/tools/redis/handlers.ts`
- [ ] T018 [P] [US2] Implement `handleRenewClusterCertificate` handler in `src/tools/redis/handlers.ts`
- [ ] T019 [US2] Register metrics and certificate tools in `src/tools/redis/index.ts`

### Tests

- [ ] T020 [US2] Unit tests for metrics and certificate handlers in `tests/unit/tools/redis/handlers.test.ts`
- [ ] T021 [US2] Contract tests for metrics and certificate tools in `tests/contract/tools/redis/contract.test.ts`

**Checkpoint**: Metrics and certificate management fully functional

---

## Phase 5: User Story 3 - ACL Rules (Priority: P2)

**Goal**: ACL rule management via MCP tools

### Implementation

- [ ] T022 [US3] Implement `handleAddACLRules` handler in `src/tools/redis/handlers.ts`
- [ ] T023 [P] [US3] Implement `handleDeleteACLRules` handler in `src/tools/redis/handlers.ts`
- [ ] T024 [P] [US3] Implement `handleSetACLRules` handler in `src/tools/redis/handlers.ts`
- [ ] T025 [US3] Register ACL rule tools in `src/tools/redis/index.ts`

### Tests

- [ ] T026 [US3] Unit tests for ACL rule handlers in `tests/unit/tools/redis/handlers.test.ts`
- [ ] T027 [US3] Contract tests for ACL rule tools in `tests/contract/tools/redis/contract.test.ts`

**Checkpoint**: ACL rule management fully functional

---

## Phase 6: User Story 4 - Endpoints (Priority: P2)

**Goal**: Endpoint management via MCP tools

### Implementation

- [ ] T028 [US4] Implement `handleAddEndpoints` handler in `src/tools/redis/handlers.ts`
- [ ] T029 [P] [US4] Implement `handleDeleteEndpoints` handler in `src/tools/redis/handlers.ts`
- [ ] T030 [P] [US4] Implement `handleSetEndpoints` handler in `src/tools/redis/handlers.ts`
- [ ] T031 [US4] Register endpoint tools in `src/tools/redis/index.ts`

### Tests

- [ ] T032 [US4] Unit tests for endpoint handlers in `tests/unit/tools/redis/handlers.test.ts`
- [ ] T033 [US4] Contract tests for endpoint tools in `tests/contract/tools/redis/contract.test.ts`

**Checkpoint**: Endpoint management fully functional

---

## Phase 7: User Story 5 - Discovery (Priority: P3)

**Goal**: Node type and version discovery via MCP tools

### Implementation

- [ ] T034 [US5] Implement `handleListNodeTypes` handler in `src/tools/redis/handlers.ts`
- [ ] T035 [P] [US5] Implement `handleListClusterVersions` handler in `src/tools/redis/handlers.ts`
- [ ] T036 [US5] Register discovery tools in `src/tools/redis/index.ts`

### Tests

- [ ] T037 [US5] Unit tests for discovery handlers in `tests/unit/tools/redis/handlers.test.ts`
- [ ] T038 [US5] Contract tests for discovery tools in `tests/contract/tools/redis/contract.test.ts`

**Checkpoint**: Discovery tools fully functional

---

## Phase 8: Polish & Cross-Cutting

- [ ] T039 Update `tests/parity-matrix.json` with all Redis API operations
- [ ] T040 Verify 100% code coverage
- [ ] T041 Run lint and type check

---

## Dependencies & Execution Order

- **Phase 1**: No dependencies - Zod schemas first
- **Phase 2**: Depends on Phase 1 (schemas needed for handlers)
- **Phase 3-7**: All depend on Phase 2 (handler infrastructure). Execute sequentially P1->P2->P2->P2->P3
- **Phase 8**: Depends on all implementation phases
