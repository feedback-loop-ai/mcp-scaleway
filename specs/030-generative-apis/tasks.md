# Tasks: Scaleway Generative APIs MCP Tools

**Input**: Design documents from `/specs/030-generative-apis/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Type Definitions)

**Purpose**: Define Zod schemas and TypeScript types for all entities and tool inputs

- [ ] T001 [US1] Define Zod schemas for Model and ListModelsResponse in `src/tools/generative-apis/types.ts`
- [ ] T002 [P] [US2] Define Zod schemas for ChatMessage, ChatCompletionChoice, Usage, ChatCompletionResponse in `src/tools/generative-apis/types.ts`
- [ ] T003 [P] [US3] Define Zod schemas for EmbeddingData, EmbeddingResponse in `src/tools/generative-apis/types.ts`
- [ ] T004 [P] Define Zod schemas for all tool input types (ListModelsInput, GetModelInput, ChatCompletionInput, CreateEmbeddingInput) in `src/tools/generative-apis/types.ts`

---

## Phase 2: Foundation (API Client Helpers)

**Purpose**: Create the Generative APIs-specific helper functions for auth and URL construction

- [ ] T005 Implement `buildHeaders()` helper that constructs Bearer token auth header using `loadAuthConfig()` in `src/tools/generative-apis/handlers.ts`
- [ ] T006 [P] Implement `buildBaseUrl(region)` helper that constructs region-scoped API URL in `src/tools/generative-apis/handlers.ts`

**Checkpoint**: API helpers ready, tool implementations can begin

---

## Phase 3: User Story 1 - Model Discovery (Priority: P1)

**Goal**: List and inspect available generative AI models

**Independent Test**: List models, get specific model by ID

### Implementation

- [ ] T007 [US1] Implement `handleListModels` handler in `src/tools/generative-apis/handlers.ts`
- [ ] T008 [P] [US1] Implement `handleGetModel` handler with client-side filtering in `src/tools/generative-apis/handlers.ts`
- [ ] T009 [US1] Register model tools in `src/tools/generative-apis/index.ts`

### Tests

- [ ] T010 [US1] Unit tests for model handlers in `tests/unit/tools/generative-apis/handlers.test.ts`
- [ ] T011 [US1] Contract tests for model tools in `tests/contract/tools/generative-apis/contract.test.ts`

**Checkpoint**: Model discovery fully functional

---

## Phase 4: User Story 2 - Chat Completion (Priority: P1)

**Goal**: Generate chat completions via MCP tools

### Implementation

- [ ] T012 [US2] Implement `handleChatCompletion` handler in `src/tools/generative-apis/handlers.ts`
- [ ] T013 [US2] Register chat completion tool in `src/tools/generative-apis/index.ts`

### Tests

- [ ] T014 [US2] Unit tests for chat completion handler in `tests/unit/tools/generative-apis/handlers.test.ts`
- [ ] T015 [US2] Contract tests for chat completion tool in `tests/contract/tools/generative-apis/contract.test.ts`

**Checkpoint**: Chat completion fully functional

---

## Phase 5: User Story 3 - Text Embeddings (Priority: P2)

**Goal**: Create text embeddings via MCP tools

### Implementation

- [ ] T016 [US3] Implement `handleCreateEmbedding` handler in `src/tools/generative-apis/handlers.ts`
- [ ] T017 [US3] Register embedding tool in `src/tools/generative-apis/index.ts`

### Tests

- [ ] T018 [US3] Unit tests for embedding handler in `tests/unit/tools/generative-apis/handlers.test.ts`
- [ ] T019 [US3] Contract tests for embedding tool in `tests/contract/tools/generative-apis/contract.test.ts`

**Checkpoint**: Text embeddings fully functional

---

## Phase 6: Polish & Cross-Cutting

- [ ] T020 Update `tests/parity-matrix.json` with all Generative APIs operations
- [ ] T021 Verify 100% code coverage
- [ ] T022 Run lint and type check

---

## Dependencies & Execution Order

- **Phase 1**: No dependencies - Zod schemas first
- **Phase 2**: Depends on Phase 1 (schemas needed for handlers)
- **Phase 3-5**: All depend on Phase 2 (API helpers). Can be done sequentially P1->P2
- **Phase 6**: Depends on all implementation phases
