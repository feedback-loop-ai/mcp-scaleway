# Tasks: Scaleway InterLink MCP Tools

**Input**: Design documents from `/specs/044-interlink/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Research & API reference

- [X] T001 Verify API slug/version/scoping against official docs + Go SDK (research.md)
- [X] T002 Document every endpoint in `specs/scaleway-api/interlink/api-reference.md`

## Phase 2: Setup (Schemas & Types)

- [X] T003 [US1] Define enums (LinkStatus, BgpStatus, LinkKind, DedicatedConnectionStatus, order-by) in `src/tools/interlink/types.ts`
- [X] T004 [US1] Define entity response schemas (Link, BgpConfig, PartnerHost, SelfHost) in `types.ts`
- [X] T005 [P] [US2] Define RoutingPolicy entity + params in `types.ts`
- [X] T006 [P] [US3] Define Partner, Pop, DedicatedConnection (+ Range) entities in `types.ts`
- [X] T007 [US1] Define link request `*Params` schemas (CRUD + attach/detach + propagation) in `types.ts`

## Phase 3: User Story 1 - Links (Priority: P1)

### Implementation
- [X] T008 [US1] Implement link CRUD handlers (list/get/create/update/delete) in `src/tools/interlink/handlers.ts`
- [X] T009 [US1] Implement VPC attach/detach handlers in `handlers.ts`
- [X] T010 [US1] Implement routing-policy attach/detach/set handlers in `handlers.ts`
- [X] T011 [US1] Implement enable/disable route-propagation handlers in `handlers.ts`
- [X] T012 [US1] Register all link tools in `src/tools/interlink/index.ts`

### Tests
- [X] T013 [US1] Unit tests for link handlers (success/error/filters) in `tests/unit/tools/interlink.test.ts`
- [X] T014 [US1] Contract tests for link tools in `tests/contract/interlink/interlink.contract.test.ts`

## Phase 4: User Story 2 - Routing policies (Priority: P2)

- [X] T015 [US2] Implement routing-policy CRUD handlers in `handlers.ts`
- [X] T016 [US2] Register routing-policy tools in `index.ts`
- [X] T017 [US2] Unit + contract tests for routing-policy tools

## Phase 5: User Story 3 - Partners, PoPs, dedicated connections (Priority: P3)

- [X] T018 [US3] Implement partner list/get handlers in `handlers.ts`
- [X] T019 [P] [US3] Implement PoP list/get handlers in `handlers.ts`
- [X] T020 [P] [US3] Implement dedicated-connection list/get handlers in `handlers.ts`
- [X] T021 [US3] Register partner/PoP/connection tools in `index.ts`
- [X] T022 [US3] Unit + contract tests for partner/PoP/connection tools

## Phase 6: Polish & Cross-Cutting

- [X] T023 Write parity fragment `<scratchpad>/parity-fragments/interlink.json`
- [X] T024 Verify 100% line+branch coverage of `src/tools/interlink/`
- [X] T025 Run `bun x tsc --noEmit` and `bun x biome check` — clean for interlink files
- [X] T026 SDD artifacts (spec, plan, research, data-model, quickstart, contracts, checklist)

## Dependencies & Execution Order

- Phase 1 → Phase 2 → Phases 3-5 (sequential P1→P2→P3) → Phase 6.
- `index.ts` wiring into `src/tools/index.ts` is owned by the orchestrator.
