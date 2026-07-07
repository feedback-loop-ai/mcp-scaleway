# Tasks: Site-to-Site VPN MCP Tools

All tasks completed by the implementing agent.

## Phase 1: Research & Contracts
- [X] T001 Research API slug/version/scope from official docs + OpenAPI schema
- [X] T002 Cross-check list wrapper keys and action shapes against scaleway-sdk-go
- [X] T003 Write `specs/scaleway-api/vpn/api-reference.md`
- [X] T004 Write SDD artifacts: spec.md, plan.md, research.md, data-model.md, quickstart.md, contracts/tool-contract.md, checklists/requirements.md

## Phase 2: Types
- [X] T005 Define shared enums (order_by, statuses, ciphers, initiation policy) in `src/tools/vpn/types.ts`
- [X] T006 Define VpnGateway + gateway-type schemas and params
- [X] T007 Define CustomerGateway schemas and params
- [X] T008 Define Connection schemas, Cipher/BgpConfig, and action params
- [X] T009 Define RoutingPolicy schemas and params

## Phase 3: Handlers
- [X] T010 Implement VPN gateway handlers (list/get/create/update/delete + list types)
- [X] T011 Implement customer gateway handlers (list/get/create/update/delete)
- [X] T012 Implement connection CRUD handlers
- [X] T013 Implement connection action handlers (renew/change PSK, set/detach routing policy, enable/disable propagation)
- [X] T014 Implement routing policy handlers (list/get/create/update/delete)

## Phase 4: Registration
- [X] T015 Implement and export `registerVpnTools` in `src/tools/vpn/index.ts` (27 tools)

## Phase 5: Tests
- [X] T016 Unit tests for every handler (success, error, optional-param, pagination) — 100% coverage
- [X] T017 Contract tests for every tool referencing api-reference.md
- [X] T018 Verify 100% line + branch coverage on `src/tools/vpn/**`

## Phase 6: Verification
- [X] T019 `bun x biome check` clean on added files
- [X] T020 `bun x tsc --noEmit` clean for added files
- [X] T021 Write parity fragment to scratchpad
