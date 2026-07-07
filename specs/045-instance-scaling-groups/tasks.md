# Tasks: Instance Scaling Groups (Autoscaling) MCP Tools

**Input**: Design documents from `/specs/045-instance-scaling-groups/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

All tasks are complete ([X]) — this vertical was implemented end-to-end.

## Phase 1: Research & API reference
- [X] T001 Verify API slug, version (`v1alpha1`), zoned scoping, resources, endpoints, enums
- [X] T002 Write `specs/scaleway-api/autoscaling/api-reference.md`

## Phase 2: Schemas & Types
- [X] T003 Define enums (statuses, actions, types, metric enums, order_by, event source/level)
- [X] T004 Define value objects (Capacity, Loadbalancer, VolumeInstanceTemplate, Metric)
- [X] T005 Define entities (InstanceGroup, InstanceTemplate, InstancePolicy, InstanceGroupEvent)
- [X] T006 Define per-tool param schemas + list response envelopes in `src/tools/autoscaling/types.ts`

## Phase 3: Handlers
- [X] T007 Implement `getClient`/`jsonResponse` helpers in `src/tools/autoscaling/handlers.ts`
- [X] T008 Instance group handlers (list/get/create/update/delete + events)
- [X] T009 Instance template handlers (list/get/create/update/delete)
- [X] T010 Instance policy handlers (list/get/create/update/delete)

## Phase 4: Registration
- [X] T011 Implement `registerAutoscalingTools(server)` in `src/tools/autoscaling/index.ts` (16 tools)

## Phase 5: Tests
- [X] T012 Unit tests `tests/unit/tools/autoscaling.test.ts` (registration + every handler)
- [X] T013 Contract tests `tests/contract/autoscaling/autoscaling.contract.test.ts` (every tool)
- [X] T014 Verify 100% line+branch coverage for `src/tools/autoscaling`

## Phase 6: Parity & verification
- [X] T015 Write parity fragment `<scratchpad>/parity-fragments/autoscaling.json`
- [X] T016 Biome + tsc clean for all new files; all tests green
