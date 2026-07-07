# Tasks: Billing - FinOps

**Feature**: `058-billing-finops` | **Status**: Complete

All tasks are implemented ([X]).

## Phase 0: Research

- [X] T001 Discover the `billing_finops` API slug, version, scope, endpoints, auth
- [X] T002 Cross-check request filters against the auto-generated Scaleway CLI
- [X] T003 Confirm budgets/alerts have no public HTTP API reference → exclude
- [X] T004 Write `research.md`

## Phase 1: Design

- [X] T005 `data-model.md` (Charge, ChargeOrderBy, ListChargesParams/Response)
- [X] T006 `contracts/list-charges.md`
- [X] T007 `quickstart.md`
- [X] T008 `checklists/requirements.md`
- [X] T009 Append "Billing - FinOps" section to `specs/scaleway-api/billing/api-reference.md`

## Phase 2: Implementation

- [X] T010 Add `Charge`, `ChargeOrderBy`, `ListChargesParams`, `ListChargesResponse` to `src/tools/billing/types.ts`
- [X] T011 Extend `buildUrlParams` for array params and add `handleListCharges` in `src/tools/billing/handlers.ts`
- [X] T012 Register `scaleway_billing_list_charges` in `src/tools/billing/index.ts` (six tools total)

## Phase 3: Tests & Parity

- [X] T013 Unit tests: Charge/ListCharges types, handler (success/all-params/omit/error), registration count 6 + callback
- [X] T014 Contract tests: ListCharges (FinOps) block referencing the API reference
- [X] T015 Parity fragment `<scratchpad>/parity-fragments/billing-finops.json`

## Phase 4: Verify

- [X] T016 `bun x vitest run` — billing unit + contract tests green (123 tests)
- [X] T017 100% line + branch coverage of `src/tools/billing/**`
- [X] T018 `bun x biome check` clean; `bun x tsc --noEmit` clean for billing files
