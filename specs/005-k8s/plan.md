# Implementation Plan: Scaleway Kubernetes (Kapsule & Kosmos) MCP Tools

**Branch**: `005-k8s` | **Date**: 2026-03-11 | **Spec**: specs/005-k8s/spec.md

## Summary

Implement 13 MCP tools for the Scaleway Kubernetes API (Kapsule & Kosmos) covering cluster CRUD, cluster upgrades, kubeconfig retrieval, available version listing, and full node pool lifecycle management. All tools are region-scoped and use the shared Scaleway client infrastructure.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: @modelcontextprotocol/sdk ^1.25.x, @scaleway/sdk-client ^1.0.0, zod ^3.25.x
**Storage**: N/A (stateless proxy)
**Testing**: Vitest with @vitest/coverage-v8 (100% coverage enforced)
**Target Platform**: Bun 1.x runtime
**Project Type**: MCP server (CLI/stdio transport)
**Constraints**: Stateless proxy, all state in Scaleway API

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. AI-Native Development | PASS | All tools have schema-validated inputs/outputs, structured errors |
| II. Spec-Driven Development | PASS | Full spec/plan/tasks pipeline followed |
| III. Contract-First API Design | PASS | Tool contracts defined before implementation |
| IV. Operational Excellence | PASS | Uses shared error mapping, structured responses |
| V. Simplicity & YAGNI | PASS | Direct Scaleway K8s API mapping, no invented abstractions |
| VI. Fast Feedback Loops | PASS | Bun runtime, Vitest for fast tests |
| VII. Type Safety & Validation | PASS | Zod schemas for all inputs, TypeScript strict mode |
| VIII. 100% Test Coverage & API Parity | PASS | Unit + contract tests, parity matrix updated |

## Project Structure

### Documentation (this feature)

```text
specs/005-k8s/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── tasks.md
├── contracts/
│   └── tool-contract.md
└── checklists/
    └── requirements.md
```

### Source Code

```text
src/tools/k8s/
├── index.ts          # Tool registration (registerK8sTools)
├── types.ts          # Zod schemas for all tool inputs
└── handlers.ts       # Tool handler implementations

tests/
├── unit/tools/k8s/
│   └── handlers.test.ts    # Unit tests with mocked SDK
└── contract/tools/k8s/
    └── contract.test.ts    # Contract tests validating API shapes
```

**Structure Decision**: Single project structure. Tools are organized per product under `src/tools/k8s/`. Tests mirror the structure under `tests/unit/` and `tests/contract/`.

## Key Design Decisions

1. **Region-scoped, not zone-scoped**: Unlike Instances (zone-based), the K8s API is region-scoped (`/k8s/v1/regions/{region}/`). All tools accept a `region` parameter.
2. **Cluster + Pool separation**: Cluster tools handle lifecycle and configuration. Pool tools handle node pool management as a separate concern, though pools are always scoped to a cluster.
3. **Pool endpoints use pool_id directly**: Get, update, delete, and upgrade pool endpoints use `/pools/{pool_id}` without requiring cluster_id. Only list and create require cluster_id.
4. **Delete with resource cleanup**: Cluster deletion supports `with_additional_resources` to clean up load balancers, volumes, and other associated resources.

## Complexity Tracking

No complexity violations. Direct API mapping with shared infrastructure.
