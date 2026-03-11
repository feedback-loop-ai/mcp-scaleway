# Research: Scaleway IPAM MCP Tools

**Feature**: 021-ipam | **Date**: 2026-03-11

## Technology Decisions

### Scaleway SDK Client Pattern

The project uses `@scaleway/sdk-client` with `createClient()`. The IPAM API is accessed via the Scaleway REST API through the SDK client. The SDK client handles authentication, base URL routing, and region-based endpoint resolution.

API calls follow the pattern:
```typescript
const client = createScalewayClient(config);
// The SDK client provides fetch-like methods for Scaleway API endpoints
```

Since `@scaleway/sdk-client` provides a generic client, we make HTTP calls to the IPAM API endpoints directly using the client's fetch method.

### IPAM API Structure

The Scaleway IPAM API is region-scoped (not zone-scoped like Instances). Base URL pattern:
```
https://api.scaleway.com/ipam/v1/regions/{region}/
```

Key endpoints:
- `GET /ips` - List IPs (paginated, extensive filtering)
- `GET /ips/{ip_id}` - Get IP
- `POST /ips` - Book (reserve) IP
- `DELETE /ips/{ip_id}` - Release IP
- `PATCH /ips/{ip_id}` - Update IP (tags, reverses)

### Key Design Decisions

1. **Region-scoped**: Unlike Instances (zone-scoped), IPAM uses regions (e.g., `fr-par` not `fr-par-1`). The `ScalewayRegion` shared type handles this.

2. **Source as oneOf**: The `source` field on IP booking uses a oneOf pattern where exactly one of `zonal`, `private_network_id`, or `subnet_id` should be provided. The Zod schema allows all three as optional/nullable, matching the API shape.

3. **CustomResource for booking**: When booking with `type=custom`, a `resource` field with `mac_address` is required. This is modeled as the `CustomResource` Zod schema.

4. **URL params for arrays**: The `tags` filter on list uses repeated query parameters (e.g., `tags=foo&tags=bar`). The `buildUrlParams` helper handles this by appending each array item.

### Implementation Approach

The handler functions construct the API URL using the `ipamUrl` helper, make requests via the SDK client's fetch method, and return structured MCP responses. List responses use the shared `buildPaginatedResponse` utility.

### Error Handling

All Scaleway API errors are handled via the shared `mapScalewayError` function in `src/shared/errors.ts`, which maps HTTP status codes to structured MCP error responses.

### Pagination

Standard Scaleway pagination: `page` (1-indexed) and `page_size` query parameters. Responses include `total_count`. The shared `paginationToQuery` and `buildPaginatedResponse` utilities handle conversion.
