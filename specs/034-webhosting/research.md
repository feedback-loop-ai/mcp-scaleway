# Research: Scaleway Web Hosting MCP Tools

**Feature**: 034-webhosting | **Date**: 2026-03-11

## Technology Decisions

### Scaleway SDK Client Pattern

The project uses `@scaleway/sdk-client` with `createClient()`. The Web Hosting API is accessed via the Scaleway REST API through the SDK client. The SDK client handles authentication, base URL routing, and region-based endpoint resolution.

API calls follow the pattern:
```typescript
const client = createScalewayClient(config);
// The SDK client provides fetch-like methods for Scaleway API endpoints
```

### Web Hosting API Structure

The Scaleway Web Hosting API is region-scoped. Base URL pattern:
```
https://api.scaleway.com/webhosting/v1/regions/{region}/
```

Key endpoints:
- `GET /hostings` - List hostings (paginated)
- `GET /hostings/{hosting_id}` - Get hosting
- `POST /hostings` - Create hosting
- `PATCH /hostings/{hosting_id}` - Update hosting
- `DELETE /hostings/{hosting_id}` - Delete hosting
- `POST /hostings/{hosting_id}/restore` - Restore hosting
- `GET /hostings/{hosting_id}/dns-records` - Get DNS records
- `GET /offers` - List offers
- `GET /control-panels` - List control panels

### Implementation Approach

The implementation uses the `@scaleway/sdk-client` to make typed HTTP requests directly. This is the simplest approach that:
1. Avoids adding new dependencies
2. Keeps the server as a thin proxy
3. Allows full control over request/response shapes

Each handler function constructs the API URL with the resolved region, makes the request via the SDK client, and returns a structured MCP response.

### Region Resolution

The Web Hosting API uses regions (e.g., `fr-par`, `nl-ams`) rather than zones. The `resolveRegion` helper falls back to the default region from `loadAuthConfig()` when no region is explicitly provided.

### Error Handling

All Scaleway API errors come back as Error objects with a `statusCode` property. The shared `mapScalewayError` function in `src/shared/errors.ts` handles the mapping to MCP error types. Each handler wraps its logic in try/catch and delegates to `formatErrorResponse`.

### Pagination

List hostings uses Scaleway standard `page` (1-indexed) and `page_size` query parameters with `total_count` in the response. The shared `paginationToQuery` and `buildPaginatedResponse` utilities handle this.

List offers and list control panels are non-paginated endpoints that return all results.

### Hosting Lifecycle

Hostings follow a lifecycle: `delivering` -> `ready` -> `deleting` -> deleted. A deleted hosting can be restored via the restore endpoint. Hostings can also be in `error`, `locked`, or `migrating` states.

### DNS Management

DNS records are read-only from the hosting API perspective. The `get_dns_records` endpoint returns the expected DNS configuration that the user should set on their domain registrar. Each record includes a `status` field indicating whether it is correctly configured.
