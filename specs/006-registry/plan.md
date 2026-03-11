# Implementation Plan: Scaleway Container Registry MCP Tools

**Branch**: `006-registry` | **Date**: 2026-03-11 | **Spec**: specs/006-registry/spec.md

## Summary

Implement 12 MCP tools for the Scaleway Container Registry API covering namespace CRUD, image management (list, get, update, delete), and tag management (list, get, delete). All tools are regional (per region) and use the shared Scaleway client infrastructure.

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
specs/006-registry/
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
src/tools/registry/
├── index.ts          # Tool registration (registerRegistryTools)
├── types.ts          # Zod schemas for all tool inputs and response entities
└── handlers.ts       # Tool handler implementations

tests/
├── unit/tools/registry/
│   └── handlers.test.ts    # Unit tests with mocked SDK
└── contract/tools/registry/
    └── contract.test.ts    # Contract tests validating API shapes
```

**Structure Decision**: Single project structure. Tools are organized per product under `src/tools/registry/`. Tests mirror the structure under `tests/unit/` and `tests/contract/`.

## Complexity Tracking

No complexity violations. Direct API mapping with shared infrastructure. The Container Registry API has three entities (Namespace, Image, Tag) with straightforward CRUD operations. All handlers follow the same fetch-then-format pattern used by other product tools.
