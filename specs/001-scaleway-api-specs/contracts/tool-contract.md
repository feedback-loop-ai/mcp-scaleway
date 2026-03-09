# MCP Tool Contract Format

**Feature**: 001-scaleway-api-specs | **Date**: 2026-03-06

## Purpose

This document defines the standard contract format that every Scaleway MCP tool MUST follow. Each product SDD spec (002-037) will define its tools using this format.

## Tool Contract Template

Each tool in a product SDD spec MUST include:

```yaml
Tool: scaleway_{product}_{action}_{resource}
Title: {Human-readable title}
Description: {Action-oriented description with usage context}
Scaleway API: {HTTP_METHOD} /path/to/endpoint
Locality: zoned | regional | global

Input Schema:
  {field}: {zod_type} - {description} [required|optional]
  ...

Output Schema:
  {field}: {type} - {description}
  ...

Pagination: yes | no
  # If yes: page (number, optional), pageSize (number, optional)
  # Response includes totalCount

Error Codes:
  - {status_code}: {description} → MCP error mapping

Example Request:
  {JSON example of tool input}

Example Response:
  {JSON example of tool output}
```

## Naming Convention (FR-007)

Pattern: `scaleway_{product}_{action}_{resource}`

| Segment | Rules | Examples |
|---------|-------|---------|
| `product` | Lowercase, matches directory name | `instances`, `k8s`, `lb`, `dns`, `iam` |
| `action` | Verb: `list`, `get`, `create`, `update`, `delete`, + custom | `list`, `get`, `create`, `start`, `stop`, `reboot` |
| `resource` | Singular or plural matching the action | `servers` (list), `server` (get/create), `records` (list) |

Examples:
- `scaleway_instances_list_servers`
- `scaleway_instances_create_server`
- `scaleway_instances_start_server`
- `scaleway_k8s_list_clusters`
- `scaleway_dns_create_record`
- `scaleway_iam_list_api_keys`
- `scaleway_lb_get_load_balancer`

## Shared Input Parameters

### Locality Parameters

Tools MUST include the appropriate locality parameter based on the API product:

- **Zoned APIs**: `zone: z.string().describe('Availability zone (e.g., fr-par-1)')` — required
- **Regional APIs**: `region: z.string().describe('Region (e.g., fr-par)')` — required
- **Global APIs**: No locality parameter

### Pagination Parameters (for list operations)

```typescript
page: z.number().int().positive().optional().describe('Page number (default: 1)')
pageSize: z.number().int().min(1).max(100).optional().describe('Items per page (default: 50)')
```

## Shared Output Format

### List Operations

```typescript
{
  content: [{
    type: 'text',
    text: JSON.stringify({
      items: [...],       // Array of resources
      totalCount: number, // Total items across all pages
      page: number,       // Current page
      pageSize: number    // Items per page
    }, null, 2)
  }]
}
```

### Single Resource Operations

```typescript
{
  content: [{
    type: 'text',
    text: JSON.stringify(resource, null, 2)
  }]
}
```

### Error Responses

```typescript
{
  content: [{
    type: 'text',
    text: JSON.stringify({
      error: {
        type: 'not_found' | 'permission_denied' | 'invalid_input' | 'rate_limited' | 'server_error',
        message: 'Human-readable error description',
        statusCode: 404 | 403 | 400 | 429 | 500
      }
    }, null, 2)
  }],
  isError: true
}
```

## Contract Test Requirements (Constitution VIII)

Every tool contract MUST have a corresponding contract test that validates:

1. **Request shape**: All required fields present, types correct, constraints enforced
2. **Response shape**: Success and error payloads match documented schemas
3. **Pagination**: List operations support page/pageSize and return totalCount
4. **Auth**: Requests include authentication headers
5. **Error codes**: Each documented error code is tested

Contract tests MUST reference:
- The Scaleway API endpoint from `specs/scaleway-api/`
- The tool name and spec number
- The entry in `tests/parity-matrix.json`
