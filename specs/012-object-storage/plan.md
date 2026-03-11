# Implementation Plan: Scaleway Object Storage MCP Tools

**Branch**: `012-object-storage` | **Date**: 2026-03-11 | **Spec**: specs/012-object-storage/spec.md

## Summary

Implement 14 MCP tools for Scaleway Object Storage (S3-compatible) covering bucket CRUD, object operations, bucket policies, lifecycle rules, and versioning management. All tools are regional and communicate directly with S3 endpoints at `s3.{region}.scw.cloud`.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: @modelcontextprotocol/sdk ^1.25.x, zod ^3.25.x
**Storage**: N/A (stateless proxy)
**Testing**: Vitest with @vitest/coverage-v8 (100% coverage enforced)
**Target Platform**: Bun 1.x runtime
**Project Type**: MCP server (CLI/stdio transport)
**Constraints**: Stateless proxy, all state in Scaleway S3 API; XML parsing via regex helpers (no XML library dependency)

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. AI-Native Development | PASS | All tools have schema-validated inputs/outputs, structured errors |
| II. Spec-Driven Development | PASS | Full spec/plan/tasks pipeline followed |
| III. Contract-First API Design | PASS | Tool contracts defined before implementation |
| IV. Operational Excellence | PASS | Uses shared error mapping, structured responses |
| V. Simplicity & YAGNI | PASS | Direct S3 API mapping, no invented abstractions |
| VI. Fast Feedback Loops | PASS | Bun runtime, Vitest for fast tests |
| VII. Type Safety & Validation | PASS | Zod schemas for all inputs, TypeScript strict mode |
| VIII. 100% Test Coverage & API Parity | PASS | Unit + contract tests, parity matrix updated |

## Project Structure

### Documentation (this feature)

```text
specs/012-object-storage/
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
src/tools/object-storage/
├── index.ts          # Tool registration (registerObjectStorageTools)
├── types.ts          # Zod schemas for all tool inputs and entity types
└── handlers.ts       # Tool handler implementations + XML parsing helpers

tests/
├── unit/tools/object-storage/
│   └── handlers.test.ts    # Unit tests with mocked fetch
└── contract/tools/object-storage/
    └── contract.test.ts    # Contract tests validating S3 API shapes
```

**Structure Decision**: Single project structure. Tools are organized per product under `src/tools/object-storage/`. Tests mirror the structure under `tests/unit/` and `tests/contract/`.

## Complexity Tracking

No complexity violations. Direct S3 API mapping with shared infrastructure. XML parsing uses lightweight regex-based helpers rather than adding an XML library dependency.
