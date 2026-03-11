# Research: Scaleway Transactional Email (TEM) MCP Tools

**Feature**: 032-tem | **Date**: 2026-03-11

## Technology Decisions

### Scaleway SDK Client Pattern

The project uses `@scaleway/sdk-client` with `createClient()`. The TEM API is accessed via the Scaleway REST API through the SDK client. The SDK client handles authentication, base URL routing, and region-based endpoint resolution.

API calls follow the pattern:
```typescript
const client = createScalewayClient(config);
// The SDK client provides fetch-like methods for Scaleway API endpoints
```

Since `@scaleway/sdk-client` provides a generic client, we make HTTP calls to the TEM API endpoints directly using the client's fetch method.

### TEM API Structure

The Scaleway Transactional Email API is region-scoped. Base URL pattern:
```
https://api.scaleway.com/transactional-email/v1alpha1/regions/{region}/
```

Key endpoints:

**Domains:**
- `GET /domains` - List domains (paginated)
- `GET /domains/{domain_id}` - Get domain
- `POST /domains` - Create domain
- `POST /domains/{domain_id}/revoke` - Revoke domain
- `POST /domains/{domain_id}/check` - Trigger DNS check
- `GET /domains/{domain_id}/verification` - Get domain last verification status

**Emails:**
- `GET /emails` - List emails (paginated)
- `GET /emails/{email_id}` - Get email
- `POST /emails` - Send email
- `POST /emails/{email_id}/cancel` - Cancel queued email

**Statistics:**
- `GET /statistics` - Get aggregated email statistics

**Webhooks:**
- `GET /webhooks` - List webhooks (paginated)
- `POST /webhooks` - Create webhook
- `PATCH /webhooks/{webhook_id}` - Update webhook
- `DELETE /webhooks/{webhook_id}` - Delete webhook

### Implementation Approach

The handler functions construct the API URL, make the request via the SDK client's `fetch` method, and return structured responses. This approach:
1. Avoids adding new dependencies
2. Keeps the server as a thin proxy
3. Allows full control over request/response shapes

A shared `buildUrlParams` utility is used to construct query parameters, omitting undefined values.

### Region Resolution

TEM uses regional (not zoned) locality. The `resolveRegion` helper defaults to `SCW_DEFAULT_REGION` env var, falling back to `fr-par`. Supported regions: fr-par, nl-ams.

### Error Handling

All Scaleway API errors come back as Error objects with a `statusCode` property. The shared `mapScalewayError` function in `src/shared/errors.ts` handles the mapping to MCP error types.

### Pagination

Scaleway uses `page` (1-indexed) and `page_size` query parameters. Responses include a `total_count` field. The shared `buildPaginatedResponse` utility handles response formatting.

### Email Sending

The create email endpoint accepts:
- `from` object with email and optional display name
- `to` array of recipient objects with email and optional display name
- `subject`, `text`, `html` body content
- `project_id` for billing/tracking
- `attachments` array with base64-encoded content

### Webhook Event Types

Webhooks subscribe to specific email lifecycle events and deliver notifications via Scaleway SNS (Simple Notification Service). This enables event-driven architectures for email tracking and monitoring.
