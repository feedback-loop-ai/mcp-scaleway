# Tasks: Scaleway Product Catalog MCP Tools

**Input**: Design documents from `/specs/054-product-catalog/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Research & Contracts

- [X] T001 Verify API slug/version/scope against official docs, Go SDK, and live API
- [X] T002 Document endpoint in `specs/scaleway-api/product-catalog/api-reference.md`
- [X] T003 Author SDD artifacts (spec, research, plan, data-model, quickstart, contracts, checklist)

## Phase 2: Schemas & Types

- [X] T004 [US1] Define enums (product type, status, cpu arch, badge) in `src/tools/product-catalog/types.ts`
- [X] T005 [P] [US1] Define value objects (Money, locality, hardware, properties, unit_of_measure, environmental impact) in `types.ts`
- [X] T006 [P] [US1] Define `PublicCatalogProduct` and `ListPublicCatalogProductsResponse` in `types.ts`
- [X] T007 [P] [US1] Define `ListProductsParams` in `types.ts`
- [X] T008 [P] [US2] Define `ListCategoriesParams` and derived `ProductCategory` in `types.ts`

## Phase 3: Handlers

- [X] T009 [US1] Implement `handleListProducts` (filters + repeated params + pagination wrap) in `src/tools/product-catalog/handlers.ts`
- [X] T010 [US2] Implement `handleListCategories` (paged scan + client-side aggregation + scan cap) in `handlers.ts`

## Phase 4: Registration

- [X] T011 Implement `registerProductCatalogTools` in `src/tools/product-catalog/index.ts`

## Phase 5: Tests

- [X] T012 [US1] Unit tests for `handleListProducts` (success, all filters, error) in `tests/unit/tools/product-catalog.test.ts`
- [X] T013 [US2] Unit tests for `handleListCategories` (single page, multi-page, empty break, scan cap, error)
- [X] T014 Contract tests for both tools in `tests/contract/product-catalog/product-catalog.contract.test.ts`
- [X] T015 Write parity fragment for both tools

## Phase 6: Quality Gates

- [X] T016 100% line+branch coverage of `src/tools/product-catalog/**`
- [X] T017 `bun x tsc --noEmit` clean; `bun x biome check` clean for area files

**Checkpoint**: Vertical complete. Orchestrator wires `registerProductCatalogTools`
into `src/tools/index.ts`.
