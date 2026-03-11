# Research: CI Build Pipeline

**Feature**: 039-ci-build-pipeline | **Date**: 2026-03-11

## Decision 1: Bun Setup Action

**Decision**: Use `oven-sh/setup-bun@v2` with explicit version pinning (`bun-version: "1.3.6"`)

**Rationale**: Official Bun setup action, well-maintained, supports version pinning. Pinning to the project's current Bun version (1.3.6) prevents CI/local divergence.

**Alternatives considered**:
- Manual Bun installation via curl — fragile, no caching integration, slower
- No version pin (use latest) — risks breaking builds from Bun upgrades

## Decision 2: Dependency Caching Strategy

**Decision**: Cache `~/.bun/install/cache` (global package cache) using `bun.lock` hash as cache key

**Rationale**: Caching the global Bun package cache is faster and more reliable than caching `node_modules/`. The lockfile hash ensures cache invalidation on dependency changes. The `oven-sh/setup-bun@v2` action does NOT have built-in caching, so we use `actions/cache@v4` explicitly.

**Alternatives considered**:
- Cache `node_modules/` — larger, platform-sensitive, includes dev symlinks
- No caching — clean installs add 10-30s per job on every run
- `setup-bun` built-in cache — not available in v2

## Decision 3: Job Parallelization Strategy

**Decision**: Four parallel jobs: `lint`, `typecheck`, `test`, `parity`

**Rationale**: Matches FR-008 requirement for separate parallel jobs. Each job reports independently as a GitHub status check, enabling granular branch protection. Total pipeline time equals the slowest job (~2-3 min) rather than sum of all (~6-10 min sequential).

**Alternatives considered**:
- Single job with sequential steps — slower, monolithic status check, violates FR-008
- Three jobs (merge parity into test) — parity is logically distinct from test coverage; separate jobs give clearer failure signals

## Decision 4: Coverage Reporting

**Decision**: Vitest with V8 provider, `json-summary` + `text` reporters. Parse `coverage-summary.json` with `jq` for GitHub Job Summary. Upload full coverage report as artifact (7-day retention).

**Rationale**: Existing vitest config already enforces 100% thresholds. The `json-summary` reporter enables machine-parseable output for job summaries. Artifact upload allows detailed review when needed. 7-day retention balances storage costs with debugging needs.

**Alternatives considered**:
- External coverage services (Codecov, Coveralls) — adds external dependency, violates Principle V (YAGNI), not needed since we enforce 100% in vitest
- Coverage comments on PRs — adds complexity; job summary is sufficient and natively supported

## Decision 5: Build Status Badge

**Decision**: Native GitHub Actions badge using `![CI](https://github.com/feedback-loop-ai/mcp-scaleway/actions/workflows/ci.yml/badge.svg)` in README.md

**Rationale**: Zero external dependencies. Auto-updates. Standard approach. References the workflow file directly.

**Alternatives considered**:
- shields.io badges — external service dependency, potential downtime
- Custom badge generation — over-engineering for a standard need

## Decision 6: Lint Execution

**Decision**: Run `bun run lint` (which invokes `biome check .`) as the lint step

**Rationale**: Uses the project's existing lint script. Biome is already configured via `biome.json`. No need for a separate Biome GitHub Action.

**Alternatives considered**:
- `biomejs/setup-biome` action — adds complexity, project already has Biome as a dev dependency
- Direct `biome check .` invocation — bypasses package.json script indirection

## Decision 7: Branch Protection Configuration

**Decision**: Document which status checks to require; actual branch protection configured manually via GitHub UI (out of scope per spec clarification)

**Rationale**: Spec explicitly states "Workflow only; branch protection configured manually (with documentation)". The workflow provides named checks (`lint`, `typecheck`, `test`, `parity`) that admins can reference in branch protection rules.

**Alternatives considered**:
- Automate branch protection via GitHub API — out of scope, requires admin token, fragile

## Decision 8: Concurrency Control

**Decision**: Use GitHub Actions `concurrency` with group `${{ github.workflow }}-${{ github.ref }}` and `cancel-in-progress: true`

**Rationale**: Satisfies FR-014 (cancel in-progress runs on new push). Groups by workflow + branch ref so runs on different branches don't cancel each other. Proven pattern from mcp-ory-kratos reference.

**Alternatives considered**:
- No concurrency control — wastes runner minutes on obsolete builds
- Manual cancellation — poor developer experience

## Decision 9: API Parity Validation

**Decision**: Separate `parity` job running `bun run test:parity` to validate parity-matrix.json completeness

**Rationale**: This is unique to mcp-scaleway (not present in mcp-ory-kratos reference). The parity validation ensures every Scaleway API operation has a contract test. Running it as a separate job provides a distinct status check per FR-008.

**Alternatives considered**:
- Merge into test job — loses independent status reporting
- Custom script — `test:parity` script already exists and works

## Known Issues

1. **Bun lockfile format**: `bun.lock` is a text-based lockfile (Bun v1.2+). Cache key should use `hashFiles('bun.lock')`.
2. **Coverage output path**: Vitest does not specify `reportsDirectory` in the current config — defaults to `./coverage/`. Need to add `json-summary` to reporters for CI parsing.
3. **Timeout tuning**: Initial timeouts (5 min for lint/typecheck, 10 min for test/parity) may need adjustment based on actual runtime data.
