# Tasks: Scaleway API Group Specs & Modular Architecture

**Input**: Design documents from `/specs/001-scaleway-api-specs/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/tool-contract.md

**Tests**: Included — Constitution v1.1.0 mandates 100% line and branch coverage.

**Organization**: Tasks grouped by user story. Each user story creates its product module stubs and registers them. Shared infrastructure is foundational.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, toolchain configuration, dependency installation

- [x] T001 Initialize Bun project with package.json at project root (`package.json`)
- [x] T002 Configure TypeScript strict mode in `tsconfig.json`
- [x] T003 [P] Configure Biome linter/formatter in `biome.json`
- [x] T004 [P] Configure Vitest with coverage enforcement in `tests/vitest.config.ts`
- [x] T005 Install dependencies: `@modelcontextprotocol/sdk`, `@scaleway/sdk-client`, `zod`, `vitest`, `@vitest/coverage-v8`, `@biomejs/biome` via `package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared infrastructure that ALL product modules depend on. MUST complete before any user story.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T006 Define shared types (Locality enum, PaginationParams, PaginatedResponse, ApiError) in `src/shared/types.ts`
- [x] T007 [P] Implement auth config loading from environment variables in `src/shared/auth.ts`
- [x] T008 [P] Implement Scaleway SDK client factory in `src/shared/client.ts`
- [x] T009 [P] Implement shared pagination helpers in `src/shared/pagination.ts`
- [x] T010 [P] Implement Scaleway-to-MCP error mapping in `src/shared/errors.ts`
- [x] T011 Create MCP server entry point with stdio transport in `src/server.ts`
- [x] T012 Create tools barrel with `registerAllTools()` in `src/tools/index.ts`
- [x] T013 [P] Create empty parity matrix skeleton in `tests/parity-matrix.json`
- [x] T013b [P] Create `specs/scaleway-api/` directory with `README.md` documenting its purpose (Scaleway API Reference Spec per Constitution Principle III) and per-product subdirectory structure
- [x] T014 [P] Create `.env.test.local.example` with required Scaleway env vars
- [x] T015 [P] Write unit tests for shared types validation in `tests/unit/shared/types.test.ts`
- [x] T016 [P] Write unit tests for auth config loading in `tests/unit/shared/auth.test.ts`
- [x] T017 [P] Write unit tests for client factory in `tests/unit/shared/client.test.ts`
- [x] T018 [P] Write unit tests for pagination helpers in `tests/unit/shared/pagination.test.ts`
- [x] T019 [P] Write unit tests for error mapping in `tests/unit/shared/errors.test.ts`
- [x] T020 [P] Write unit tests for server creation and tool registration barrel in `tests/unit/server.test.ts`

**Checkpoint**: Foundation ready — shared infrastructure tested. User story implementation can now begin in parallel.

---

## Phase 3: User Story 1 — Discover and Manage Compute Resources (Priority: P1) 🎯 MVP

**Goal**: Create product module stubs for Compute API group (Instances, Elastic Metal, Apple Silicon) with registration functions and Zod type placeholders.

**Independent Test**: Import each compute module's `registerTools` function and verify it registers without error on a mock MCP server.

### Implementation for User Story 1

- [x] T021 [P] [US1] Create Instances module stub with `registerInstancesTools(server)` in `src/tools/instances/index.ts`
- [x] T022 [P] [US1] Create Instances types with placeholder Zod schemas in `src/tools/instances/types.ts`
- [x] T023 [P] [US1] Create Elastic Metal module stub with `registerElasticMetalTools(server)` in `src/tools/elastic-metal/index.ts`
- [x] T024 [P] [US1] Create Elastic Metal types with placeholder Zod schemas in `src/tools/elastic-metal/types.ts`
- [x] T025 [P] [US1] Create Apple Silicon module stub with `registerAppleSiliconTools(server)` in `src/tools/apple-silicon/index.ts`
- [x] T026 [P] [US1] Create Apple Silicon types with placeholder Zod schemas in `src/tools/apple-silicon/types.ts`
- [x] T027 [US1] Register Compute modules in `src/tools/index.ts` barrel (instances, elastic-metal, apple-silicon)
- [x] T028 [P] [US1] Write unit tests for Instances module registration in `tests/unit/tools/instances.test.ts`
- [x] T029 [P] [US1] Write unit tests for Elastic Metal module registration in `tests/unit/tools/elastic-metal.test.ts`
- [x] T030 [P] [US1] Write unit tests for Apple Silicon module registration in `tests/unit/tools/apple-silicon.test.ts`

