# Implementation Plan: Scaleway RabbitMQ (MessageQ) MCP Tools

**Branch**: `042-api-catalog-remediation` | **Date**: 2026-07-07 | **Spec**: specs/050-rabbitmq/spec.md

## Summary

Implement 15 MCP tools for the Scaleway MessageQ (Cloud Essentials for RabbitMQ) API
covering deployment lifecycle (list/get/create/update/upgrade/delete + certificate
download), user management (list/create/update/delete), endpoint management
(create/delete), and catalog discovery (node types, versions). All tools are
region-scoped and use the shared Scaleway client infrastructure.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: @modelcontextprotocol/sdk ^1.25.x, @scaleway/sdk-client ^1.0.0, zod ^3.25.x
**Storage**: N/A (stateless proxy)
**Testing**: Vitest with @vitest/coverage-v8 (100% coverage enforced)
**Target Platform**: Bun 1.x runtime
**Project Type**: MCP server (CLI/stdio transport)
**Constraints**: Stateless proxy, all state in Scaleway API; product currently fr-par only, Beta (v1alpha1)

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. AI-Native Development | PASS | Schema-validated inputs/outputs, structured errors |
| II. Spec-Driven Development | PASS | Full spec/plan/research/data-model/tasks pipeline |
| III. Contract-First API Design | PASS | Tool contracts + api-reference.md defined; verified against SDK |
| IV. Operational Excellence | PASS | Shared error mapping, structured responses |
| V. Simplicity & YAGNI | PASS | Direct API mapping; flat endpoint-spec inputs for ergonomics |
| VI. Fast Feedback Loops | PASS | Bun runtime, Vitest |
| VII. Type Safety & Validation | PASS | Zod schemas for all inputs; strict mode |
| VIII. 100% Test Coverage & API Parity | PASS | Unit + contract tests, 100% line+branch, parity fragment |

## Project Structure

### Documentation (this feature)

```text
specs/050-rabbitmq/
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

specs/scaleway-api/rabbitmq/
└── api-reference.md
```

### Source Code

```text
src/tools/rabbitmq/
├── index.ts          # Tool registration (registerRabbitmqTools)
├── types.ts          # Zod schemas for all tool inputs and entity definitions
└── handlers.ts       # Tool handler implementations

tests/
├── unit/tools/rabbitmq.test.ts               # Unit tests with mocked client
└── contract/rabbitmq/rabbitmq.contract.test.ts   # Contract tests validating API shapes
```

**Structure Decision**: Single project structure. Tools organized per product under
`src/tools/rabbitmq/`. The orchestrator wires `registerRabbitmqTools` into
`src/tools/index.ts`.

## Complexity Tracking

No complexity violations. Direct API mapping with shared infrastructure. The only
non-trivial pieces are (1) the `toEndpointSpec` mapping from flat inputs to the oneof
wire shape, and (2) the `upgrade` XOR validation via Zod `.refine` with a separately
exported raw shape for MCP registration.
