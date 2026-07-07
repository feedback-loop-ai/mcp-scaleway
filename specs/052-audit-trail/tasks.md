# Tasks: Scaleway Audit Trail MCP Tools

**Input**: Design documents from `/specs/052-audit-trail/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Research & API Reference

- [x] T001 Research the Audit Trail API (slug, version, locality, endpoints, shapes, pagination,
      enums) from the official reference and the Scaleway SDK
- [x] T002 Document endpoints in `specs/scaleway-api/audit-trail/api-reference.md`

## Phase 2: Schemas & Types

- [x] T003 [US1] Define ResourceType, order-by enums, Event/Resource/EventPrincipal schemas in
      `src/tools/audit-trail/types.ts`
- [x] T004 [US1] Define `ListAuditTrailEventsParams` input schema in `types.ts`
- [x] T005 [P] [US2] Define Product/ProductService schemas and `ListAuditTrailProductsParams`
- [x] T006 [P] [US3] Define ExportJob/ExportJobS3 schemas and export-job input schemas

## Phase 3: Handlers

- [x] T007 [US1] Implement `handleListAuditTrailEvents` (all filters, cursor pagination) in
      `src/tools/audit-trail/handlers.ts`
- [x] T008 [P] [US2] Implement `handleListAuditTrailProducts`
- [x] T009 [P] [US3] Implement `handleListAuditTrailExportJobs` (offset pagination)
- [x] T010 [P] [US3] Implement `handleCreateAuditTrailExportJob`
- [x] T011 [P] [US3] Implement `handleDeleteAuditTrailExportJob`

## Phase 4: Registration

- [x] T012 Register all 5 tools via `registerAuditTrailTools` in `src/tools/audit-trail/index.ts`

## Phase 5: Tests

- [x] T013 Unit tests for all handlers (success, error, every optional-param and pagination branch)
      in `tests/unit/tools/audit-trail.test.ts`
- [x] T014 Contract tests for all tools in
      `tests/contract/audit-trail/audit-trail.contract.test.ts` referencing api-reference.md

## Phase 6: Polish & Verification

- [x] T015 Provide parity fragment for all 5 operations
- [x] T016 Verify 100% line + branch coverage on `src/tools/audit-trail/**`
- [x] T017 Lint (biome) and type-check (tsc) clean for all new files

## Dependencies & Execution Order

- Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6.
- Within Phase 2 and Phase 3, tasks marked [P] are independent (different tools) and may proceed in
  parallel once the events path is established.

## Notes

- `src/tools/index.ts` wiring of `registerAuditTrailTools` is performed by the orchestrator.
- `tests/parity-matrix.json` is owned by the orchestrator; see the parity fragment.
