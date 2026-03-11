# Research: Scaleway Managed Database (RDB) MCP Tools

**Feature**: 013-rdb | **Date**: 2026-03-11

## Technology Decisions

### Scaleway SDK Client Pattern

The project uses `@scaleway/sdk-client` with `createClient()`. The RDB API is accessed via the Scaleway REST API through the SDK client. The SDK client handles authentication, base URL routing, and region-based endpoint resolution.

API calls follow the pattern:
```typescript
const client = createScalewayClient(config);
// The SDK client provides a fetch method for Scaleway API endpoints
const response = await client.fetch(new Request(url, { method, headers, body }));
```

### RDB API Structure

The Scaleway Managed Database (RDB) API is region-scoped. Base URL pattern:
```
https://api.scaleway.com/rdb/v1/regions/{region}/
```

Key endpoints:

**Instance management:**
- `GET /instances` - List instances (paginated)
- `GET /instances/{instance_id}` - Get instance
- `POST /instances` - Create instance
- `PATCH /instances/{instance_id}` - Update instance
- `DELETE /instances/{instance_id}` - Delete instance
- `POST /instances/{instance_id}/upgrade` - Upgrade instance

**Database management:**
- `GET /instances/{instance_id}/databases` - List databases (paginated)
- `POST /instances/{instance_id}/databases` - Create database
- `DELETE /instances/{instance_id}/databases/{name}` - Delete database

**User management:**
- `GET /instances/{instance_id}/users` - List users (paginated)
- `POST /instances/{instance_id}/users` - Create user
- `PATCH /instances/{instance_id}/users/{name}` - Update user
- `DELETE /instances/{instance_id}/users/{name}` - Delete user

**Backup management:**
- `GET /backups` - List backups (paginated)
- `POST /backups` - Create backup
- `POST /backups/{backup_id}/restore` - Restore backup

**Endpoint management:**
- `GET /instances/{instance_id}` - List endpoints (derived from instance)
- `POST /instances/{instance_id}/endpoints` - Create endpoint
- `DELETE /endpoints/{endpoint_id}` - Delete endpoint

**ACL management:**
- `GET /instances/{instance_id}/acls` - List ACL rules (paginated)
- `POST /instances/{instance_id}/acls` - Add ACL rules
- `DELETE /instances/{instance_id}/acls` - Delete ACL rules

**Snapshot management:**
- `GET /snapshots` - List snapshots (paginated)
- `POST /snapshots` - Create snapshot
- `POST /snapshots/{snapshot_id}/create-instance-from-snapshot` - Restore snapshot

**Reference data:**
- `GET /node-types` - List node types
- `GET /database-engines` - List database engines

### Implementation Approach

The implementation uses the `@scaleway/sdk-client` fetch method to make typed HTTP requests directly. This is the simplest approach that:
1. Avoids adding new dependencies
2. Keeps the server as a thin proxy
3. Allows full control over request/response shapes

Each handler function constructs the API URL, makes the request via the SDK client's fetch method, and returns structured MCP responses.

### Error Handling

All Scaleway API errors come back as HTTP error responses. The handler catches these, attaches a `statusCode` property, and delegates to the shared `mapScalewayError` function in `src/shared/errors.ts` which maps to MCP error types.

### Pagination

Scaleway uses `page` (1-indexed) and `page_size` query parameters. Responses include a `total_count` field. The shared `paginationToQuery` and `buildPaginatedResponse` utilities handle this pattern.

### Snapshots vs Backups

The RDB API distinguishes between:
- **Backups**: Database-level, can target a specific database within an instance. Restored to an existing instance.
- **Snapshots**: Instance-level, full copy of the entire instance. Restored by creating a new instance from the snapshot.

### Endpoint Types

RDB instances support three endpoint types:
- **Public**: Default endpoint with public IP
- **Private Network**: Connects via a Scaleway VPC private network
- **Load Balancer**: Routes traffic through a load balancer
