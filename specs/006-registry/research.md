# Research: Scaleway Container Registry MCP Tools

**Feature**: 006-registry | **Date**: 2026-03-11

## Technology Decisions

### Scaleway SDK Client Pattern

The project uses `@scaleway/sdk-client` with `createClient()`. The Container Registry API is accessed via the Scaleway REST API through the SDK client. The SDK client handles authentication, base URL routing, and region-based endpoint resolution.

API calls follow the pattern:
```typescript
const client = createScalewayClient(config);
// Use client.fetch() with typed request/response for Registry endpoints
```

Since `@scaleway/sdk-client` provides a generic client, we make HTTP calls to the Container Registry API endpoints directly using `client.fetch()`.

### Container Registry API Structure

The Scaleway Container Registry API is region-scoped (unlike Instances which is zone-scoped). Base URL pattern:
```
https://api.scaleway.com/registry/v1/regions/{region}/
```

Supported regions: `fr-par`, `nl-ams`, `pl-waw`

Key endpoints:
- `GET /namespaces` - List namespaces (paginated)
- `GET /namespaces/{namespace_id}` - Get namespace
- `POST /namespaces` - Create namespace
- `PATCH /namespaces/{namespace_id}` - Update namespace
- `DELETE /namespaces/{namespace_id}` - Delete namespace
- `GET /images` - List images (paginated, filterable by namespace_id)
- `GET /images/{image_id}` - Get image
- `PATCH /images/{image_id}` - Update image (visibility)
- `DELETE /images/{image_id}` - Delete image
- `GET /images/{image_id}/tags` - List tags for an image (paginated)
- `GET /tags/{tag_id}` - Get tag
- `DELETE /tags/{tag_id}` - Delete tag

### Implementation Approach

The implementation uses the same thin API client pattern as other product tools in this project. Each handler function:
1. Constructs the API path using `buildPath(region, path)` with the `registry/v1` prefix
2. Makes the request via `client.fetch()` with typed generics
3. Returns a structured MCP response via `successResponse(data)`
4. Catches errors and maps them via the shared `mapScalewayError` + `formatErrorResponse`

Helper functions:
- `buildPath(region, path)` - Constructs `/registry/v1/regions/{region}{path}`
- `successResponse(data)` - Wraps data in MCP text content format
- `toUrlParams(params)` - Converts optional parameters to `URLSearchParams`, filtering out undefined values

### Error Handling

All Scaleway API errors come back as Error objects with a `statusCode` property. The shared `mapScalewayError` function in `src/shared/errors.ts` handles the mapping to MCP error types. Registry-specific error codes:
- 400: Invalid input (malformed request, invalid region)
- 401: Unauthorized (invalid/missing API key)
- 403: Permission denied (insufficient IAM permissions)
- 404: Resource not found (invalid namespace_id, image_id, or tag_id)
- 409: Conflict (e.g., duplicate namespace name within a project)
- 429: Rate limited
- 500: Internal server error

### Pagination

Scaleway Container Registry uses standard Scaleway pagination: `page` (1-indexed) and `page_size` (default 50, max 100) query parameters. Responses include a `total_count` field. The `toUrlParams` utility handles converting optional pagination parameters to URL query strings.

### Key Differences from Instances API

| Aspect | Instances (002) | Container Registry (006) |
|--------|-----------------|--------------------------|
| Locality | Zone-scoped (fr-par-1) | Region-scoped (fr-par) |
| Entity hierarchy | Flat (servers, volumes, IPs) | Nested (Namespace > Image > Tag) |
| Create operations | Servers, volumes, SGs, IPs, snapshots | Namespaces only (images are pushed via Docker) |
| Update operations | Limited | Namespace (description, is_public), Image (visibility) |
| Action endpoints | Server actions (poweron, poweroff) | None |

### Image Creation Note

Unlike most Scaleway resources, container images are not created via the API. Images are pushed to the registry using Docker or OCI-compatible tools. The API only allows listing, inspecting, updating visibility, and deleting images. Tags are similarly created by pushing images and can only be listed, inspected, or deleted via the API.
