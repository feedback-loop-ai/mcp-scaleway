# Tasks: CI Build Pipeline

**Input**: Design documents from `/specs/039-ci-build-pipeline/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create directory structure and verify local prerequisites

- [x] T001 Create `.github/workflows/` directory structure
- [x] T002 Verify local commands pass: `bun run lint`, `bun x tsc --noEmit`, `bun run test -- --coverage.enabled`, `bun run test:parity` — NOTE: pre-existing lint, typecheck, and parity failures unrelated to CI setup

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Verify vitest coverage outputs to `coverage/` by default (no config change needed — vitest v8 provider defaults to `coverage/` directory)

- [x] T003 ~REMOVED~ — vitest default `reportsDirectory` is `coverage/`, matching CI expectations. No config change required. Verified by inspecting `tests/vitest.config.ts`.

**Checkpoint**: Foundation ready — workflow creation can begin

---

## Phase 3: User Story 1 — Automated Code Validation on Push (Priority: P1) 🎯 MVP

**Goal**: Code changes are automatically validated when pushed to any branch via four parallel GitHub Actions jobs (lint, type-check, test+coverage, API parity)

**Independent Test**: Push a commit to any branch and verify the CI workflow triggers with all 4 jobs running in parallel, each reporting pass/fail status

### Implementation for User Story 1

- [x] T004 [US1] Create CI workflow file at `.github/workflows/ci.yml` with workflow name `CI`, push trigger on all branches (`branches: ["*"]`), and concurrency group `${{ github.workflow }}-${{ github.ref }}` with `cancel-in-progress: true` per contracts/ci-workflow.yml (FR-001, FR-007, FR-014)
- [x] T005 [US1] Add shared `env.BUN_VERSION: "1.3.6"` to `.github/workflows/ci.yml` and implement the `lint` job: checkout → setup-bun → cache `~/.bun/install/cache` with key `bun-${{ runner.os }}-${{ hashFiles('bun.lock') }}` → `bun install --frozen-lockfile` → `bun run lint` with 5-minute timeout (FR-002, FR-010)
- [x] T006 [P] [US1] Add `typecheck` job to `.github/workflows/ci.yml`: same setup steps as lint → `bun x tsc --noEmit` with 5-minute timeout (FR-002)
- [x] T007 [P] [US1] Add `test` job to `.github/workflows/ci.yml`: same setup steps → `bun run test -- --coverage.enabled --coverage.reporter=text --coverage.reporter=json-summary` with 10-minute timeout (FR-002, FR-012)
- [x] T008 [P] [US1] Add `parity` job to `.github/workflows/ci.yml`: same setup steps → `bun run test:parity` with 5-minute timeout (FR-002, FR-013)

**Checkpoint**: Push to any branch triggers CI with 4 parallel jobs; each job reports pass/fail as a commit status check (FR-003) via GitHub Actions' native status reporting (FR-009). Verify both in T016. User Story 1 is fully functional.

---

## Phase 4: User Story 2 — Pull Request Validation Gate (Priority: P2)

**Goal**: Pull requests to `main` trigger validation and provide named status checks that can be used by branch protection rules to block merges

**Independent Test**: Create a PR to `main` with a failing check and verify the PR checks tab shows individual job statuses; verify merge is blocked after branch protection is manually configured

### Implementation for User Story 2

- [x] T009 [US2] Add `pull_request` trigger with `branches: [main]` to the `on:` block in `.github/workflows/ci.yml` (FR-004)
- [x] T010 [US2] Add branch protection documentation to `specs/039-ci-build-pipeline/quickstart.md` listing the four required status checks (`lint`, `typecheck`, `test`, `parity`) and step-by-step instructions for configuring GitHub branch protection rules (FR-004, Decision 7) — already present in quickstart.md Step 5

**Checkpoint**: PRs to main trigger CI; named status checks are available for branch protection configuration. User Story 2 is fully functional.

---

## Phase 5: User Story 3 — Validation Results Visibility (Priority: P3)

**Goal**: Developers can view detailed validation results via coverage job summaries, downloadable coverage artifacts, and a README badge showing build status

**Independent Test**: Trigger a CI run, verify coverage summary table appears in the test job summary, coverage artifact is downloadable, and the README badge reflects the current build status

### Implementation for User Story 3

- [x] T011 [US3] Add coverage summary step to the `test` job in `.github/workflows/ci.yml`: parse `coverage/coverage-summary.json` with `jq` and write lines/branches/functions/statements table to `$GITHUB_STEP_SUMMARY` (conditional on `if: always()`) (FR-005, FR-012)
- [x] T012 [US3] Add coverage artifact upload step to the `test` job in `.github/workflows/ci.yml`: use `actions/upload-artifact@v4` to upload `coverage/` directory as `coverage-report` with 7-day retention and `if-no-files-found: ignore` (FR-012)
- [x] T013 [US3] Add CI build status badge to `README.md` after the first heading: `[![CI](https://github.com/feedback-loop-ai/mcp-scaleway/actions/workflows/ci.yml/badge.svg)](https://github.com/feedback-loop-ai/mcp-scaleway/actions/workflows/ci.yml)` (FR-011, Decision 5)

**Checkpoint**: All validation results are visible — job summaries, artifacts, and badge. User Story 3 is fully functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [x] T014 Validate `.github/workflows/ci.yml` matches the design contract in `specs/039-ci-build-pipeline/contracts/ci-workflow.yml` (all FR requirements traced) — verified via diff, only comment differences
- [x] T015 Run quickstart.md local validation checklist: verify `bun run lint`, `bun x tsc --noEmit`, `bun run test -- --coverage.enabled`, and `bun run test:parity` all pass locally — pre-existing failures noted (lint format in .claude/worktrees, typecheck missing SDK modules, parity test failures)
- [ ] T016 Push branch and verify CI workflow executes successfully on GitHub with all 4 parallel jobs passing

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase — creates the core workflow file
- **User Story 2 (Phase 4)**: Depends on US1 (adds PR trigger to existing workflow file)
- **User Story 3 (Phase 5)**: Depends on US1 (adds reporting steps to existing workflow file); can run in parallel with US2 (different sections of the file)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Creates `.github/workflows/ci.yml` — must complete first as US2 and US3 modify this file
- **User Story 2 (P2)**: Adds PR trigger to existing workflow — can start after US1
- **User Story 3 (P3)**: Adds reporting steps and README badge — can start after US1; independent of US2

### Within Each User Story

- T004 → T005 (sequential: workflow skeleton before first job)
- T005 → T006, T007, T008 (parallel: additional jobs once lint job establishes the pattern)
- T011 → T012 (sequential: summary before artifact, both in test job)
- T013 is independent of T011/T012 (different file)

### Parallel Opportunities

- **Phase 3**: T006, T007, T008 can all run in parallel after T005 (different jobs in same file, non-overlapping sections)
- **Phase 5**: T013 (README badge) can run in parallel with T011/T012 (workflow reporting steps) — different files
- **Cross-story**: US2 and US3 can proceed in parallel after US1 completes (US2 modifies `on:` block, US3 modifies `test` job steps and README)

---

## Parallel Example: User Story 1

```bash
# After T005 (lint job) establishes the pattern, launch remaining jobs in parallel:
Task: "Add typecheck job to .github/workflows/ci.yml"
Task: "Add test job to .github/workflows/ci.yml"
Task: "Add parity job to .github/workflows/ci.yml"
```

## Parallel Example: User Story 3

```bash
# These touch different files and can run in parallel:
Task: "Add coverage summary step to test job in .github/workflows/ci.yml"
Task: "Add CI build status badge to README.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (directory structure + local verification)
2. Complete Phase 2: Foundational (vitest config update)
3. Complete Phase 3: User Story 1 (core workflow with push trigger and 4 parallel jobs)
4. **STOP and VALIDATE**: Push to branch, verify all 4 jobs run and pass
5. This alone delivers the core CI value

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Push and verify → **MVP delivered!**
3. Add User Story 2 → PR trigger + branch protection docs → PR gating ready
4. Add User Story 3 → Coverage summaries + badge → Full visibility
5. Polish → Final validation against contract

### Single Developer Strategy

Since all tasks modify at most 3 files (`.github/workflows/ci.yml`, `tests/vitest.config.ts`, `README.md`), the recommended approach is sequential story delivery: US1 → US2 → US3 → Polish.

---

## Notes

- [P] tasks = different files or non-overlapping sections, no dependencies
- [Story] label maps task to specific user story for traceability
- All FR requirements are traced from spec.md through contracts/ci-workflow.yml to tasks
- This feature modifies only 3 files: `.github/workflows/ci.yml` (new), `tests/vitest.config.ts` (minor update), `README.md` (badge addition)
- No changes to `src/` or `tests/` directories beyond vitest config
