# Research: Scaleway NATS Messaging MCP Tools

**Feature**: 026-nats | **Date**: 2026-03-11

## Technology Decisions

### Scaleway SDK Client Pattern

The project uses `@scaleway/sdk-client` with `createClient()`. The NATS Messaging API is accessed via the Scaleway REST API through the SDK client. The SDK client handles authentication, base URL routing, and region-based endpoint resolution.

API calls follow the pattern:
```typescript
const client = createScalewayClient(config);
// The SDK client provides fetch-like methods for Scaleway API endpoints
```

The `urlParams` utility from `@scaleway/sdk-client` is used to construct query string parameters for list/filter operations.

### NATS Messaging API Structure

The Scaleway NATS Messaging API is part of the MNQ (Messaging and Queuing) product, operating at the regional level. Base URL pattern:
```
https://api.scaleway.com/mnq/v1beta1/regions/{region}/
```

Key endpoints:
- `GET /nats-accounts` - List NATS accounts (paginated)
- `GET /nats-accounts/{nats_account_id}` - Get NATS account
- `POST /nats-accounts` - Create NATS account
- `PATCH /nats-accounts/{nats_account_id}` - Update NATS account
- `DELETE /nats-accounts/{nats_account_id}` - Delete NATS account
- `GET /nats-accounts/{nats_account_id}/nats-credentials` - List credentials for an account
- `GET /nats-credentials/{nats_credentials_id}` - Get credentials
- `POST /nats-credentials` - Create credentials
- `DELETE /nats-credentials/{nats_credentials_id}` - Delete credentials

### Implementation Approach

The implementation uses the shared `@scaleway/sdk-client` to make typed HTTP requests. This is the simplest approach that:
1. Avoids adding new dependencies
2. Keeps the server as a thin proxy
3. Allows full control over request/response shapes

The handler functions construct the API URL, make the request via the SDK client, and return structured JSON responses via the `jsonResponse` helper.

### Error Handling

All Scaleway API errors come back as Error objects with a `statusCode` property. The shared `mapScalewayError` function in `src/shared/errors.ts` handles the mapping to MCP error types. The shared `formatErrorResponse` wraps errors into the MCP response format.

### Pagination

Scaleway uses `page` (1-indexed) and `page_size` query parameters. Responses include a `total_count` field. The shared `buildPaginatedResponse` utility from `src/shared/pagination.ts` constructs the standardized paginated response structure.

### Regional Locality

Unlike zone-scoped APIs (e.g., Instances), the NATS API is region-scoped. Supported regions are: fr-par, nl-ams, pl-waw. The `ScalewayRegion` Zod type from `src/shared/types.ts` validates region inputs.

### Credentials Security

When creating NATS credentials, the API returns the credential content (NKey-based) in the response. This content is only available at creation time and cannot be retrieved later. The `NatsCredentialsContent` type models this extended response.
