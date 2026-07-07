# Implementation Plan: Data Lab for Apache Spark

**Branch**: `049-data-lab-spark` | **Date**: 2026-07-07 | **Spec**: ./spec.md

## Summary

Expose Scaleway's Data Lab for Apache Spark™ (`datalab` v1beta1, region-scoped)
as 8 MCP tools covering the cluster lifecycle plus read-only catalogs (node
types, cluster versions, notebook versions). Implemented as a stateless proxy
following the repo's `src/tools/<area>/{types,handlers,index}.ts` convention.

## Technical Context

**Language/Version**: TypeScript 5.x (strict) on Bun 1.x
**Primary Dependencies**: `@modelcontextprotocol/sdk` ^1.25.x, `@scaleway/sdk-client` ^1.0.0, `zod` ^3.25.x
**Storage**: N/A (stateless proxy to Scaleway APIs)
**Testing**: Vitest (unit + contract), @vitest/coverage-v8 (100%)
**Target Platform**: Node/Bun MCP server (stdio)
**Project Type**: Single project (MCP server)
**Scale/Scope**: 8 tools, 1 product area

## Constitution Check

- **Contract-first**: API reference documented at `specs/scaleway-api/data-lab/api-reference.md`; contract tests validate every tool. PASS
- **100% coverage & API parity**: Unit + contract tests give 100% line/branch of `src/tools/data-lab/`; parity fragment lists all 8 tools. PASS
- **No tool without tests**: Every handler has success, error, and branch coverage. PASS

## Project Structure

### Documentation (this feature)

```text
specs/049-data-lab-spark/
├── plan.md
├── research.md
├── spec.md
├── data-model.md
├── quickstart.md
├── tasks.md
├── contracts/
│   ├── clusters.md
│   └── catalog.md
└── checklists/
    └── requirements.md
```

### Source Code

```text
src/tools/data-lab/
├── types.ts       # zod schemas: entities, enums, request params
├── handlers.ts    # one handleXxx per tool (stateless proxy)
└── index.ts       # registerDataLabTools(server)

tests/
├── unit/tools/data-lab.test.ts
└── contract/data-lab/data-lab.contract.test.ts

specs/scaleway-api/data-lab/api-reference.md
```

## Phases

- **Phase 0 — Research**: Confirm slug/version/scoping and exact shapes (done, see research.md).
- **Phase 1 — Design**: Data model + tool contracts (done).
- **Phase 2 — Implementation**: types/handlers/index + tests (done).
- **Phase 3 — Verification**: vitest pass, 100% coverage, biome clean, tsc clean (done).

## Wiring

The orchestrator wires `registerDataLabTools` into `src/tools/index.ts`
(FORBIDDEN for this agent to edit).
