# Research: Scaleway VPC & Private Networks MCP Tools

**Feature**: 016-vpc | **Date**: 2026-03-11

## Technology Decisions

### Scaleway SDK Client Pattern

The project uses `@scaleway/sdk-client` with `createClient()`. The VPC API is accessed via the Scaleway REST API through the SDK client's `fetch` method. The SDK client handles authentication, base URL routing, and region-based endpoint resolution.

API calls follow the pattern:
```typescript
const client = createScalewayClient(config);
const body = await client.fetch<ResponseType>({
  method: "GET",
  path: "/vpc/v2/regions/{region}/vpcs",
  urlParams,
});
```

### VPC API Structure

The Scaleway VPC v2 API is region-scoped (not zone-scoped). Base URL pattern:
```
https://api.scaleway.com/vpc/v2/regions/{region}/
```

Supported regions: fr-par, nl-ams, pl-waw

Key endpoints:
- `GET /vpcs` - List VPCs (paginated)
- `GET /vpcs/{vpc_id}` - Get VPC
- `POST /vpcs` - Create VPC
- `PATCH /vpcs/{vpc_id}` - Update VPC
- `DELETE /vpcs/{vpc_id}` - Delete VPC
- `GET /private-networks` - List private networks (paginated)
- `GET /private-networks/{private_network_id}` - Get private network
- `POST /private-networks` - Create private network
- `PATCH /private-networks/{private_network_id}` - Update private network
- `DELETE /private-networks/{private_network_id}` - Delete private network

### Regional vs Zoned

Unlike many Scaleway APIs (e.g., Instances which is zoned), the VPC API operates at the region level. This means the locality parameter is `region` (e.g., `fr-par`) rather than `zone` (e.g., `fr-par-1`). The shared `ScalewayRegion` Zod type from `src/shared/types.ts` validates the region format.

### Implementation Approach

The implementation uses the `@scaleway/sdk-client` `client.fetch<T>()` method directly, constructing structured request objects with method, path, urlParams, body, and headers. This approach:
1. Avoids adding per-product SDK dependencies
2. Keeps the server as a thin proxy
3. Provides full control over request/response shapes

Handler functions construct the API URL, make the request via the SDK client, and return structured responses wrapped in MCP-compatible `formatSuccess` output.

### Error Handling

All Scaleway API errors are caught in try/catch blocks and mapped via the shared `mapScalewayError` function from `src/shared/errors.ts`. This produces structured MCP error responses with appropriate error codes (invalid_input, permission_denied, not_found, rate_limited).

### Pagination

Scaleway uses `page` (1-indexed) and `page_size` query parameters. Responses include a `total_count` field. The shared `paginationToQuery` and `buildPaginatedResponse` utilities handle the conversion between MCP pagination conventions (page, pageSize) and Scaleway API conventions (page, page_size).

### Field Naming Asymmetry

The Scaleway VPC API has an intentional naming asymmetry:
- VPCs use `project` for the project ID field
- Private Networks use `project_id` for the project ID field

This is preserved as-is in the MCP tool schemas to maintain a 1:1 mapping with the upstream API.

### Tags Filtering

Tags are passed as repeated query parameters for list filters (e.g., `?tags=a&tags=b`). The implementation iterates over the tags array and appends each one individually to the URLSearchParams object.
