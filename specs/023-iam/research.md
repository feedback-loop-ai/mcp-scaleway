# Research: Scaleway IAM MCP Tools

**Feature**: 023-iam | **Date**: 2026-03-11

## Technology Decisions

### Scaleway SDK Client Pattern

The project uses `@scaleway/sdk-client` with `createClient()`. The IAM API is accessed via the Scaleway REST API through the SDK client. The SDK client handles authentication, base URL routing, and request marshalling.

API calls follow the pattern:
```typescript
const client = createScalewayClient(config);
const data = await client.fetch<unknown>({
  method: "GET",
  path: "/iam/v1alpha1/users",
  urlParams: buildParams({ organization_id, page, page_size }),
});
```

### IAM API Structure

The Scaleway IAM API is a **global** API (not zoned or regional). Base URL pattern:
```
https://api.scaleway.com/iam/v1alpha1/
```

Key endpoints:

**Users**:
- `GET /users` - List users (paginated, filterable by organization_id)
- `GET /users/{user_id}` - Get user
- `POST /users` - Create user (invite by email)
- `PATCH /users/{user_id}` - Update user
- `DELETE /users/{user_id}` - Delete user

**Applications**:
- `GET /applications` - List applications (paginated)
- `GET /applications/{application_id}` - Get application
- `POST /applications` - Create application
- `PATCH /applications/{application_id}` - Update application
- `DELETE /applications/{application_id}` - Delete application

**API Keys**:
- `GET /api-keys` - List API keys (paginated, filterable by organization_id, application_id, user_id)
- `GET /api-keys/{access_key}` - Get API key
- `POST /api-keys` - Create API key
- `PATCH /api-keys/{access_key}` - Update API key
- `DELETE /api-keys/{access_key}` - Delete API key

**Policies**:
- `GET /policies` - List policies (paginated)
- `GET /policies/{policy_id}` - Get policy
- `POST /policies` - Create policy (with optional inline rules)
- `PATCH /policies/{policy_id}` - Update policy
- `DELETE /policies/{policy_id}` - Delete policy

**Rules**:
- `GET /rules` - List rules (filtered by policy_id, paginated)
- `POST /rules` - Create rule
- `PATCH /rules/{rule_id}` - Update rule
- `DELETE /rules/{rule_id}` - Delete rule

**Groups**:
- `GET /groups` - List groups (paginated)
- `GET /groups/{group_id}` - Get group
- `POST /groups` - Create group
- `PATCH /groups/{group_id}` - Update group
- `DELETE /groups/{group_id}` - Delete group
- `POST /groups/{group_id}/members` - Add member
- `DELETE /groups/{group_id}/members` - Remove member

**Permission Sets**:
- `GET /permission-sets` - List permission sets (paginated)

### Implementation Approach

The implementation uses a thin handler layer that wraps the shared `@scaleway/sdk-client`. Each handler function constructs the appropriate API path, makes the request via `client.fetch()`, and returns structured JSON responses. Helper functions `jsonResponse()` and `buildParams()` reduce boilerplate.

Key differences from zoned APIs (like Instances):
1. No `zone` parameter on any tool
2. `organization_id` is the primary scoping parameter instead
3. API keys are identified by `access_key` string, not a UUID
4. Group membership uses nested `/members` endpoints

### Error Handling

All Scaleway API errors come back as Error objects with a `statusCode` property. The shared `mapScalewayError` function in `src/shared/errors.ts` handles the mapping to MCP error types. Each handler wraps its logic in try/catch and calls `formatErrorResponse(mapScalewayError(error))`.

### Pagination

Scaleway uses `page` (1-indexed) and `page_size` query parameters. Responses include a `total_count` field. All list endpoints support the `order_by` parameter for sorting results.
