# Implementation Plan: Scaleway Environmental Footprint MCP Tools

**Branch**: `053-environmental-footprint` | **Date**: 2026-07-07 | **Spec**: specs/053-environmental-footprint/spec.md

## Summary

Implement 3 read-only MCP tools for the Scaleway Environmental Footprint User
API (`v1alpha1`): retrieve detailed impact data, list available reports, and
download an impact report. The API is Organization-scoped (global); regions and
zones are filters, not path scope. Tools use the shared Scaleway client
infrastructure.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: @modelcontextprotocol/sdk ^1.25.x, @scaleway/sdk-client ^1.0.0, zod ^3.25.x
**Storage**: N/A (stateless proxy)
**Testing**: Vitest with @vitest/coverage-v8 (100% coverage enforced)
**Target Platform**: Bun 1.x runtime
**Project Type**: MCP server (CLI/stdio transport)
**Constraints**: Stateless proxy, all state in Scaleway API; read-only product

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. AI-Native Development | PASS | Schema-validated inputs, structured errors |
| II. Spec-Driven Development | PASS | Full spec/plan/tasks pipeline followed |
| III. Contract-First API Design | PASS | Tool contracts + api-reference.md written before implementation |
| IV. Operational Excellence | PASS | Shared error mapping, structured responses |
| V. Simplicity & YAGNI | PASS | Direct API mapping; no pagination/CRUD invented for a read-only aggregate API |
| VI. Fast Feedback Loops | PASS | Bun runtime, Vitest |
| VII. Type Safety & Validation | PASS | Zod schemas for all inputs; TS strict |
| VIII. 100% Test Coverage & API Parity | PASS | Unit + contract tests; parity fragment provided |

## Project Structure

### Documentation (this feature)

```text
specs/053-environmental-footprint/
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
src/tools/environmental-footprint/
├── index.ts          # Tool registration (registerEnvironmentalFootprintTools)
├── types.ts          # Zod schemas for tool inputs and entity definitions
└── handlers.ts       # Tool handler implementations

tests/
├── unit/tools/environmental-footprint.test.ts        # Unit tests (mocked client)
└── contract/environmental-footprint/
    └── environmental-footprint.contract.test.ts       # Contract tests (API shapes)
```

**Structure Decision**: Single project structure. Tools organized per product
under `src/tools/environmental-footprint/`. Tests mirror under `tests/unit/` and
`tests/contract/`.

## Complexity Tracking

No complexity violations. Direct API mapping over the shared client. Each
handler is a small try/catch wrapper building the request via the shared
`urlParams` helper. No pagination or lifecycle actions because the API is a
read-only aggregate/report surface.
