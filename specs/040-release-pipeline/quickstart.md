# Quickstart: Release Pipeline

**Feature**: 040-release-pipeline | **Date**: 2026-03-11

## For Users (Installing from npm)

```bash
# Install globally
npm install -g mcp-scaleway

# Verify installation
mcp-scaleway --help

# Or use with npx (no install)
npx mcp-scaleway
```

Configure in your MCP client (e.g., Claude Desktop):
```json
{
  "mcpServers": {
    "scaleway": {
      "command": "mcp-scaleway",
      "env": {
        "SCW_ACCESS_KEY": "your-access-key",
        "SCW_SECRET_KEY": "your-secret-key",
        "SCW_DEFAULT_PROJECT_ID": "your-project-id"
      }
    }
  }
}
```

## For Maintainers (Creating a Release)

### Stable Release

```bash
# Ensure you're on main with all changes merged
git checkout main
git pull origin main

# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0

# The release workflow triggers automatically:
# 1. Validates (lint, type-check, tests)
# 2. Builds (bun.build.ts → dist/index.js)
# 3. Publishes (npm + GitHub Release)
```

### Pre-release

```bash
# Beta release
git tag v1.1.0-beta.0
git push origin v1.1.0-beta.0

# Users install with: npm install mcp-scaleway@beta
```

### Monitoring a Release

```bash
# Check workflow status
gh run list --workflow=release.yml --limit=5

# Check npm publication
npm view mcp-scaleway version

# Check GitHub Release
gh release list --limit=5
```

## For Developers (Local Build)

```bash
# Build the distributable
bun run build

# Verify the output
head -1 dist/index.js  # Should show: #!/usr/bin/env node
ls -lh dist/index.js   # Should be < 5MB

# Test the built output
node dist/index.js
```

## Troubleshooting

| Issue | Solution |
|-------|---------|
| npm publish fails with 403 | OIDC not configured — add NPM_TOKEN secret for initial publish |
| Package size exceeds 5MB | Check for accidentally bundled dependencies in bun.build.ts |
| Shebang missing from dist/index.js | Verify bun.build.ts post-processing step |
| Tests fail during release | Fix tests on main first, then re-tag |
| Duplicate version tag | Delete tag (`git tag -d v1.0.0 && git push origin :refs/tags/v1.0.0`), fix, re-tag |
