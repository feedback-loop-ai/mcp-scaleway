# Tasks: File Storage Vertical

All tasks implemented in this change.

## Phase 1: Research
- [X] T001 Discover API slug/version/scoping (file/v1alpha1, region-scoped, Beta) — research.md
- [X] T002 Enumerate endpoints, entities, enums, pagination from official docs + Go SDK

## Phase 2: SDD Artifacts
- [X] T003 spec.md (user stories, FRs, out-of-scope)
- [X] T004 research.md (decisions + sources)
- [X] T005 plan.md
- [X] T006 data-model.md
- [X] T007 contracts/file-storage-tools.md
- [X] T008 quickstart.md
- [X] T009 checklists/requirements.md

## Phase 3: API Spec Doc
- [X] T010 specs/scaleway-api/file-storage/api-reference.md

## Phase 4: Implementation
- [X] T011 types.ts — enums, entities, request/response zod schemas
- [X] T012 handlers.ts — list/get/create/update/delete filesystems + list attachments
- [X] T013 index.ts — registerFileStorageTools with six tools

## Phase 5: Tests
- [X] T014 tests/unit/tools/file-storage.test.ts — all handlers, 100% line+branch
- [X] T015 tests/contract/file-storage/file-storage.contract.test.ts — all six tools

## Phase 6: Parity & Verification
- [X] T016 parity fragment (scratchpad/parity-fragments/file-storage.json)
- [X] T017 vitest green, biome clean, tsc clean for vertical files