**Checkpoint**: Compute product stubs registered and tested. Server starts with compute modules loaded.

---

## Phase 4: User Story 2 — Manage Storage and Data Services (Priority: P1)

**Goal**: Create product module stubs for Storage (Block Storage, Object Storage) and Managed Databases (RDB, Redis, MongoDB).

**Independent Test**: Import each storage/data module's `registerTools` function and verify it registers without error.

### Implementation for User Story 2

- [x] T031 [P] [US2] Create Block Storage module stub with `registerBlockStorageTools(server)` in `src/tools/block-storage/index.ts`
- [x] T032 [P] [US2] Create Block Storage types in `src/tools/block-storage/types.ts`
- [x] T033 [P] [US2] Create Object Storage module stub with `registerObjectStorageTools(server)` in `src/tools/object-storage/index.ts`
- [x] T034 [P] [US2] Create Object Storage types in `src/tools/object-storage/types.ts`
- [x] T035 [P] [US2] Create RDB (PostgreSQL & MySQL) module stub with `registerRdbTools(server)` in `src/tools/rdb/index.ts`
- [x] T036 [P] [US2] Create RDB types in `src/tools/rdb/types.ts`
- [x] T037 [P] [US2] Create Redis module stub with `registerRedisTools(server)` in `src/tools/redis/index.ts`
- [x] T038 [P] [US2] Create Redis types in `src/tools/redis/types.ts`
- [x] T039 [P] [US2] Create MongoDB module stub with `registerMongodbTools(server)` in `src/tools/mongodb/index.ts`
- [x] T040 [P] [US2] Create MongoDB types in `src/tools/mongodb/types.ts`
- [x] T041 [US2] Register Storage & Data modules in `src/tools/index.ts` barrel (block-storage, object-storage, rdb, redis, mongodb)
- [x] T042 [P] [US2] Write unit tests for Block Storage module registration in `tests/unit/tools/block-storage.test.ts`
- [x] T043 [P] [US2] Write unit tests for Object Storage module registration in `tests/unit/tools/object-storage.test.ts`
- [x] T044 [P] [US2] Write unit tests for RDB module registration in `tests/unit/tools/rdb.test.ts`
- [x] T045 [P] [US2] Write unit tests for Redis module registration in `tests/unit/tools/redis.test.ts`
- [x] T046 [P] [US2] Write unit tests for MongoDB module registration in `tests/unit/tools/mongodb.test.ts`

**Checkpoint**: Storage & Data product stubs registered and tested.

---

## Phase 5: User Story 3 — Manage Networking and Security (Priority: P2)

**Goal**: Create product module stubs for Networking (VPC, LB, Public Gateway, DNS, Domain Registrar, IPAM, Edge Services) and Security (IAM, Secret Manager, Key Manager).

**Independent Test**: Import each networking/security module's `registerTools` function and verify it registers without error.

### Implementation for User Story 3

