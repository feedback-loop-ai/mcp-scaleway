# Tasks: Scaleway Marketplace MCP Tools

**Input**: Design documents from `/specs/037-marketplace/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Zod Schemas)

**Purpose**: Define Zod schemas and TypeScript types for all entities and inputs

- [ ] T001 [US1] Define Zod schemas for Image entity and ListImagesInput/GetImageInput in `src/tools/marketplace/types.ts`
- [ ] T002 [P] [US2] Define Zod schemas for LocalImage entity and ListLocalImagesInput/GetLocalImageInput in `src/tools/marketplace/types.ts`
- [ ] T003 [P] [US3] Define Zod schemas for Category entity and ListCategoriesInput/GetCategoryInput in `src/tools/marketplace/types.ts`
- [ ] T004 [P] [US4] Define Zod schemas for Version entity and ListVersionsInput/GetVersionInput in `src/tools/marketplace/types.ts`

---

## Phase 2: Foundation (API Client Helper)

**Purpose**: Create the Marketplace-specific handler functions that wrap the shared client

- [ ] T005 Implement Marketplace API helper function (successResponse, BASE_URL constant) in `src/tools/marketplace/handlers.ts`

**Checkpoint**: API helper ready, tool implementations can begin

---

## Phase 3: User Story 1 - Image Browsing (Priority: P1)

**Goal**: Browse and inspect marketplace images via MCP tools

**Independent Test**: List images with filters, get a specific image

### Implementation

- [ ] T006 [US1] Implement `handleListImages` handler in `src/tools/marketplace/handlers.ts`
- [ ] T007 [P] [US1] Implement `handleGetImage` handler in `src/tools/marketplace/handlers.ts`
- [ ] T008 [US1] Register image tools in `src/tools/marketplace/index.ts`

### Tests

- [ ] T009 [US1] Unit tests for image handlers in `tests/unit/tools/marketplace/handlers.test.ts`
- [ ] T010 [US1] Contract tests for image tools in `tests/contract/tools/marketplace/contract.test.ts`

**Checkpoint**: Image browsing fully functional

---

## Phase 4: User Story 2 - Local Image Discovery (Priority: P1)

**Goal**: Discover zone-specific image variants via MCP tools

### Implementation

- [ ] T011 [US2] Implement `handleListLocalImages` handler in `src/tools/marketplace/handlers.ts`
- [ ] T012 [P] [US2] Implement `handleGetLocalImage` handler in `src/tools/marketplace/handlers.ts`
- [ ] T013 [US2] Register local image tools in `src/tools/marketplace/index.ts`

### Tests

- [ ] T014 [US2] Unit tests for local image handlers in `tests/unit/tools/marketplace/handlers.test.ts`
- [ ] T015 [US2] Contract tests for local image tools in `tests/contract/tools/marketplace/contract.test.ts`

**Checkpoint**: Local image discovery fully functional

---

## Phase 5: User Story 3 - Category Browsing (Priority: P2)

**Goal**: Browse marketplace categories via MCP tools

### Implementation

- [ ] T016 [US3] Implement `handleListCategories` handler in `src/tools/marketplace/handlers.ts`
- [ ] T017 [P] [US3] Implement `handleGetCategory` handler in `src/tools/marketplace/handlers.ts`
- [ ] T018 [US3] Register category tools in `src/tools/marketplace/index.ts`

### Tests

- [ ] T019 [US3] Unit tests for category handlers in `tests/unit/tools/marketplace/handlers.test.ts`
- [ ] T020 [US3] Contract tests for category tools in `tests/contract/tools/marketplace/contract.test.ts`

**Checkpoint**: Category browsing fully functional

---

## Phase 6: User Story 4 - Version Management (Priority: P3)

**Goal**: Browse image versions via MCP tools

### Implementation

- [ ] T021 [US4] Implement `handleListVersions` handler in `src/tools/marketplace/handlers.ts`
- [ ] T022 [P] [US4] Implement `handleGetVersion` handler in `src/tools/marketplace/handlers.ts`
- [ ] T023 [US4] Register version tools in `src/tools/marketplace/index.ts`

### Tests

- [ ] T024 [US4] Unit tests for version handlers in `tests/unit/tools/marketplace/handlers.test.ts`
- [ ] T025 [US4] Contract tests for version tools in `tests/contract/tools/marketplace/contract.test.ts`

**Checkpoint**: Version management fully functional

---

## Phase 7: Polish & Cross-Cutting

- [ ] T026 Update `tests/parity-matrix.json` with all Marketplace API operations
- [ ] T027 Verify 100% code coverage
- [ ] T028 Run lint and type check

---

## Dependencies & Execution Order

- **Phase 1**: No dependencies - Zod schemas first
- **Phase 2**: Depends on Phase 1 (schemas needed for handlers)
- **Phase 3-6**: All depend on Phase 2 (API helper). Can be done sequentially P1->P2->P3
- **Phase 7**: Depends on all implementation phases
