# Research: Scaleway Secret Manager MCP Tools

**Feature**: 024-secret-manager | **Date**: 2026-03-11

## Technology Decisions

### Scaleway SDK Secret Package

The project uses `@scaleway/sdk-secret` with the `Secretv1beta1.API` class. This provides type-safe methods for all Secret Manager API endpoints. The SDK handles authentication, base URL routing, and region-based endpoint resolution.

API client initialization:
```typescript
const config = loadAuthConfig();
const client = createScalewayClient(config);
const api = new Secretv1beta1.API(client);
```

The SDK provides methods like `api.listSecrets()`, `api.createSecret()`, `api.accessSecretVersion()`, etc., each accepting typed request objects and returning typed responses.

### Secret Manager API Structure

The Scaleway Secret Manager API is region-scoped. Base URL pattern:
```
https://api.scaleway.com/secret-manager/v1beta1/regions/{region}/
```

Key endpoints:
- `GET /secrets` - List secrets (paginated)
- `GET /secrets/{secret_id}` - Get secret
- `POST /secrets` - Create secret
- `PATCH /secrets/{secret_id}` - Update secret
- `DELETE /secrets/{secret_id}` - Delete secret
- `GET /secrets/{secret_id}/versions` - List versions (paginated)
- `GET /secrets/{secret_id}/versions/{revision}` - Get version
- `POST /secrets/{secret_id}/versions` - Create version
- `GET /secrets/{secret_id}/versions/{revision}/access` - Access version data
- `POST /secrets/{secret_id}/versions/{revision}/disable` - Disable version
- `POST /secrets/{secret_id}/versions/{revision}/enable` - Enable version
- `DELETE /secrets/{secret_id}/versions/{revision}` - Destroy version
- `POST /secrets/{secret_id}/protect` - Protect secret
- `POST /secrets/{secret_id}/unprotect` - Unprotect secret
- `GET /tags` - List tags (paginated)
- `POST /secrets/{secret_id}/add-owner` - Add owner

### Implementation Approach

The implementation uses the `@scaleway/sdk-secret` package directly rather than raw HTTP calls. This approach:
1. Provides type-safe request/response handling out of the box
2. Avoids reimplementing API marshalling
3. Keeps the handler code minimal (thin proxy pattern)

Each handler function instantiates the API client, calls the appropriate SDK method, and formats the response using the shared `formatSuccess` helper or catches errors using `mapScalewayError` + `formatErrorResponse`.

### Error Handling

All Scaleway API errors from the SDK are caught and mapped via `mapScalewayError()` in `src/shared/errors.ts`. This converts SDK error objects to structured MCP error responses with appropriate error types (not_found, invalid_input, etc.).

### Pagination

List operations use the shared `paginationToQuery()` helper to convert `page`/`pageSize` params to SDK-compatible query params, and `buildPaginatedResponse()` to wrap results with `totalCount`, `page`, and `pageSize` metadata.

### Secret Protection

The Secret Manager has a built-in protection mechanism. Protected secrets cannot be deleted until explicitly unprotected. The `isProtected` field on create maps to the API's `protected` field (renamed to avoid TypeScript reserved word conflicts).

### Ephemeral Policy

Secrets can have an ephemeral policy that controls automatic version lifecycle. When a policy triggers (based on time-to-live or single-access), the specified action (delete or disable) is applied to the version automatically.

### Version Revisions

Versions are identified by revision, which can be:
- A numeric string (e.g., "1", "2") for specific versions
- `"latest"` for the most recent version
- `"latest_enabled"` for the most recent enabled version

### Filtered Listing

The `listSecrets` handler adds `scheduledForDeletion: false` by default to exclude secrets that are pending deletion, ensuring clean results.
