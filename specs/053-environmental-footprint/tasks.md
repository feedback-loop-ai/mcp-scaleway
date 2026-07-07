# Tasks: Scaleway Environmental Footprint MCP Tools

**Input**: Design documents from `/specs/053-environmental-footprint/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Schemas & Types)

- [X] T001 [US1] Define enums (ServiceCategory, ProductCategory, ReportType) in `src/tools/environmental-footprint/types.ts`
- [X] T002 [P] [US1] Define entity schemas (Impact, SkuImpact, ZoneImpact, RegionImpact, ProjectImpact, ImpactDataResponse, ImpactReportAvailability) in `src/tools/environmental-footprint/types.ts`
- [X] T003 [P] [US1] Define tool input schemas (GetImpactDataParams, GetReportAvailabilityParams, DownloadImpactReportParams) in `src/tools/environmental-footprint/types.ts`

---

## Phase 2: Foundation (Client Helpers)

- [X] T004 Implement `getClient` and `jsonResponse` helpers in `src/tools/environmental-footprint/handlers.ts`

**Checkpoint**: Helpers ready, handler implementations can begin

---

## Phase 3: User Story 1 - Retrieve Impact Data (Priority: P1)

- [X] T005 [US1] Implement `handleGetImpactData` handler in `src/tools/environmental-footprint/handlers.ts`
- [X] T006 [US1] Unit tests for `handleGetImpactData` (no-filter, all-filters, error) in `tests/unit/tools/environmental-footprint.test.ts`
- [X] T007 [US1] Contract tests for GetImpactData request/response shapes in `tests/contract/environmental-footprint/environmental-footprint.contract.test.ts`

**Checkpoint**: Impact data retrieval functional

---

## Phase 4: User Story 2 - Report Availability (Priority: P2)

- [X] T008 [US2] Implement `handleGetReportAvailability` handler in `src/tools/environmental-footprint/handlers.ts`
- [X] T009 [US2] Unit tests for `handleGetReportAvailability` in `tests/unit/tools/environmental-footprint.test.ts`
- [X] T010 [US2] Contract tests for GetReportAvailability shapes in `tests/contract/environmental-footprint/environmental-footprint.contract.test.ts`

**Checkpoint**: Report availability listing functional

---

## Phase 5: User Story 3 - Download Report (Priority: P3)

- [X] T011 [US3] Implement `handleDownloadImpactReport` handler in `src/tools/environmental-footprint/handlers.ts`
- [X] T012 [US3] Unit tests for `handleDownloadImpactReport` (with/without org, error) in `tests/unit/tools/environmental-footprint.test.ts`
- [X] T013 [US3] Contract tests for DownloadImpactReport request shape in `tests/contract/environmental-footprint/environmental-footprint.contract.test.ts`

**Checkpoint**: Report download functional

---

## Phase 6: Registration & Cross-Cutting

- [X] T014 Register all 3 tools via `registerEnvironmentalFootprintTools` in `src/tools/environmental-footprint/index.ts`
- [X] T015 Author `specs/scaleway-api/environmental-footprint/api-reference.md`
- [X] T016 Provide parity fragment `parity-fragments/environmental-footprint.json`
- [X] T017 Verify 100% coverage, lint (biome), and type check for the vertical's files

---

## Dependencies & Execution Order

- **Phase 1** → **Phase 2** → **Phases 3-5** (sequential P1→P2→P3) → **Phase 6**
- The orchestrator wires `registerEnvironmentalFootprintTools` into `src/tools/index.ts`
  and merges the parity fragment into `tests/parity-matrix.json`.
