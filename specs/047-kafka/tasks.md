# Tasks: Clusters for Apache Kafka® MCP Tools

**Feature**: 047-kafka | **Status**: Implemented

## Phase 1: Research & Design

- [X] T001 Discover API slug, version, and scope from the official reference and Go SDK
- [X] T002 Document all endpoints in specs/scaleway-api/kafka/api-reference.md
- [X] T003 Write spec.md (user stories, FRs, out-of-scope)
- [X] T004 Write research.md (decisions + rationale)
- [X] T005 Write plan.md, data-model.md, contracts/tool-contract.md, quickstart.md, checklists/requirements.md

## Phase 2: Types (src/tools/kafka/types.ts)

- [X] T006 Define enums: ClusterStatus, VolumeType, NodeTypeStock, order-by enums
- [X] T007 Define entity schemas: Cluster, Volume, ClusterSetting, Endpoint, User, NodeType, Version
- [X] T008 Define tool param schemas + list response schemas for all 13 tools

## Phase 3: Handlers (src/tools/kafka/handlers.ts)

- [X] T009 Cluster handlers: list, get, create, update, delete
- [X] T010 Certificate authority handlers: get, renew
- [X] T011 Endpoint handlers: create, delete (+ buildEndpointSpec helper)
- [X] T012 User handlers: list, update
- [X] T013 Catalog handlers: list node types, list versions

## Phase 4: Registration (src/tools/kafka/index.ts)

- [X] T014 registerKafkaTools registering all 13 tools with descriptions and zod shapes

## Phase 5: Tests

- [X] T015 Unit tests: every handler — success, error, optional-param, pagination branches (100% coverage)
- [X] T016 Unit test: registered callbacks wired to handlers
- [X] T017 Contract tests: request + response shapes for every tool, referencing api-reference.md

## Phase 6: Verification

- [X] T018 `bun x vitest run` for feature tests — all pass, 100% line + branch coverage
- [X] T019 `bun x biome check` clean on feature files
- [X] T020 `bun x tsc --noEmit` clean for feature files
- [X] T021 Parity fragment written for all 13 tools

## Note

The orchestrator wires `registerKafkaTools` into `src/tools/index.ts` and merges the parity fragment into
`tests/parity-matrix.json` (both files are out of scope for this feature branch).
