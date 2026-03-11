# Research: Scaleway Managed MongoDB MCP Tools

**Feature**: 015-mongodb | **Date**: 2026-03-11

## Technology Decisions

### Scaleway SDK Client Pattern

The project uses `@scaleway/sdk-client` with `createClient()`. The MongoDB API is accessed via the Scaleway REST API through the SDK client. The SDK client handles authentication, base URL routing, and region-based endpoint resolution.

API calls follow the pattern:
```typescript
const client = createScalewayClient(config);
// The SDK client provides fetch-like methods for Scaleway API endpoints
```

### MongoDB API Structure

The Scaleway Managed MongoDB API is region-scoped. Base URL pattern:
```
https://api.scaleway.com/mongodb/v1alpha1/regions/{region}/
```

Note: This is an **alpha** API (v1alpha1), meaning the interface may evolve.

Key endpoints:

**Instances:**
- `GET /instances` - List instances (paginated, filterable by name, tags, project_id, organization_id)
- `GET /instances/{instance_id}` - Get instance
- `POST /instances` - Create instance
- `PATCH /instances/{instance_id}` - Update instance (name, tags)
- `DELETE /instances/{instance_id}` - Delete instance

**Users (scoped to instance):**
- `GET /instances/{instance_id}/users` - List users (paginated, filterable by name)
- `POST /instances/{instance_id}/users` - Create user
- `PATCH /instances/{instance_id}/users/{name}` - Update user (password)
- `DELETE /instances/{instance_id}/users/{name}` - Delete user

**Snapshots:**
- `GET /snapshots` - List snapshots (paginated, filterable by instance_id, name, project_id, organization_id)
- `POST /instances/{instance_id}/snapshots` - Create snapshot
- `POST /snapshots/{snapshot_id}/restore` - Restore snapshot to new instance
- `DELETE /snapshots/{snapshot_id}` - Delete snapshot

**Discovery:**
- `GET /node-types` - List available node types (paginated, optional include_disabled_types)
- `GET /versions` - List available MongoDB versions (paginated, optional version filter)

### Implementation Approach

The implementation uses a thin API client layer that wraps the shared `createScalewayClient`. Each handler constructs the API URL, makes the request, and returns structured responses. This approach:
1. Avoids adding new dependencies
2. Keeps the server as a thin proxy
3. Allows full control over request/response shapes

### Error Handling

All Scaleway API errors come back as Error objects with a `statusCode` property. The shared `mapScalewayError` function in `src/shared/errors.ts` handles the mapping to MCP error types.

### Pagination

Scaleway uses `page` (1-indexed) and `page_size` query parameters. Responses include a `total_count` field. The shared `paginationToQuery` and `buildPaginatedResponse` utilities handle this.

### Key Differences from Other Products

- **Regional, not zoned**: Unlike Instances which are zoned (fr-par-1), MongoDB is regional (fr-par)
- **Alpha API**: v1alpha1 indicates the API is not yet GA
- **User identification by name**: Users are identified by their username string (URL-encoded), not by UUID
- **Snapshot restore creates new instance**: Restoring a snapshot creates a new instance rather than restoring in-place
- **Volume configuration**: Uses Scaleway Block Storage (sbs_5k, sbs_15k) rather than local/block SSD
