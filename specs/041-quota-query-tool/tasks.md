# Tasks: Quota Query Tool

**Input**: Design documents from `/specs/041-quota-query-tool/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/quota-tools.md

> **⛔ BLOCKED — DO NOT START.** Scaleway does not expose a public REST API for
> querying quotas (see plan.md "BLOCKER" and research.md; upstream feature
> request [#706](https://feature-request.scaleway.com/posts/706/api-and-observability-for-quotas)).
> All tasks below are ready to execute the moment Scaleway publishes the API.
> T001 is the unblocking gate: no other task may begin until it is complete.

**Organization**: Grouped by user story so each story can be implemented and
tested independently. `[P]` = parallelizable (different files, no dependencies).

## Phase 1: Setup (unblocking gate)

- [ ] T001 Verify the Scaleway Quotas API is public: locate the product entry on
      https://www.scaleway.com/en/developers/api/ , record slug, version,
      scoping (global/region), auth, pagination style, and error codes in
      research.md (replace the "does not exist" finding). Update plan.md
      Constitution Check gates III and VIII to PASS.
- [ ] T002 Write `specs/scaleway-api/quotas/api-reference.md` documenting every
      endpoint the tools will use (request/response shapes, pagination, auth,
      error codes) from the official reference — update contracts/quota-tools.md
      and data-model.md where the real API differs from the projected design.

## Phase 2: Foundational

- [ ] T003 Create `src/tools/quotas/types.ts` — zod param schemas
      (`ListQuotasParams`, `GetQuotaParams`) and response types (`Quota`,
      `ListQuotasResponse`) per data-model.md as corrected by T002.

## Phase 3: User Story 1 — List Project Quotas (P1) 🎯 MVP

- [ ] T004 [US1] Implement `handleListQuotas` in `src/tools/quotas/handlers.ts`
      (raw `client.fetch()` pattern per plan.md; pagination via
      `buildPaginatedResponse`; optional region filter per FR-002a; errors via
      `mapScalewayError`/`formatErrorResponse`).
- [ ] T005 [US1] Register `scaleway_quotas_list` in `src/tools/quotas/index.ts`
      (`registerQuotasTools`) and wire it into `src/tools/index.ts`.
- [ ] T006 [P] [US1] Unit tests in `tests/unit/tools/quotas.test.ts` — success,
      pagination, region filter present/absent, auth error, rate-limit error
      (FR-004); 100% line+branch coverage of the area.
- [ ] T007 [P] [US1] Contract tests in
      `tests/contract/quotas/quotas.contract.test.ts` for list — param schema
      accept/reject, documented response fixtures, error codes; header
      references `specs/scaleway-api/quotas/api-reference.md`.

**Checkpoint**: US1 independently testable (list quotas end-to-end).

## Phase 4: User Story 2 — Get Quota for a Specific Resource (P2)

- [ ] T008 [US2] Implement `handleGetQuota` in `src/tools/quotas/handlers.ts`
      (not-found → clear error per FR-004).
- [ ] T009 [US2] Register `scaleway_quotas_get` in `src/tools/quotas/index.ts`.
- [ ] T010 [P] [US2] Extend unit tests — success, unknown resource name,
      error paths; keep 100% coverage.
- [ ] T011 [P] [US2] Extend contract tests for get — schema + fixtures + errors.

## Phase 5: Polish & parity

- [ ] T012 Add both tools to `tests/parity-matrix.json` (entries with `api`,
      `tool`, `contract_test`) and confirm `bun run test:parity` passes.
- [ ] T013 [P] Add the quotas area to README.md tool reference (Account &
      Billing category) with both tool names and descriptions.
- [ ] T014 Run full gates: `bun run lint`, `bun x tsc --noEmit`,
      `bun run test -- --coverage.enabled` (100% line+branch), `bun run test:parity`.

## Dependencies

- T001 → everything (external unblocking gate)
- T002 → T003 → {US1: T004 → T005 → T006/T007} → {US2: T008 → T009 → T010/T011} → T012–T014
- US2 depends on US1 only through shared files (handlers/index); logically independent.
