# Research: Scaleway Managed Redis MCP Tools

**Feature**: 014-redis | **Date**: 2026-03-11

## Technology Decisions

### Scaleway SDK Client Pattern

The project uses `@scaleway/sdk-client` with `createClient()`. The Managed Redis API is accessed via the Scaleway REST API through the SDK client. The SDK client handles authentication, base URL routing, and region-based endpoint resolution.

API calls follow the pattern:
```typescript
const client = createScalewayClient(config);
// The SDK client provides fetch-like methods for Scaleway API endpoints
```

Since `@scaleway/sdk-client` provides a generic client, we make HTTP calls to the Redis API endpoints directly using the client's fetch method.

### Managed Redis API Structure

The Scaleway Managed Redis API is region-scoped. Base URL pattern:
```
https://api.scaleway.com/redis/v1/regions/{region}/
```

Key endpoints:

**Cluster CRUD**:
- `GET /clusters` - List clusters (paginated, filterable by name, tags, project_id, organization_id)
- `GET /clusters/{cluster_id}` - Get cluster details
- `POST /clusters` - Create cluster
- `PATCH /clusters/{cluster_id}` - Update cluster (name, tags, credentials)
- `DELETE /clusters/{cluster_id}` - Delete cluster

**Metrics & Certificates**:
- `GET /clusters/{cluster_id}/metrics` - Get cluster metrics (optional time range, metric name)
- `GET /clusters/{cluster_id}/certificate` - Get TLS certificate
- `POST /clusters/{cluster_id}/renew-certificate` - Renew TLS certificate

**ACL Rules**:
- `POST /clusters/{cluster_id}/acls` - Add ACL rules
- `DELETE /clusters/{cluster_id}/acls` - Delete ACL rules (by rule IDs in body)
- `PUT /clusters/{cluster_id}/acls` - Set (replace all) ACL rules

**Endpoints**:
- `POST /clusters/{cluster_id}/endpoints` - Add endpoints
- `DELETE /clusters/{cluster_id}/endpoints/{endpoint_id}` - Delete endpoint
- `PUT /clusters/{cluster_id}/endpoints` - Set (replace all) endpoints

**Discovery**:
- `GET /node-types` - List available node types (paginated)
- `GET /cluster-versions` - List available Redis versions (paginated)

### Implementation Approach

The handler functions construct the API URL, make the request via the SDK client's `fetch` method, and return structured responses. This is the simplest approach that:
1. Avoids adding new dependencies
2. Keeps the server as a thin proxy
3. Allows full control over request/response shapes

A shared `regionOrDefault()` helper resolves the region from the input parameter or `SCW_DEFAULT_REGION` environment variable, defaulting to `fr-par`.

### Error Handling

All Scaleway API errors come back as Error objects with a `statusCode` property. The shared `mapScalewayError` function in `src/shared/errors.ts` handles the mapping to MCP error types. The `formatErrorResponse` function wraps errors in the standard MCP response format.

### Pagination

Scaleway uses `page` (1-indexed) and `page_size` query parameters. Responses include a `total_count` field. The shared `paginationToQuery` and `buildPaginatedResponse` utilities from `src/shared/pagination.ts` handle this.

### Key Differences from Other Products

- **Regional API**: Unlike Instances (zoned), Redis uses region-scoped endpoints (fr-par, nl-ams, pl-waw)
- **Cluster model**: Redis clusters have built-in ACL rules and endpoints as sub-resources
- **TLS certificates**: Managed TLS with get/renew operations
- **Metrics**: Built-in time-series metrics endpoint with filtering
- **Endpoint types**: Support for both public and private network endpoints via endpoint specs