- [x] T047 [P] [US3] Create VPC module stub with `registerVpcTools(server)` in `src/tools/vpc/index.ts`
- [x] T048 [P] [US3] Create VPC types in `src/tools/vpc/types.ts`
- [x] T049 [P] [US3] Create Load Balancer module stub with `registerLbTools(server)` in `src/tools/lb/index.ts`
- [x] T050 [P] [US3] Create Load Balancer types in `src/tools/lb/types.ts`
- [x] T051 [P] [US3] Create Public Gateway module stub with `registerPublicGatewayTools(server)` in `src/tools/public-gateway/index.ts`
- [x] T052 [P] [US3] Create Public Gateway types in `src/tools/public-gateway/types.ts`
- [x] T053 [P] [US3] Create DNS module stub with `registerDnsTools(server)` in `src/tools/dns/index.ts`
- [x] T054 [P] [US3] Create DNS types in `src/tools/dns/types.ts`
- [x] T055 [P] [US3] Create Domain Registrar module stub with `registerDomainRegistrarTools(server)` in `src/tools/domain-registrar/index.ts`
- [x] T056 [P] [US3] Create Domain Registrar types in `src/tools/domain-registrar/types.ts`
- [x] T057 [P] [US3] Create IPAM module stub with `registerIpamTools(server)` in `src/tools/ipam/index.ts`
- [x] T058 [P] [US3] Create IPAM types in `src/tools/ipam/types.ts`
- [x] T059 [P] [US3] Create Edge Services module stub with `registerEdgeServicesTools(server)` in `src/tools/edge-services/index.ts`
- [x] T060 [P] [US3] Create Edge Services types in `src/tools/edge-services/types.ts`
- [x] T061 [P] [US3] Create IAM module stub with `registerIamTools(server)` in `src/tools/iam/index.ts`
- [x] T062 [P] [US3] Create IAM types in `src/tools/iam/types.ts`
- [x] T063 [P] [US3] Create Secret Manager module stub with `registerSecretManagerTools(server)` in `src/tools/secret-manager/index.ts`
- [x] T064 [P] [US3] Create Secret Manager types in `src/tools/secret-manager/types.ts`
- [x] T065 [P] [US3] Create Key Manager module stub with `registerKeyManagerTools(server)` in `src/tools/key-manager/index.ts`
- [x] T066 [P] [US3] Create Key Manager types in `src/tools/key-manager/types.ts`
- [x] T067 [US3] Register Networking & Security modules in `src/tools/index.ts` barrel (vpc, lb, public-gateway, dns, domain-registrar, ipam, edge-services, iam, secret-manager, key-manager)
- [x] T068 [P] [US3] Write unit tests for VPC module registration in `tests/unit/tools/vpc.test.ts`
- [x] T069 [P] [US3] Write unit tests for LB module registration in `tests/unit/tools/lb.test.ts`
- [x] T070 [P] [US3] Write unit tests for Public Gateway module registration in `tests/unit/tools/public-gateway.test.ts`
- [x] T071 [P] [US3] Write unit tests for DNS module registration in `tests/unit/tools/dns.test.ts`
- [x] T072 [P] [US3] Write unit tests for Domain Registrar module registration in `tests/unit/tools/domain-registrar.test.ts`
- [x] T073 [P] [US3] Write unit tests for IPAM module registration in `tests/unit/tools/ipam.test.ts`
- [x] T074 [P] [US3] Write unit tests for Edge Services module registration in `tests/unit/tools/edge-services.test.ts`
- [x] T075 [P] [US3] Write unit tests for IAM module registration in `tests/unit/tools/iam.test.ts`
- [x] T076 [P] [US3] Write unit tests for Secret Manager module registration in `tests/unit/tools/secret-manager.test.ts`
- [x] T077 [P] [US3] Write unit tests for Key Manager module registration in `tests/unit/tools/key-manager.test.ts`

**Checkpoint**: Networking & Security product stubs registered and tested.

---

## Phase 6: User Story 4 — Deploy Serverless and Container Workloads (Priority: P2)

**Goal**: Create product module stubs for Containers (Kubernetes, Container Registry) and Serverless (Functions, Containers, Jobs, Serverless SQL DB).

**Independent Test**: Import each serverless/container module's `registerTools` function and verify it registers without error.

### Implementation for User Story 4

