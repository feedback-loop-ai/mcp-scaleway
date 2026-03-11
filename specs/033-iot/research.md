# Research: Scaleway IoT Hub MCP Tools

**Feature**: 033-iot | **Date**: 2026-03-11

## Technology Decisions

### HTTP Client Pattern

The IoT tools use a direct `scalewayFetch` helper function instead of a per-product SDK package. This helper handles:
- Authentication via `X-Auth-Token` header (loaded from `loadAuthConfig`)
- JSON serialization/deserialization
- HTTP status code checking (non-2xx throws with `statusCode` property)
- 204 No Content responses (returns empty object)

```typescript
async function scalewayFetch(method: string, url: string, body?: unknown): Promise<unknown>
```

### IoT Hub API Structure

The Scaleway IoT Hub API is region-scoped. Base URL pattern:
```
https://api.scaleway.com/iot/v1/regions/{region}/
```

Key endpoints:
- `GET /hubs` - List hubs (paginated)
- `GET /hubs/{hub_id}` - Get hub
- `POST /hubs` - Create hub
- `PATCH /hubs/{hub_id}` - Update hub
- `DELETE /hubs/{hub_id}` - Delete hub (with optional `?delete_devices=true`)
- `POST /hubs/{hub_id}/enable` - Enable hub
- `POST /hubs/{hub_id}/disable` - Disable hub
- `GET /hubs/{hub_id}/ca` - Get hub CA certificate
- `POST /hubs/{hub_id}/ca` - Set hub CA certificate
- `GET /devices` - List devices (paginated)
- `GET /devices/{device_id}` - Get device
- `POST /devices` - Create device
- `PATCH /devices/{device_id}` - Update device
- `DELETE /devices/{device_id}` - Delete device
- `POST /devices/{device_id}/enable` - Enable device
- `POST /devices/{device_id}/disable` - Disable device
- `GET /devices/{device_id}/certificate` - Get device certificate
- `POST /devices/{device_id}/certificate/renew` - Renew device certificate
- `PUT /devices/{device_id}/certificate` - Set device certificate
- `GET /devices/{device_id}/metrics` - Get device metrics
- `GET /routes` - List routes (paginated)
- `GET /routes/{route_id}` - Get route
- `POST /routes` - Create route
- `PATCH /routes/{route_id}` - Update route
- `DELETE /routes/{route_id}` - Delete route
- `GET /networks` - List networks (paginated)
- `GET /networks/{network_id}` - Get network
- `POST /networks` - Create network
- `DELETE /networks/{network_id}` - Delete network

### Implementation Approach

The implementation uses direct HTTP calls via `scalewayFetch` rather than SDK packages. This approach:
1. Avoids adding new dependencies
2. Keeps the server as a thin proxy
3. Allows full control over request/response shapes

Each handler function constructs the API URL, makes the request, and returns a structured MCP response via `successResponse`.

### Error Handling

All Scaleway API errors come back as Error objects with a `statusCode` property. The shared `mapScalewayError` function in `src/shared/errors.ts` handles the mapping to MCP error types. Each handler wraps its logic in try/catch and calls `formatErrorResponse(mapScalewayError(error))`.

### Pagination

Scaleway uses `page` (1-indexed) and `page_size` query parameters. The shared `paginationToQuery` utility converts parameters, and `buildPaginatedResponse` wraps the response with pagination metadata.

### Route Configuration Types

Routes support three mutually exclusive backend configurations:
- **S3**: `bucket_region`, `bucket_name`, `object_prefix`, `strategy` (per_topic/per_message)
- **Database**: `host`, `port`, `dbname`, `username`, `password`, `query`, `engine` (postgresql/mysql)
- **REST**: `verb` (HTTP method), `uri`, `headers`

A shared `buildRouteConfigBody` helper maps camelCase params to snake_case API fields.

### Region vs Zone

Unlike the Instances API (which is zone-scoped, e.g., fr-par-1), the IoT Hub API is region-scoped (e.g., fr-par). The `getRegion` helper falls back to `config.defaultRegion` when no region is specified.
