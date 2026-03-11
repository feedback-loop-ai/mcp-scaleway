# Tasks: Scaleway Account MCP Tools

**Input**: Design documents from `/specs/035-account/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Schemas & Types)

**Purpose**: Define Zod schemas and TypeScript types for all entities

- [ ] T001 [US1] Define Zod schemas for project-related tool inputs in `src/tools/account/types.ts`
- [ ] T002 [P] [US1] Define response interfaces (ProjectResponse, ListProjectsApiResponse) in `src/tools/account/types.ts`

---

## Phase 2: Foundation (API Client Helper)

**Purpose**: Create the Account-specific API helper that wraps the shared client

- [ ] T003 Implement `createProjectApi` factory function in `src/tools/account/handlers.ts`
- [ ] T004 [P] Implement `formatProject` response formatter in `src/tools/account/handlers.ts`
- [ ] T005 [P] Implement `successResponse` helper in `src/tools/account/handlers.ts`

**Checkpoint**: API helper ready, tool implementations can begin

---

## Phase 3: User Story 1 - Project CRUD (Priority: P1)

**Goal**: Full project lifecycle management via MCP tools

**Independent Test**: Create, list, get, update, delete projects

### Implementation

- [ ] T006 [US1] Implement `handleListProjects` handler in `src/tools/account/handlers.ts`
- [ ] T007 [P] [US1] Implement `handleGetProject` handler in `src/tools/account/handlers.ts`
- [ ] T008 [P] [US1] Implement `handleCreateProject` handler in `src/tools/account/handlers.ts`
- [ ] T009 [P] [US1] Implement `handleUpdateProject` handler in `src/tools/account/handlers.ts`
- [ ] T010 [P] [US1] Implement `handleDeleteProject` handler in `src/tools/account/handlers.ts`
- [ ] T011 [US1] Register all account tools in `src/tools/account/index.ts`

### Tests

- [ ] T012 [US1] Unit tests for all project handlers in `tests/unit/tools/account/handlers.test.ts`
- [ ] T013 [US1] Contract tests for all project tools in `tests/contract/tools/account/contract.test.ts`

**Checkpoint**: Project CRUD fully functional

---

## Phase 4: Polish & Cross-Cutting

- [ ] T014 Update `tests/parity-matrix.json` with all Account API operations
- [ ] T015 Verify 100% code coverage
- [ ] T016 Run lint and type check

---

## Dependencies & Execution Order

- **Phase 1**: No dependencies - Zod schemas first
- **Phase 2**: Depends on Phase 1 (schemas needed for handlers)
- **Phase 3**: Depends on Phase 2 (API helper). All handlers can be implemented sequentially
- **Phase 4**: Depends on all implementation phases
