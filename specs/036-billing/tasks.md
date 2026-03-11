# Tasks: Scaleway Billing MCP Tools

**Input**: Design documents from `/specs/036-billing/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Schemas & Types)

**Purpose**: Define Zod schemas and TypeScript types for all billing entities and request parameters

- [ ] T001 [US1] Define Zod schemas for Money, Consumption, and ListConsumptionsParams in `src/tools/billing/types.ts`
- [ ] T002 [P] [US2] Define Zod schemas for Invoice, InvoiceType, InvoiceState, ListInvoicesParams, GetInvoiceParams, DownloadInvoiceParams in `src/tools/billing/types.ts`
- [ ] T003 [P] [US3] Define Zod schemas for Discount, DiscountMode, DiscountFilter, DiscountCoupon, ListDiscountsParams in `src/tools/billing/types.ts`
- [ ] T004 [P] Define response schemas (ListConsumptionsResponse, ListInvoicesResponse, ListDiscountsResponse) in `src/tools/billing/types.ts`

---

## Phase 2: Foundation (Handler Helpers)

**Purpose**: Create billing-specific handler helper functions

- [ ] T005 Implement `buildUrlParams` and `formatJsonResponse` helpers in `src/tools/billing/handlers.ts`

**Checkpoint**: Helper functions ready, handler implementations can begin

---

## Phase 3: User Story 1 - Consumption Tracking (Priority: P1)

**Goal**: List consumption data with filtering and pagination

**Independent Test**: List consumptions with various filters

### Implementation

- [ ] T006 [US1] Implement `handleListConsumptions` handler in `src/tools/billing/handlers.ts`
- [ ] T007 [US1] Register `scaleway_billing_list_consumptions` tool in `src/tools/billing/index.ts`

### Tests

- [ ] T008 [US1] Unit tests for list consumptions handler in `tests/unit/tools/billing/handlers.test.ts`
- [ ] T009 [US1] Contract tests for list consumptions tool in `tests/contract/tools/billing/contract.test.ts`

**Checkpoint**: Consumption tracking fully functional

---

## Phase 4: User Story 2 - Invoice Management (Priority: P1)

**Goal**: List, get, and download invoices

### Implementation

- [ ] T010 [US2] Implement `handleListInvoices` handler in `src/tools/billing/handlers.ts`
- [ ] T011 [P] [US2] Implement `handleGetInvoice` handler in `src/tools/billing/handlers.ts`
- [ ] T012 [P] [US2] Implement `handleDownloadInvoice` handler in `src/tools/billing/handlers.ts`
- [ ] T013 [US2] Register invoice tools (list, get, download) in `src/tools/billing/index.ts`

### Tests

- [ ] T014 [US2] Unit tests for invoice handlers in `tests/unit/tools/billing/handlers.test.ts`
- [ ] T015 [US2] Contract tests for invoice tools in `tests/contract/tools/billing/contract.test.ts`

**Checkpoint**: Invoice management fully functional

---

## Phase 5: User Story 3 - Discount Management (Priority: P2)

**Goal**: List discounts for an organization

### Implementation

- [ ] T016 [US3] Implement `handleListDiscounts` handler in `src/tools/billing/handlers.ts`
- [ ] T017 [US3] Register `scaleway_billing_list_discounts` tool in `src/tools/billing/index.ts`

### Tests

- [ ] T018 [US3] Unit tests for list discounts handler in `tests/unit/tools/billing/handlers.test.ts`
- [ ] T019 [US3] Contract tests for list discounts tool in `tests/contract/tools/billing/contract.test.ts`

**Checkpoint**: Discount management fully functional

---

## Phase 6: Polish & Cross-Cutting

- [ ] T020 Update `tests/parity-matrix.json` with all Billing API operations
- [ ] T021 Verify 100% code coverage
- [ ] T022 Run lint and type check

---

## Dependencies & Execution Order

- **Phase 1**: No dependencies - Zod schemas first
- **Phase 2**: Depends on Phase 1 (schemas needed for handlers)
- **Phase 3-5**: All depend on Phase 2 (helpers). Can be done sequentially P1->P1->P2
- **Phase 6**: Depends on all implementation phases
