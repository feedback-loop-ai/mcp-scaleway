# Research: Release Pipeline

**Feature**: 040-release-pipeline | **Date**: 2026-03-11

## R1: Build Tool — Bun Bundler with Node.js Target

**Decision**: Use Bun's built-in bundler (`Bun.build()`) with `target: "node"` to produce a single ESM JavaScript file compatible with Node.js 18+.

**Rationale**: Bun is already the project runtime and package manager. Its bundler produces Node.js-compatible output without requiring additional tools. The reference mcp-ory-kratos project validates this approach in production.

**Alternatives considered**:
- **esbuild**: Would work but adds a dependency; Bun's bundler wraps esbuild internally
- **tsc only**: Produces multiple files, doesn't bundle dependencies, requires additional tooling for CLI distribution
- **tsup**: Wrapper around esbuild; unnecessary indirection when Bun.build() is available natively

**Implementation**: `bun.build.ts` script using `Bun.build({ entrypoints: ["./src/main.ts"], outdir: "./dist", target: "node", format: "esm" })` with external dependencies (kept as imports, not bundled — npm install resolves them). Post-processing adds `#!/usr/bin/env node` shebang.

## R2: npm Publishing Security — OIDC Trusted Publishing

**Decision**: Use npm OIDC Trusted Publishing via GitHub Actions for secretless releases after initial publish. NPM_TOKEN secret needed only for the first v0.1.0 release (before the package exists on npm and OIDC can be configured).

**Rationale**: OIDC eliminates long-lived npm tokens. GitHub Actions issues short-lived OIDC tokens that npm verifies. This is the recommended approach by both npm and GitHub. The `--provenance` flag additionally generates SLSA provenance attestations.

**Alternatives considered**:
- **NPM_TOKEN secret**: Works but requires manual rotation, risk of token leakage
- **GitHub Packages**: Would scope to GitHub ecosystem only; npm has broader reach

**Implementation**: Workflow uses `permissions: id-token: write` and `npm publish --provenance --access public`. Registry URL set to `https://registry.npmjs.org`.

## R3: Release Trigger — Semantic Version Tags

**Decision**: Trigger releases on git tags matching `v[0-9]+.[0-9]+.[0-9]+` (stable) and `v[0-9]+.[0-9]+.[0-9]+-(alpha|beta|rc)*` (pre-release).

**Rationale**: Tag-based triggers are the standard GitHub Actions pattern for releases. Semantic versioning is already assumed in the spec. Tag patterns enable automatic dist-tag assignment (alpha→alpha, beta→beta, rc→rc, stable→latest).

**Alternatives considered**:
- **Manual workflow_dispatch**: Adds friction, contradicts zero-manual-steps requirement
- **Push to main branch**: Would publish on every merge, not every intentional release
- **GitHub Releases UI**: Adds manual step; the workflow should create the release, not be triggered by it

**Implementation**: `on: push: tags: ['v[0-9]+.[0-9]+.[0-9]+', 'v[0-9]+.[0-9]+.[0-9]+-*']`

## R4: Retry Logic for npm Publish

**Decision**: Single automatic retry with 10-second delay for transient npm publish failures. Fail with clear error after second attempt.

**Rationale**: npm registry occasionally has transient errors. One retry handles most cases without masking persistent issues. The reference pipeline uses max 2 attempts.

**Alternatives considered**:
- **No retry**: Transient failures would require manual re-tagging
- **Multiple retries with backoff**: Over-engineering for a CI pipeline; 2 attempts is sufficient

**Implementation**: Shell script with attempt counter and `sleep 10` between attempts.

## R5: Pre-release Channel Management

**Decision**: Use npm dist-tags to manage release channels. Version string determines tag: `-alpha.*` → alpha, `-beta.*` → beta, `-rc.*` → rc, no pre-release suffix → latest.

**Rationale**: npm dist-tags are the standard mechanism for release channels. `npm install mcp-scaleway` always gets `latest`; `npm install mcp-scaleway@beta` gets the beta channel.

**Alternatives considered**:
- **Separate packages**: Would fragment the install experience
- **Branch-based publishing**: Complex and non-standard

**Implementation**: Shell conditional in workflow: extract version from tag, check for pre-release suffix, set `--tag` accordingly.

## R6: GitHub Release Notes

**Decision**: Use `gh release create` with `--generate-notes` for automatic release notes from merged PRs.

**Rationale**: GitHub's auto-generated notes are sufficient for a project of this scale. They list merged PRs and new contributors automatically.

**Alternatives considered**:
- **Conventional commits + changelog generator**: Over-engineering for current needs
- **Manual release notes**: Contradicts zero-manual-steps requirement

**Implementation**: `gh release create "$TAG" --generate-notes --prerelease` (with `--prerelease` flag conditional on version type).

## R7: Package Size Constraint

**Decision**: Enforce < 5MB package size in the build job via shell check before publish.

**Rationale**: Large packages slow installation and signal dependency bloat. 5MB is generous for a CLI proxy server.

**Implementation**: `npm pack --dry-run` to check size, fail if exceeds threshold. Also verify `dist/index.js` exists and has the correct shebang.

## R8: Dependencies — External vs Bundled

**Decision**: Keep all npm dependencies as external (not bundled into dist/index.js). Users install them via npm's dependency resolution.

**Rationale**: The Scaleway SDK packages are substantial. Bundling them would bloat the output and potentially break Node.js module resolution. Keeping them external means `npm install -g mcp-scaleway` resolves them normally.

**Alternatives considered**:
- **Bundle everything**: Would exceed 5MB size limit; potential compatibility issues
- **Bundle some, externalize others**: Complex to maintain; no clear benefit

**Implementation**: `Bun.build({ external: ["*"] })` or explicit external list matching package.json dependencies.

## R9: Workflow Job Structure

**Decision**: Three sequential jobs: Validate → Build → Publish. Each job has independent timeout.

**Rationale**: Sequential jobs ensure quality gates are enforced before expensive operations. Job isolation means a build failure doesn't run publish. Matches the reference pipeline structure.

**Implementation**:
- **validate** (10 min): lint, type-check, unit+contract tests
- **build** (5 min): bun build, shebang verify, size check, upload artifact
- **publish** (10 min): download artifact, npm publish with retry, GitHub release

## R10: Pre-release Workflow Trigger

**Decision**: Pre-releases are triggered by pushing pre-release version tags (e.g., `v1.0.0-beta.0`). No separate manual workflow needed.

**Rationale**: Simplicity — the same release.yml workflow handles both stable and pre-release versions. The tag format determines the npm dist-tag automatically.

**Alternatives considered**:
- **workflow_dispatch for pre-releases**: Adds complexity; tag-based is simpler and consistent
- **Separate pre-release workflow**: Duplicates logic unnecessarily
