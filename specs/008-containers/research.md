# Research: Scaleway Serverless Containers MCP Tools

**Feature**: 008-containers | **Date**: 2026-03-11

## Technology Decisions

### Scaleway SDK Client Pattern

The project uses `@scaleway/sdk-client` with `createClient()`. The Serverless Containers API is accessed via the Scaleway REST API through the SDK client. The SDK client handles authentication, base URL routing, and region-based endpoint resolution.

The handlers use a shared `apiRequest` helper that wraps the SDK client's HTTP transport:
```typescript
const client = createScalewayClient(config);
// apiRequest constructs URLs and uses the client's httpClient for fetch
```

### Serverless Containers API Structure

The Scaleway Serverless Containers API is region-scoped (not zoned). Base URL pattern:
```
https://api.scaleway.com/containers/v1beta1/regions/{region}/
```

Supported regions: `fr-par`, `nl-ams`, `pl-waw`

Key endpoints:
- `GET /namespaces` - List namespaces (paginated)
- `GET /namespaces/{namespace_id}` - Get namespace
- `POST /namespaces` - Create namespace
- `PATCH /namespaces/{namespace_id}` - Update namespace
- `DELETE /namespaces/{namespace_id}` - Delete namespace
- `GET /containers` - List containers (paginated, requires namespace_id)
- `GET /containers/{container_id}` - Get container
- `POST /containers` - Create container
- `PATCH /containers/{container_id}` - Update container
- `DELETE /containers/{container_id}` - Delete container
- `POST /containers/{container_id}/deploy` - Deploy container
- `GET /crons` - List cron triggers (paginated, requires container_id)
- `POST /crons` - Create cron trigger
- `PATCH /crons/{cron_id}` - Update cron trigger
- `DELETE /crons/{cron_id}` - Delete cron trigger
- `GET /domains` - List domains (paginated, requires container_id)
- `POST /domains` - Create domain mapping
- `DELETE /domains/{domain_id}` - Delete domain mapping
- `POST /tokens` - Create authentication token
- `DELETE /tokens/{token_id}` - Delete authentication token

### Implementation Approach

The implementation uses a thin `apiRequest` helper that constructs the full URL and delegates to the SDK client's HTTP transport. The `toSnakeCase` utility converts camelCase Zod input fields to snake_case for the Scaleway API request body. This keeps the handler code minimal and consistent.

Key patterns:
1. `getRegion()` resolves the region from the parameter or falls back to the account default
2. `baseUrl(region)` constructs the API base URL for the given region
3. List handlers use `paginationToQuery` and `buildPaginatedResponse` from shared utilities
4. All handlers follow try/catch with `mapScalewayError` + `formatErrorResponse`

### Error Handling

All Scaleway API errors come back as HTTP error responses. The `apiRequest` helper converts non-OK responses into Error objects with a `statusCode` property. The shared `mapScalewayError` function in `src/shared/errors.ts` handles the mapping to MCP error types.

Expected error codes:
- 400: `invalid_input` - Invalid parameters or malformed request
- 401/403: `permission_denied` - Authentication or authorization failure
- 404: `not_found` - Resource does not exist
- 429: `rate_limited` - Too many requests

### Pagination

Scaleway uses `page` (1-indexed) and `page_size` query parameters. Responses include a `total_count` field. The shared `paginationToQuery` and `buildPaginatedResponse` utilities handle conversion and response formatting.

### Key Differences from Instances API

- **Regional vs. Zoned**: Containers use `region` (e.g., fr-par) while Instances use `zone` (e.g., fr-par-1)
- **v1beta1 API**: The Containers API is still in beta, unlike the stable Instances v1 API
- **Hierarchical resources**: Containers live inside namespaces; crons and domains are scoped to containers
- **Deploy action**: Containers have an explicit deploy step separate from create/update
- **Autoscaling**: Built-in min_scale/max_scale with scale-to-zero support (min_scale=0)
