# Tasks: Data Lab for Apache Spark

All tasks implemented by this agent. `[X]` = complete.

## Phase 0 — Research
- [X] T001 Verify API slug, version, scoping via official docs + Go SDK → `research.md`.
- [X] T002 Document every endpoint in `specs/scaleway-api/data-lab/api-reference.md`.

## Phase 1 — Design
- [X] T003 Write `spec.md` (user stories, FRs, out-of-scope).
- [X] T004 Write `data-model.md` (entities, enums, request params).
- [X] T005 Write tool contracts (`contracts/clusters.md`, `contracts/catalog.md`).
- [X] T006 Write `plan.md`, `quickstart.md`, `checklists/requirements.md`.

## Phase 2 — Implementation
- [X] T007 `src/tools/data-lab/types.ts` — zod schemas for entities, enums, and request params.
- [X] T008 `src/tools/data-lab/handlers.ts` — 8 handlers (list/get/create/update/delete clusters; list node-types/cluster-versions/notebook-versions).
- [X] T009 `src/tools/data-lab/index.ts` — `registerDataLabTools(server)` registering all 8 tools.

## Phase 3 — Tests
- [X] T010 `tests/unit/tools/data-lab.test.ts` — every handler: success, error, optional-param, empty-list branches (100% coverage).
- [X] T011 `tests/contract/data-lab/data-lab.contract.test.ts` — every tool: request/response shapes, enums, pagination, auth.

## Phase 4 — Verification
- [X] T012 Vitest green (58 tests); 100% line + branch coverage of `src/tools/data-lab/`.
- [X] T013 `biome check` clean; `tsc --noEmit` clean for feature files.
- [X] T014 Parity fragment `parity-fragments/data-lab.json` for all 8 tools.

## Handoff
- [ ] T015 (orchestrator) Wire `registerDataLabTools` into `src/tools/index.ts` and merge `data-lab.json` into `tests/parity-matrix.json`.
