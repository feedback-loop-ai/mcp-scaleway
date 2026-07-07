# Tasks: Apple silicon Private Networks

All tasks complete (this feature is implemented).

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Research & Contracts
- [X] T001 Research API from `@scaleway/sdk-applesilicon@2.4.1` PrivateNetworkAPI (research.md)
- [X] T002 Extend `specs/scaleway-api/apple-silicon/api-reference.md` with Private Networks section
- [X] T003 Author SDD artifacts (spec, plan, data-model, quickstart, contracts, checklist)

## Phase 2: Schemas & Types
- [X] T004 [P1] Add `ListServerPrivateNetworksOrderBy` enum + 5 param schemas to `types.ts`

## Phase 3: Handlers (extend existing factory)
- [X] T005 [P1] `listServerPrivateNetworks` — GET `/server-private-networks` with filters + repeated `ipam_ip_ids`
- [X] T006 [P1] `getServerPrivateNetwork` — GET nested path
- [X] T007 [P1] `addServerPrivateNetwork` — POST with `{ private_network_id, ipam_ip_ids? }`
- [X] T008 [P2] `setServerPrivateNetworks` — PUT with `{ per_private_network_ipam_ip_ids }`
- [X] T009 [P1] `deleteServerPrivateNetwork` — DELETE nested path

## Phase 4: Registration
- [X] T010 Register the 5 tools in `registerAppleSiliconTools` (index.ts)

## Phase 5: Tests
- [X] T011 Unit tests for all 5 handlers (success, error, optional-param & pagination branches)
- [X] T012 Registration + tool-callback coverage tests (13 tools total)
- [X] T013 Contract tests: schema validation, request shapes, response shapes for all 5 tools
- [X] T014 Parity fragment `parity-fragments/apple-silicon-pn.json`

## Phase 6: Verify
- [X] T015 `bun x vitest run` for the 3 test files — 115 tests pass
- [X] T016 100% line+branch coverage of `src/tools/apple-silicon/**`
- [X] T017 `biome check` clean; `tsc --noEmit` clean for touched files
