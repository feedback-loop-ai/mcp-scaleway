# Implementation Plan: Scaleway SQS (Queues) MCP Tools

**Branch**: `027-sqs` | **Date**: 2026-03-11 | **Spec**: specs/027-sqs/spec.md

## Summary

Implement 8 MCP tools for the Scaleway SQS (Queues) management API covering service activation/deactivation, service info retrieval, and SQS credentials CRUD. All tools are regional and use the shared Scaleway client infrastructure. The management API is under `/mnq/v1beta1/regions/{region}/`.

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
specs/027-sqs/
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
src/tools/sqs/
├── index.ts          # Tool registration (registerSqsTools)
├── types.ts          # Zod schemas for all tool inputs and response models
└── handlers.ts       # Tool handler implementations

tests/
├── unit/tools/
│   └── sqs.test.ts            # Unit tests with mocked SDK
└── contract/tools/
    └── sqs.contract.test.ts   # Contract tests validating API shapes
```

**Structure Decision**: Single project structure. Tools are organized per product under `src/tools/sqs/`. Tests mirror the structure under `tests/unit/` and `tests/contract/`.

## Complexity Tracking

No complexity violations. Direct API mapping with shared infrastructure. The SQS management API is a simple regional REST API with 8 endpoints.
