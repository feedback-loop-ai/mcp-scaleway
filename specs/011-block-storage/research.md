# Research: Scaleway Block Storage MCP Tools

**Feature**: 011-block-storage | **Date**: 2026-03-11

## Technology Decisions

### Scaleway SDK Client Pattern

The project uses `@scaleway/sdk-client` with `createClient()`. The Block Storage API is accessed via the Scaleway REST API through the SDK client. The SDK client handles authentication, base URL routing, and zone-based endpoint resolution.

API calls follow the pattern:
```typescript
const client = createScalewayClient(config);
// The SDK client provides fetch-like methods for Scaleway API endpoints
```

Since `@scaleway/sdk-client` provides a generic client, we make HTTP calls to the Block Storage API endpoints directly using the client's `fetch` method with manual request construction (method, path, body, urlParams).

### Block Storage API Structure

The Scaleway Block Storage API is zone-scoped and uses the `v1alpha1` version. Base URL pattern:
```
https://api.scaleway.com/block/v1alpha1/zones/{zone}/
```

Key endpoints:
- `GET /volumes` - List volumes (paginated, filterable by name, project_id, status)
- `GET /volumes/{volume_id}` - Get volume
- `POST /volumes` - Create volume (from_empty or from_snapshot)
- `PATCH /volumes/{volume_id}` - Update volume (name, size, perf_iops, tags)
- `DELETE /volumes/{volume_id}` - Delete volume
- `GET /snapshots` - List snapshots (paginated, filterable by name, project_id, volume_id, status)
- `GET /snapshots/{snapshot_id}` - Get snapshot
- `POST /snapshots` - Create snapshot (from volume_id)
- `PATCH /snapshots/{snapshot_id}` - Update snapshot (name, tags)
- `DELETE /snapshots/{snapshot_id}` - Delete snapshot
- `GET /volume-types` - List volume types (paginated)

### Implementation Approach

The implementation uses a thin handler layer in `src/tools/block-storage/handlers.ts` that:
1. Loads auth config and creates the Scaleway client
2. Resolves zone (explicit param or default from config)
3. Constructs the API URL via `getBlockStorageUrl(zone, path)`
4. Makes the request via `client.fetch()`
5. Returns structured MCP responses (content array with text type)

Helper functions:
- `getBlockStorageUrl(zone, path)` - Constructs the full API path
- `resolveZone(zone?)` - Falls back to default zone from config
- `toUrlParams(params)` - Converts object to URLSearchParams, filtering nulls

### Volume Creation Modes

Block Storage volumes support two creation modes:
1. **fromEmpty** - Create a blank volume with a specified size in bytes
2. **fromSnapshot** - Clone a volume from an existing snapshot, optionally overriding the size

This differs from Instance volumes which use a simpler `size` + `volume_type` model.

### Error Handling

All Scaleway API errors come back as Error objects with a `statusCode` property. The shared `mapScalewayError` function in `src/shared/errors.ts` handles the mapping to MCP error types. Each handler wraps its logic in try/catch and returns `formatErrorResponse(mapScalewayError(error))`.

### Pagination

Scaleway uses `page` (1-indexed) and `page_size` query parameters. The shared `paginationToQuery` utility converts page/pageSize to the query format, and `buildPaginatedResponse` wraps the response with pagination metadata.
