# Tasks: Scaleway Key Manager MCP Tools

**Input**: Design documents from `/specs/025-key-manager/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Schemas & Types)

**Purpose**: Define Zod schemas and TypeScript types for all entities

- [ ] T001 [US1] Define Zod enum schemas (KeyAlgorithmSymmetricEncryption, KeyAlgorithmAsymmetricEncryption, KeyAlgorithmAsymmetricSigning, DataKeyAlgorithmSymmetricEncryption, KeyState, KeyOrigin, ListKeysOrderBy, ListKeysUsage) in `src/tools/key-manager/types.ts`
- [ ] T002 [P] [US1] Define Zod schemas for nested objects (KeyUsageSchema, RotationPolicySchema) in `src/tools/key-manager/types.ts`
- [ ] T003 [P] [US1] Define Zod schemas for key lifecycle tool inputs (ListKeysInput, GetKeyInput, CreateKeyInput, UpdateKeyInput, DeleteKeyInput, RotateKeyInput, ProtectKeyInput, UnprotectKeyInput, EnableKeyInput, DisableKeyInput) in `src/tools/key-manager/types.ts`
- [ ] T004 [P] [US2] Define Zod schemas for cryptographic operation inputs (EncryptInput, DecryptInput, GenerateDataKeyInput) in `src/tools/key-manager/types.ts`

---

## Phase 2: Foundation (API Client Helper)

**Purpose**: Create the Key Manager API helper using the SDK package

- [ ] T005 Implement `createApi` helper function in `src/tools/key-manager/handlers.ts` that instantiates `KeyManagerv1alpha1.API` from `@scaleway/sdk-key-manager`
- [ ] T006 [P] Implement `formatSuccess` helper in `src/tools/key-manager/handlers.ts` for consistent MCP response formatting

**Checkpoint**: API helper ready, tool implementations can begin

---

## Phase 3: User Story 1 - Key CRUD & Lifecycle (Priority: P1)

**Goal**: Full key lifecycle management via MCP tools

**Independent Test**: Create, list, get, update, rotate, protect/unprotect, enable/disable, delete keys

### Implementation

- [ ] T007 [US1] Implement `handleListKeys` handler in `src/tools/key-manager/handlers.ts`
- [ ] T008 [P] [US1] Implement `handleGetKey` handler in `src/tools/key-manager/handlers.ts`
- [ ] T009 [P] [US1] Implement `handleCreateKey` handler with rotationPolicy date conversion in `src/tools/key-manager/handlers.ts`
- [ ] T010 [P] [US1] Implement `handleUpdateKey` handler with rotationPolicy date conversion in `src/tools/key-manager/handlers.ts`
- [ ] T011 [P] [US1] Implement `handleDeleteKey` handler in `src/tools/key-manager/handlers.ts`
- [ ] T012 [P] [US1] Implement `handleRotateKey` handler in `src/tools/key-manager/handlers.ts`
- [ ] T013 [P] [US1] Implement `handleProtectKey` handler in `src/tools/key-manager/handlers.ts`
- [ ] T014 [P] [US1] Implement `handleUnprotectKey` handler in `src/tools/key-manager/handlers.ts`
- [ ] T015 [P] [US1] Implement `handleEnableKey` handler in `src/tools/key-manager/handlers.ts`
- [ ] T016 [P] [US1] Implement `handleDisableKey` handler in `src/tools/key-manager/handlers.ts`
- [ ] T017 [US1] Register all key lifecycle tools in `src/tools/key-manager/index.ts`

### Tests

- [ ] T018 [US1] Unit tests for key lifecycle handlers in `tests/unit/tools/key-manager/handlers.test.ts`
- [ ] T019 [US1] Contract tests for key lifecycle tools in `tests/contract/tools/key-manager/contract.test.ts`

**Checkpoint**: Key CRUD & lifecycle fully functional

---

## Phase 4: User Story 2 - Cryptographic Operations (Priority: P1)

**Goal**: Encrypt, decrypt, and generate data keys via MCP tools

### Implementation

- [ ] T020 [US2] Implement `handleEncrypt` handler in `src/tools/key-manager/handlers.ts`
- [ ] T021 [P] [US2] Implement `handleDecrypt` handler in `src/tools/key-manager/handlers.ts`
- [ ] T022 [P] [US2] Implement `handleGenerateDataKey` handler in `src/tools/key-manager/handlers.ts`
- [ ] T023 [US2] Register cryptographic operation tools in `src/tools/key-manager/index.ts`

### Tests

- [ ] T024 [US2] Unit tests for cryptographic operation handlers in `tests/unit/tools/key-manager/handlers.test.ts`
- [ ] T025 [US2] Contract tests for cryptographic operation tools in `tests/contract/tools/key-manager/contract.test.ts`

**Checkpoint**: Cryptographic operations fully functional

---

## Phase 5: Polish & Cross-Cutting

- [ ] T026 Update `tests/parity-matrix.json` with all Key Manager API operations
- [ ] T027 Verify 100% code coverage
- [ ] T028 Run lint and type check

---

## Dependencies & Execution Order

- **Phase 1**: No dependencies - Zod schemas first
- **Phase 2**: Depends on Phase 1 (schemas needed for handlers)
- **Phase 3-4**: Both depend on Phase 2 (API helper). Can be done sequentially
- **Phase 5**: Depends on all implementation phases
