# Implementation Plan: Scaleway Audit Trail MCP Tools

**Branch**: `052-audit-trail` | **Date**: 2026-07-07 | **Spec**: specs/052-audit-trail/spec.md

## Summary

Implement 5 MCP tools for the Scaleway Audit Trail API (`v1alpha1`, Beta, regional): list events
(rich filters, cursor pagination), list integrated products, and list/create/delete export jobs
(offset pagination). All tools reuse the shared Scaleway client, error mapping, and pagination
infrastructure.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: @modelcontextprotocol/sdk ^1.25.x, @scaleway/sdk-client ^1.0.0, zod ^3.25.x
**Storage**: N/A (stateless proxy to Scaleway APIs)
**Testing**: Vitest with @vitest/coverage-v8 (100% line + branch enforced)
**Target Platform**: Bun 1.x runtime (stdio MCP transport)
**Constraints**: Stateless proxy; all state lives in the Scaleway API

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. AI-Native Development | PASS | Schema-validated inputs, structured error responses |
| II. Spec-Driven Development | PASS | Full spec/plan/research/data-model/contracts/tasks pipeline |
| III. Contract-First API Design | PASS | Tool + API contracts documented before/with implementation |
| IV. Operational Excellence | PASS | Shared error mapping and response shaping |
| V. Simplicity & YAGNI | PASS | Direct API mapping; oneofs tolerated, not enumerated |
| VI. Fast Feedback Loops | PASS | Bun + Vitest |
| VII. Type Safety & Validation | PASS | Zod schemas for every tool input; TS strict |
| VIII. 100% Test Coverage & API Parity | PASS | Unit + contract tests; parity fragment provided |

## Project Structure

```text
specs/052-audit-trail/
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

specs/scaleway-api/audit-trail/
└── api-reference.md

src/tools/audit-trail/
├── index.ts      # registerAuditTrailTools
├── types.ts      # Zod schemas (entities, enums, tool inputs)
└── handlers.ts   # Tool handler implementations

tests/
├── unit/tools/audit-trail.test.ts
└── contract/audit-trail/audit-trail.contract.test.ts
```

**Structure Decision**: Single project, per-product tool directory, mirroring existing verticals
(e.g. `src/tools/nats/`). The orchestrator wires `registerAuditTrailTools` into
`src/tools/index.ts`.

## Complexity Tracking

No complexity violations. The only notable variance from other verticals is that pagination is not
uniform: events use cursor pagination (returned raw), products have no pagination, and export jobs
use the shared offset `buildPaginatedResponse`. This mirrors the underlying API exactly and adds no
new abstraction.
