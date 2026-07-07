# Tasks: Elastic Metal Private Networks

**Input**: spec.md, plan.md, research.md, data-model.md, contracts/private-networks.md
**Status**: All complete (extension implemented).

## Phase 1: Research & Design

- [X] T001 Research authoritative API surface (Scaleway Go SDK `PrivateNetworkAPI`) — research.md
- [X] T002 Write spec.md (user stories, FRs, out-of-scope)
- [X] T003 Write data-model.md (ServerPrivateNetwork + input schemas)
- [X] T004 Write plan.md + contracts/private-networks.md
- [X] T005 Append Private Networks section to specs/scaleway-api/elastic-metal/api-reference.md

## Phase 2: Implementation

- [X] T006 Add 4 input schemas to src/tools/elastic-metal/types.ts
- [X] T007 Add 4 handlers to src/tools/elastic-metal/handlers.ts
- [X] T008 Register 4 tools in registerElasticMetalTools (src/tools/elastic-metal/index.ts)

## Phase 3: Tests & Verification

- [X] T009 Extend unit tests (tests/unit/tools/elastic-metal/handlers.test.ts) — every handler:
      success, error, optional-param and pagination branches
- [X] T010 Extend contract tests (tests/contract/tools/elastic-metal/contract.test.ts) — schema
      contracts, registration count (18), zone-validation matrix entries
- [X] T011 Verify 100% line+branch coverage of elastic-metal src files
- [X] T012 Verify tsc clean + biome clean on touched files
- [X] T013 Write parity fragment (scratchpad/parity-fragments/elastic-metal-pn.json)

## Notes

- Existing 14 elastic-metal tools untouched; change is purely additive.
- IPAM options excluded (see spec.md Out of Scope); additive/non-breaking to add later.
