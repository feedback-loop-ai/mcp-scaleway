# Research: Scaleway Edge Services MCP Tools

**Feature**: 022-edge-services | **Date**: 2026-03-11

## Technology Decisions

### Scaleway SDK Package

The project uses the per-product SDK package `@scaleway/sdk-edge-services` (v2.7.0) which provides the `API` class from `@scaleway/sdk-edge-services/v1beta1`. This is preferred over raw HTTP calls because:
1. It provides typed method signatures for all Edge Services endpoints
2. It handles serialization/deserialization automatically
3. It integrates with the shared `createScalewayClient()` infrastructure

API access pattern:
```typescript
import { API } from "@scaleway/sdk-edge-services/v1beta1";
const client = createScalewayClient(config);
const api = new API(client);
```

### Edge Services API Structure

The Edge Services API is **global** (not scoped to a zone or region). Base URL pattern:
```
https://api.scaleway.com/edge-services/v1beta1/
```

The API is currently in **v1beta1** status, meaning it may have breaking changes in future versions.

Key endpoints:
- `GET /pipelines` - List pipelines (paginated)
- `GET /pipelines/{pipeline_id}` - Get pipeline
- `POST /pipelines` - Create pipeline
- `PATCH /pipelines/{pipeline_id}` - Update pipeline
- `DELETE /pipelines/{pipeline_id}` - Delete pipeline
- `GET /dns-stages` - List DNS stages (paginated, filtered by pipeline)
- `GET /dns-stages/{dns_stage_id}` - Get DNS stage
- `POST /dns-stages` - Create DNS stage
- `PATCH /dns-stages/{dns_stage_id}` - Update DNS stage
- `DELETE /dns-stages/{dns_stage_id}` - Delete DNS stage
- `GET /tls-stages` - List TLS stages (paginated, filtered by pipeline)
- `GET /tls-stages/{tls_stage_id}` - Get TLS stage
- `POST /tls-stages` - Create TLS stage
- `PATCH /tls-stages/{tls_stage_id}` - Update TLS stage
- `DELETE /tls-stages/{tls_stage_id}` - Delete TLS stage
- `GET /cache-stages` - List cache stages (paginated, filtered by pipeline)
- `GET /cache-stages/{cache_stage_id}` - Get cache stage
- `POST /cache-stages` - Create cache stage
- `PATCH /cache-stages/{cache_stage_id}` - Update cache stage
- `DELETE /cache-stages/{cache_stage_id}` - Delete cache stage
- `GET /backend-stages` - List backend stages (paginated, filtered by pipeline)
- `GET /backend-stages/{backend_stage_id}` - Get backend stage
- `POST /backend-stages` - Create backend stage
- `PATCH /backend-stages/{backend_stage_id}` - Update backend stage
- `DELETE /backend-stages/{backend_stage_id}` - Delete backend stage
- `POST /purge-requests` - Create purge request
- `GET /purge-requests` - List purge requests (paginated)
- `GET /purge-requests/{purge_request_id}` - Get purge request

### Pipeline Architecture

Edge Services uses a pipeline-based model where stages are chained together to process HTTP requests from edge to origin:

1. **DNS Stage** - Entry point; maps custom FQDNs to the pipeline
2. **TLS Stage** - Handles TLS termination with managed (Let's Encrypt) or custom certificates
3. **Cache Stage** - Configures edge caching with TTL and cookie settings
4. **Backend Stage** - Defines the origin (Scaleway S3 bucket or Load Balancer)

Stages reference the next stage in the chain via one-of ID fields (e.g., `tlsStageId`, `cacheStageId`, `backendStageId`). This allows flexible stage ordering and optional stages.

### Backend Origin Types

Backend stages support two origin types (one-of):
- **Scaleway S3**: Points to an Object Storage bucket (with optional website mode)
- **Scaleway Load Balancer**: Points to one or more LB frontends (with optional SSL, websocket, and domain settings)

The API also supports `scalewayServerlessContainer` and `scalewayServerlessFunction` origins, but these are not yet exposed in the current implementation.

### Error Handling

All Scaleway API errors are handled by the shared `mapScalewayError` function from `src/shared/errors.ts`. Common error codes:
- 400: Invalid input parameters
- 403: Permission denied (insufficient IAM permissions)
- 404: Resource not found
- 429: Rate limited

### Pagination

Edge Services uses the shared pagination utilities (`paginationToQuery`, `buildPaginatedResponse`) with standard `page` (1-indexed) and `pageSize` query parameters. Responses include a `totalCount` field.
