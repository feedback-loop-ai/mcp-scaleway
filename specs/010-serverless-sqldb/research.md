# Research: Scaleway Serverless SQL DB MCP Tools

**Feature**: 010-serverless-sqldb | **Date**: 2026-03-11

## Technology Decisions

### Scaleway SDK Client Pattern

The project uses `@scaleway/sdk-client` with `createClient()`. The Serverless SQL DB API is accessed via the Scaleway REST API through the SDK client. The SDK client handles authentication, base URL routing, and region-based endpoint resolution.

API calls follow the pattern:
```typescript
const client = createScalewayClient(config);
// The SDK client provides fetch-like methods for Scaleway API endpoints
```

Since `@scaleway/sdk-client` provides a generic client, we make HTTP calls to the Serverless SQL DB API endpoints directly using the client's fetch method.

### Serverless SQL DB API Structure

The Scaleway Serverless SQL DB API is region-scoped and currently at v1alpha1 (alpha). Base URL pattern:
```
https://api.scaleway.com/serverless-sqldb/v1alpha1/regions/{region}/
```

Key endpoints:
- `GET /databases` - List databases (paginated)
- `GET /databases/{database_id}` - Get database
- `POST /databases` - Create database
- `PATCH /databases/{database_id}` - Update database (CPU scaling)
- `DELETE /databases/{database_id}` - Delete database
- `GET /backups` - List backups (filtered by database_id)
- `GET /backups/{backup_id}` - Get backup
- `POST /backups/{backup_id}/export` - Export backup (get download URL)
- `POST /databases/{database_id}/restore` - Restore database from backup

### Implementation Approach

The implementation uses the shared `@scaleway/sdk-client` to make typed HTTP requests. This is the simplest approach that:
1. Avoids adding new dependencies
2. Keeps the server as a thin proxy
3. Allows full control over request/response shapes

The handler functions construct the API URL, make the request via the SDK client, and return structured responses.

### Auto-Scaling Model

Serverless SQL Databases use an auto-scaling CPU model:
- `cpu_min`: Minimum vCPU allocation (can be 0 for scale-to-zero)
- `cpu_max`: Maximum vCPU allocation
- `cpu_current`: Current vCPU allocation (read-only, managed by the platform)
- `started`: Whether the database is currently running

The platform automatically scales between cpu_min and cpu_max based on load. Setting cpu_min to 0 enables scale-to-zero behavior.

### Error Handling

All Scaleway API errors come back as Error objects with a `statusCode` property. The shared `mapScalewayError` function in `src/shared/errors.ts` handles the mapping to MCP error types.

### Pagination

Scaleway uses `page` (1-indexed) and `page_size` query parameters. Responses include a `total_count` field. The shared `paginationToQuery` and `buildPaginatedResponse` utilities handle this.

### Backup Lifecycle

- Backups are automatically created by the platform
- Backups have statuses: unknown_status, error, ready, locked
- Export generates a temporary download URL with an expiration
- Restore can target an existing database or be used at creation time via `from_backup_id`
