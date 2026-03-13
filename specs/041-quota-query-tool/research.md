# Research: Quota Query Tool

**Feature Branch**: `041-quota-query-tool`
**Date**: 2026-03-13

## Research Task 1: Confirm Scaleway Quota API Endpoint

**Context**: Spec assumption states "Scaleway exposes project-scoped quotas via their Account API. The exact endpoint path MUST be confirmed during the planning phase."

### Findings

**Decision**: Scaleway does NOT currently expose a public REST API for querying quotas.

**Evidence**:
1. **Account API v3** (`https://api.scaleway.com/account/v3`) only contains Project CRUD endpoints: `GET/POST /projects`, `GET/PATCH/DELETE /projects/{id}`. No quota endpoints exist.
2. **Scaleway Feature Request #706** ("API and Observability for quotas") — open since August 17, 2023 — explicitly requests REST API access to quotas. No official Scaleway response or timeline provided. Only 2 votes, minimal engagement.
3. **SDK package search**: `@scaleway/sdk-account` v2.3.1 contains only `Accountv3.ProjectAPI`. No `QuotaAPI` class exists. No `@scaleway/sdk-quota` package exists on npm.
4. **Scaleway developer docs** (`developers.scaleway.com/api/account/project-api/`) only document Project endpoints.
5. **Console-only access**: Scaleway documentation states quotas are viewable via Organization Dashboard > Quotas tab in the console UI.

**Alternatives Considered**:
- **Reverse-engineer console API**: The Scaleway console UI must call some internal API to display quotas. This could be discovered via browser DevTools, but would be undocumented, unsupported, and liable to break without notice. **Rejected** — violates Constitution Principle III (Contract-First API Design) and Principle V (Simplicity/YAGNI).
- **Aggregate from individual product APIs**: Some product APIs (Instances, K8s, etc.) may expose per-resource limits. This would require calling every product API and aggregating — complex, incomplete, and fragile. **Rejected** — no standard quota response shape across products.
- **Wait for Scaleway**: Monitor feature request #706 and implement when the API becomes available. **Recommended** — ensures stable, supported implementation.

## Research Task 2: Quota Data Shape (from SDK error types)

**Context**: What does Scaleway's quota data look like?

### Findings

**Decision**: The `QuotasExceededError` in `@scaleway/sdk-client` reveals the canonical quota shape.

**Shape** (from `node_modules/@scaleway/sdk-client/dist/scw/errors/standard/quotas-exceeded-error.d.ts`):

```typescript
interface QuotasExceededErrorScope {
  kind: 'organization' | 'project';
  id: string;
}

interface QuotasExceededErrorDetails {
  readonly resource: string;    // e.g., "instances"
  readonly quota: number;       // maximum limit
  readonly current: number;     // current usage
  readonly scope?: QuotasExceededErrorScope;
}
```

**Key insights**:
- Quotas are scoped to either `organization` or `project` level
- Each quota has: `resource` (name), `quota` (limit), `current` (usage)
- This shape is only returned in error responses when quota is exceeded — not queryable proactively

**Rationale**: This data shape should inform the data model and contracts for when the API becomes available.

## Research Task 3: Existing Codebase Patterns for Raw HTTP Client

**Context**: The spec assumes using raw HTTP client pattern since no SDK package exists.

### Findings

**Decision**: The K8s tools (`src/tools/k8s/handlers.ts`) provide the reference pattern for raw HTTP client usage.

**Pattern**:
- `getClient()` → `loadAuthConfig()` + `createScalewayClient(config)`
- `client.fetch<T>({ method, path, urlParams, body })` for direct API calls
- `buildParams()` for query parameter construction
- `paginationToQuery()` + `buildPaginatedResponse()` for pagination
- `formatSuccess()` / `formatErrorResponse(mapScalewayError(error))` for responses
- All handlers wrapped in try-catch

**Rationale**: When the quota API becomes available, the K8s pattern is the correct implementation template — it uses the raw HTTP client without an SDK wrapper.

## Research Task 4: Tool Registration Pattern

**Context**: How to register new tools in the MCP server.

### Findings

**Decision**: Follow the established 3-file pattern per tool directory.

**Files needed** (per `src/tools/{product}/`):
1. `types.ts` — Zod schemas for input/output, exported types
2. `handlers.ts` — Async handler functions with error handling
3. `index.ts` — `register{Product}Tools(server: McpServer)` function

**Registration**: Add to `src/tools/index.ts` in the "Account & Billing" section alongside `registerAccountTools` and `registerBillingTools`.

**Tool naming**: `scaleway_quotas_list`, `scaleway_quotas_get`

## Summary

| Unknown | Resolution | Status |
|---------|-----------|--------|
| Quota API endpoint | Does not exist in public Scaleway API | BLOCKER |
| Quota data shape | Known from `QuotasExceededError` SDK type | Resolved |
| Implementation pattern | K8s raw HTTP client pattern | Resolved |
| Tool registration | Standard 3-file pattern + index.ts update | Resolved |
