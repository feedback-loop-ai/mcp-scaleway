# Implementation Plan: Scaleway VPC & Private Networks MCP Tools

**Branch**: `016-vpc` | **Date**: 2026-03-11 | **Spec**: specs/016-vpc/spec.md

## Summary

Implement 10 MCP tools for the Scaleway VPC v2 API covering VPC CRUD (list, get, create, update, delete) and Private Network CRUD (list, get, create, update, delete). All tools are regional and use the shared Scaleway client infrastructure via `client.fetch`.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: @modelcontextprotocol/sdk ^1.25.x, @scaleway/sdk-client ^1.0.0, zod ^3.25.x
**Storage**: N/A (stateless proxy)
**Testing**: Vitest with @vitest/coverage-v8 (100% coverage enforced)
**Target Platform**: Bun 1.x runtime
**Project Type**: MCP server (CLI/stdio transport)
**Constraints**: Stateless proxy, all state in Scaleway API. Regional API (not zoned).

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
specs/016-vpc/
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
src/tools/vpc/
├── index.ts          # Tool registration (registerVpcTools)
├── types.ts          # Zod schemas for all tool inputs + response types
└── handlers.ts       # Tool handler implementations

tests/
├── unit/tools/vpc/
│   └── handlers.test.ts    # Unit tests with mocked SDK
└── contract/tools/vpc/
    └── contract.test.ts    # Contract tests validating API shapes
```

**Structure Decision**: Single project structure. Tools are organized per product under `src/tools/vpc/`. Tests mirror the structure under `tests/unit/` and `tests/contract/`.

## Complexity Tracking

No complexity violations. Direct API mapping with shared infrastructure. The VPC API is straightforward CRUD with pagination on list endpoints.
