# Implementation Plan: Scaleway Serverless Containers MCP Tools

**Branch**: `008-containers` | **Date**: 2026-03-11 | **Spec**: specs/008-containers/spec.md

## Summary

Implement 20 MCP tools for the Scaleway Serverless Containers API covering namespace CRUD, container CRUD with deploy, cron trigger management, custom domain mapping, and authentication token management. All tools are regional and use the shared Scaleway client infrastructure.

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
| V. Simplicity & YAGNI | PASS | Direct Scaleway API mapping, no invented abstractions |
| VI. Fast Feedback Loops | PASS | Bun runtime, Vitest for fast tests |
| VII. Type Safety & Validation | PASS | Zod schemas for all inputs, TypeScript strict mode |
| VIII. 100% Test Coverage & API Parity | PASS | Unit + contract tests, parity matrix updated |

## Project Structure

### Documentation (this feature)

```text
specs/008-containers/
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
src/tools/containers/
├── index.ts          # Tool registration (registerContainersTools)
├── types.ts          # Zod schemas for all tool inputs
└── handlers.ts       # Tool handler implementations

tests/
├── unit/tools/containers/
│   └── handlers.test.ts    # Unit tests with mocked SDK
└── contract/tools/containers/
    └── contract.test.ts    # Contract tests validating API shapes
```

**Structure Decision**: Single project structure. Tools are organized per product under `src/tools/containers/`. Tests mirror the structure under `tests/unit/` and `tests/contract/`.

## Key Design Decisions

- **Regional API**: Uses `region` parameter (fr-par, nl-ams, pl-waw) instead of zone. Falls back to account default region.
- **camelCase inputs, snake_case API**: Zod schemas use camelCase (TypeScript convention). The `toSnakeCase` helper converts to snake_case before sending to the Scaleway API.
- **Direct HTTP via SDK client**: Uses `apiRequest` helper wrapping the shared SDK client's HTTP transport for all API calls.
- **Deploy as separate action**: Container deploy is a distinct tool (`deploy_container`) that triggers deployment of the current configuration, separate from create/update.
- **Token scoping**: Tokens can be scoped to either a container or a namespace, not both.

## Complexity Tracking

No complexity violations. Direct API mapping with shared infrastructure.
