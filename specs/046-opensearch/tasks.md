# Tasks: 046-opensearch

All tasks completed by the implementing agent.

## Phase 1: Research
- [X] T001 Locate "Cloud Essentials for OpenSearch" in the Scaleway developer API index
- [X] T002 Discover real slug/version (`searchdb/v1alpha1`) and scope (region, fr-par)
- [X] T003 Pin entity/enum/request shapes from the Scaleway Go SDK
- [X] T004 Confirm absence of snapshot/ACL endpoints; record as out of scope

## Phase 2: SDD artifacts
- [X] T005 spec.md (user stories, entities, tool table, out of scope, acceptance)
- [X] T006 research.md (decisions, sources, ambiguities)
- [X] T007 plan.md (technical context, structure, constitution check)
- [X] T008 data-model.md (entities, enums, input→wire mappings)
- [X] T009 contracts/tool-contract.md (per-tool I/O)
- [X] T010 quickstart.md
- [X] T011 checklists/requirements.md

## Phase 3: API spec doc
- [X] T012 specs/scaleway-api/opensearch/api-reference.md (all endpoints, shapes, errors)

## Phase 4: Implementation
- [X] T013 types.ts — enums, entities, list-response wrappers
- [X] T014 types.ts — per-tool `*Params` zod schemas
- [X] T015 handlers.ts — deployment handlers (list/get/create/update/upgrade/delete/CA)
- [X] T016 handlers.ts — node-type & version list handlers
- [X] T017 handlers.ts — user handlers (list/create/update/delete)
- [X] T018 handlers.ts — endpoint handlers (create/delete)
- [X] T019 index.ts — `registerOpensearchTools` registering all 15 tools

## Phase 5: Tests
- [X] T020 Unit tests for every handler (success/error/optional/pagination branches)
- [X] T021 Contract tests for every tool referencing api-reference.md
- [X] T022 Achieve 100% line + branch coverage of src files
- [X] T023 tsc + biome clean for owned files

## Phase 6: Parity
- [X] T024 Parity fragment `<scratchpad>/parity-fragments/opensearch.json` (15 entries)
