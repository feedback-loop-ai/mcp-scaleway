# Research: Scaleway Serverless Functions MCP Tools

**Feature**: 007-functions | **Date**: 2026-03-11

## Technology Decisions

### Scaleway SDK Client Pattern

The project uses `@scaleway/sdk-client` with `createClient()`. The Functions API is accessed via the Scaleway REST API through the SDK client. The SDK client handles authentication, base URL routing, and region-based endpoint resolution.

API calls follow the pattern:
```typescript
const client = createScalewayClient(config);
// The SDK client provides fetch-like methods for Scaleway API endpoints
```

Since `@scaleway/sdk-client` provides a generic client, we make HTTP calls to the Functions API endpoints directly using the client's `fetch` method with typed request/response shapes.

### Functions API Structure

The Scaleway Serverless Functions API is region-scoped (not zone-scoped like Instances). Base URL pattern:
```
https://api.scaleway.com/functions/v1beta1/regions/{region}/
```

Supported regions: `fr-par`, `nl-ams`, `pl-waw`.

Key endpoints:
- `GET /namespaces` - List namespaces (paginated)
- `GET /namespaces/{namespace_id}` - Get namespace
- `POST /namespaces` - Create namespace
- `PATCH /namespaces/{namespace_id}` - Update namespace
- `DELETE /namespaces/{namespace_id}` - Delete namespace
- `GET /functions` - List functions (paginated, filtered by namespace_id)
- `GET /functions/{function_id}` - Get function
- `POST /functions` - Create function
- `PATCH /functions/{function_id}` - Update function
- `DELETE /functions/{function_id}` - Delete function
- `POST /functions/{function_id}/deploy` - Deploy function
- `GET /crons` - List crons (paginated, filtered by function_id)
- `POST /crons` - Create cron
- `PATCH /crons/{cron_id}` - Update cron
- `DELETE /crons/{cron_id}` - Delete cron
- `GET /domains` - List domains (filtered by function_id)
- `POST /domains` - Create domain
- `DELETE /domains/{domain_id}` - Delete domain
- `POST /tokens` - Create token
- `DELETE /tokens/{token_id}` - Delete token

### API Version Note

The Functions API uses the `v1beta1` version prefix. This is the current stable version exposed by Scaleway. All endpoint paths include this prefix.

### Implementation Approach

The implementation uses a thin API client layer through the `@scaleway/sdk-client` `fetch` method. Each handler function:
1. Constructs the API URL with the appropriate region prefix
2. Builds URL search params for GET requests with query parameters
3. Serializes the request body as JSON for POST/PATCH requests
4. Returns structured JSON responses via the shared `jsonResponse` helper

This approach avoids adding per-product SDK dependencies and keeps the server as a stateless proxy.

### Error Handling

All Scaleway API errors come back as Error objects with a `statusCode` property. The shared `mapScalewayError` function in `src/shared/errors.ts` handles the mapping to MCP error types. Common error codes:
- `400` - Invalid input (bad request body or query params)
- `403` - Permission denied (insufficient IAM permissions)
- `404` - Resource not found
- `409` - Conflict (duplicate name, resource in use)
- `429` - Rate limited

### Pagination

Scaleway Functions API uses `page` (1-indexed) and `page_size` query parameters. Responses include a `total_count` field. The shared pagination utilities handle this pattern.

### Secret Environment Variables

`secret_environment_variables` follow a write-only pattern: on creation/update, both `key` and `value` are provided. On read responses, the `value` field is always `null`. This is by design for security.

### Runtimes

Supported runtimes as of the current API version:
- Node.js: `node22`, `node20`
- Python: `python312`, `python311`, `python310`
- Go: `go123`, `go122`
- PHP: `php82`
- Rust: `rust165`

### Memory and Scaling

- Memory limits: 128, 256, 512, 1024, 2048, 4096 MB
- CPU is automatically allocated proportional to memory
- `min_scale: 0` enables scale-to-zero (cold starts apply)
- `min_scale >= 1` keeps instances warm (always-on)
