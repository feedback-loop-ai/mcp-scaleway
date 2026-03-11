# Implementation Plan: Scaleway Cockpit (Observability) MCP Tools

**Branch**: `031-cockpit` | **Date**: 2026-03-11 | **Spec**: specs/031-cockpit/spec.md

## Summary

Implement 22 MCP tools for the Scaleway Cockpit (Observability) API covering Cockpit lifecycle (get/activate/deactivate), data source management, token management, Grafana user management, alert manager controls, contact point management, and managed alerts. Most tools are regional; Grafana user tools are global.

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
specs/031-cockpit/
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
src/tools/cockpit/
├── index.ts          # Tool registration (registerCockpitTools)
├── types.ts          # Zod schemas for all tool inputs and entity types
└── handlers.ts       # Tool handler implementations

tests/
├── unit/tools/cockpit/
│   └── handlers.test.ts    # Unit tests with mocked SDK
└── contract/tools/cockpit/
    └── contract.test.ts    # Contract tests validating API shapes
```

**Structure Decision**: Single project structure. Tools are organized per product under `src/tools/cockpit/`. Tests mirror the structure under `tests/unit/` and `tests/contract/`.

## Complexity Tracking

No complexity violations. Direct API mapping with shared infrastructure. The only notable variation is the mixed locality model (regional vs global for Grafana users) and the non-standard DELETE-with-body pattern for contact points.