- [x] T078 [P] [US4] Create Kubernetes module stub with `registerK8sTools(server)` in `src/tools/k8s/index.ts`
- [x] T079 [P] [US4] Create Kubernetes types in `src/tools/k8s/types.ts`
- [x] T080 [P] [US4] Create Container Registry module stub with `registerRegistryTools(server)` in `src/tools/registry/index.ts`
- [x] T081 [P] [US4] Create Container Registry types in `src/tools/registry/types.ts`
- [x] T082 [P] [US4] Create Serverless Functions module stub with `registerFunctionsTools(server)` in `src/tools/functions/index.ts`
- [x] T083 [P] [US4] Create Serverless Functions types in `src/tools/functions/types.ts`
- [x] T084 [P] [US4] Create Serverless Containers module stub with `registerContainersTools(server)` in `src/tools/containers/index.ts`
- [x] T085 [P] [US4] Create Serverless Containers types in `src/tools/containers/types.ts`
- [x] T086 [P] [US4] Create Serverless Jobs module stub with `registerJobsTools(server)` in `src/tools/jobs/index.ts`
- [x] T087 [P] [US4] Create Serverless Jobs types in `src/tools/jobs/types.ts`
- [x] T088 [P] [US4] Create Serverless SQL DB module stub with `registerServerlessSqldbTools(server)` in `src/tools/serverless-sqldb/index.ts`
- [x] T089 [P] [US4] Create Serverless SQL DB types in `src/tools/serverless-sqldb/types.ts`
- [x] T090 [US4] Register Serverless & Container modules in `src/tools/index.ts` barrel (k8s, registry, functions, containers, jobs, serverless-sqldb)
- [x] T091 [P] [US4] Write unit tests for Kubernetes module registration in `tests/unit/tools/k8s.test.ts`
- [x] T092 [P] [US4] Write unit tests for Container Registry module registration in `tests/unit/tools/registry.test.ts`
- [x] T093 [P] [US4] Write unit tests for Serverless Functions module registration in `tests/unit/tools/functions.test.ts`
- [x] T094 [P] [US4] Write unit tests for Serverless Containers module registration in `tests/unit/tools/containers.test.ts`
- [x] T095 [P] [US4] Write unit tests for Serverless Jobs module registration in `tests/unit/tools/jobs.test.ts`
- [x] T096 [P] [US4] Write unit tests for Serverless SQL DB module registration in `tests/unit/tools/serverless-sqldb.test.ts`

**Checkpoint**: Serverless & Container product stubs registered and tested.

---

## Phase 7: User Story 5 — Use AI and Managed Services (Priority: P3)

**Goal**: Create product module stubs for AI (Inference, Generative APIs), Observability (Cockpit), Messaging (NATS, SQS, SNS), and Managed Services (TEM, IoT, Web Hosting).

**Independent Test**: Import each AI/managed service module's `registerTools` function and verify it registers without error.

### Implementation for User Story 5

