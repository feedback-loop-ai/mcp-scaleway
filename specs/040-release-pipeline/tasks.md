# Tasks: Release Pipeline

**Input**: Design documents from `/specs/040-release-pipeline/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in the feature specification. No test tasks generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and configuration file preparation

- [x] T001 Add `dist/` to `.gitignore` if not already present
- [x] T002 [P] Add `build` script entry to `package.json` scripts: `"build": "bun run bun.build.ts"`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build script that ALL user stories depend on — produces `dist/index.js` from source

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Create Bun bundler configuration in `bun.build.ts` with: entrypoint `./src/main.ts`, outdir `./dist`, target `node`, format `esm`, external dependencies (all packages from package.json), post-processing to prepend `#!/usr/bin/env node` shebang to `dist/index.js` (see research.md R1, R8)
- [x] T004 Verify build works locally: run `bun run build`, confirm `dist/index.js` exists, first line is `#!/usr/bin/env node`, file size < 5MB, and output runs on both runtimes (`node dist/index.js` and `bun dist/index.js` both start the server)

**Checkpoint**: Build script ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Install from Package Registry (Priority: P1) 🎯 MVP

**Goal**: Users can install via `npm install -g mcp-scaleway` and run the server as a global CLI command

**Independent Test**: Run `bun run build`, then `node dist/index.js` to verify built output runs. Verify `npm pack` produces a valid tarball under 5MB with correct files.

### Implementation for User Story 1

- [x] T005 [US1] Add `bin` field to `package.json`: `{ "mcp-scaleway": "./dist/index.js" }` (see contracts/release-workflow.md Package Metadata Contract)
- [x] T006 [US1] Add `files` field to `package.json`: `["dist/", "README.md", "LICENSE"]` to control published package contents
- [x] T007 [US1] Add `engines` field to `package.json`: `{ "node": ">=18.0.0" }` for Node.js version requirement
- [x] T008 [US1] Validate package locally: run `npm pack --dry-run` to verify only intended files are included and package size < 5MB (5,242,880 bytes)

**Checkpoint**: Package is installable — `npm pack` produces a valid tarball, `node dist/index.js` starts the server

---

## Phase 4: User Story 2 — Automated Version Release (Priority: P2)

**Goal**: Pushing a semantic version tag (e.g., `v1.0.0`) automatically validates, builds, and publishes to npm with a GitHub Release

**Independent Test**: Create a test tag push and verify the workflow YAML is syntactically valid with `actionlint`. Verify job dependencies and timeout values match the contract.

### Implementation for User Story 2

- [x] T009 [US2] Create `.github/workflows/release.yml` with workflow trigger: `on: push: tags: ['v[0-9]+.[0-9]+.[0-9]+', 'v[0-9]+.[0-9]+.[0-9]+-*']` and top-level permissions (see contracts/release-workflow.md Trigger Contract)
- [x] T010 [US2] Add `validate` job to `release.yml`: ubuntu-latest runner, Bun 1.3.6 via `oven-sh/setup-bun@v2`, 10-minute timeout, steps: checkout → install (`bun install --frozen-lockfile`) → lint (`bun run lint`) → type-check (`bun x tsc --noEmit`) → test (`bun x vitest run --config tests/vitest.config.ts --dir tests/unit && bun x vitest run --config tests/vitest.config.ts --dir tests/contract` with coverage enforcement)
- [x] T011 [US2] Add `build` job to `release.yml`: depends on `validate`, ubuntu-latest runner, Bun 1.3.6, 5-minute timeout, steps: checkout → install → build (`bun run build`) → verify shebang (`head -c 21 dist/index.js` equals `#!/usr/bin/env node`) → size check (`npm pack --dry-run` output < 5MB) → upload artifact (`actions/upload-artifact@v4` with `dist/` directory, 1-day retention)
- [x] T012 [US2] Add `publish` job to `release.yml`: depends on `build`, ubuntu-latest runner, Node.js 22 via `actions/setup-node@v4` with `registry-url: https://registry.npmjs.org`, 10-minute timeout, permissions `contents: write` + `id-token: write`, steps: checkout → download artifact → install deps (`npm ci`) → extract version from tag → npm publish with `--provenance --access public` and single retry with 10-second delay. Auth: uses `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` env var for initial publish; after first release, configure npm OIDC Trusted Publishing in npm settings and remove the NPM_TOKEN secret (see research.md R2, R4)
- [x] T013 [US2] Add GitHub Release creation step to publish job: `gh release create "$TAG" --generate-notes` with `GITHUB_TOKEN` env var (see research.md R6)

