# Research: Scaleway Domain Registrar MCP Tools

**Feature**: 020-domain-registrar | **Date**: 2026-03-11

## Technology Decisions

### Scaleway SDK Client Pattern

The project uses `@scaleway/sdk-client` with `createClient()`. The Domain Registrar API is accessed via the Scaleway REST API through the SDK client. The SDK client handles authentication and base URL routing.

API calls follow the pattern:
```typescript
const client = createScalewayClient(config);
// Direct HTTP calls to Domain Registrar API endpoints
```

### Domain Registrar API Structure

The Scaleway Domain Registrar API is a global API (not zone-scoped). Base URL pattern:
```
https://api.scaleway.com/domain/v2beta1/
```

Key endpoints:

**Domains:**
- `GET /domains` - List domains (paginated, filterable by project_id, organization_id, order_by)
- `GET /domains/{domain}` - Get domain by FQDN
- `POST /domains` - Register a new domain
- `POST /domains/{domain}/renew` - Renew a domain
- `POST /domains/transfer` - Transfer a domain from another registrar
- `PATCH /domains/{domain}` - Update domain contacts
- `POST /domains/{domain}/enable-auto-renew` - Enable auto-renewal
- `POST /domains/{domain}/disable-auto-renew` - Disable auto-renewal
- `GET /domains/availability` - Check domain availability

**Contacts:**
- `GET /contacts` - List contacts (paginated, filterable by domain, project_id, organization_id)
- `GET /contacts/{contact_id}` - Get contact by UUID
- `POST /contacts` - Create a new contact
- `PATCH /contacts/{contact_id}` - Update a contact

**TLDs:**
- `GET /tlds` - List available TLDs (paginated)
- `GET /tlds/{tld_name}` - Get TLD details

### Implementation Approach

The implementation uses a thin API client layer via the shared `createScalewayClient` to make typed HTTP requests. This approach:
1. Avoids adding new dependencies
2. Keeps the server as a thin proxy
3. Allows full control over request/response shapes

Each handler function constructs the API URL with the `/domain/v2beta1` prefix, makes the request via the SDK client, and returns structured MCP responses.

### Error Handling

All Scaleway API errors come back as Error objects with a `statusCode` property. The shared `mapScalewayError` function in `src/shared/errors.ts` handles the mapping to MCP error types. Common domain-specific errors include:
- 404: Domain or contact not found
- 409: Domain already registered or transfer conflict
- 400: Invalid domain name format, missing required fields
- 403: Insufficient permissions

### Pagination

Scaleway uses `page` (1-indexed) and `page_size` query parameters. Responses include a `total_count` field. The shared `paginationToQuery` and `buildPaginatedResponse` utilities handle this consistently.

### Key Design Decisions

- **Domain identification**: Domains are identified by FQDN (e.g., "example.com"), not by UUID. This differs from most other Scaleway resources.
- **Contact identification**: Contacts use standard UUIDs.
- **TLD identification**: TLDs are identified by name (e.g., "com", "fr", "io").
- **Auto-renew**: Managed via separate enable/disable endpoints rather than a PATCH field, providing explicit actions.
- **Transfer workflow**: Requires an EPP/authorization code from the current registrar.
- **API version**: Uses v2beta1, indicating the API is still in beta.
