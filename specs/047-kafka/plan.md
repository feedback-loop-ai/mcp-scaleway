# Implementation Plan: Clusters for Apache Kafka® MCP Tools

**Branch**: `047-kafka` | **Date**: 2026-07-07 | **Spec**: specs/047-kafka/spec.md

## Summary

Implement 13 MCP tools for the Scaleway Clusters for Apache Kafka® API (`kafka/v1alpha1`, Public Beta)
covering cluster CRUD, TLS certificate authority get/renew, endpoint create/delete, user list/update, and
read-only node-type/version discovery. All tools are regional and use the shared Scaleway client
infrastructure.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: @modelcontextprotocol/sdk ^1.25.x, @scaleway/sdk-client ^1.0.0, zod ^3.25.x
**Storage**: N/A (stateless proxy)
**Testing**: Vitest with @vitest/coverage-v8 (100% line + branch coverage enforced)
**Target Platform**: Bun 1.x runtime
**Project Type**: MCP server (CLI/stdio transport)
**Constraints**: Stateless proxy; all state in the Scaleway API

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. AI-Native Development | PASS | Schema-validated inputs/outputs, structured errors |
| II. Spec-Driven Development | PASS | Full spec/plan/research/data-model/tasks pipeline |
| III. Contract-First API Design | PASS | api-reference.md + tool contracts precede implementation |
| IV. Operational Excellence | PASS | Shared error mapping and structured responses |
| V. Simplicity & YAGNI | PASS | Direct API mapping, no invented abstractions/endpoints |
| VI. Fast Feedback Loops | PASS | Bun runtime, Vitest |
| VII. Type Safety & Validation | PASS | Zod schemas, TypeScript strict mode |
| VIII. 100% Test Coverage & API Parity | PASS | Unit + contract tests, parity fragment; 100% coverage |

## Project Structure

### Documentation (this feature)

```text
specs/047-kafka/
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
src/tools/kafka/
├── index.ts          # Tool registration (registerKafkaTools)
├── types.ts          # Zod schemas for all tool inputs and entity definitions
└── handlers.ts       # Tool handler implementations

tests/
├── unit/tools/kafka.test.ts               # Unit tests with mocked client
└── contract/kafka/kafka.contract.test.ts  # Contract tests validating API shapes
```

**Structure Decision**: Single project structure following the established per-product convention under
`src/tools/<area>/` with tests mirrored under `tests/unit/` and `tests/contract/`.

## Complexity Tracking

No complexity violations. Direct API mapping with shared infrastructure. A `buildEndpointSpec` helper maps
the flat MCP endpoint inputs to the API one-of body, reused by cluster creation and endpoint creation.
