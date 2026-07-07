# Implementation Plan: Billing - FinOps

**Branch**: `058-billing-finops` | **Status**: Implemented
**Spec**: `specs/058-billing-finops/spec.md`

## Summary

Add one read-only MCP tool, `scaleway_billing_list_charges`, to the existing
`billing` area, backed by `GET /billing/v2beta1/charges` (Scaleway Billing -
FinOps, v2beta1, global). No new area; the existing five billing tools are
extended, not modified.

## Technical Context

- **Language/Runtime**: TypeScript 5.x (strict) on Bun 1.x
- **Primary deps**: `@modelcontextprotocol/sdk`, `@scaleway/sdk-client`, `zod`
- **Storage**: N/A (stateless proxy)
- **Testing**: Vitest, 100% line+branch coverage of `src/tools/billing/**`
- **Scope**: global; cursor pagination

## Constitution Check

- **Contract-first / API Reference Spec**: FinOps section appended to
  `specs/scaleway-api/billing/api-reference.md`. ✅
- **100% coverage & API parity**: unit + contract tests extended; parity fragment
  written. ✅
- **No invented endpoints**: only the documented `charges` endpoint implemented;
  budgets/alerts explicitly excluded with rationale. ✅
- **Read-only**: no write tools added. ✅

## Project Structure

Files touched (all within the assigned billing paths):

```
src/tools/billing/types.ts        # + Charge, ChargeOrderBy, ListChargesParams, ListChargesResponse
src/tools/billing/handlers.ts     # + handleListCharges; buildUrlParams extended for array params
src/tools/billing/index.ts        # + register scaleway_billing_list_charges (6 tools total)
tests/unit/tools/billing.test.ts  # + Charge/ListCharges type + handler + registration tests
tests/contract/billing/billing.contract.test.ts  # + ListCharges (FinOps) contract block
specs/scaleway-api/billing/api-reference.md      # + Billing - FinOps section
specs/058-billing-finops/*        # SDD artifacts
```

## Design decisions

1. Reuse the billing area's `(client, params)` handler signature and
   `formatJsonResponse`/`buildUrlParams` helpers; extend `buildUrlParams` to
   append array-valued params (`URLSearchParams.append`) — backward compatible.
2. Cursor pagination (`page_size`/`page_token`) instead of the offset
   `PaginationParams` used by the other billing list tools, matching the FinOps API.
3. Reuse `Money`; proxy the raw response through unchanged.

## Phases

- Phase 0 — Research → `research.md` (done)
- Phase 1 — Design → `data-model.md`, `contracts/`, `quickstart.md` (done)
- Phase 2 — Implement types/handler/registration (done)
- Phase 3 — Tests (unit + contract), parity fragment (done)
- Phase 4 — Verify: vitest green, 100% coverage, biome clean, tsc clean (done)
