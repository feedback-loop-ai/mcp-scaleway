# Tasks: Compact Operation Discovery

**Input**: Design documents from `/specs/059-discovery-token-reduction/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/gateway-tools.md, quickstart.md

**Tests**: REQUIRED by Constitution VIII (100% line/branch coverage, contract traceability, parity gates). Test tasks are listed before the implementation they cover within each story.

**Status**: Implementation shipped in 0.4.0 (commits `f46a252`, `a6ca23b`, `36dcb5e` on main). Checked items denote implemented artifacts, not proof that tests/contracts preceded code. Phase 8 lists work that remains open.

**Organization**: Tasks are grouped by user story so each story is an independently testable increment.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1..US4 from spec.md)

## Path Conventions

Single project: `src/`, `tests/`, `scripts/`, `specs/` at repository root.

---

## Phase 1: Setup

**Purpose**: Contracts and dependencies the whole feature relies on

- [x] T001 Maintain the normative gateway contract; historical pre-code ordering is not certified. Contract: in specs/059-discovery-token-reduction/contracts/gateway-tools.md
- [x] T002 Promote `zod-to-json-schema` to a direct pinned dependency in package.json and regenerate bun.lock
- [x] T003 [P] Amend the constitution to v1.2.0 (Principles III and VIII gateway clauses) in .specify/memory/constitution.md

---

## Phase 2: Foundational (blocking prerequisites)

**Purpose**: Runtime metadata and the registry every surface depends on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Implement pure metadata derivation with read-only classification and deny list in src/gateway/metadata.ts
- [x] T005 Add the generator script that writes committed runtime metadata in scripts/gen-operations.ts and commit src/gateway/operations.json
- [x] T006 [P] Unit-test derivation, duplicates, deny list and generated-equals-fresh in tests/unit/gateway/metadata.test.ts
- [x] T007 Implement the recorder-based immutable filtered registry in src/gateway/registry.ts
- [x] T008 [P] Unit-test recorder failure paths, filtering, prefix-tolerant lookup and immutability in tests/unit/gateway/registry.test.ts
- [x] T009 Implement schema projection (schema-position walk, boilerplate removal only) and public listing override in src/shared/catalog.ts
- [x] T010 [P] Unit-test projection fidelity for refs, records, unions, defaults and user fields named like keywords in tests/unit/shared/catalog.test.ts
- [x] T011 Create shared protocol fixtures (in-memory client, synthetic registrars) in tests/unit/gateway/fixtures.ts

**Checkpoint**: Registry builds for all 724 operations with zero metadata drift; projection preserves validation semantics.

---

## Phase 3: User Story 1 - Cheap discovery of a large operation catalog (Priority: P1) 🎯 MVP

**Goal**: Four fixed tools replace the eager catalog; every operation remains findable and executable.

**Independent Test**: Connect a client with defaults; listing shows exactly four tools; paginated search reaches all 724 operations; describe returns faithful contracts; execute matches legacy results.

### Tests for User Story 1

- [x] T012 [P] [US1] Protocol contract for search reachability, describe fidelity, read/call parity, error shapes and zero-network discovery (FR-027/SC-009) in tests/contract/gateway.test.ts
- [x] T013 [P] [US1] Unit-test ranking, pagination, area listing, bounds and lookup suggestions in tests/unit/gateway/discovery.test.ts
- [x] T014 [P] [US1] Unit-test execution: defaults, async refinements, record values, isError preservation, sanitized errors in tests/unit/gateway/execution.test.ts
- [x] T015 [P] [US1] Retrieval smoke test over 20 real keyword queries in tests/unit/gateway/search-quality.test.ts

### Implementation for User Story 1

- [x] T016 [US1] Implement search/describe inputs, deterministic ranking, pagination and lookup errors in src/gateway/discovery.ts
- [x] T017 [US1] Implement the four tool registrations, validation-error shaping and bounded schema echo in src/gateway/index.ts
- [x] T018 [US1] Wire default gateway mode, connection instructions and projected listing in src/server.ts
- [x] T019 [US1] Add reproducible listing-size measurement for all modes in scripts/measure-discovery.ts and record results in specs/059-discovery-token-reduction/validation.md

**Checkpoint**: Gateway listing is 2,162 bytes. Flat listing was 554,857 bytes at 0.4.0 and is 557,833 after retrofit examples. All 724 operations are reachable via paging.

---

## Phase 4: User Story 2 - Operators bound what an assistant may touch (Priority: P2)

**Goal**: Area, preset, explicit, exclusion and read-only filters hold on every surface, and identifiers cannot redirect requests.

**Independent Test**: Start with an area restriction and read-only mode; mutations and excluded operations are refused by legacy name and via call/read with zero upstream requests; traversal payloads are blocked.

### Tests for User Story 2

- [x] T020 [P] [US2] Unit-test presets, additive names, globs, read-only precedence and fail-closed errors in tests/unit/shared/toolsets.test.ts
- [x] T021 [P] [US2] Unit-test matcher compilation, raw-path traversal rejection, query confinement and S3 subresources in tests/unit/shared/route-guard.test.ts
- [x] T022 [P] [US2] Protocol contract replaying every reviewer traversal payload across 11 areas in gateway, flat and both modes in tests/contract/route-confinement.test.ts
- [x] T023 [P] [US2] Protocol contract for IAM identifier confinement with fail-closed transport in tests/contract/iam-path-confinement.test.ts
- [x] T024 [P] [US2] Protocol test that filters cannot be bypassed through call/read or legacy names in tests/contract/gateway.test.ts (both-mode listing check also in tests/unit/server.test.ts)

### Implementation for User Story 2

- [x] T025 [US2] Implement presets, ToolsetConfig, env resolution and the single allowed-set predicate in src/shared/toolsets.ts
- [x] T026 [US2] Implement read-only refusal before validation in executeOperation in src/gateway/index.ts
- [x] T027 [US2] Implement endpoint confinement on raw paths with async-local route context in src/shared/route-guard.ts
- [x] T028 [US2] Wrap the SDK client fetch with the confinement check in src/shared/client.ts
- [x] T029 [P] [US2] Route the three raw-fetch areas through the guarded fetch in src/tools/object-storage/handlers.ts, src/tools/generative-apis/handlers.ts, src/tools/iot/handlers.ts
- [x] T030 [P] [US2] Constrain IAM path identifiers at the schema level in src/tools/iam/types.ts and document in specs/scaleway-api/iam/api-reference.md
- [x] T031 [P] [US2] Constrain secret revision inputs at the schema level in src/tools/secret-manager/types.ts and document in specs/scaleway-api/secret-manager/api-reference.md
- [x] T032 [US2] Run every gateway and flat callback inside its route context in src/gateway/index.ts and src/gateway/registry.ts

**Checkpoint**: Every reviewer-reproduced bypass returns an error with zero HTTP calls; honest identifiers reach exactly their declared endpoints.

---

## Phase 5: User Story 3 - Existing integrations keep working during migration (Priority: P3)

**Goal**: Flat and combined modes preserve legacy names; upgrade notes map names to identifiers.

**Independent Test**: Start in flat mode; supported legacy names remain, with documented migration and security constraints; both mode shows gateway plus filtered legacy tools.

### Tests for User Story 3

- [x] T033 [P] [US3] Unit-test mode parsing, invalid values and env independence in tests/unit/shared/mode.test.ts
- [x] T034 [P] [US3] Protocol tests for flat and both listings, instructions text and SDK validation retention in tests/unit/server.test.ts

### Implementation for User Story 3

- [x] T035 [US3] Implement ModeSchema and the startup-only env boundary in src/shared/mode.ts
- [x] T036 [US3] Implement flat registration with conservative annotations and shared route context in src/gateway/registry.ts
- [x] T037 [US3] Bundle a library entry so package imports do not start stdio in bun.build.ts and set main to ./dist/server.js in package.json
- [x] T038 [P] [US3] Write migration notes, mode/filter documentation and the legacy-name mapping rule in README.md and CHANGELOG.md
- [x] T039 [P] [US3] Update architecture and command guidance in CLAUDE.md

**Checkpoint**: Flat mode retains supported legacy names and original callbacks, with documented API migrations and security-tightened identifier contracts. It is not byte-identical to 0.3.x.

---

## Phase 6: User Story 4 - Assistants recover from mistakes without help (Priority: P4)

**Goal**: Structured, non-leaking errors that enable a one-retry fix.

**Independent Test**: Call with a missing required field and with an unknown identifier; responses name fields/codes and suggest identifiers; no submitted values appear.

### Tests for User Story 4

- [x] T040 [P] [US4] Assert issue codes, field names, secret non-echo and schema size bound in tests/unit/gateway/execution.test.ts
- [x] T041 [P] [US4] Assert unknown-operation suggestions and describe batch limits in tests/contract/gateway.test.ts

### Implementation for User Story 4

- [x] T042 [US4] Implement validationError shaping with MAX_ERROR_SCHEMA_BYTES and sanitized thrown-error results in src/gateway/index.ts
- [x] T043 [US4] Implement lookupError with up to five ranked suggestions in src/gateway/discovery.ts

**Checkpoint**: Error responses are actionable and contain no submitted values or stack traces.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [x] T044 Add gateway `meta` entries with contract_test to tests/parity-matrix.json and the traceability gates in tests/unit/parity.test.ts
- [x] T045 [P] Enable CI on slash-named branches and stacked pull requests in .github/workflows/ci.yml
- [x] T046 [P] Attach CHANGELOG notes to releases in .github/workflows/release.yml
- [x] T047 Verify packed npm install over real stdio in all modes without credentials (recorded in specs/059-discovery-token-reduction/validation.md)
- [x] T048 Release 0.4.0: version bump, signed commits and tag, npm publish, GitHub release

---

## Phase 8: Retrofit and open follow-ups

- [x] T049 Retrofit spec.md to full template form with prioritized stories, requirements and success criteria in specs/059-discovery-token-reduction/spec.md
- [x] T050 Resolve all clarifications and record them in specs/059-discovery-token-reduction/spec.md (Clarifications, Session 2026-09-06)
- [x] T051 Retrofit plan.md with Technical Context, honest Constitution Check and Complexity Tracking in specs/059-discovery-token-reduction/plan.md
- [x] T052 [P] Write research.md, data-model.md and quickstart.md in specs/059-discovery-token-reduction/
- [x] T053 Write the spec quality checklist in specs/059-discovery-token-reduction/checklists/requirements.md
- [ ] T054 Close implementation gaps R-I, R-IV, R-VI, R-VII and R-VIII in ../retrofit-compliance.md. Analysis ran; R-II/R-III remain permanent historical findings, not tasks that a later document can close.
- [ ] T055 Measure post-change token counts on an Anthropic-served route and append to specs/059-discovery-token-reduction/validation.md (blocked: provider pool returned 503)
- [ ] T056 Follow-up (Principle IV, repo-wide): add structured logging and a stdio-appropriate health self-check in src/main.ts Tracked as #60.
- [ ] T057 Follow-up (Principle VII, repo-wide): runtime-validate upstream response shapes in src/tools/*/handlers.ts, starting with the most-used reads Tracked as #62.
- [ ] T058 Follow-up (Principle I, repo-wide): surface usage examples for legacy operations through describe or descriptions in src/gateway/discovery.ts Tracked as #59.
- [x] T059 [P] [US3] Document the FR-026 support window (flat mode for the whole 0.x series; removal needs a major bump preceded by a deprecation minor) in README.md and the next CHANGELOG entry
- [x] T060 [P] [US3] Enumerate family-preset memberships in README.md (FR-015/US3 "without consulting source") instead of pointing at src/shared/toolsets.ts
- [x] T061 [P] [US1] Add a test asserting gateway listing bytes are identical for the small fixture registry and the full catalog (SC-002) in tests/unit/gateway/
- [x] T062 [P] [US1] Extend scripts/measure-discovery.ts to emit the SC-005 offline discovery-sequence byte budget and assert it in a test
- [x] T063 [P] [US2] Express the IAM create/update/delete_rule composite as `GET ... + PUT ...` in tests/parity-matrix.json, regenerate operations.json, and delete the label-specific override in src/shared/route-guard.ts (I4: one source of truth for endpoint legs)
- [x] T064 [P] [US4] Specify partial-token-overlap fallback for lookup suggestions so typos yield candidates (FR-018/U1) in src/gateway/discovery.ts and tests/unit/gateway/discovery.test.ts
- [x] T065 [P] [US4] Define the single gateway error envelope (ApiError type + op/issues/suggestions) in contracts/gateway-tools.md and src/gateway/index.ts, with a contract assertion (I3)
- [x] T066 Add a unit test asserting flat mode remains supported while the package major version is 0 (FR-026 guard) in tests/unit/shared/mode.test.ts
- [x] T067 Release-quality SC-010 test: package importable without starting stdio; packed install passes a stdio handshake in all three modes (tests/ or release check)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies
- **Foundational (Phase 2)**: depends on Setup; blocks all stories
- **US1 (Phase 3)**: depends on Foundational; delivers the MVP
- **US2 (Phase 4)**: depends on Foundational; independent of US1 except that route context wraps US1's execute path
- **US3 (Phase 5)**: depends on Foundational and on US2's filters for combined mode
- **US4 (Phase 6)**: depends on US1's execute path
- **Polish (Phase 7)**: depends on all stories
- **Retrofit (Phase 8)**: documentation and follow-ups; no code dependency

### Parallel Opportunities

- Phase 2: T006, T008, T010 run in parallel once their implementation files exist.
- Phase 3: T012–T015 in parallel; T016 and T017 in sequence, then T018.
- Phase 4: T020–T024 in parallel; T029–T031 in parallel after T027.
- Phase 5: T038 and T039 in parallel with T035–T037.

### Implementation Strategy

- **MVP**: Phases 1–3 (US1) already deliver the token reduction on the default surface.
- US2 is the security boundary and must ship with US1 in any release that changes the default.
- US3 is the migration path and must ship in the same breaking release.
- US4 reduces round-trip waste; low risk, high leverage.
