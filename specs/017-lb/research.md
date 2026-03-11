# Research: Scaleway Load Balancer MCP Tools

**Feature**: 017-lb | **Date**: 2026-03-11

## Technology Decisions

### Scaleway SDK Client Pattern

The project uses `@scaleway/sdk-client` with `createClient()`. The LB API is accessed via the Scaleway REST API through the SDK client. The SDK client handles authentication, base URL routing, and zone-based endpoint resolution.

API calls follow the pattern:
```typescript
const client = createScalewayClient(config);
const result = await client.fetch({
  method: "GET",
  path: `/lb/v1/zones/${zone}/lbs`,
  urlParams,
});
```

### Load Balancer API Structure

The Scaleway Load Balancer API is zone-scoped. Base URL pattern:
```
https://api.scaleway.com/lb/v1/zones/{zone}/
```

Key endpoints:

**LB CRUD & Migration**:
- `GET /lbs` - List load balancers (paginated, filterable by name, tags, project_id, order_by)
- `GET /lbs/{lb_id}` - Get load balancer
- `POST /lbs` - Create load balancer
- `PUT /lbs/{lb_id}` - Update load balancer
- `DELETE /lbs/{lb_id}` - Delete load balancer (with optional `release_ip` query param)
- `POST /lbs/{lb_id}/migrate` - Migrate LB to a different type

**Frontends**:
- `GET /lbs/{lb_id}/frontends` - List frontends (paginated)
- `GET /frontends/{frontend_id}` - Get frontend
- `POST /lbs/{lb_id}/frontends` - Create frontend
- `PUT /frontends/{frontend_id}` - Update frontend
- `DELETE /frontends/{frontend_id}` - Delete frontend

**Backends**:
- `GET /lbs/{lb_id}/backends` - List backends (paginated)
- `GET /backends/{backend_id}` - Get backend
- `POST /lbs/{lb_id}/backends` - Create backend
- `PUT /backends/{backend_id}` - Update backend
- `DELETE /backends/{backend_id}` - Delete backend
- `POST /backends/{backend_id}/servers` - Add servers to backend
- `DELETE /backends/{backend_id}/servers` - Remove servers from backend
- `PUT /backends/{backend_id}/servers` - Set servers for backend

**Routes**:
- `GET /routes` - List routes (filterable by frontend_id)
- `GET /routes/{route_id}` - Get route
- `POST /routes` - Create route
- `PUT /routes/{route_id}` - Update route
- `DELETE /routes/{route_id}` - Delete route

**Certificates**:
- `GET /lbs/{lb_id}/certificates` - List certificates (paginated)
- `GET /certificates/{certificate_id}` - Get certificate
- `POST /lbs/{lb_id}/certificates` - Create certificate
- `PUT /certificates/{certificate_id}` - Update certificate
- `DELETE /certificates/{certificate_id}` - Delete certificate

**Stats & Types**:
- `GET /lbs/{lb_id}/stats` - Get LB statistics (filterable by backend_id)
- `GET /lb-types` - List LB types (paginated)

### Implementation Approach

The handlers use the `@scaleway/sdk-client` to make typed HTTP requests. This is the simplest approach that:
1. Avoids adding new dependencies
2. Keeps the server as a thin proxy
3. Allows full control over request/response shapes

Each handler function constructs the API URL, makes the request via the SDK client, and returns structured responses via `jsonResponse()`.

### Error Handling

All Scaleway API errors come back as Error objects with a `statusCode` property. The shared `mapScalewayError` function in `src/shared/errors.ts` handles the mapping to MCP error types. Every handler wraps its logic in try/catch and returns `formatErrorResponse(mapScalewayError(error))`.

### Pagination

Scaleway uses `page` (1-indexed) and `page_size` query parameters. Responses include a `total_count` field. The shared `paginationToQuery` utility converts page/pageSize to query params.

### Health Check Configuration

Backends support three mutually exclusive health check types:
- **TCP**: Empty object `{}`, simplest check
- **HTTP**: Configurable URI, method, expected status code, and host header
- **HTTPS**: Same as HTTP plus SNI support

Health checks also have common fields: port, check_delay, check_timeout, check_max_retries.

### SSL/TLS

- **SSL Compatibility Levels**: Control the minimum TLS version and cipher suites (unknown, intermediate, modern, old_backward)
- **Certificates**: Two types - Let's Encrypt (automated) and custom (PEM chain upload)
- **HTTP/3**: Can be enabled per frontend via `enable_http3` flag
