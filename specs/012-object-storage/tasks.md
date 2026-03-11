# Tasks: Scaleway Object Storage MCP Tools

**Input**: Design documents from `/specs/012-object-storage/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Zod Schemas & Types)

**Purpose**: Define Zod schemas and TypeScript types for all entities and tool inputs

- [ ] T001 [US1] Define Zod schemas for bucket-related entities (Bucket, BucketInfo) in `src/tools/object-storage/types.ts`
- [ ] T002 [P] [US2] Define Zod schemas for object-related entities (S3Object, ObjectInfo) in `src/tools/object-storage/types.ts`
- [ ] T003 [P] [US1] Define Zod input schemas for bucket tools (ListBucketsInput, CreateBucketInput, DeleteBucketInput, GetBucketInfoInput) in `src/tools/object-storage/types.ts`
- [ ] T004 [P] [US2] Define Zod input schemas for object tools (ListObjectsInput, GetObjectInfoInput, PutObjectInput, DeleteObjectInput) in `src/tools/object-storage/types.ts`
- [ ] T005 [P] [US3] Define Zod input schemas for policy tools (GetBucketPolicyInput, SetBucketPolicyInput) in `src/tools/object-storage/types.ts`
- [ ] T006 [P] [US4] Define Zod input schemas for lifecycle and versioning tools in `src/tools/object-storage/types.ts`

---

## Phase 2: Foundation (HTTP Helpers & XML Parsers)

**Purpose**: Create the S3 endpoint builder, auth header builder, and XML parsing utilities

- [ ] T007 Implement `buildEndpoint(region)` and `buildHeaders(accessKey, secretKey)` helpers in `src/tools/object-storage/handlers.ts`
- [ ] T008 [P] Implement XML parsing helpers (parseListBucketsXml, parseListObjectsV2Xml, parseVersioningXml, parseKeyCount, parseLifecycleXml) in `src/tools/object-storage/handlers.ts`
- [ ] T009 [P] Implement `buildLifecycleXml` helper for lifecycle PUT requests in `src/tools/object-storage/handlers.ts`
- [ ] T010 [P] Implement `extractMetadata` helper for x-amz-meta-* headers in `src/tools/object-storage/handlers.ts`

**Checkpoint**: All helpers ready, handler implementations can begin

---

## Phase 3: User Story 1 - Bucket Management (Priority: P1)

**Goal**: Full bucket lifecycle management via MCP tools

**Independent Test**: Create, list, get info, delete buckets

### Implementation

- [ ] T011 [US1] Implement `handleListBuckets` handler in `src/tools/object-storage/handlers.ts`
- [ ] T012 [P] [US1] Implement `handleCreateBucket` handler in `src/tools/object-storage/handlers.ts`
- [ ] T013 [P] [US1] Implement `handleDeleteBucket` handler in `src/tools/object-storage/handlers.ts`
- [ ] T014 [P] [US1] Implement `handleGetBucketInfo` handler in `src/tools/object-storage/handlers.ts`
- [ ] T015 [US1] Register bucket tools in `src/tools/object-storage/index.ts`

### Tests

- [ ] T016 [US1] Unit tests for bucket handlers in `tests/unit/tools/object-storage/handlers.test.ts`
- [ ] T017 [US1] Contract tests for bucket tools in `tests/contract/tools/object-storage/contract.test.ts`

**Checkpoint**: Bucket management fully functional

---

## Phase 4: User Story 2 - Object Operations (Priority: P1)

**Goal**: Object CRUD via MCP tools

### Implementation

- [ ] T018 [US2] Implement `handleListObjects` handler in `src/tools/object-storage/handlers.ts`
- [ ] T019 [P] [US2] Implement `handleGetObjectInfo` handler in `src/tools/object-storage/handlers.ts`
- [ ] T020 [P] [US2] Implement `handlePutObject` handler in `src/tools/object-storage/handlers.ts`
- [ ] T021 [P] [US2] Implement `handleDeleteObject` handler in `src/tools/object-storage/handlers.ts`
- [ ] T022 [US2] Register object tools in `src/tools/object-storage/index.ts`

### Tests

- [ ] T023 [US2] Unit tests for object handlers in `tests/unit/tools/object-storage/handlers.test.ts`
- [ ] T024 [US2] Contract tests for object tools in `tests/contract/tools/object-storage/contract.test.ts`

**Checkpoint**: Object operations fully functional

---

## Phase 5: User Story 3 - Bucket Policies (Priority: P2)

**Goal**: Bucket policy get/set via MCP tools

### Implementation

- [ ] T025 [US3] Implement `handleGetBucketPolicy` handler in `src/tools/object-storage/handlers.ts`
- [ ] T026 [P] [US3] Implement `handleSetBucketPolicy` handler in `src/tools/object-storage/handlers.ts`
- [ ] T027 [US3] Register policy tools in `src/tools/object-storage/index.ts`

### Tests

- [ ] T028 [US3] Unit tests for policy handlers in `tests/unit/tools/object-storage/handlers.test.ts`
- [ ] T029 [US3] Contract tests for policy tools in `tests/contract/tools/object-storage/contract.test.ts`

**Checkpoint**: Bucket policies fully functional

---

## Phase 6: User Story 4 - Lifecycle & Versioning (Priority: P3)

**Goal**: Lifecycle and versioning management via MCP tools

### Implementation

- [ ] T030 [US4] Implement `handleGetBucketLifecycle` and `handleSetBucketLifecycle` handlers in `src/tools/object-storage/handlers.ts`
- [ ] T031 [P] [US4] Implement `handleGetBucketVersioning` and `handleSetBucketVersioning` handlers in `src/tools/object-storage/handlers.ts`
- [ ] T032 [US4] Register lifecycle and versioning tools in `src/tools/object-storage/index.ts`

### Tests

- [ ] T033 [US4] Unit tests for lifecycle and versioning handlers in `tests/unit/tools/object-storage/handlers.test.ts`
- [ ] T034 [US4] Contract tests for lifecycle and versioning tools in `tests/contract/tools/object-storage/contract.test.ts`

**Checkpoint**: Lifecycle and versioning fully functional

---

## Phase 7: Polish & Cross-Cutting

- [ ] T035 Update `tests/parity-matrix.json` with all Object Storage API operations
- [ ] T036 Verify 100% code coverage
- [ ] T037 Run lint and type check

---

## Dependencies & Execution Order

- **Phase 1**: No dependencies - Zod schemas first
- **Phase 2**: Depends on Phase 1 (schemas needed for handler type annotations)
- **Phase 3-6**: All depend on Phase 2 (helpers). Can be done sequentially P1->P1->P2->P3
- **Phase 7**: Depends on all implementation phases
