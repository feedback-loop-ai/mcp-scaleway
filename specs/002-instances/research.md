# Research: Scaleway Instances MCP Tools

**Feature**: 002-instances | **Date**: 2026-03-11

## Technology Decisions

### Scaleway SDK Client Pattern

The project uses `@scaleway/sdk-client` with `createClient()`. The Instances API is accessed via the Scaleway REST API through the SDK client. The SDK client handles authentication, base URL routing, and zone-based endpoint resolution.

API calls follow the pattern:
```typescript
const client = createScalewayClient(config);
// The SDK client provides fetch-like methods for Scaleway API endpoints
```

Since `@scaleway/sdk-client` provides a generic client, we make HTTP calls to the Instances API endpoints directly using the client's marshalling utilities, or use the per-product SDK packages if available.

### Instances API Structure

The Scaleway Instances API is zone-scoped. Base URL pattern:
```
https://api.scaleway.com/instance/v1/zones/{zone}/
```

Key endpoints:
- `GET /servers` - List servers (paginated)
- `GET /servers/{server_id}` - Get server
- `POST /servers` - Create server
- `DELETE /servers/{server_id}` - Delete server
- `POST /servers/{server_id}/action` - Server action
- `GET /volumes` - List volumes
- `GET /volumes/{volume_id}` - Get volume
- `POST /volumes` - Create volume
- `DELETE /volumes/{volume_id}` - Delete volume
- `GET /security_groups` - List security groups
- `GET /security_groups/{security_group_id}` - Get security group
- `POST /security_groups` - Create security group
- `DELETE /security_groups/{security_group_id}` - Delete security group
- `GET /ips` - List IPs
- `POST /ips` - Create IP
- `DELETE /ips/{ip_id}` - Delete IP
- `PATCH /ips/{ip_id}` - Update IP (attach/detach)
- `GET /snapshots` - List snapshots
- `POST /snapshots` - Create snapshot
- `DELETE /snapshots/{snapshot_id}` - Delete snapshot

### Implementation Approach

Instead of using per-product SDK packages, we will build a thin API client layer that uses the `@scaleway/sdk-client` to make typed HTTP requests. This is the simplest approach that:
1. Avoids adding new dependencies
2. Keeps the server as a thin proxy
3. Allows full control over request/response shapes

The handler functions will construct the API URL, make the request via the SDK client, and return structured responses.

### Error Handling

All Scaleway API errors come back as Error objects with a `statusCode` property. The shared `mapScalewayError` function in `src/shared/errors.ts` handles the mapping to MCP error types.

### Pagination

Scaleway uses `page` (1-indexed) and `page_size` query parameters. Responses include a `total_count` header or field. The shared pagination utilities handle this.
