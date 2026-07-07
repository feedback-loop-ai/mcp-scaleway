# Tasks: 048-data-warehouse

All tasks complete (this vertical is implemented).

## Phase 1 — Research
- [X] T001 Discover product, API slug/version/scope from official docs + OpenAPI schema
- [X] T002 Enumerate every endpoint, request/response shape, enums, pagination, errors

## Phase 2 — SDD artifacts
- [X] T003 spec.md (user stories, acceptance scenarios, FRs, out-of-scope)
- [X] T004 research.md (decisions + rationale)
- [X] T005 plan.md, data-model.md, quickstart.md
- [X] T006 contracts/tool-contract.md
- [X] T007 checklists/requirements.md

## Phase 3 — API reference
- [X] T008 specs/scaleway-api/data-warehouse/api-reference.md

## Phase 4 — Implementation
- [X] T009 src/tools/data-warehouse/types.ts (enums, response objects, per-tool params)
- [X] T010 src/tools/data-warehouse/handlers.ts (19 handlers + helpers)
- [X] T011 src/tools/data-warehouse/index.ts (registerDataWarehouseTools, 19 tools)

## Phase 5 — Tests
- [X] T012 tests/unit/tools/data-warehouse.test.ts (100% line+branch coverage)
- [X] T013 tests/contract/data-warehouse/data-warehouse.contract.test.ts (every tool)

## Phase 6 — Verify
- [X] T014 vitest passing (77 tests), 100% coverage
- [X] T015 biome clean, tsc clean for area files
- [X] T016 parity fragment written to scratchpad

## Handoff (orchestrator-owned)
- [ ] H001 Wire registerDataWarehouseTools into src/tools/index.ts
- [ ] H002 Merge parity fragment into tests/parity-matrix.json