- [x] T097 [P] [US5] Create Managed Inference module stub with `registerInferenceTools(server)` in `src/tools/inference/index.ts`
- [x] T098 [P] [US5] Create Managed Inference types in `src/tools/inference/types.ts`
- [x] T099 [P] [US5] Create Generative APIs module stub with `registerGenerativeApisTools(server)` in `src/tools/generative-apis/index.ts`
- [x] T100 [P] [US5] Create Generative APIs types in `src/tools/generative-apis/types.ts`
- [x] T101 [P] [US5] Create Cockpit module stub with `registerCockpitTools(server)` in `src/tools/cockpit/index.ts`
- [x] T102 [P] [US5] Create Cockpit types in `src/tools/cockpit/types.ts`
- [x] T103 [P] [US5] Create NATS module stub with `registerNatsTools(server)` in `src/tools/nats/index.ts`
- [x] T104 [P] [US5] Create NATS types in `src/tools/nats/types.ts`
- [x] T105 [P] [US5] Create SQS module stub with `registerSqsTools(server)` in `src/tools/sqs/index.ts`
- [x] T106 [P] [US5] Create SQS types in `src/tools/sqs/types.ts`
- [x] T107 [P] [US5] Create SNS module stub with `registerSnsTools(server)` in `src/tools/sns/index.ts`
- [x] T108 [P] [US5] Create SNS types in `src/tools/sns/types.ts`
- [x] T109 [P] [US5] Create Transactional Email module stub with `registerTemTools(server)` in `src/tools/tem/index.ts`
- [x] T110 [P] [US5] Create Transactional Email types in `src/tools/tem/types.ts`
- [x] T111 [P] [US5] Create IoT Hub module stub with `registerIotTools(server)` in `src/tools/iot/index.ts`
- [x] T112 [P] [US5] Create IoT Hub types in `src/tools/iot/types.ts`
- [x] T113 [P] [US5] Create Web Hosting module stub with `registerWebhostingTools(server)` in `src/tools/webhosting/index.ts`
- [x] T114 [P] [US5] Create Web Hosting types in `src/tools/webhosting/types.ts`
- [x] T115 [US5] Register AI & Managed Services modules in `src/tools/index.ts` barrel (inference, generative-apis, cockpit, nats, sqs, sns, tem, iot, webhosting)
- [x] T116 [P] [US5] Write unit tests for Managed Inference module registration in `tests/unit/tools/inference.test.ts`
- [x] T117 [P] [US5] Write unit tests for Generative APIs module registration in `tests/unit/tools/generative-apis.test.ts`
- [x] T118 [P] [US5] Write unit tests for Cockpit module registration in `tests/unit/tools/cockpit.test.ts`
- [x] T119 [P] [US5] Write unit tests for NATS module registration in `tests/unit/tools/nats.test.ts`
- [x] T120 [P] [US5] Write unit tests for SQS module registration in `tests/unit/tools/sqs.test.ts`
- [x] T121 [P] [US5] Write unit tests for SNS module registration in `tests/unit/tools/sns.test.ts`
- [x] T122 [P] [US5] Write unit tests for TEM module registration in `tests/unit/tools/tem.test.ts`
- [x] T123 [P] [US5] Write unit tests for IoT Hub module registration in `tests/unit/tools/iot.test.ts`
- [x] T124 [P] [US5] Write unit tests for Web Hosting module registration in `tests/unit/tools/webhosting.test.ts`

**Checkpoint**: AI & Managed Services product stubs registered and tested.

---

## Phase 8: User Story 6 — Manage Account and Billing (Priority: P3)

**Goal**: Create product module stubs for Account (Projects), Billing, and Marketplace.

**Independent Test**: Import each account/billing module's `registerTools` function and verify it registers without error.

### Implementation for User Story 6

- [x] T125 [P] [US6] Create Account module stub with `registerAccountTools(server)` in `src/tools/account/index.ts`
- [x] T126 [P] [US6] Create Account types in `src/tools/account/types.ts`
- [x] T127 [P] [US6] Create Billing module stub with `registerBillingTools(server)` in `src/tools/billing/index.ts`
- [x] T128 [P] [US6] Create Billing types in `src/tools/billing/types.ts`
- [x] T129 [P] [US6] Create Marketplace module stub with `registerMarketplaceTools(server)` in `src/tools/marketplace/index.ts`
- [x] T130 [P] [US6] Create Marketplace types in `src/tools/marketplace/types.ts`
- [x] T131 [US6] Register Account & Billing modules in `src/tools/index.ts` barrel (account, billing, marketplace)
- [x] T132 [P] [US6] Write unit tests for Account module registration in `tests/unit/tools/account.test.ts`
- [x] T133 [P] [US6] Write unit tests for Billing module registration in `tests/unit/tools/billing.test.ts`
- [x] T134 [P] [US6] Write unit tests for Marketplace module registration in `tests/unit/tools/marketplace.test.ts`

**Checkpoint**: Account & Billing product stubs registered and tested. All 36 product modules now registered.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: SDD template, parity matrix validation, full-server integration test, quickstart validation

