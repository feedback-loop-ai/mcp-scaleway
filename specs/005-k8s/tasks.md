# Tasks: Scaleway Kubernetes (Kapsule & Kosmos) MCP Tools

**Input**: Design documents from `/specs/005-k8s/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Zod Schemas & Types)

**Purpose**: Define Zod schemas and TypeScript types for all Kubernetes entities and tool inputs

- [x] T001 [US-K8S-01] Define Zod enum schemas for ClusterStatus, ClusterCni, ClusterType, PoolStatus in `src/tools/k8s/types.ts`
- [x] T002 [P] [US-K8S-01] Define Zod schemas for cluster-related tool inputs (ListClusters, GetCluster, CreateCluster, DeleteCluster) in `src/tools/k8s/types.ts`
- [x] T003 [P] [US-K8S-05] Define Zod schemas for pool-related tool inputs (ListPools, GetPool, CreatePool, UpdatePool, DeletePool, UpgradePool) in `src/tools/k8s/types.ts`
- [x] T004 [P] [US-K8S-11] Define Zod schemas for cluster operations inputs (GetKubeconfig, ListAvailableVersions, UpgradeCluster) in `src/tools/k8s/types.ts`

---

## Phase 2: Foundation (API Client Helper)

**Purpose**: Create the K8s-specific API helper that wraps the shared client

- [x] T005 Implement K8s API helper functions in `src/tools/k8s/handlers.ts` (getClient, buildUrl, apiRequest, formatSuccess wrappers)

**Checkpoint**: API helper ready, tool implementations can begin

---

## Phase 3: User Story 1 - Cluster CRUD (Priority: P1)

**Goal**: Full cluster lifecycle management via MCP tools

**Independent Test**: Create, list, get, delete clusters

### Implementation

- [x] T006 [US-K8S-01] Implement `handleListClusters` handler with pagination and filtering in `src/tools/k8s/handlers.ts`
- [x] T007 [P] [US-K8S-02] Implement `handleGetCluster` handler in `src/tools/k8s/handlers.ts`
- [x] T008 [P] [US-K8S-03] Implement `handleCreateCluster` handler in `src/tools/k8s/handlers.ts`
- [x] T009 [P] [US-K8S-04] Implement `handleDeleteCluster` handler with optional resource cleanup in `src/tools/k8s/handlers.ts`
- [x] T010 [US-K8S-01] Register cluster tools in `src/tools/k8s/index.ts`

### Tests

- [x] T011 [US-K8S-01] Unit tests for cluster handlers in `tests/unit/tools/k8s/handlers.test.ts`
- [x] T012 [US-K8S-01] Contract tests for cluster tools in `tests/contract/tools/k8s/contract.test.ts`

**Checkpoint**: Cluster CRUD fully functional

---

## Phase 4: User Story 2 - Node Pool Management (Priority: P1)

**Goal**: Full node pool lifecycle management via MCP tools

### Implementation

- [x] T013 [US-K8S-05] Implement `handleListPools` handler with pagination in `src/tools/k8s/handlers.ts`
- [x] T014 [P] [US-K8S-06] Implement `handleGetPool` handler in `src/tools/k8s/handlers.ts`
- [x] T015 [P] [US-K8S-07] Implement `handleCreatePool` handler in `src/tools/k8s/handlers.ts`
- [x] T016 [P] [US-K8S-08] Implement `handleUpdatePool` handler in `src/tools/k8s/handlers.ts`
- [x] T017 [P] [US-K8S-09] Implement `handleDeletePool` handler in `src/tools/k8s/handlers.ts`
- [x] T018 [P] [US-K8S-10] Implement `handleUpgradePool` handler in `src/tools/k8s/handlers.ts`
- [x] T019 [US-K8S-05] Register pool tools in `src/tools/k8s/index.ts`

### Tests

- [x] T020 [US-K8S-05] Unit tests for pool handlers in `tests/unit/tools/k8s/handlers.test.ts`
- [x] T021 [US-K8S-05] Contract tests for pool tools in `tests/contract/tools/k8s/contract.test.ts`

**Checkpoint**: Node pool management fully functional

---

## Phase 5: User Story 3 - Cluster Operations (Priority: P2)

**Goal**: Kubeconfig retrieval and version listing

### Implementation

- [x] T022 [US-K8S-11] Implement `handleGetClusterKubeconfig` handler in `src/tools/k8s/handlers.ts`
- [x] T023 [P] [US-K8S-12] Implement `handleListClusterAvailableVersions` handler in `src/tools/k8s/handlers.ts`
- [x] T024 [US-K8S-11] Register kubeconfig and version tools in `src/tools/k8s/index.ts`

### Tests

- [x] T025 [US-K8S-11] Unit tests for kubeconfig and version handlers in `tests/unit/tools/k8s/handlers.test.ts`
- [x] T026 [US-K8S-11] Contract tests for kubeconfig and version tools in `tests/contract/tools/k8s/contract.test.ts`

**Checkpoint**: Cluster operations fully functional

---

## Phase 6: User Story 4 - Cluster Upgrades (Priority: P3)

**Goal**: Cluster version upgrade management

### Implementation

- [x] T027 [US-K8S-13] Implement `handleUpgradeCluster` handler with optional pool upgrade in `src/tools/k8s/handlers.ts`
- [x] T028 [US-K8S-13] Register upgrade tool in `src/tools/k8s/index.ts`

### Tests

- [x] T029 [US-K8S-13] Unit tests for cluster upgrade handler in `tests/unit/tools/k8s/handlers.test.ts`
- [x] T030 [US-K8S-13] Contract tests for cluster upgrade tool in `tests/contract/tools/k8s/contract.test.ts`

**Checkpoint**: Cluster upgrades fully functional

---

## Phase 7: Polish & Cross-Cutting

- [x] T031 Update `tests/parity-matrix.json` with all K8s API operations
- [x] T032 Verify 100% code coverage
- [x] T033 Run lint and type check

---

## Dependencies & Execution Order

- **Phase 1**: No dependencies - Zod schemas first
- **Phase 2**: Depends on Phase 1 (schemas needed for handlers)
- **Phase 3-6**: All depend on Phase 2 (API helper). Execute sequentially P1->P1->P2->P3
- **Phase 7**: Depends on all implementation phases
