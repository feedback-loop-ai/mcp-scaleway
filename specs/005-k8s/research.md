# Research: Scaleway Kubernetes (Kapsule & Kosmos) MCP Tools

**Feature**: 005-k8s | **Date**: 2026-03-11

## Technology Decisions

### Scaleway SDK Client Pattern

The project uses `@scaleway/sdk-client` with `createClient()`. The Kubernetes API is accessed via the Scaleway REST API through the SDK client. The SDK client handles authentication, base URL routing, and region-based endpoint resolution.

API calls follow the pattern:
```typescript
const client = createScalewayClient(config);
// client.send() for HTTP requests to Scaleway API endpoints
```

The handler layer builds URLs manually and uses the generic `send()` method on the SDK client, keeping the implementation as a thin proxy.

### Kubernetes API Structure

The Scaleway Kubernetes API is region-scoped (unlike Instances which is zone-scoped). Base URL pattern:
```
https://api.scaleway.com/k8s/v1/regions/{region}/
```

Key endpoints:
- `GET /clusters` - List clusters (paginated)
- `GET /clusters/{cluster_id}` - Get cluster
- `POST /clusters` - Create cluster
- `DELETE /clusters/{cluster_id}` - Delete cluster
- `POST /clusters/{cluster_id}/upgrade` - Upgrade cluster
- `GET /clusters/{cluster_id}/available-versions` - List available versions
- `GET /clusters/{cluster_id}/kubeconfig` - Get kubeconfig
- `GET /clusters/{cluster_id}/pools` - List pools for a cluster
- `POST /clusters/{cluster_id}/pools` - Create pool in a cluster
- `GET /pools/{pool_id}` - Get pool (note: not nested under cluster)
- `PATCH /pools/{pool_id}` - Update pool
- `DELETE /pools/{pool_id}` - Delete pool
- `POST /pools/{pool_id}/upgrade` - Upgrade pool

### Kapsule vs Kosmos

Scaleway offers two managed Kubernetes products:
- **Kapsule**: Single-region managed Kubernetes with Scaleway compute nodes
- **Kosmos**: Multi-cloud Kubernetes that can span multiple providers

Both share the same API surface. The `type` field on a cluster distinguishes them (`kapsule` vs `multicloud`). The MCP tools handle both transparently.

### Pool Endpoint Asymmetry

Pool creation and listing are scoped under a cluster (`/clusters/{cluster_id}/pools`), but get, update, delete, and upgrade operate directly on the pool (`/pools/{pool_id}`). This is because pool IDs are globally unique, so the cluster_id is not needed for direct operations.

### CNI Plugin Selection

CNI is required at cluster creation and cannot be changed later. The available options depend on the Kubernetes version. Cilium is the recommended default for new clusters. Available CNIs per version can be queried via the available-versions endpoint.

### Implementation Approach

The handler functions construct the API URL using `buildUrl(region, path)`, make the request via the SDK client's `send()` method, and return structured JSON responses wrapped in MCP text content. This follows the same pattern as Instances and other product areas.

### Error Handling

All Scaleway API errors are caught in try/catch blocks and mapped through the shared `mapScalewayError` function in `src/shared/errors.ts`, which converts HTTP status codes to MCP error types. The `formatErrorResponse` helper wraps them in the MCP response format.

### Pagination

Scaleway uses `page` (1-indexed) and `page_size` query parameters. The shared `paginationToQuery` and `buildPaginatedResponse` utilities handle conversion and response wrapping. List endpoints (clusters and pools) both support pagination.

### Autoscaling Configuration

Node pools support autoscaling via `min_size`, `max_size`, and `autoscaling` boolean. When autoscaling is enabled, the cluster autoscaler adjusts the node count between min and max. Autohealing is a separate feature that replaces unhealthy nodes automatically.