**Checkpoint**: Stable version tag push triggers full validate → build → publish pipeline automatically

---

## Phase 5: User Story 3 — Pre-release Testing (Priority: P3)

**Goal**: Maintainers can publish pre-release versions (alpha, beta, rc) that install via `npm install mcp-scaleway@beta` without affecting the stable `latest` tag

**Independent Test**: Verify the dist-tag extraction logic correctly maps `v1.0.0-beta.0` → `beta`, `v1.0.0-alpha.1` → `alpha`, `v1.0.0-rc.0` → `rc`, and `v1.0.0` → `latest`.

### Implementation for User Story 3

- [x] T014 [US3] Add dist-tag extraction logic to the publish job in `.github/workflows/release.yml`: parse tag for pre-release suffix (`alpha`, `beta`, `rc`), set `--tag` flag accordingly, default to `latest` for stable versions (see contracts/release-workflow.md Dist-Tag Mapping Contract, research.md R5)
- [x] T015 [US3] Add `--prerelease` flag conditionally to `gh release create` step when publishing a pre-release version in `.github/workflows/release.yml` (see research.md R6)

**Checkpoint**: Pre-release tags (e.g., `v1.0.0-beta.0`) publish with correct npm dist-tag and GitHub pre-release flag

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation and documentation

- [x] T016 Run full local build and verify end-to-end: `bun run build` → `node dist/index.js` starts server → `npm pack --dry-run` shows correct files under 5MB
- [x] T017 Verify existing CI workflow `.github/workflows/ci.yml` is NOT modified (contracts/release-workflow.md Existing CI Preservation Contract)
- [x] T018 Run quickstart.md validation: verify developer build commands work (`bun run build`, `head -1 dist/index.js`, `ls -lh dist/index.js`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational (Phase 2) — package metadata for installability
- **US2 (Phase 4)**: Depends on Foundational (Phase 2) — release workflow uses build script
- **US3 (Phase 5)**: Depends on US2 (Phase 4) — extends the release workflow with pre-release logic
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — no dependency on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) — no dependency on US1 (workflow is independent)
- **User Story 3 (P3)**: Depends on US2 (Phase 4) — extends release.yml created in US2

### Within Each User Story

- US1: Package metadata tasks (T005–T007) are parallelizable [P] is omitted because they all modify the same file (`package.json`)
- US2: Workflow jobs are sequential (validate → build → publish mirrors job dependency chain)
- US3: Both tasks modify `release.yml` and must be sequential

### Parallel Opportunities

- T001 and T002 can run in parallel (different files)
- US1 (Phase 3) and US2 (Phase 4) can run in parallel after Foundational phase completes (different files: `package.json` vs `.github/workflows/release.yml`)
- T005, T006, T007 modify `package.json` so must be sequential or combined

---

## Parallel Example: US1 + US2 After Foundational

```bash
# After Phase 2 (Foundational) completes, launch US1 and US2 in parallel:

# Stream 1: User Story 1 (package.json metadata)
Task: T005 "Add bin field to package.json"
Task: T006 "Add files field to package.json"
Task: T007 "Add engines field to package.json"
Task: T008 "Validate package locally"

# Stream 2: User Story 2 (release workflow)
Task: T009 "Create release.yml with trigger"
Task: T010 "Add validate job"
Task: T011 "Add build job"
Task: T012 "Add publish job"
Task: T013 "Add GitHub Release creation"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T002)
2. Complete Phase 2: Foundational (T003–T004)
3. Complete Phase 3: User Story 1 (T005–T008)
4. **STOP and VALIDATE**: Run `bun run build && npm pack --dry-run` — package is installable
5. Merge to main if ready — users can install from source/tarball

### Incremental Delivery

1. Complete Setup + Foundational → Build script works
2. Add User Story 1 → Package installable via npm (MVP!)
3. Add User Story 2 → Automated releases on tag push
4. Add User Story 3 → Pre-release channels for testing
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (package.json metadata)
   - Developer B: User Story 2 (release workflow)
3. After US2 is complete:
   - Developer B: User Story 3 (pre-release support)
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- No test tasks generated — feature is CI/CD configuration only (no new runtime source code)
- Existing CI workflow (ci.yml) must NOT be modified
- All package.json changes are metadata-only (bin, files, engines, scripts)
- Build output (dist/) is gitignored — never committed
