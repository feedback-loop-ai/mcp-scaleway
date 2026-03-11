# Tasks: Scaleway Domain Registrar MCP Tools

**Input**: Design documents from `/specs/020-domain-registrar/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Schemas & Types)

**Purpose**: Define Zod schemas and TypeScript types for all entities and tool inputs

- [ ] T001 [US1] Define Zod schemas for domain-related enums (DomainStatus, AutoRenewStatus, DnssecStatus, RegistrarLockStatus, TransferStatus) in `src/tools/domain-registrar/types.ts`
- [ ] T002 [P] [US1] Define Zod schemas for Domain, DomainAvailability entities in `src/tools/domain-registrar/types.ts`
- [ ] T003 [P] [US2] Define Zod schema for Contact entity in `src/tools/domain-registrar/types.ts`
- [ ] T004 [P] [US3] Define Zod schema for Tld entity in `src/tools/domain-registrar/types.ts`
- [ ] T005 [P] [US1] Define Zod schemas for domain tool inputs (ListDomains, GetDomain, RegisterDomain, RenewDomain, TransferDomain, UpdateDomain, EnableAutoRenew, DisableAutoRenew, CheckDomainAvailability) in `src/tools/domain-registrar/types.ts`
- [ ] T006 [P] [US2] Define Zod schemas for contact tool inputs (ListContacts, GetContact, CreateContact, UpdateContact) in `src/tools/domain-registrar/types.ts`
- [ ] T007 [P] [US3] Define Zod schemas for TLD tool inputs (ListTlds, GetTld) in `src/tools/domain-registrar/types.ts`

---

## Phase 2: Foundation (API Client Helper)

**Purpose**: Create the Domain Registrar-specific API helper that wraps the shared client

- [ ] T008 Implement Domain Registrar API helper functions in `src/tools/domain-registrar/handlers.ts` (HTTP request wrappers with `/domain/v2beta1` prefix)

**Checkpoint**: API helper ready, tool implementations can begin

---

## Phase 3: User Story 1 - Domain Management (Priority: P1)

**Goal**: Full domain lifecycle management via MCP tools

**Independent Test**: List, get, register, renew, transfer, update, auto-renew, availability check

### Implementation

- [ ] T009 [US1] Implement `scaleway_domain_registrar_list_domains` handler in `src/tools/domain-registrar/handlers.ts`
- [ ] T010 [P] [US1] Implement `scaleway_domain_registrar_get_domain` handler in `src/tools/domain-registrar/handlers.ts`
- [ ] T011 [P] [US1] Implement `scaleway_domain_registrar_register_domain` handler in `src/tools/domain-registrar/handlers.ts`
- [ ] T012 [P] [US1] Implement `scaleway_domain_registrar_renew_domain` handler in `src/tools/domain-registrar/handlers.ts`
- [ ] T013 [P] [US1] Implement `scaleway_domain_registrar_transfer_domain` handler in `src/tools/domain-registrar/handlers.ts`
- [ ] T014 [P] [US1] Implement `scaleway_domain_registrar_update_domain` handler in `src/tools/domain-registrar/handlers.ts`
- [ ] T015 [P] [US1] Implement `scaleway_domain_registrar_enable_auto_renew` handler in `src/tools/domain-registrar/handlers.ts`
- [ ] T016 [P] [US1] Implement `scaleway_domain_registrar_disable_auto_renew` handler in `src/tools/domain-registrar/handlers.ts`
- [ ] T017 [P] [US1] Implement `scaleway_domain_registrar_check_domain_availability` handler in `src/tools/domain-registrar/handlers.ts`
- [ ] T018 [US1] Register domain tools in `src/tools/domain-registrar/index.ts`

### Tests

- [ ] T019 [US1] Unit tests for domain handlers in `tests/unit/tools/domain-registrar/handlers.test.ts`
- [ ] T020 [US1] Contract tests for domain tools in `tests/contract/tools/domain-registrar/contract.test.ts`

**Checkpoint**: Domain management fully functional

---

## Phase 4: User Story 2 - Contact Management (Priority: P2)

**Goal**: Contact CRUD via MCP tools

### Implementation

- [ ] T021 [US2] Implement contact handler functions (list, get, create, update) in `src/tools/domain-registrar/handlers.ts`
- [ ] T022 [US2] Register contact tools in `src/tools/domain-registrar/index.ts`

### Tests

- [ ] T023 [US2] Unit tests for contact handlers in `tests/unit/tools/domain-registrar/handlers.test.ts`
- [ ] T024 [US2] Contract tests for contact tools in `tests/contract/tools/domain-registrar/contract.test.ts`

**Checkpoint**: Contact management fully functional

---

## Phase 5: User Story 3 - TLD Lookups (Priority: P3)

**Goal**: TLD information retrieval via MCP tools

### Implementation

- [ ] T025 [US3] Implement TLD handler functions (list, get) in `src/tools/domain-registrar/handlers.ts`
- [ ] T026 [US3] Register TLD tools in `src/tools/domain-registrar/index.ts`

### Tests

- [ ] T027 [US3] Unit tests for TLD handlers in `tests/unit/tools/domain-registrar/handlers.test.ts`
- [ ] T028 [US3] Contract tests for TLD tools in `tests/contract/tools/domain-registrar/contract.test.ts`

**Checkpoint**: TLD lookups fully functional

---

## Phase 6: Polish & Cross-Cutting

- [ ] T029 Update `tests/parity-matrix.json` with all Domain Registrar API operations
- [ ] T030 Verify 100% code coverage
- [ ] T031 Run lint and type check

---

## Dependencies & Execution Order

- **Phase 1**: No dependencies - Zod schemas first
- **Phase 2**: Depends on Phase 1 (schemas needed for handlers)
- **Phase 3-5**: All depend on Phase 2 (API helper). Can be done sequentially P1->P2->P3
- **Phase 6**: Depends on all implementation phases
