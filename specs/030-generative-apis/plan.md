# Implementation Plan: Scaleway Generative APIs MCP Tools

**Branch**: `030-generative-apis` | **Date**: 2026-03-11 | **Spec**: specs/030-generative-apis/spec.md

## Summary

Implement 4 MCP tools for the Scaleway Generative APIs covering model discovery, chat completions, and text embeddings. The API follows the OpenAI-compatible format and is region-scoped (default: fr-par). Authentication uses Bearer token with SCW_SECRET_KEY.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: @modelcontextprotocol/sdk ^1.25.x, zod ^3.25.x
**Storage**: N/A (stateless proxy)
**Testing**: Vitest with @vitest/coverage-v8 (100% coverage enforced)
**Target Platform**: Bun 1.x runtime
**Project Type**: MCP server (CLI/stdio transport)
**Constraints**: Stateless proxy, all state in Scaleway API. No streaming support.

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
specs/030-generative-apis/
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
src/tools/generative-apis/
├── index.ts          # Tool registration (registerGenerativeApisTools)
├── types.ts          # Zod schemas for all tool inputs and response types
└── handlers.ts       # Tool handler implementations

tests/
├── unit/tools/generative-apis/
│   └── handlers.test.ts    # Unit tests with mocked fetch
└── contract/tools/generative-apis/
    └── contract.test.ts    # Contract tests validating API shapes
```

**Structure Decision**: Single project structure. Tools are organized per product under `src/tools/generative-apis/`. Tests mirror the structure under `tests/unit/` and `tests/contract/`.

## Complexity Tracking

No complexity violations. Direct API mapping with shared infrastructure. The get-model-by-ID handler uses client-side filtering from the list endpoint, which is the simplest approach given the absence of a dedicated GET endpoint.
