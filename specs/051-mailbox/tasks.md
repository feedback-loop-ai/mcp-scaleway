# Tasks: Scaleway Mailbox MCP Tools

**Input**: Design documents from `/specs/051-mailbox/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

All tasks are complete ([X]) — this feature was implemented alongside the SDD
artifacts.

## Phase 1: Setup (Schemas & Types)

**Purpose**: Define Zod schemas and TypeScript types for all entities and inputs

- [X] T001 [US1] Define enums and Domain/DomainRecord schemas in `src/tools/mailbox/types.ts`
- [X] T002 [P] [US1] Define Mailbox schemas and order-by enums in `src/tools/mailbox/types.ts`
- [X] T003 [P] [US2] Define Alias schemas in `src/tools/mailbox/types.ts`
- [X] T004 [US1] Define all tool input param schemas (domain/mailbox/alias) in `src/tools/mailbox/types.ts`

---

## Phase 2: Foundation (Client helper)

**Purpose**: Set up the shared client + response/error helpers for the area

- [X] T005 Implement `getClient`, `jsonResponse`, and the `MAILBOX_API_PREFIX` constant in `src/tools/mailbox/handlers.ts`

**Checkpoint**: Foundation ready, handlers can begin

---

## Phase 3: User Story 1 - Domain lifecycle (Priority: P1)

**Goal**: Domain CRUD + DNS record fetch & validation

- [X] T006 [US1] Implement `handleListDomains` in `src/tools/mailbox/handlers.ts`
- [X] T007 [P] [US1] Implement `handleGetDomain` in `src/tools/mailbox/handlers.ts`
- [X] T008 [P] [US1] Implement `handleCreateDomain` in `src/tools/mailbox/handlers.ts`
- [X] T009 [P] [US1] Implement `handleDeleteDomain` in `src/tools/mailbox/handlers.ts`
- [X] T010 [P] [US1] Implement `handleGetDomainRecords` in `src/tools/mailbox/handlers.ts`
- [X] T011 [P] [US1] Implement `handleValidateDomainRecords` in `src/tools/mailbox/handlers.ts`

**Checkpoint**: Domain lifecycle functional

---

## Phase 4: User Story 1 (cont.) - Mailbox lifecycle (Priority: P1)

**Goal**: Batch create + mailbox CRUD, update (subscription/password), restore

- [X] T012 [US1] Implement `handleCreateMailboxes` (batch) in `src/tools/mailbox/handlers.ts`
- [X] T013 [P] [US1] Implement `handleListMailboxes` in `src/tools/mailbox/handlers.ts`
- [X] T014 [P] [US1] Implement `handleGetMailbox` in `src/tools/mailbox/handlers.ts`
- [X] T015 [P] [US1] Implement `handleUpdateMailbox` in `src/tools/mailbox/handlers.ts`
- [X] T016 [P] [US1] Implement `handleDeleteMailbox` in `src/tools/mailbox/handlers.ts`
- [X] T017 [P] [US1] Implement `handleRestoreMailbox` in `src/tools/mailbox/handlers.ts`

**Checkpoint**: Mailbox lifecycle functional

---

## Phase 5: User Story 2 - Alias management (Priority: P2)

**Goal**: Alias CRUD

- [X] T018 [US2] Implement `handleCreateAlias` in `src/tools/mailbox/handlers.ts`
- [X] T019 [P] [US2] Implement `handleListAliases` in `src/tools/mailbox/handlers.ts`
- [X] T020 [P] [US2] Implement `handleGetAlias` in `src/tools/mailbox/handlers.ts`
- [X] T021 [P] [US2] Implement `handleDeleteAlias` in `src/tools/mailbox/handlers.ts`

**Checkpoint**: Alias management functional

---

## Phase 6: Registration

- [X] T022 Register all 16 tools via `registerMailboxTools` in `src/tools/mailbox/index.ts`

---

## Phase 7: Tests

- [X] T023 [US1] Unit tests for domain & mailbox handlers in `tests/unit/tools/mailbox.test.ts`
- [X] T024 [US2] Unit tests for alias handlers in `tests/unit/tools/mailbox.test.ts`
- [X] T025 Contract tests for all 16 tools in `tests/contract/mailbox/mailbox.contract.test.ts`

---

## Phase 8: Docs, Parity & Verification

- [X] T026 Write `specs/scaleway-api/mailbox/api-reference.md`
- [X] T027 Provide parity fragment (`parity-fragments/mailbox.json`) for the 16 operations
- [X] T028 Verify 100% line & branch coverage of `src/tools/mailbox/**`
- [X] T029 Run Biome (clean) and `tsc --noEmit` (clean for mailbox files)

---

## Dependencies & Execution Order

- **Phase 1** first (schemas). **Phase 2** depends on Phase 1.
- **Phases 3-5** depend on Phase 2; ordered P1 → P2.
- **Phase 6** after handlers exist. **Phase 7** after registration.
- **Phase 8** after implementation & tests.
