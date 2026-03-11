# Research: Scaleway SNS (Topics & Events) MCP Tools

**Feature**: 028-sns | **Date**: 2026-03-11

## Technology Decisions

### Scaleway SDK Client Pattern

The project uses `@scaleway/sdk-client` with `createClient()`. The SNS API is accessed via the `SnsAPI` class from `@scaleway/sdk-mnq/v1beta1`. The SDK client handles authentication, base URL routing, and region-based endpoint resolution.

API calls follow the pattern:
```typescript
const config = loadAuthConfig();
const client = createScalewayClient(config);
const api = new SnsAPI(client);
```

Unlike the Instances API which uses direct HTTP calls, the SNS tools use the per-product SDK package `@scaleway/sdk-mnq` which provides a typed class-based interface (`SnsAPI`).

### SNS API Structure

The Scaleway Topics and Events (SNS) API is region-scoped (not zone-scoped). It is part of the Messaging and Queuing (MNQ) product family. Base URL pattern:
```
https://api.scaleway.com/mnq/v1beta1/regions/{region}/
```

Key endpoints:
- `POST /activate-sns` - Activate SNS for a project
- `POST /deactivate-sns` - Deactivate SNS for a project
- `GET /sns-info` - Get SNS service info
- `GET /sns-credentials` - List SNS credentials (paginated)
- `GET /sns-credentials/{sns_credentials_id}` - Get SNS credentials
- `POST /sns-credentials` - Create SNS credentials
- `PATCH /sns-credentials/{sns_credentials_id}` - Update SNS credentials
- `DELETE /sns-credentials/{sns_credentials_id}` - Delete SNS credentials

### Implementation Approach

The implementation uses the `SnsAPI` class from `@scaleway/sdk-mnq/v1beta1`, which provides typed methods for all SNS operations. This avoids building a custom HTTP client layer and leverages the SDK's built-in request/response marshalling.

Each handler function:
1. Instantiates the `SnsAPI` via `getSnsApi()` helper
2. Calls the corresponding SDK method
3. Formats the response (converting Date objects to ISO strings)
4. Returns a JSON text response via the `jsonResponse` helper

### Error Handling

All Scaleway API errors are caught in try/catch blocks and passed through the shared `mapScalewayError` function in `src/shared/errors.ts`, which maps SDK errors to structured MCP error types. The `formatErrorResponse` function then formats them for the MCP protocol.

### Pagination

Only `listSnsCredentials` supports pagination. It uses the shared `paginationToQuery` utility to convert page/pageSize parameters and `buildPaginatedResponse` to structure the paginated output with total_count.

### Permissions Model

SNS credentials have three granular permission flags:
- **canPublish**: Allows publishing messages to topics
- **canReceive**: Allows configuring subscriptions to receive messages
- **canManage**: Allows managing topics and subscriptions (create, delete, configure)

### Service Lifecycle

SNS follows a two-phase lifecycle:
1. **Activation**: Must call `activateSns` before any other operation. Returns the SNS endpoint URL.
2. **Deactivation**: Must delete all credentials and topics before calling `deactivateSns`.

### Date Formatting

The SDK returns `Date` objects for `createdAt` and `updatedAt` fields. The handlers convert these to ISO 8601 strings via a `formatDate` helper for consistent JSON serialization.
