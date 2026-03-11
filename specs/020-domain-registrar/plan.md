# Implementation Plan: Scaleway Domain Registrar MCP Tools

**Branch**: `020-domain-registrar` | **Date**: 2026-03-11 | **Spec**: specs/020-domain-registrar/spec.md

## Summary

Implement 15 MCP tools for the Scaleway Domain Registrar API covering domain CRUD (list, get, register, renew, transfer, update), auto-renew management, availability checks, contact management (list, get, create, update), and TLD lookups (list, get). This is a global API (no zone parameter) using the `/domain/v2beta1` endpoint prefix.

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
specs/020-domain-registrar/
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
src/tools/domain-registrar/
├── index.ts          # Tool registration (registerDomainRegistrarTools)
├── types.ts          # Zod schemas for all tool inputs and entities
└── handlers.ts       # Tool handler implementations

tests/
├── unit/tools/domain-registrar/
│   └── handlers.test.ts    # Unit tests with mocked client
└── contract/tools/domain-registrar/
    └── contract.test.ts    # Contract tests validating API shapes
```

**Structure Decision**: Single project structure. Tools are organized per product under `src/tools/domain-registrar/`. Tests mirror the structure under `tests/unit/` and `tests/contract/`.

## Complexity Tracking

No complexity violations. Direct API mapping with shared infrastructure. The domain registrar API is straightforward with standard CRUD operations and no complex state machines.
