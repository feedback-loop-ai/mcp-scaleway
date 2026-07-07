# Implementation Plan: Scaleway Site-to-Site VPN MCP Tools

**Branch**: `042-api-catalog-remediation` | **Date**: 2026-07-07 | **Spec**: specs/043-site-to-site-vpn/spec.md

## Summary

Implement 27 MCP tools for the Scaleway Site-to-Site VPN API (`s2s-vpn/v1alpha1`) covering VPN
gateway CRUD, gateway-type discovery, customer gateway CRUD, connection CRUD, connection
lifecycle actions (PSK renew/change, routing-policy attach/detach, route propagation
enable/disable), and routing policy CRUD. All tools are regional and use the shared Scaleway
client infrastructure.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: @modelcontextprotocol/sdk ^1.25.x, @scaleway/sdk-client ^1.0.0, zod ^3.25.x
**Storage**: N/A (stateless proxy)
**Testing**: Vitest with @vitest/coverage-v8 (100% coverage enforced)
**Target Platform**: Bun 1.x runtime
**Project Type**: MCP server (CLI/stdio transport)
**Constraints**: Stateless proxy; all state lives in the Scaleway API

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. AI-Native Development | PASS | Schema-validated inputs, structured errors |
| II. Spec-Driven Development | PASS | Full spec/plan/tasks pipeline followed |
| III. Contract-First API Design | PASS | Tool contracts + api-reference.md written before code |
| IV. Operational Excellence | PASS | Shared error mapping + structured responses |
| V. Simplicity & YAGNI | PASS | Direct API mapping, no invented abstractions |
| VI. Fast Feedback Loops | PASS | Bun + Vitest |
| VII. Type Safety & Validation | PASS | Zod schemas for all inputs, TS strict |
| VIII. 100% Test Coverage & API Parity | PASS | Unit + contract tests at 100%, parity fragment written |

## Project Structure

```text
specs/043-site-to-site-vpn/
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

src/tools/vpn/
├── index.ts          # registerVpnTools
├── types.ts          # zod schemas for inputs + entities
└── handlers.ts       # handler implementations

tests/
├── unit/tools/vpn.test.ts
└── contract/vpn/vpn.contract.test.ts

specs/scaleway-api/vpn/api-reference.md
```

**Structure Decision**: Single project structure; one product folder per area. `registerVpnTools`
is wired into `src/tools/index.ts` by the orchestrator.

## Complexity Tracking

No complexity violations. Nested cipher and BGP-config objects are modelled as pass-through zod
objects with snake_case keys so handlers require no per-field remapping of arrays.
