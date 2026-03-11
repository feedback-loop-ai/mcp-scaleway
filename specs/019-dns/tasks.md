# Tasks: Scaleway Domains and DNS MCP Tools

**Input**: Design documents from `/specs/019-dns/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Zod Schemas & Types)

**Purpose**: Define Zod schemas and TypeScript types for all DNS entities and tool inputs

- [ ] T001 [US1] Define Zod schemas for DNS zone tool inputs (list, create, update, delete, clone, refresh) in `src/tools/dns/types.ts`
- [ ] T002 [P] [US2] Define Zod schemas for DNS record tool inputs (list, update, clear) and RecordChange union in `src/tools/dns/types.ts`
- [ ] T003 [P] [US2] Define Zod schemas for raw zone tool inputs (export, import) in `src/tools/dns/types.ts`
- [ ] T004 [P] [US3] Define Zod schemas for nameserver tool inputs (list, update) in `src/tools/dns/types.ts`
- [ ] T005 [P] [US4] Define Zod schemas for SSL certificate and TSIG key tool inputs in `src/tools/dns/types.ts`

---

## Phase 2: Foundation (Handler Infrastructure)

**Purpose**: Set up the DNS handler module with shared client and response helpers

- [ ] T006 Set up handler module with API prefix, client factory, and JSON response helper in `src/tools/dns/handlers.ts`

**Checkpoint**: Handler infrastructure ready, tool implementations can begin

---

## Phase 3: User Story 1 - DNS Zone CRUD (Priority: P1)

**Goal**: Full DNS zone lifecycle management via MCP tools

**Independent Test**: Create, list, update, clone, refresh, delete DNS zones

### Implementation

- [ ] T007 [US1] Implement `handleListDnsZones` handler with pagination and filtering
- [ ] T008 [P] [US1] Implement `handleCreateDnsZone` handler
- [ ] T009 [P] [US1] Implement `handleUpdateDnsZone` handler
- [ ] T010 [P] [US1] Implement `handleDeleteDnsZone` handler
- [ ] T011 [P] [US1] Implement `handleCloneDnsZone` handler
- [ ] T012 [P] [US1] Implement `handleRefreshDnsZone` handler
- [ ] T013 [US1] Register DNS zone tools in `src/tools/dns/index.ts`

### Tests

- [ ] T014 [US1] Unit tests for DNS zone handlers in `tests/unit/tools/dns/handlers.test.ts`
- [ ] T015 [US1] Contract tests for DNS zone tools in `tests/contract/tools/dns/contract.test.ts`

**Checkpoint**: DNS zone CRUD fully functional

---

## Phase 4: User Story 2 - DNS Records & Raw Zones (Priority: P1)

**Goal**: DNS record management including batch operations and raw zone import/export

### Implementation

- [ ] T016 [US2] Implement `handleListDnsRecords` handler with pagination and filtering
- [ ] T017 [P] [US2] Implement `handleUpdateDnsRecords` handler with batch change support
- [ ] T018 [P] [US2] Implement `handleClearDnsRecords` handler
- [ ] T019 [P] [US2] Implement `handleExportRawDnsZone` handler
- [ ] T020 [P] [US2] Implement `handleImportRawDnsZone` handler
- [ ] T021 [US2] Register DNS record and raw zone tools in `src/tools/dns/index.ts`

### Tests

- [ ] T022 [US2] Unit tests for DNS record and raw zone handlers in `tests/unit/tools/dns/handlers.test.ts`
- [ ] T023 [US2] Contract tests for DNS record and raw zone tools in `tests/contract/tools/dns/contract.test.ts`

**Checkpoint**: DNS record management and raw zone operations fully functional

---

## Phase 5: User Story 3 - Nameserver Management (Priority: P2)

**Goal**: Nameserver listing and update via MCP tools

### Implementation

- [ ] T024 [US3] Implement `handleListNameservers` handler
- [ ] T025 [P] [US3] Implement `handleUpdateNameservers` handler
- [ ] T026 [US3] Register nameserver tools in `src/tools/dns/index.ts`

### Tests

- [ ] T027 [US3] Unit tests for nameserver handlers in `tests/unit/tools/dns/handlers.test.ts`
- [ ] T028 [US3] Contract tests for nameserver tools in `tests/contract/tools/dns/contract.test.ts`

**Checkpoint**: Nameserver management fully functional

---

## Phase 6: User Story 4 - SSL Certificates & TSIG Keys (Priority: P3)

**Goal**: SSL certificate and TSIG key management via MCP tools

### Implementation

- [ ] T029 [US4] Implement `handleGetSslCertificate`, `handleCreateSslCertificate`, `handleDeleteSslCertificate` handlers
- [ ] T030 [P] [US4] Implement `handleGetTsigKey`, `handleDeleteTsigKey` handlers
- [ ] T031 [US4] Register SSL certificate and TSIG key tools in `src/tools/dns/index.ts`

### Tests

- [ ] T032 [US4] Unit tests for SSL certificate and TSIG key handlers in `tests/unit/tools/dns/handlers.test.ts`
- [ ] T033 [US4] Contract tests for SSL certificate and TSIG key tools in `tests/contract/tools/dns/contract.test.ts`

**Checkpoint**: SSL certificate and TSIG key management fully functional

---

## Phase 7: Polish & Cross-Cutting

- [ ] T034 Update `tests/parity-matrix.json` with all DNS API operations
- [ ] T035 Verify 100% code coverage
- [ ] T036 Run lint and type check

---

## Dependencies & Execution Order

- **Phase 1**: No dependencies - Zod schemas first
- **Phase 2**: Depends on Phase 1 (schemas needed for handlers)
- **Phase 3-6**: All depend on Phase 2 (handler infrastructure). Execute sequentially P1->P1->P2->P3
- **Phase 7**: Depends on all implementation phases
