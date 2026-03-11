# Implementation Plan: Scaleway Edge Services MCP Tools

**Branch**: `022-edge-services` | **Date**: 2026-03-11 | **Spec**: specs/022-edge-services/spec.md

## Summary

Implement 28 MCP tools for the Scaleway Edge Services API covering pipeline CRUD, DNS stage management, TLS stage management, cache stage management, backend stage management, and cache purge requests. Edge Services is a global API (no zone/region parameter) and uses a pipeline-based architecture where stages are chained: DNS -> TLS -> Cache -> Backend.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: @modelcontextprotocol/sdk ^1.25.x, @scaleway/sdk-client ^1.0.0, @scaleway/sdk-edge-services, zod ^3.25.x
**Storage**: N/A (stateless proxy)
**Testing**: Vitest with @vitest/coverage-v8 (100% coverage enforced)
**Target Platform**: Bun 1.x runtime
**Project Type**: MCP server (CLI/stdio transport)
**Constraints**: Stateless proxy, all state in Scaleway API. API is v1beta1 (may have breaking changes).

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. AI-Native Development | PASS | All tools have schema-validated inputs/outputs, structured errors |
| II. Spec-Driven Development | PASS | Full spec/plan/tasks pipeline followed |
| III. Contract-First API Design | PASS | Tool contracts defined before implementation |
| IV. Operational Excellence | PASS | Uses shared error mapping, structured responses |
| V. Simplicity & YAGNI | PASS | Direct Scaleway API mapping via SDK, no invented abstractions |
| VI. Fast Feedback Loops | PASS | Bun runtime, Vitest for fast tests |
| VII. Type Safety & Validation | PASS | Zod schemas for all inputs, TypeScript strict mode |
| VIII. 100% Test Coverage & API Parity | PASS | Unit + contract tests, parity matrix updated |

## Project Structure

### Documentation (this feature)

```text
specs/022-edge-services/
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
src/tools/edge-services/
├── index.ts          # Tool registration (registerEdgeServicesTools)
├── types.ts          # Zod schemas for all tool inputs
└── handlers.ts       # Tool handler implementations

tests/
├── unit/tools/edge-services/
│   └── handlers.test.ts    # Unit tests with mocked SDK
└── contract/tools/edge-services/
    └── contract.test.ts    # Contract tests validating API shapes
```

**Structure Decision**: Single project structure. Tools are organized per product under `src/tools/edge-services/`. Tests mirror the structure under `tests/unit/` and `tests/contract/`.

## Complexity Tracking

No complexity violations. Direct API mapping using `@scaleway/sdk-edge-services` v1beta1 API class. Stage chaining (DNS -> TLS -> Cache -> Backend) is handled by the Scaleway API; tools only pass through stage ID references.
