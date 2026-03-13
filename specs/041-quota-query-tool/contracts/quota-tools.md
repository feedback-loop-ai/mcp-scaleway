# MCP Tool Contracts: Quota Query Tool

**Feature Branch**: `041-quota-query-tool`
**Date**: 2026-03-13
**Status**: BLOCKED — Scaleway quota API does not exist (see research.md)

> **Note**: These contracts define the **target** MCP tool interfaces for when the Scaleway quota API becomes available. They are based on existing codebase patterns and the QuotasExceededError data shape.

## Tool: `scaleway_quotas_list`

**Description**: List all resource quotas for a Scaleway project showing current usage and limits

### Input Schema (Zod)

```typescript
const ListQuotasInput = z.object({
  project_id: z.string().uuid()
    .describe("Scaleway project ID to query quotas for"),
  region: z.string().optional()
    .describe("Filter by region (e.g., 'fr-par'). Omit to return all regions"),
  page: z.number().int().positive().optional().default(1)
    .describe("Page number (1-indexed)"),
  page_size: z.number().int().min(1).max(100).optional().default(50)
    .describe("Items per page (1-100)"),
});
```

### Success Response

```json
{
  "items": [
    {
      "resource": "instances",
      "current": 5,
      "quota": 100,
      "scope": { "kind": "project", "id": "<project-uuid>" }
    }
  ],
  "total_count": 42,
  "page": 1,
  "page_size": 50
}
```

### Error Responses

| Code | Condition | MCP Error |
|------|-----------|-----------|
| 401 | Invalid/expired credentials | Authentication error with actionable guidance |
| 403 | Insufficient permissions | Permission denied with required scope |
| 429 | Rate limit exceeded | Rate limit error with retry guidance |

### Scaleway API Mapping

- **Endpoint**: TBD — API does not yet exist
- **Expected**: `GET /account/v3/projects/{project_id}/quotas` (based on Account API v3 pattern)
- **Auth**: `X-Auth-Token` header (SCW secret key)
- **Pagination**: offset-based (`page`, `page_size`) with `total_count` in response

---

## Tool: `scaleway_quotas_get`

**Description**: Get quota details for a specific resource type within a Scaleway project

### Input Schema (Zod)

```typescript
const GetQuotaInput = z.object({
  project_id: z.string().uuid()
    .describe("Scaleway project ID"),
  resource_name: z.string().min(1)
    .describe("Resource type name (e.g., 'instances', 'snapshots', 'volumes')"),
});
```

### Success Response

```json
{
  "resource": "instances",
  "current": 5,
  "quota": 100,
  "scope": { "kind": "project", "id": "<project-uuid>" }
}
```

### Error Responses

| Code | Condition | MCP Error |
|------|-----------|-----------|
| 401 | Invalid/expired credentials | Authentication error with actionable guidance |
| 403 | Insufficient permissions | Permission denied with required scope |
| 404 | Resource name not found | Not found with valid resource names hint |
| 429 | Rate limit exceeded | Rate limit error with retry guidance |

### Scaleway API Mapping

- **Endpoint**: TBD — API does not yet exist
- **Expected**: `GET /account/v3/projects/{project_id}/quotas/{resource_name}` (based on Account API v3 pattern)
- **Auth**: `X-Auth-Token` header (SCW secret key)
