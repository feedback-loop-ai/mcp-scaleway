# Implementation Plan: Scaleway Domains and DNS MCP Tools

**Branch**: `019-dns` | **Date**: 2026-03-11 | **Spec**: specs/019-dns/spec.md

## Summary

Implement 18 MCP tools for the Scaleway Domains and DNS API (v2beta1) covering DNS zone CRUD, DNS record management (including batch operations), raw zone import/export, nameserver management, SSL certificate management, and TSIG key management. The DNS API is global (not zoned) and uses dns_zone name as the primary identifier instead of UUIDs.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: @modelcontextprotocol/sdk ^1.25.x, @scaleway/sdk-client ^1.0.0, zod ^3.25.x
**Storage**: N/A (stateless proxy)
**Testing**: Vitest with @vitest/coverage-v8 (100% coverage enforced)
**Target Platform**: Bun 1.x runtime
**Project Type**: MCP server (CLI/stdio transport)
**Constraints**: Stateless proxy, all state in Scaleway API. Global API (no region/zone parameter).

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
specs/019-dns/
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
src/tools/dns/
├── index.ts          # Tool registration (registerDnsTools)
├── types.ts          # Zod schemas for all tool inputs
└── handlers.ts       # Tool handler implementations

tests/
├── unit/tools/dns/
│   └── handlers.test.ts    # Unit tests with mocked SDK
└── contract/tools/dns/
    └── contract.test.ts    # Contract tests validating API shapes
```

**Structure Decision**: Single project structure. Tools are organized per product under `src/tools/dns/`. Tests mirror the structure under `tests/unit/` and `tests/contract/`.

## Key Design Decisions

1. **Global API**: Unlike Instances (zone-scoped), the DNS API is global. No zone/region parameter is needed on any tool.
2. **DNS zone name as identifier**: Tools use the full DNS zone name (e.g. `sub.example.com`) as the primary identifier, URL-encoded in path parameters.
3. **Batch record updates**: The `scaleway_dns_update_records` tool accepts a `changes` array supporting add/set/delete/clear operations in a single API call.
4. **Raw zone import/export**: Supports BIND zone file format for bulk DNS management.

## Complexity Tracking

No complexity violations. Direct API mapping with shared infrastructure.
