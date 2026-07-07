# Tasks: 055-dedibox

All tasks complete (this vertical is implemented).

## Phase 1: Research
- [X] T001 Confirm Dedibox has a Scaleway-hosted API with X-Auth-Token auth
  (docs + generated Go SDK). See research.md.
- [X] T002 Extract endpoints, request/response shapes, enums, pagination.

## Phase 2: SDD artifacts
- [X] T003 spec.md (user stories, FRs, out-of-scope).
- [X] T004 research.md (decisions + rationale).
- [X] T005 plan.md, data-model.md, quickstart.md.
- [X] T006 contracts/ tool contracts.
- [X] T007 checklists/requirements.md.
- [X] T008 specs/scaleway-api/dedibox/api-reference.md.

## Phase 3: Implementation
- [X] T009 src/tools/dedibox/types.ts — enums, response schemas, param schemas.
- [X] T010 src/tools/dedibox/handlers.ts — 17 handlers.
- [X] T011 src/tools/dedibox/index.ts — registerDediboxTools with 17 tools.

## Phase 4: Tests
- [X] T012 tests/unit/tools/dedibox.test.ts — every handler (success/error/branch),
  100% line+branch coverage.
- [X] T013 tests/contract/dedibox/dedibox.contract.test.ts — all 17 tools,
  request + response schema validation.

## Phase 5: Verify
- [X] T014 vitest green (61 tests), 100% coverage of src/tools/dedibox/**.
- [X] T015 biome clean, tsc clean for dedibox files.
- [X] T016 Emit parity fragment (scratchpad/parity-fragments/dedibox.json).

## Tools delivered

servers: list, get, update, reboot, start, stop, delete
install: install_server, get_server_install, cancel_server_install
offers: list_offers, get_offer
os: list_os, get_os
bmc: get_bmc_access, start_bmc_access, stop_bmc_access
