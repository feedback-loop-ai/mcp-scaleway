# Data Model: Release Pipeline

**Feature**: 040-release-pipeline | **Date**: 2026-03-11

## Entities

This feature involves CI/CD configuration entities, not runtime data models. The "data model" describes the structure and relationships of configuration files and artifacts.

### Package (package.json metadata)

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| name | string | `mcp-scaleway` | Must be valid npm package name |
| version | string | SemVer (e.g., `0.1.0`) | Must match `[0-9]+.[0-9]+.[0-9]+(-[a-z]+.[0-9]+)?` |
| bin | object | `{ "mcp-scaleway": "./dist/index.js" }` | Path must exist after build |
| files | string[] | `["dist/", "README.md", "LICENSE"]` | Only distributable files |
| engines | object | `{ "node": ">=18.0.0" }` | Minimum Node.js version |
| type | string | `"module"` | ESM package (already set) |

### Version Tag (git tag)

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| name | string | e.g., `v1.0.0`, `v1.0.0-beta.0` | Must match `v[0-9]+.[0-9]+.[0-9]+(-[a-z]+(\.[0-9]+)?)?` |
| type | enum | `stable \| alpha \| beta \| rc` | Derived from tag suffix |
| npm_dist_tag | string | `latest \| alpha \| beta \| rc` | Mapped from type |

### Build Artifact (dist/index.js)

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| path | string | `dist/index.js` | Must exist after build |
| shebang | string | `#!/usr/bin/env node` | First line must be shebang |
| format | string | ESM (ES modules) | Bun bundler output |
| target | string | Node.js 18+ | Compatible JavaScript output |
| max_size | number | 5MB (5,242,880 bytes) | CI gate enforced |

### Release (GitHub Release + npm package)

| Field | Type | Description |
|-------|------|-------------|
| tag | string | Git version tag that triggered the release |
| npm_version | string | Published npm version (tag without `v` prefix) |
| npm_dist_tag | string | `latest`, `alpha`, `beta`, or `rc` |
| github_release | object | Auto-generated release with notes from merged PRs |
| provenance | boolean | SLSA provenance attestation via `--provenance` flag |

## State Transitions

```
Tag Push → Validate → Build → Publish → Released
              ↓          ↓        ↓
           FAILED     FAILED   FAILED (retry once → FAILED)
```

- **Tag Push**: Maintainer pushes `v*` tag to repository
- **Validate**: Lint + type-check + tests must all pass
- **Build**: Bun bundler produces dist/index.js, size check passes
- **Publish**: npm publish with provenance + GitHub release creation
- **FAILED**: Any stage failure aborts the pipeline; tag remains for retry after fix

## Relationships

```
Version Tag (v1.0.0)
  ├── triggers → Release Workflow
  │     ├── validates → Package (lint, types, tests)
  │     ├── produces → Build Artifact (dist/index.js)
  │     └── publishes → Release
  │           ├── npm package (mcp-scaleway@1.0.0)
  │           └── GitHub Release (with auto-notes)
  └── references → Package.version (must match)
```

## Configuration Files

| File | Purpose | New/Modified |
|------|---------|-------------|
| `package.json` | Package metadata, bin entry, build script | Modified |
| `.github/workflows/release.yml` | Release pipeline workflow | New |
| `bun.build.ts` | Bun bundler configuration | New |
| `.gitignore` | Exclude dist/ from version control | Modified (if needed) |
