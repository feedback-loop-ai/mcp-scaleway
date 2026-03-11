# Research: Scaleway Account MCP Tools

**Feature**: 035-account | **Date**: 2026-03-11

## Technology Decisions

### Scaleway SDK Account Package

The project uses `@scaleway/sdk-account` which provides the `Accountv3.ProjectAPI` class. This is a typed SDK that wraps the Scaleway Account v3 API. Unlike the Instances API which uses a generic HTTP client, the Account tools use the per-product SDK package directly.

API calls follow the pattern:
```typescript
const client = createScalewayClient(config);
const api = new Accountv3.ProjectAPI(client);
const response = await api.listProjects({ ... });
```

### Account API Structure

The Scaleway Account API is global (not zone- or region-scoped). Base URL pattern:
```
https://api.scaleway.com/account/v3/
```

Key endpoints:
- `GET /projects` - List projects (paginated)
- `GET /projects/{project_id}` - Get project
- `POST /projects` - Create project
- `PATCH /projects/{project_id}` - Update project
- `DELETE /projects/{project_id}` - Delete project

### Implementation Approach

The Account tools use the `@scaleway/sdk-account` package directly via `Accountv3.ProjectAPI`. This approach:
1. Provides full type safety from the SDK
2. Handles request marshalling automatically
3. Provides typed responses that are then formatted into MCP-friendly snake_case format

The handler functions instantiate the ProjectAPI, call the appropriate method, format the response with `formatProject()`, and return structured MCP content.

### Response Formatting

The SDK returns camelCase properties (e.g., `organizationId`, `createdAt`). The `formatProject()` helper maps these to snake_case for consistent MCP tool output:
- `organizationId` -> `organization_id`
- `createdAt` -> `created_at` (ISO 8601 string)
- `updatedAt` -> `updated_at` (ISO 8601 string)

### Error Handling

All Scaleway API errors are caught in try/catch blocks and processed through the shared `mapScalewayError` and `formatErrorResponse` functions from `src/shared/errors.ts`.

### Pagination

Scaleway uses `page` (1-indexed) and `pageSize` query parameters. Responses include a `totalCount` field. The list handler maps these to snake_case (`page_size`, `total_count`) in the response.

### Ordering

List projects supports ordering via `order_by` with values: `created_at_asc`, `created_at_desc`, `name_asc`, `name_desc`.
