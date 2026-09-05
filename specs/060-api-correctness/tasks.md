# Tasks: Scaleway API Correctness Repairs

**Input**: Design documents from `/specs/060-api-correctness/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: REQUIRED by Constitution VIII. Real-transport contract tests are the proof standard for this feature (Clarification Q3).

**Status**: Shipped in 0.4.0 (commit `ce01175`, PR #54; error-mapper fix in `4cf689c`). Completed tasks are checked with the file each landed in. Phase 8 lists open follow-ups.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1..US4 from spec.md

## Path Conventions

Single project: `src/`, `tests/`, `specs/` at repository root.

---

## Phase 1: Setup

- [x] T001 Establish the SDK transport contract empirically (URL join, response parsing, error shape, httpClient injection) and record it in specs/060-api-correctness/research.md
- [x] T002 Bump `@scaleway/sdk-client` to ^2.7 and Node engines to ≥ 20.20.2 in package.json; regenerate bun.lock and verify under CI-pinned Bun

---

## Phase 2: Foundational (blocking prerequisites)

**⚠️ CRITICAL**: All stories depend on error mapping and the shared transport behaving correctly

- [x] T003 Map both `.statusCode` and SDK `.status` to error types in src/shared/errors.ts
- [x] T004 [P] Unit-test SDK ScalewayError mapping, precedence and non-numeric statuses in tests/unit/shared/errors.test.ts
- [x] T005 Build the whole-catalog fake-network smoke harness that classifies every operation's outgoing request (recorded in specs/060-api-correctness/quickstart.md)

**Checkpoint**: Upstream 4xx statuses survive to the MCP error envelope; harness available to prove request construction.

---

## Phase 3: User Story 1 - Operations reach the right endpoint with the right credentials (Priority: P1) 🎯 MVP

**Goal**: Every shared-transport operation sends a documented, authenticated request and parses responses correctly.

**Independent Test**: Real-transport contract tests record host/path/method/auth/body for representative operations in every repaired area; whole-catalog harness reports 0 BAD_URL and 0 NO_AUTH.

### Tests for User Story 1

- [x] T006 [P] [US1] Real-SDK whole-catalog GET path, auth header and 4xx/5xx status regressions in tests/contract/transport/path-auth.contract.test.ts
- [x] T007 [P] [US1] Update unit assertions from unslashed to slashed paths for 14 areas in tests/unit/tools/{audit-trail,data-lab,data-warehouse,dedibox,file-storage,interlink,kafka,mailbox,nats,opensearch,rabbitmq,tem,vpn,product-catalog}.test.ts
- [x] T008 [P] [US1] Rewrite RDB unit tests to assert ScwRequest objects and SDK errors in tests/unit/tools/rdb.test.ts
- [x] T009 [P] [US1] Rewrite Elastic Metal unit/contract tests to assert ScwRequest objects in tests/unit/tools/elastic-metal/handlers.test.ts and tests/contract/tools/elastic-metal/contract.test.ts
- [x] T010 [P] [US1] Rewrite Containers tests to mock the shared client instead of global fetch in tests/unit/containers/handlers.test.ts and tests/contract/containers/containers.contract.test.ts
- [x] T011 [P] [US1] Assert parsed-result consumption and real 404 mapping for SQS in tests/unit/tools/sqs.test.ts
- [x] T012 [P] [US1] Assert camelCase pageSize reaches generated clients in tests/unit/tools/{key-manager,secret-manager,edge-services,sns}.test.ts and their contract tests
- [x] T013 [P] [US1] Add JSON content-type and InterLink 204 assertions in tests/unit/tools/{dns,functions,iam,instances,k8s,serverless-sqldb,tem,webhosting,interlink}.test.ts

### Implementation for User Story 1

- [x] T014 [P] [US1] Prefix API constants with `/` in src/tools/{audit-trail,data-lab,data-warehouse,dedibox,file-storage,interlink,kafka,mailbox,nats,opensearch,rabbitmq,tem,vpn,product-catalog}/handlers.ts
- [x] T015 [P] [US1] Rewrite apiRequest to ScwRequest with relative paths and urlParams in src/tools/rdb/handlers.ts
- [x] T016 [P] [US1] Rewrite apiRequest to ScwRequest in src/tools/elastic-metal/handlers.ts
- [x] T017 [P] [US1] Route requests through the authenticated shared client instead of global fetch in src/tools/containers/handlers.ts
- [x] T018 [P] [US1] Consume parsed results and move query strings to urlParams in src/tools/sqs/handlers.ts
- [x] T019 [P] [US1] Pass `pageSize` to generated clients in src/tools/{key-manager,secret-manager,edge-services,sns}/handlers.ts
- [x] T020 [P] [US1] Add JSON content type on body requests in src/tools/{dns,functions,iam,instances,k8s,serverless-sqldb,tem,webhosting}/handlers.ts
- [x] T021 [US1] Return a valid acknowledgement for the documented 204 in handleDeleteRoutingPolicy in src/tools/interlink/handlers.ts

**Checkpoint**: Harness reports 724 OK, 0 BAD_URL, 0 NO_AUTH; upstream statuses preserved.

---

## Phase 4: User Story 2 - Retired and dead upstream versions are replaced or removed (Priority: P2)

**Goal**: No registered operation targets a removed version; migrations preserve units and names where faithful.

**Independent Test**: Parity gate passes with real endpoints only; autoscaling/containers contract tests assert current paths and bodies; removed operations are absent and documented.

### Tests for User Story 2

- [x] T022 [P] [US2] Rewrite autoscaling contract and unit tests for v1alpha2 groups and instance v2alpha1 templates in tests/contract/autoscaling/autoscaling.contract.test.ts and tests/unit/tools/autoscaling.test.ts
- [x] T023 [P] [US2] Real-transport contracts for containers v1 (units, triggers, explicit unsupported combinations, 17-tool exactness) in tests/contract/containers/containers.contract.test.ts and tests/unit/containers/{handlers,index,types}.test.ts
- [x] T024 [P] [US2] Remove DHCP tests and assert absence in tests/unit/tools/public-gateway.test.ts and tests/contract/public-gateway.test.ts
- [x] T025 [P] [US2] Assert deprecation notices in cockpit descriptions in tests/unit/tools/cockpit.test.ts

### Implementation for User Story 2

- [x] T026 [US2] Document autoscaling v1alpha2 with a migration section in specs/scaleway-api/autoscaling/api-reference.md, then migrate src/tools/autoscaling/{types,handlers,index}.ts
- [x] T027 [US2] Document containers v1 with unit conversions and removed operations in specs/scaleway-api/containers/api-reference.md, then migrate src/tools/containers/{types,handlers,index}.ts
- [x] T028 [P] [US2] Remove DHCP operations and buildV1Url from src/tools/public-gateway/{types,handlers,index}.ts and note the removal in specs/scaleway-api/public-gateway/api-reference.md
- [x] T029 [P] [US2] Add "(deprecated upstream)" to six cockpit descriptions in src/tools/cockpit/index.ts and note in specs/scaleway-api/cockpit/api-reference.md
- [x] T030 [US2] Update autoscaling, containers, public-gateway and cockpit entries (removals, migrations, deprecated_upstream flags) in tests/parity-matrix.json
- [x] T031 [P] [US2] Remove DHCP and container legacy rows and update autoscaling rows in README.md; enumerate migrations in CHANGELOG.md

**Checkpoint**: 724 operations, all on live versions; parity gate green.

---

## Phase 5: User Story 3 - Flexible IP operations use their actual API (Priority: P3)

### Tests for User Story 3

- [x] T032 [P] [US3] Real-transport contract for list/create/delete flexible IPs (server_ids, flexible_ips, 204) in tests/contract/tools/elastic-metal/flexible-ip.transport.test.ts

### Implementation for User Story 3

- [x] T033 [US3] Document the flexible-ip v1alpha1 endpoints in specs/scaleway-api/elastic-metal/api-reference.md
- [x] T034 [US3] Retarget list/create/delete IP handlers to `/flexible-ip/v1alpha1/zones/{zone}/fips` in src/tools/elastic-metal/handlers.ts
- [x] T035 [US3] Point the three elastic-metal IP entries at the flexible-ip endpoints and the new contract test in tests/parity-matrix.json

**Checkpoint**: Three operations reach the flexible-IP API with unchanged names and inputs.

---

## Phase 6: User Story 4 - Discovery does not require cloud credentials (Priority: P4)

### Tests for User Story 4

- [x] T036 [P] [US4] Assert registration without credentials and package-version serverInfo over a real handshake in tests/unit/server.test.ts and tests/unit/tools/apple-silicon.test.ts
- [x] T037 [P] [US4] Remove the credential workaround from the parity gate in tests/unit/parity.test.ts

### Implementation for User Story 4

- [x] T038 [US4] Load credentials lazily at execution time in src/tools/apple-silicon/index.ts
- [x] T039 [US4] Report the package.json version in src/server.ts

**Checkpoint**: Server lists its catalog with zero credentials; version matches the package.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [x] T040 Reconcile operation counts (733 → 724) in README.md and CLAUDE.md
- [x] T041 [P] Fix stale "36 total" count in specs/scaleway-api/README.md
- [x] T042 [P] Correct autoscaling availability hints in src/tools/autoscaling/types.ts and specs/scaleway-api/autoscaling/api-reference.md
- [x] T043 Independent verification: correctness-only tree passes lint, types, 129 files / 5,830 tests, 100% coverage, build (recorded in PR #54)
- [x] T044 Open PR #54 with migration notes; CI green; merged to main

---

## Phase 8: Retrofit and open follow-ups

- [x] T045 Retrofit spec.md with stories, requirements, success criteria and clarifications in specs/060-api-correctness/spec.md
- [x] T046 Retrofit plan.md with Technical Context, honest Constitution Check and Complexity Tracking in specs/060-api-correctness/plan.md
- [x] T047 [P] Write research.md, data-model.md and quickstart.md in specs/060-api-correctness/
- [x] T048 Write the spec quality checklist in specs/060-api-correctness/checklists/requirements.md
- [ ] T049 Run `/speckit.analyze` across spec, plan and tasks and resolve every finding to zero constitutional drift
- [ ] T050 Follow-up: adopt official `@scaleway/sdk-<product>` packages for hand-rolled areas, starting with rdb and instances in src/tools/{rdb,instances}/handlers.ts
- [ ] T051 Follow-up (Principle VII, repo-wide): runtime-validate upstream response shapes in src/tools/*/handlers.ts
- [ ] T052 Follow-up: manual live smoke against a sandbox project, documented in specs/060-api-correctness/quickstart.md, run outside CI

---

## Dependencies & Execution Order

- Setup → Foundational → US1 (MVP) → US2, US3, US4 (independent of each other; all depend on Foundational) → Polish → Retrofit.
- US2's containers migration depends on US1's transport rewrite of the same handler file (T017 before T027).
- Parallel: within US1, T014–T020 touch disjoint files and ran concurrently in the original delivery; within US2, T028/T029/T031 are independent.

### Implementation Strategy

- **MVP**: Phases 1–3 restore live correctness for ~290 operations; ship-blocking on its own.
- US2 and US3 remove dead endpoints and must accompany US1 in the same breaking release.
- US4 is a small enabler consumed by feature 059.
