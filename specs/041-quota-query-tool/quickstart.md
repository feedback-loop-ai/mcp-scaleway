# Quickstart: Quota Query Tool

**Feature Branch**: `041-quota-query-tool`
**Date**: 2026-03-13
**Status**: BLOCKED — Scaleway quota API does not exist (see research.md)

## Overview

This feature adds two MCP tools for querying Scaleway project resource quotas:
- `scaleway_quotas_list` — List all quotas for a project
- `scaleway_quotas_get` — Get quota for a specific resource

## Implementation Quickstart (when unblocked)

### 1. Create source files

```
src/tools/quota/
├── types.ts      # Zod schemas (ListQuotasInput, GetQuotaInput)
├── handlers.ts   # Handler functions (raw HTTP client pattern from k8s/)
└── index.ts      # registerQuotaTools(server: McpServer)
```

### 2. Register tools

In `src/tools/index.ts`, add to the "Account & Billing" section:
```typescript
import { registerQuotaTools } from "./quota/index.js";
// ...
registerQuotaTools(server);
```

### 3. Add API spec

Create `specs/scaleway-api/quota/api-reference.md` documenting the actual Scaleway API endpoints once available.

### 4. Add tests

```
tests/unit/tools/quota/handlers.test.ts      # Mock client.fetch, test handlers
tests/contract/tools/quota/contract.test.ts  # Validate schemas + registration
```

### 5. Update parity matrix

Add entries to `tests/parity-matrix.json` for both `list_quotas` and `get_quota` operations.

### 6. Run validation

```bash
bun run lint
bun x tsc --noEmit
bun x vitest run --config tests/vitest.config.ts --dir tests/unit
bun x vitest run --config tests/vitest.config.ts --dir tests/contract
bun run test -- --coverage.enabled   # Must be 100%
bun run test:parity                  # Must pass
```

## Key Patterns to Follow

| Pattern | Reference |
|---------|-----------|
| Raw HTTP client | `src/tools/k8s/handlers.ts` |
| Zod schema types | `src/tools/account/types.ts` |
| Tool registration | `src/tools/account/index.ts` |
| Error handling | `src/shared/errors.ts` → `mapScalewayError()` |
| Pagination | `src/shared/pagination.ts` → `buildPaginatedResponse()` |
| Contract tests | `tests/contract/tools/k8s/contract.test.ts` |
| Unit tests | `tests/unit/tools/k8s/handlers.test.ts` |
