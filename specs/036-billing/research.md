# Research: Scaleway Billing MCP Tools

**Feature**: 036-billing | **Date**: 2026-03-11

## Technology Decisions

### Scaleway SDK Client Pattern

The project uses `@scaleway/sdk-client` with `createClient()`. The Billing API is accessed via the Scaleway REST API through the SDK client. The SDK client handles authentication and base URL routing.

API calls follow the pattern:
```typescript
const client = createScalewayClient(config);
const response = await client.fetch<Record<string, unknown>>({
  method: "GET",
  path: `${BILLING_API_BASE}/consumptions`,
  urlParams,
});
```

### Billing API Structure

The Scaleway Billing API is a **global** API (not zoned or regional). Base URL pattern:
```
https://api.scaleway.com/billing/v2beta1/
```

Key endpoints:
- `GET /consumptions` - List consumptions (paginated, filterable)
- `GET /invoices` - List invoices (paginated, filterable)
- `GET /invoices/{invoice_id}` - Get a single invoice
- `GET /invoices/{invoice_id}/download` - Download invoice as PDF
- `GET /discounts` - List discounts (paginated)

### Implementation Approach

The billing tools follow the same pattern as other product tools in the MCP server:
1. **types.ts** defines Zod schemas for entities (Money, Consumption, Invoice, Discount) and request/response params
2. **handlers.ts** implements handler functions that build URL params, call the Scaleway API via `client.fetch`, and return formatted JSON responses
3. **index.ts** registers each tool with the MCP server using `server.tool()`, providing name, description, schema shape, and async handler

Helper functions in handlers.ts:
- `buildUrlParams()` - Converts a params record to URLSearchParams, filtering out undefined/null values
- `formatJsonResponse()` - Wraps API response data in the MCP text content format

### Error Handling

All Scaleway API errors are caught in try/catch blocks and mapped using the shared `mapScalewayError` + `formatErrorResponse` from `src/shared/errors.ts`. This provides consistent structured error responses across all tools.

### Pagination

Billing uses the shared `PaginationParams` (page, pageSize) and the `paginationToQuery()` helper to convert to Scaleway API query parameters. List responses include `total_count` for total result count.

### Key Differences from Other Products

- **Global API**: No zone or region parameter (unlike Instances which is zoned)
- **Read-only**: All 5 tools are GET operations; no create/update/delete of billing entities
- **Beta API**: v2beta1 indicates the API shape may evolve
- **Money type**: Uses a composite Money object (currency_code, units, nanos) for precise monetary values
- **Organization-scoped**: Most operations require or accept organization_id as a filter
