# Contract: Release Workflow

**Feature**: 040-release-pipeline | **Date**: 2026-03-11

## Overview

This contract defines the interface of the GitHub Actions release workflow — its triggers, jobs, inputs, outputs, and quality gates.

## Trigger Contract

**Event**: `push` with tag filters

```yaml
on:
  push:
    tags:
      - 'v[0-9]+.[0-9]+.[0-9]+'        # stable: v1.0.0
      - 'v[0-9]+.[0-9]+.[0-9]+-*'       # pre-release: v1.0.0-beta.0
```

**Invariant**: Only semantic version tags trigger the workflow. Branch pushes and PRs do NOT trigger it.

## Job Contract

### Job 1: validate

| Property | Value |
|----------|-------|
| Timeout | 10 minutes |
| Runner | ubuntu-latest |
| Runtime | Bun 1.3.6 |
| Steps | install → lint → type-check → test |

**Pre-conditions**: Tag exists on a commit reachable from main
**Post-conditions**: All lint rules pass, zero TypeScript errors, 100% test coverage
**Failure behavior**: Pipeline aborts; build and publish jobs do not run

### Job 2: build

| Property | Value |
|----------|-------|
| Timeout | 5 minutes |
| Runner | ubuntu-latest |
| Runtime | Bun 1.3.6 |
| Depends on | validate |
| Artifact | dist/index.js (uploaded, 1-day retention) |

**Pre-conditions**: validate job succeeded
**Post-conditions**:
- `dist/index.js` exists
- First line is `#!/usr/bin/env node`
- Package size < 5MB (5,242,880 bytes)

**Failure behavior**: Pipeline aborts; publish job does not run

### Job 3: publish

| Property | Value |
|----------|-------|
| Timeout | 10 minutes |
| Runner | ubuntu-latest |
| Runtime | Node.js 22 (for npm publish) |
| Depends on | build |
| Permissions | contents: write, id-token: write |

**Pre-conditions**: build job succeeded, artifact downloaded
**Post-conditions**:
- Package published to npm with correct version and dist-tag
- GitHub Release created with auto-generated notes
- SLSA provenance attestation attached

**Failure behavior**: Single retry with 10-second delay. If retry fails, pipeline fails with clear error.

## Dist-Tag Mapping Contract

| Tag Pattern | npm dist-tag | Example |
|-------------|-------------|---------|
| `v1.0.0` (no suffix) | `latest` | `npm install mcp-scaleway` |
| `v1.0.0-alpha.0` | `alpha` | `npm install mcp-scaleway@alpha` |
| `v1.0.0-beta.0` | `beta` | `npm install mcp-scaleway@beta` |
| `v1.0.0-rc.0` | `rc` | `npm install mcp-scaleway@rc` |

## Build Output Contract

```
dist/index.js
├── Line 1: #!/usr/bin/env node
├── Format: ESM (ES modules)
├── Target: Node.js 18+
├── Dependencies: external (resolved by npm install)
└── Size: < 5MB
```

## Package Metadata Contract (package.json changes)

```json
{
  "bin": { "mcp-scaleway": "./dist/index.js" },
  "files": ["dist/", "README.md", "LICENSE"],
  "engines": { "node": ">=18.0.0" },
  "scripts": {
    "build": "bun run bun.build.ts"
  }
}
```

## Security Contract

| Mechanism | Purpose |
|-----------|---------|
| npm OIDC Trusted Publishing | Secretless authentication (no long-lived NPM_TOKEN) |
| `--provenance` flag | SLSA provenance attestation for supply chain security |
| `--access public` | Explicit public access (required for unscoped packages) |
| `id-token: write` permission | GitHub OIDC token issuance for npm |
| `contents: write` permission | GitHub Release creation |

## Existing CI Preservation Contract

The existing `.github/workflows/ci.yml` MUST NOT be modified. The release workflow is a separate, independent workflow file that replicates validation steps internally rather than depending on the CI workflow.
