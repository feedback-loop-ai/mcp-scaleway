# Research: Scaleway SQS (Queues) MCP Tools

**Feature**: 027-sqs | **Date**: 2026-03-11

## Technology Decisions

### Scaleway SDK Client Pattern

The project uses `@scaleway/sdk-client` with `createClient()`. The SQS management API is accessed via the Scaleway REST API through the SDK client. The SDK client handles authentication, base URL routing, and region-based endpoint resolution.

API calls follow the pattern:
```typescript
const client = createScalewayClient(config);
// HTTP calls to the SQS management API endpoints
```

### SQS Management API Structure

The Scaleway SQS management API is region-scoped. Base URL pattern:
```
https://api.scaleway.com/mnq/v1beta1/regions/{region}/
```

The API is under the Messaging and Queuing (MnQ) product family, at API version v1beta1.

Key endpoints:
- `POST /activate-sqs` - Activate SQS service for a project
- `POST /deactivate-sqs` - Deactivate SQS service for a project
- `GET /sqs-info` - Get SQS service status and endpoint URL
- `POST /sqs-credentials` - Create SQS credentials
- `DELETE /sqs-credentials/{credential_id}` - Delete SQS credentials
- `GET /sqs-credentials/{credential_id}` - Get SQS credentials
- `GET /sqs-credentials` - List SQS credentials (paginated)
- `PATCH /sqs-credentials/{credential_id}` - Update SQS credentials

### Two-Layer Architecture

Scaleway SQS has two distinct layers:

1. **Management API** (what this MCP server exposes): Handles service activation and credential management via the Scaleway REST API at `/mnq/v1beta1/`.
2. **SQS-compatible endpoint**: Once activated, the management API returns an `sqs_endpoint_url` that accepts standard AWS SQS protocol operations (CreateQueue, SendMessage, ReceiveMessage, etc.). This layer is not exposed by the MCP server.

### Implementation Approach

The handlers use the shared `@scaleway/sdk-client` to make typed HTTP requests to the management API. Each handler:
1. Resolves the region from input or config defaults
2. Constructs the API URL under `/mnq/v1beta1/regions/{region}/`
3. Makes the HTTP request via `client.fetch()`
4. Returns the response as structured JSON

### Error Handling

All Scaleway API errors are caught and mapped through the shared `mapScalewayError` function in `src/shared/errors.ts`, then formatted via `formatErrorResponse`. Standard error codes: 400 (invalid_input), 403 (permission_denied), 404 (not_found), 429 (rate_limited).

### Pagination

Only the `scaleway_sqs_list_credentials` endpoint supports pagination. It uses the shared `paginationToQuery` and `buildPaginatedResponse` utilities. Pagination parameters: `page` (1-indexed), `page_size` (1-100), `order_by` (enum of sort fields).

### Credentials Security

The `secret_key` field is only returned in full at credential creation time. Subsequent GET requests return a redacted value. This is standard Scaleway behavior for sensitive credentials.