- [x] T135 [P] Create SDD template for product specs at `specs/001-scaleway-api-specs/sdd-template.md` (used by specs 002-037)
- [x] T136 [P] Write integration test verifying all 36 modules register on a single MCP server in `tests/unit/tools/all-modules.test.ts`
- [x] T137 [P] Add `start` script to `package.json` that runs `src/server.ts` via Bun
- [x] T138 [P] Add `lint`, `lint:fix`, `test`, `test:watch`, `test:parity` scripts to `package.json`
- [x] T139 Verify 100% line and branch coverage by running `bun run test -- --coverage.enabled`
- [x] T140 Run quickstart.md validation — follow the quickstart guide to add a test product module end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **User Stories (Phases 3–8)**: All depend on Phase 2 completion
  - US1 (P1) and US2 (P1) can proceed in parallel
  - US3 (P2) and US4 (P2) can proceed in parallel
  - US5 (P3) and US6 (P3) can proceed in parallel
  - All user stories are independent — no cross-story dependencies
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (Compute, P1)**: After Phase 2 — no dependency on other stories
- **US2 (Storage/Data, P1)**: After Phase 2 — no dependency on other stories
- **US3 (Networking/Security, P2)**: After Phase 2 — no dependency on other stories
- **US4 (Serverless/Containers, P2)**: After Phase 2 — no dependency on other stories
- **US5 (AI/Managed Services, P3)**: After Phase 2 — no dependency on other stories
- **US6 (Account/Billing, P3)**: After Phase 2 — no dependency on other stories

### Within Each User Story

1. Product module stubs (index.ts + types.ts) — all [P] within a story
2. Barrel registration (updates `src/tools/index.ts`) — after stubs complete
3. Unit tests — [P] after stubs complete

### Parallel Opportunities

- All Setup tasks T003-T004 can run in parallel
- All Foundational infrastructure tasks T007-T010, T014 can run in parallel
- All Foundational test tasks T015-T020 can run in parallel
- Within each user story: ALL stub tasks are [P] (different files)
- Within each user story: ALL test tasks are [P] (different files)
- User stories at the same priority can run in parallel (US1‖US2, US3‖US4, US5‖US6)

---

## Parallel Example: User Story 1

```bash
# Launch all Compute stubs together:
Task: "Create Instances module stub in src/tools/instances/index.ts"
Task: "Create Instances types in src/tools/instances/types.ts"
Task: "Create Elastic Metal module stub in src/tools/elastic-metal/index.ts"
Task: "Create Elastic Metal types in src/tools/elastic-metal/types.ts"
Task: "Create Apple Silicon module stub in src/tools/apple-silicon/index.ts"
Task: "Create Apple Silicon types in src/tools/apple-silicon/types.ts"

# Then register all in barrel:
Task: "Register Compute modules in src/tools/index.ts barrel"

# Then launch all tests together:
Task: "Write unit tests for Instances module registration in tests/unit/tools/instances.test.ts"
Task: "Write unit tests for Elastic Metal module registration in tests/unit/tools/elastic-metal.test.ts"
Task: "Write unit tests for Apple Silicon module registration in tests/unit/tools/apple-silicon.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T005)
2. Complete Phase 2: Foundational (T006–T020)
3. Complete Phase 3: User Story 1 — Compute stubs (T021–T030)
4. **STOP and VALIDATE**: Server starts, compute modules register, tests pass
5. Continue with remaining stories

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Compute) + US2 (Storage/Data) → P1 complete, test independently
3. Add US3 (Networking/Security) + US4 (Serverless/Containers) → P2 complete
4. Add US5 (AI/Managed) + US6 (Account/Billing) → P3 complete
5. Polish → Full coverage verified, SDD template ready for specs 002-037

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: US1 (Compute) + US2 (Storage/Data)
   - Developer B: US3 (Networking/Security) + US4 (Serverless/Containers)
   - Developer C: US5 (AI/Managed) + US6 (Account/Billing)
3. All stories integrate independently via barrel imports

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Product module stubs export a `registerXxxTools(server)` function that is a no-op initially — actual tool implementations come in specs 002-037
- Commit after each phase or logical group
- Stop at any checkpoint to validate independently
