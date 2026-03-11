# Research: Scaleway Cockpit (Observability) MCP Tools

**Feature**: 031-cockpit | **Date**: 2026-03-11

## Technology Decisions

### Scaleway Cockpit API Structure

The Scaleway Cockpit API is primarily region-scoped, with Grafana user endpoints being global. Base URL pattern:
```
https://api.scaleway.com/cockpit/v1/regions/{region}/
```

Grafana user endpoints are global (no region):
```
https://api.scaleway.com/cockpit/v1/grafana-users
```

### API Endpoint Groups

**Cockpit Lifecycle** (regional):
- `GET /cockpit/v1/regions/{region}/cockpit` - Get Cockpit info
- `POST /cockpit/v1/regions/{region}/activate-cockpit` - Activate Cockpit
- `POST /cockpit/v1/regions/{region}/deactivate-cockpit` - Deactivate Cockpit

**Data Sources** (regional):
- `GET /cockpit/v1/regions/{region}/data-sources` - List data sources (paginated)
- `POST /cockpit/v1/regions/{region}/data-sources` - Create data source
- `DELETE /cockpit/v1/regions/{region}/data-sources/{data_source_id}` - Delete data source

**Tokens** (regional):
- `GET /cockpit/v1/regions/{region}/tokens` - List tokens (paginated)
- `POST /cockpit/v1/regions/{region}/tokens` - Create token
- `DELETE /cockpit/v1/regions/{region}/tokens/{token_id}` - Delete token

**Grafana Users** (global):
- `GET /cockpit/v1/grafana-users` - List Grafana users (paginated)
- `POST /cockpit/v1/grafana-users` - Create Grafana user
- `DELETE /cockpit/v1/grafana-users/{grafana_user_id}` - Delete Grafana user
- `POST /cockpit/v1/grafana-users/{grafana_user_id}/reset-password` - Reset password

**Alert Manager** (regional):
- `GET /cockpit/v1/regions/{region}/alert-manager` - Get alert manager
- `POST /cockpit/v1/regions/{region}/alert-manager/enable` - Enable alert manager
- `POST /cockpit/v1/regions/{region}/alert-manager/disable` - Disable alert manager

**Contact Points** (regional):
- `GET /cockpit/v1/regions/{region}/alert-manager/contact-points` - List contact points (paginated)
- `POST /cockpit/v1/regions/{region}/alert-manager/contact-points` - Create contact point
- `DELETE /cockpit/v1/regions/{region}/alert-manager/contact-points` - Delete contact point (uses body, not path param)

**Managed Alerts** (regional):
- `GET /cockpit/v1/regions/{region}/alert-manager/managed-alerts-contact-points` - List managed alerts contact points (paginated)
- `POST /cockpit/v1/regions/{region}/alert-manager/managed-alerts/enable` - Enable managed alerts
- `POST /cockpit/v1/regions/{region}/alert-manager/managed-alerts/disable` - Disable managed alerts

### Implementation Approach

The handlers use the shared `createScalewayClient` from `src/shared/client.ts` to make typed HTTP requests. Each handler:
1. Loads auth config and creates a client
2. Resolves the region (from input or default config)
3. Constructs the API path and parameters
4. Returns structured responses via `formatSuccess`
5. Maps errors via shared `mapScalewayError` + `formatErrorResponse`

### Key Design Decisions

- **Region resolution**: All regional endpoints accept an optional `region` parameter. If omitted, the default region from auth config is used via `resolveRegion()`.
- **Grafana user ID type**: Grafana user IDs are numeric (not UUID strings), unlike most other Scaleway resource IDs.
- **Contact point deletion**: The delete contact point endpoint uses a request body with `project_id` and `email` rather than a path parameter, which is unusual for REST APIs.
- **Token secret key**: The `secret_key` field on Token is only returned at creation time and cannot be retrieved afterwards.
- **Pagination**: List endpoints use the shared `paginationToQuery` and `buildPaginatedResponse` helpers for consistent pagination behavior.

### Error Handling

All Scaleway API errors are caught and mapped through `mapScalewayError` from `src/shared/errors.ts`, then formatted via `formatErrorResponse`. This provides consistent structured error responses across all tools.

### Pagination

Paginated list endpoints (data sources, tokens, Grafana users, contact points, managed alerts contact points) use the shared `PaginationParams` schema (page, pageSize) and return responses via `buildPaginatedResponse` with `total_count`.
