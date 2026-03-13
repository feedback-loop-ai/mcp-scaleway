# Implementation Plan: Quota Query Tool

**Branch**: `041-quota-query-tool` | **Date**: 2026-03-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/041-quota-query-tool/spec.md`

## Summary

Add two MCP tools (`scaleway_quotas_list`, `scaleway_quotas_get`) for querying Scaleway project resource quotas — showing resource name, current usage, and maximum limit. Uses the raw HTTP client pattern (K8s tools reference) since no `@scaleway/sdk-quota` package exists.

**BLOCKER**: Research confirmed that Scaleway does **not** currently expose a public REST API for querying quotas. Feature request [#706](https://feature-request.scaleway.com/posts/706/api-and-observability-for-quotas) has been open since August 2023 with no Scaleway response. **Implementation is blocked until Scaleway releases a quota API.**

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) with Bun 1.x
**Primary Dependencies**: `@modelcontextprotocol/sdk` ^1.25.x, `@scaleway/sdk-client` ^1.0.0, `zod` ^3.25.x
**Storage**: N/A (stateless proxy)
**Testing**: Vitest + @vitest/coverage-v8 (100% line/branch coverage enforced)
**Target Platform**: Node.js / Bun runtime (MCP server)
**Project Type**: MCP server (stateless API proxy)
**Performance Goals**: N/A (pass-through to Scaleway API)
**Constraints**: No dedicated SDK package — raw HTTP client via `@scaleway/sdk-client` `Client.fetch()`
**Scale/Scope**: 2 new MCP tools, 3 source files, 2 test files, 1 API spec, 1 parity matrix update

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. AI-Native Development | PASS | Tools have schema-validated inputs/outputs, actionable errors |
| II. Spec-Driven Development | PASS | Spec complete, plan in progress |
| III. Contract-First API Design | **BLOCKED** | Cannot document Scaleway API Reference Spec — API does not exist |
| IV. Operational Excellence | PASS | Structured errors, no sensitive data in logs |
| V. Simplicity & YAGNI | PASS | Direct API mapping, no invented abstractions |
| VI. Fast Feedback Loops | PASS | Standard Bun/Vitest toolchain |
| VII. Type Safety & Validation | PASS | Zod schemas for all inputs, typed responses |
| VIII. 100% Test Coverage & API Parity | **BLOCKED** | Cannot write contract tests without API to validate against |

**Gate Result**: BLOCKED — Principles III and VIII cannot be satisfied because the underlying Scaleway quota API does not exist.

### Post-Phase 1 Re-check

Same as above. The blocker is external (Scaleway API availability), not a design issue. All design artifacts are ready for implementation once the API becomes available.

## Project Structure

### Documentation (this feature)

```text
specs/041-quota-query-tool/
├── plan.md              # This file
├── research.md          # Phase 0 output — API existence confirmed negative
├── data-model.md        # Phase 1 output — target data model from SDK error types
├── quickstart.md        # Phase 1 output — implementation guide for when unblocked
├── contracts/
│   └── quota-tools.md   # Phase 1 output — target MCP tool contracts
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (when unblocked)

```text
src/tools/quota/
├── types.ts             # Zod schemas: ListQuotasInput, GetQuotaInput
├── handlers.ts          # handleListQuotas, handleGetQuota (raw HTTP client)
└── index.ts             # registerQuotaTools(server: McpServer)

src/tools/index.ts       # UPDATE: add registerQuotaTools to Account & Billing section

specs/scaleway-api/quota/
└── api-reference.md     # Scaleway quota API reference (when API exists)

tests/unit/tools/quota/
└── handlers.test.ts     # Unit tests with mocked client.fetch

tests/contract/tools/quota/
└── contract.test.ts     # Contract tests validating schemas + registration

tests/parity-matrix.json # UPDATE: add quota operations
```

**Structure Decision**: Standard single-product tool directory (`src/tools/quota/`) following the established 3-file pattern (types, handlers, index). Raw HTTP client pattern from `src/tools/k8s/handlers.ts` since no SDK wrapper exists.

## Blocker Resolution Options

| Option | Description | Recommendation |
|--------|-------------|----------------|
| **A. Wait for Scaleway** | Monitor feature request #706; implement when API releases | **Recommended** — ensures stable, supported implementation |
| **B. Reverse-engineer console** | Discover internal console API via DevTools | Rejected — unsupported, fragile, violates Principle III |
| **C. Aggregate product APIs** | Call each product API for per-resource limits | Rejected — complex, incomplete, no standard shape |
| **D. Contact Scaleway** | Inquire about API timeline or undocumented endpoints | Worth trying as complementary action |

## Complexity Tracking

No constitution violations to justify — the feature design is straightforward. The blocker is external (missing upstream API), not a complexity issue.
