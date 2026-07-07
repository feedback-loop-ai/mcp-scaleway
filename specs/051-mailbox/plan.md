# Implementation Plan: Scaleway Mailbox MCP Tools

**Branch**: `051-mailbox` | **Date**: 2026-07-07 | **Spec**: specs/051-mailbox/spec.md

## Summary

Implement 16 MCP tools for the Scaleway Mailbox API (`mailbox/v1alpha1`, Beta),
covering domain lifecycle + DNS record validation, batch mailbox creation and
lifecycle (including subscription/password update and restore), and email alias
CRUD. The API is **global** (no region), so no tool accepts a region parameter. All
tools use the shared Scaleway client infrastructure.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: @modelcontextprotocol/sdk ^1.25.x, @scaleway/sdk-client ^1.0.0, zod ^3.25.x
**Storage**: N/A (stateless proxy)
**Testing**: Vitest with @vitest/coverage-v8 (100% coverage enforced)
**Target Platform**: Bun 1.x runtime
**Project Type**: MCP server (CLI/stdio transport)
**Constraints**: Stateless proxy, all state in Scaleway API; global-scoped API

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. AI-Native Development | PASS | Schema-validated inputs/outputs, structured errors |
| II. Spec-Driven Development | PASS | Full spec/plan/tasks pipeline followed |
| III. Contract-First API Design | PASS | Tool contracts + api-reference.md defined; verified vs SDK |
| IV. Operational Excellence | PASS | Shared error mapping, structured responses |
| V. Simplicity & YAGNI | PASS | Direct API mapping, no invented abstractions or offers tool |
| VI. Fast Feedback Loops | PASS | Bun runtime, Vitest |
| VII. Type Safety & Validation | PASS | Zod schemas for all inputs, strict mode |
| VIII. 100% Test Coverage & API Parity | PASS | Unit + contract tests (92 tests), parity fragment provided |

## Project Structure

### Documentation (this feature)

```text
specs/051-mailbox/
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
src/tools/mailbox/
├── index.ts          # Tool registration (registerMailboxTools)
├── types.ts          # Zod schemas for all tool inputs and entity definitions
└── handlers.ts       # Tool handler implementations

tests/
├── unit/tools/mailbox.test.ts             # Unit tests with mocked client
└── contract/mailbox/mailbox.contract.test.ts  # Contract tests validating API shapes

specs/scaleway-api/mailbox/api-reference.md  # API reference doc
```

**Structure Decision**: Single project structure, one directory per product under
`src/tools/mailbox/`. Tests mirror under `tests/unit/` and `tests/contract/`.

## Complexity Tracking

No complexity violations. Direct API mapping with shared infrastructure. Handlers
follow the established `nats` pattern using `client.fetch` + `urlParams`. The only
notable shape difference from a typical product is the global scope (no region) and
the batch mailbox-create endpoint — both handled without added abstraction.
