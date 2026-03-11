# Implementation Plan: Scaleway Account MCP Tools

**Branch**: `035-account` | **Date**: 2026-03-11 | **Spec**: specs/035-account/spec.md

## Summary

Implement 5 MCP tools for the Scaleway Account API covering project CRUD (list, get, create, update, delete). The Account API is global (no zone/region scoping) and uses the `@scaleway/sdk-account` package with the `Accountv3.ProjectAPI` class.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: @modelcontextprotocol/sdk ^1.25.x, @scaleway/sdk-client ^1.0.0, @scaleway/sdk-account, zod ^3.25.x
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
| V. Simplicity & YAGNI | PASS | Direct Scaleway API mapping via SDK, no invented abstractions |
| VI. Fast Feedback Loops | PASS | Bun runtime, Vitest for fast tests |
| VII. Type Safety & Validation | PASS | Zod schemas for all inputs, TypeScript strict mode |
| VIII. 100% Test Coverage & API Parity | PASS | Unit + contract tests, parity matrix updated |

## Project Structure

### Documentation (this feature)

```text
specs/035-account/
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
src/tools/account/
├── index.ts          # Tool registration (registerAccountTools)
├── types.ts          # Zod schemas for all tool inputs
└── handlers.ts       # Tool handler implementations

tests/
├── unit/tools/account/
│   └── handlers.test.ts    # Unit tests with mocked SDK
└── contract/tools/account/
    └── contract.test.ts    # Contract tests validating API shapes
```

**Structure Decision**: Single project structure. Tools are organized per product under `src/tools/account/`. Tests mirror the structure under `tests/unit/` and `tests/contract/`.

## Complexity Tracking

No complexity violations. Direct API mapping via `@scaleway/sdk-account` with shared infrastructure.
