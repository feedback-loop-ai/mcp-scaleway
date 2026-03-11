# Implementation Plan: Scaleway Key Manager MCP Tools

**Branch**: `025-key-manager` | **Date**: 2026-03-11 | **Spec**: specs/025-key-manager/spec.md

## Summary

Implement 13 MCP tools for the Scaleway Key Manager API covering key CRUD, key lifecycle management (rotate, protect/unprotect, enable/disable), and cryptographic operations (encrypt, decrypt, generate data key). All tools are regional and use the `@scaleway/sdk-key-manager` package with the shared Scaleway client infrastructure.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: @modelcontextprotocol/sdk ^1.25.x, @scaleway/sdk-client ^1.0.0, @scaleway/sdk-key-manager, zod ^3.25.x
**Storage**: N/A (stateless proxy)
**Testing**: Vitest with @vitest/coverage-v8 (100% coverage enforced)
**Target Platform**: Bun 1.x runtime
**Project Type**: MCP server (CLI/stdio transport)
**Constraints**: Stateless proxy, all state in Scaleway API. API is v1alpha1 (pre-GA).

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
specs/025-key-manager/
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
src/tools/key-manager/
├── index.ts          # Tool registration (registerKeyManagerTools)
├── types.ts          # Zod schemas for all tool inputs + enums
└── handlers.ts       # Tool handler implementations

tests/
├── unit/tools/key-manager/
│   └── handlers.test.ts    # Unit tests with mocked SDK
└── contract/tools/key-manager/
    └── contract.test.ts    # Contract tests validating API shapes
```

**Structure Decision**: Single project structure. Tools are organized per product under `src/tools/key-manager/`. Tests mirror the structure under `tests/unit/` and `tests/contract/`.

## Complexity Tracking

No complexity violations. Direct API mapping using `@scaleway/sdk-key-manager` with shared infrastructure. The only non-trivial mapping is the `rotationPolicy` field conversion (string date to Date object) in create/update handlers.
