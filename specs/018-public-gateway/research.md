# Research: Scaleway Public Gateway MCP Tools

**Feature**: 018-public-gateway | **Date**: 2026-03-11

## Technology Decisions

### Scaleway SDK Client Pattern

The project uses `@scaleway/sdk-client` with `createClient()`. The Public Gateway API is accessed via the Scaleway REST API through the SDK client. The SDK client handles authentication, base URL routing, and zone-based endpoint resolution.

API calls follow the pattern:
```typescript
const client = createScalewayClient(config);
// The SDK client provides fetch-like methods for Scaleway API endpoints
```

### Public Gateway API Structure

The Scaleway Public Gateway API spans two versions and is zone-scoped.

**v2 Base URL** (Gateways, GatewayNetworks, PAT Rules, IPs, Gateway Types):
```
https://api.scaleway.com/vpc-gw/v2/zones/{zone}/
```

**v1 Base URL** (DHCP):
```
https://api.scaleway.com/vpc-gw/v1/zones/{zone}/
```

Key v2 endpoints:
- `GET /gateways` - List gateways (paginated)
- `GET /gateways/{gateway_id}` - Get gateway
- `POST /gateways` - Create gateway
- `PATCH /gateways/{gateway_id}` - Update gateway
- `DELETE /gateways/{gateway_id}` - Delete gateway
- `GET /gateway-networks` - List gateway network connections
- `GET /gateway-networks/{gateway_network_id}` - Get gateway network
- `POST /gateway-networks` - Create gateway network
- `PATCH /gateway-networks/{gateway_network_id}` - Update gateway network
- `DELETE /gateway-networks/{gateway_network_id}` - Delete gateway network
- `GET /pat-rules` - List PAT rules
- `GET /pat-rules/{pat_rule_id}` - Get PAT rule
- `POST /pat-rules` - Create PAT rule
- `PATCH /pat-rules/{pat_rule_id}` - Update PAT rule
- `DELETE /pat-rules/{pat_rule_id}` - Delete PAT rule
- `GET /ips` - List flexible IPs
- `GET /ips/{ip_id}` - Get IP
- `POST /ips` - Create IP
- `PATCH /ips/{ip_id}` - Update IP
- `DELETE /ips/{ip_id}` - Delete IP
- `GET /gateway-types` - List gateway types

Key v1 endpoints:
- `GET /dhcps` - List DHCP configurations
- `GET /dhcps/{dhcp_id}` - Get DHCP
- `POST /dhcps` - Create DHCP
- `PATCH /dhcps/{dhcp_id}` - Update DHCP
- `DELETE /dhcps/{dhcp_id}` - Delete DHCP

### Implementation Approach

The handler functions construct the API URL using either `buildUrl` (v2) or `buildV1Url` (v1), make the request via the SDK client, and return structured responses. A local `toURLSearchParams` helper converts filter objects to URL query parameters, handling arrays by appending multiple values.

Key implementation details:
1. Two URL builders to handle v1/v2 API split
2. camelCase-to-snake_case conversion for request body fields
3. Conditional body construction (only set fields that are provided)
4. `formatResponse` wraps all responses in MCP text content format
5. `formatErrorResponse(mapScalewayError(error))` for consistent error handling

### Error Handling

All Scaleway API errors come back as Error objects with a `statusCode` property. The shared `mapScalewayError` function in `src/shared/errors.ts` handles the mapping to MCP error types.

### Pagination

Scaleway uses `page` (1-indexed) and `page_size` query parameters. Responses include a `total_count` field. The shared `paginationToQuery` and `buildPaginatedResponse` utilities handle this.

### Gateway Status Lifecycle

Gateways go through states: `unknown_status` -> `allocating` -> `configuring` -> `running` -> `stopping` -> `stopped`. Error states: `failed`, `locked`, `deleting`.

### GatewayNetwork Status Lifecycle

Connections go through: `unknown_status` -> `created` -> `attaching` -> `configuring` -> `ready` -> `detaching`.
