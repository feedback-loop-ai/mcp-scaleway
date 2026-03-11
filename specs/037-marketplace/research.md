# Research: Scaleway Marketplace MCP Tools

**Feature**: 037-marketplace | **Date**: 2026-03-11

## Technology Decisions

### Scaleway SDK Client Pattern

The project uses `@scaleway/sdk-client` with `createClient()`. The Marketplace API v2 is accessed via the Scaleway REST API through the SDK client. The SDK client handles authentication and base URL routing.

API calls follow the pattern:
```typescript
const client = createScalewayClient(config);
// The SDK client provides fetch-like methods for Scaleway API endpoints
```

### Marketplace API Structure

The Scaleway Marketplace API v2 is a **global** API (not scoped to region or zone). Base URL pattern:
```
https://api.scaleway.com/marketplace/v2/
```

Key endpoints:
- `GET /images` - List marketplace images (paginated, filterable)
- `GET /images/{imageId}` - Get a single image
- `GET /local-images` - List local images (zone-specific variants)
- `GET /local-images/{localImageId}` - Get a single local image
- `GET /categories` - List categories
- `GET /categories/{categoryId}` - Get a single category
- `GET /versions` - List versions for an image (requires imageId)
- `GET /versions/{versionId}` - Get a single version

### Read-Only API

Unlike most Scaleway product APIs, the Marketplace API is entirely **read-only**. There are no create, update, or delete operations. The catalog is managed by Scaleway internally. This simplifies the implementation significantly -- all 8 tools are GET requests with optional query parameters.

### Implementation Approach

The implementation uses a thin API client layer that wraps `@scaleway/sdk-client` to make typed HTTP requests. This is the simplest approach that:
1. Avoids adding new dependencies
2. Keeps the server as a thin proxy
3. Allows full control over request/response shapes

Handler functions construct the API URL with query parameters, make the request via the SDK client, and return structured responses.

### Error Handling

All Scaleway API errors come back as Error objects with a `statusCode` property. The shared `mapScalewayError` function in `src/shared/errors.ts` handles the mapping to MCP error types. Common errors for the Marketplace API:
- 404: Image/category/version/local image not found
- 400: Invalid query parameters (bad UUID format, invalid enum values)

### Pagination

Scaleway uses `page` (1-indexed) and `page_size` query parameters. Responses include a `total_count` field. The shared `paginationToQuery` and `buildPaginatedResponse` utilities handle this pattern.

### Relationship Between Entities

- **Image** is the top-level catalog entry (e.g., "Ubuntu 22.04")
- **Version** represents a specific release of an Image (e.g., "22.04.3")
- **LocalImage** is a zone-specific, architecture-specific variant of a Version (e.g., "Ubuntu 22.04.3 in fr-par-1 for x86_64")
- **Category** groups Images by type (e.g., "Distribution", "Application")
