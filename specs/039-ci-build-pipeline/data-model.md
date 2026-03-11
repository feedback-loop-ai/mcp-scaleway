# Data Model: CI Build Pipeline

**Feature**: 039-ci-build-pipeline | **Date**: 2026-03-11

This feature introduces CI configuration (YAML) rather than application code. The "data model" here describes the configuration entities and transient runtime entities managed by GitHub Actions.

## Configuration Entities

### Workflow Configuration

The CI workflow is defined in `.github/workflows/ci.yml`. This is the sole configuration artifact.

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Workflow display name: `"CI"` |
| `on.push.branches` | string[] | Trigger branches: `["*"]` (all branches) |
| `on.pull_request.branches` | string[] | PR target branches: `["main"]` |
| `concurrency.group` | string | Concurrency key: `${{ github.workflow }}-${{ github.ref }}` |
| `concurrency.cancel-in-progress` | boolean | Cancel stale runs: `true` |
| `env.BUN_VERSION` | string | Pinned Bun version: `"1.3.6"` |

### Job Definitions

| Job | Timeout | Purpose | Command |
|-----|---------|---------|---------|
| `lint` | 5 min | Biome linting | `bun run lint` |
| `typecheck` | 5 min | TypeScript type checking | `bun x tsc --noEmit` |
| `test` | 10 min | Unit + contract tests with 100% coverage | `bun run test -- --coverage.enabled --coverage.reporter=text --coverage.reporter=json-summary` |
| `parity` | 5 min | API parity matrix validation | `bun run test:parity` |

All jobs share the same setup steps: checkout → setup-bun → cache → install.

## Transient Runtime Entities (GitHub-managed)

These entities exist only during workflow execution and are managed entirely by GitHub Actions. They are not persisted in the repository.

### Pipeline Run
- Created automatically on push/PR events
- Contains: trigger source, commit SHA, branch, start time, status
- Retained by GitHub for 90 days (default)

### Validation Check (Job)
- One per parallel job (lint, typecheck, test, parity)
- Contains: job name, status (queued/in_progress/completed), conclusion (success/failure), duration, logs
- Reports as individual commit status check

### Build Status (Aggregate)
- Aggregate of all job conclusions
- Reported on the commit and PR checks tab
- Used by branch protection rules to gate merges

## State Transitions

```
Pipeline Run: queued → in_progress → completed (success|failure|cancelled)
Individual Job: queued → in_progress → completed (success|failure|cancelled)
```

A pipeline run is `cancelled` when a newer commit triggers concurrency cancellation (FR-014).

## Artifacts

| Artifact | Retention | Purpose |
|----------|-----------|---------|
| `coverage-report` | 7 days | Full V8 coverage report for detailed review |

## Validation Rules

- Lint job fails if Biome reports any violations
- Typecheck job fails if `tsc` reports any errors
- Test job fails if any test fails OR coverage drops below 100% (line + branch)
- Parity job fails if any parity-matrix entry lacks a corresponding contract test
