# Research: Scaleway Managed Inference MCP Tools

**Feature**: 029-inference | **Date**: 2026-03-11

## Technology Decisions

### Scaleway SDK Client Pattern

The project uses `@scaleway/sdk-client` with `createClient()`. The Inference API is accessed via the Scaleway REST API through the SDK client. The SDK client handles authentication, base URL routing, and region-based endpoint resolution.

The `handlers.ts` file implements a centralized `apiCall` helper that wraps all HTTP interactions:
```typescript
async function apiCall(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  region: string,
  path: string,
  body?: unknown,
  query?: Record<string, unknown>,
): Promise<Record<string, unknown>>
```

This keeps individual handler functions minimal (5-10 lines each).

### Managed Inference API Structure

The Scaleway Managed Inference API is region-scoped. Base URL pattern:
```
https://api.scaleway.com/inference/v1/regions/{region}/
```

Key endpoints:
- `GET /deployments` - List deployments (paginated, filterable)
- `GET /deployments/{deployment_id}` - Get deployment
- `POST /deployments` - Create deployment
- `PATCH /deployments/{deployment_id}` - Update deployment
- `DELETE /deployments/{deployment_id}` - Delete deployment
- `GET /deployments/{deployment_id}/events` - List deployment events (paginated)
- `GET /endpoints` - List endpoints (paginated, filterable by deployment_id)
- `POST /endpoints` - Create endpoint
- `PATCH /endpoints/{endpoint_id}` - Update endpoint
- `DELETE /endpoints/{endpoint_id}` - Delete endpoint
- `GET /models` - List models (paginated, filterable)
- `GET /models/{model_id}` - Get model
- `GET /node-types` - List node types (paginated)
- `GET /models/{model_id}/eula` - Get EULA content
- `POST /models/{model_id}/eula` - Accept EULA

### Implementation Approach

The implementation uses the shared `@scaleway/sdk-client` to make typed HTTP requests. Each handler:
1. Extracts region and other parameters from the validated Zod input
2. Constructs the API path
3. Calls `apiCall` with appropriate method, path, body, and query parameters
4. Returns a JSON response via `jsonResponse` helper
5. Catches errors and maps them via `mapScalewayError` + `formatErrorResponse`

### Locality Model

Unlike Instances (zoned), the Inference API is **regional**. Supported regions: fr-par, nl-ams, pl-waw. All tools accept a `region` parameter validated by the shared `ScalewayRegion` schema.

### Error Handling

All Scaleway API errors are caught in try/catch blocks and mapped through the shared `mapScalewayError` function in `src/shared/errors.ts`, then formatted via `formatErrorResponse`.

### Pagination

Scaleway uses `page` (1-indexed) and `page_size` query parameters. The shared `paginationToQuery` utility converts the `page` and `pageSize` tool inputs to Scaleway query parameters. Responses include `total_count`. The `buildPaginatedResponse` helper standardizes the paginated output format.

### Key Domain Concepts

- **Deployment**: An AI model running on GPU nodes. Supports autoscaling via min_size/max_size.
- **Endpoint**: A network access point for a deployment. Can be public or attached to a private network. Authentication can be toggled.
- **Model**: A pre-built AI model available in the Scaleway catalog. Some models require EULA acceptance before deployment.
- **Node Type**: A GPU hardware configuration (e.g., L4, H100) with specific vCPU, memory, VRAM, and GPU counts.
- **EULA**: End-User License Agreement that must be accepted for certain models before they can be deployed.
