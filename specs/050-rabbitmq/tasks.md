# Tasks: Scaleway RabbitMQ (MessageQ) MCP Tools

**Input**: Design documents from `/specs/050-rabbitmq/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Research & Spec

- [x] T001 Identify product API (RabbitMQ → MessageQ, slug `messageq`, v1alpha1, region-scoped fr-par); verify against Go SDK and developers API
- [x] T002 Author `specs/scaleway-api/rabbitmq/api-reference.md` documenting every endpoint, request/response shape, pagination, auth, errors
- [x] T003 Author SDD artifacts (spec.md, research.md, plan.md, data-model.md, quickstart.md, contracts/tool-contract.md, checklists/requirements.md)

## Phase 2: Schemas & Types

- [x] T004 [US1] Define Zod enums (DeploymentStatus, VolumeType, NodeTypeStockStatus, order-by enums) in `src/tools/rabbitmq/types.ts`
- [x] T005 [US1] Define entity schemas (Deployment, Volume, Endpoint, EndpointService, NodeType, NodeTypeVolumeType, User, Version) in `types.ts`
- [x] T006 [US1] Define deployment tool input schemas (list/get/create/update/upgrade/delete/certificate) in `types.ts`
- [x] T007 [US1] Define user tool input schemas (list/create/update/delete) in `types.ts`
- [x] T008 [P] [US2] Define endpoint tool input schemas (create/delete) in `types.ts`
- [x] T009 [P] [US2] Define catalog tool input schemas (node types, versions) and list response wrappers in `types.ts`

## Phase 3: Handlers

- [x] T010 [US1] Implement `getClient`, `jsonResponse`, `toEndpointSpec` helpers in `src/tools/rabbitmq/handlers.ts`
- [x] T011 [US1] Implement deployment handlers (list/get/create/update/upgrade/delete/certificate) in `handlers.ts`
- [x] T012 [US1] Implement user handlers (list/create/update/delete) in `handlers.ts`
- [x] T013 [P] [US2] Implement endpoint handlers (create/delete) in `handlers.ts`
- [x] T014 [P] [US2] Implement catalog handlers (node types, versions) in `handlers.ts`

## Phase 4: Registration

- [x] T015 Register all 15 tools in `src/tools/rabbitmq/index.ts` via `registerRabbitmqTools`

## Phase 5: Tests

- [x] T016 [US1] Unit tests for all handlers (success, error, optional-param and pagination branches) in `tests/unit/tools/rabbitmq.test.ts`
- [x] T017 Contract tests for every tool in `tests/contract/rabbitmq/rabbitmq.contract.test.ts`, referencing api-reference.md

## Phase 6: Polish & Cross-Cutting

- [x] T018 Write parity fragment `<scratchpad>/parity-fragments/rabbitmq.json` (one entry per tool)
- [x] T019 Verify 100% line+branch coverage of `src/tools/rabbitmq/**`
- [x] T020 Run biome + tsc clean for the new files

## Dependencies & Execution Order

- **Phase 1** first (research drives everything).
- **Phase 2** before Phase 3 (schemas needed by handlers).
- **Phase 3** before Phase 4 (handlers needed by registration).
- **Phase 5** after Phases 2-4.
- **Phase 6** last.

## Notes

- The orchestrator wires `registerRabbitmqTools` into `src/tools/index.ts` and merges the
  parity fragment into `tests/parity-matrix.json` (both owned outside this task).
- Vhost/queue/exchange/permission management is out of scope — not exposed by the messageq API.
