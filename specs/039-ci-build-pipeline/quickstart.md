# Quickstart: CI Build Pipeline

**Feature**: 039-ci-build-pipeline | **Date**: 2026-03-11

## Prerequisites

- Repository hosted on GitHub with Actions enabled
- Existing commands work locally:
  - `bun run lint` — no violations
  - `bun x tsc --noEmit` — no errors
  - `bun run test -- --coverage.enabled` — all tests pass with 100% coverage
  - `bun run test:parity` — parity matrix validation passes

## Implementation Steps

### Step 1: Create the CI Workflow

Create `.github/workflows/ci.yml` using the contract in `contracts/ci-workflow.yml` as the source of truth.

### Step 2: Add Coverage Reporters for CI

Update `tests/vitest.config.ts` to add `json-summary` reporter and explicit `reportsDirectory` so CI can parse coverage results:

```typescript
coverage: {
  provider: "v8",
  include: ["src/**/*.ts"],
  exclude: ["src/**/*.d.ts", "src/main.ts"],
  reportsDirectory: "coverage",
  thresholds: {
    lines: 100,
    branches: 100,
  },
},
```

The CI workflow will pass `--coverage.reporter=json-summary` at runtime to generate the parseable output.

### Step 3: Add Build Status Badge to README

Add the following badge after the first heading in `README.md`:

```markdown
[![CI](https://github.com/feedback-loop-ai/mcp-scaleway/actions/workflows/ci.yml/badge.svg)](https://github.com/feedback-loop-ai/mcp-scaleway/actions/workflows/ci.yml)
```

### Step 4: Push and Verify

```bash
git push origin 039-ci-build-pipeline
```

Verify on GitHub:
- Actions tab shows the CI workflow running
- Four parallel jobs visible (lint, typecheck, test, parity)
- All jobs complete successfully
- Coverage summary appears in the test job summary
- Badge renders on README

### Step 5: Configure Branch Protection (Manual)

After the first successful run, configure branch protection for `main`:

1. Go to **Settings → Branches → Branch protection rules → Add rule**
2. Branch name pattern: `main`
3. Enable **Require status checks to pass before merging**
4. Search and add required checks: `lint`, `typecheck`, `test`, `parity`
5. Enable **Require branches to be up to date before merging**
6. Save changes

## Validation Checklist

- [ ] `bun run lint` passes locally
- [ ] `bun x tsc --noEmit` passes locally
- [ ] `bun run test -- --coverage.enabled` passes with 100% coverage locally
- [ ] `bun run test:parity` passes locally
- [ ] Push triggers CI workflow on GitHub
- [ ] All 4 jobs run in parallel and pass
- [ ] Coverage summary visible in test job summary
- [ ] Coverage artifact uploaded
- [ ] Stale runs cancelled on new push to same branch
- [ ] Badge displays on README
- [ ] Branch protection rules configured (manual step)

## Troubleshooting

### Bun version mismatch
If CI fails with unexpected Bun errors, verify `BUN_VERSION` in the workflow matches the version in use locally (`bun --version`).

### Cache misses
On first run, there will be no cache. Subsequent runs on the same branch should hit the cache. If cache seems stale, the key is based on `bun.lock` hash — any dependency change invalidates it.

### Coverage threshold failures
The test job will fail if coverage drops below 100%. Run `bun run test -- --coverage.enabled` locally to identify uncovered lines before pushing.

### Parity validation failures
The parity job runs `bun run test:parity`. If it fails, check `tests/parity-matrix.json` for operations missing contract tests.

## Local Development Commands

```bash
# Run exactly what CI runs
bun run lint                                    # Lint job
bun x tsc --noEmit                             # Typecheck job
bun run test -- --coverage.enabled              # Test job
bun run test:parity                            # Parity job
```
