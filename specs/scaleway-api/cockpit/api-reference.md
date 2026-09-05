# Scaleway Cockpit API Reference

Official docs:
- Regional API: https://www.scaleway.com/en/developers/api/cockpit/regional-api/
- Global API: https://www.scaleway.com/en/developers/api/cockpit/global-api/

Base URL: `https://api.scaleway.com/cockpit/v1`

## Authentication

- Header: `X-Auth-Token: <secret_key>` (Scaleway API secret key)

## Pagination

Offset-based via `page` (1-indexed) and `page_size`. List responses return
`total_count` and are wrapped by the server through `buildPaginatedResponse`.

## Entities

### Cockpit
`{ project_id, status, endpoints: CockpitEndpoint[], created_at|null, updated_at|null }`
- `CockpitEndpoint`: `{ url, name, type }`
- `status` enum: `unknown_status`, `creating`, `ready`, `deleting`, `updating`, `error`

### DataSource
`{ id, project_id, name, type, url, created_at|null, updated_at|null, synchronized_with_grafana, region }`
- `type` enum (`DataSourceType`): `unknown_type`, `metrics`, `logs`, `traces`

### Token
`{ id, project_id, name, created_at|null, updated_at|null, scopes: TokenScope[], secret_key? }`
- `secret_key` only returned on creation.
- `TokenScope` enum (regional v1, per official OpenAPI schema `scaleway.cockpit.v1.Token.Scope`):
  `unknown_scope`, `read_only_metrics`, `write_only_metrics`, `full_access_metrics_rules`,
  `read_only_logs`, `write_only_logs`, `full_access_logs_rules`, `full_access_alert_manager`,
  `read_only_traces`, `write_only_traces`.
- Note: the token entity response field is `scopes`, but the CreateToken request body uses `token_scopes`.

### GrafanaUser
`{ id (number), login, role, password? }`
- `password` only returned on creation / reset.
- `role` enum (`GrafanaUserRole`): `unknown_role`, `editor`, `viewer`

### ContactPoint
`{ email?, region? }`

### AlertManager
`{ alert_manager_url, alert_manager_enabled, region }`

## Endpoints

### Cockpit (regional)
| Tool | Method/Path |
|------|-------------|
| `scaleway_cockpit_get_cockpit` | `GET /cockpit/v1/regions/{region}/cockpit?project_id=` |
| `scaleway_cockpit_activate_cockpit` | `POST /cockpit/v1/regions/{region}/activate-cockpit` |
| `scaleway_cockpit_deactivate_cockpit` | `POST /cockpit/v1/regions/{region}/deactivate-cockpit` |

### Data Sources (regional)
| Tool | Method/Path |
|------|-------------|
| `scaleway_cockpit_list_data_sources` | `GET /cockpit/v1/regions/{region}/data-sources` |
| `scaleway_cockpit_create_data_source` | `POST /cockpit/v1/regions/{region}/data-sources` |
| `scaleway_cockpit_delete_data_source` | `DELETE /cockpit/v1/regions/{region}/data-sources/{id}` |

- List query: `project_id`, `page`, `page_size`, `order_by`, `types[]`
- List response: `{ data_sources: DataSource[], total_count }`
- Create body: `{ project_id, name, type? }`

### Tokens (regional)
| Tool | Method/Path |
|------|-------------|
| `scaleway_cockpit_list_tokens` | `GET /cockpit/v1/regions/{region}/tokens` |
| `scaleway_cockpit_create_token` | `POST /cockpit/v1/regions/{region}/tokens` |
| `scaleway_cockpit_delete_token` | `DELETE /cockpit/v1/regions/{region}/tokens/{id}` |

- List response: `{ tokens: Token[], total_count }`
- Create body: `{ project_id, name, token_scopes? }` (the request field is `token_scopes`, not `scopes`)

### Grafana Users (global) — deprecated upstream

> **Deprecation:** all four `/cockpit/v1/grafana/users` operations are flagged `deprecated: true` in the official Cockpit Global v1 OpenAPI schema with the summary "(Deprecated) EOL 2026-01-20"; the schema names no replacement endpoint. The tools are kept for compatibility, carry " (deprecated upstream)" in their MCP descriptions, and are marked `deprecated_upstream: true` in `tests/parity-matrix.json`. Expect them to start failing once Scaleway completes the removal.

| Tool | Method/Path |
|------|-------------|
| `scaleway_cockpit_list_grafana_users` | `GET /cockpit/v1/grafana/users?project_id=` |
| `scaleway_cockpit_create_grafana_user` | `POST /cockpit/v1/grafana/users` |
| `scaleway_cockpit_delete_grafana_user` | `DELETE /cockpit/v1/grafana/users/{id}?project_id=` |
| `scaleway_cockpit_reset_grafana_user_password` | `POST /cockpit/v1/grafana/users/{id}/reset-password` |

- List response: `{ grafana_users: GrafanaUser[], total_count }`
- Create body: `{ project_id, login, role? }`

### Alert Manager (regional)
| Tool | Method/Path |
|------|-------------|
| `scaleway_cockpit_get_alert_manager` | `GET /cockpit/v1/regions/{region}/alert-manager?project_id=` |
| `scaleway_cockpit_enable_alert_manager` | `POST /cockpit/v1/regions/{region}/alert-manager/enable` |
| `scaleway_cockpit_disable_alert_manager` | `POST /cockpit/v1/regions/{region}/alert-manager/disable` |

### Contact Points (regional)
| Tool | Method/Path |
|------|-------------|
| `scaleway_cockpit_list_contact_points` | `GET /cockpit/v1/regions/{region}/alert-manager/contact-points` |
| `scaleway_cockpit_create_contact_point` | `POST /cockpit/v1/regions/{region}/alert-manager/contact-points` |
| `scaleway_cockpit_delete_contact_point` | `DELETE /cockpit/v1/regions/{region}/alert-manager/contact-points` |

- Create/delete body: `{ project_id, email: { to: <email> } }`
- List response: `{ contact_points: ContactPoint[], total_count }`

### Managed Alerts (regional)
| Tool | Method/Path |
|------|-------------|
| `scaleway_cockpit_list_managed_alerts_contact_points` | `GET /cockpit/v1/regions/{region}/alert-manager/managed-alerts-contact-points` |
| `scaleway_cockpit_enable_managed_alerts` | `POST /cockpit/v1/regions/{region}/alert-manager/managed-alerts/enable` — **deprecated upstream** |
| `scaleway_cockpit_disable_managed_alerts` | `POST /cockpit/v1/regions/{region}/alert-manager/managed-alerts/disable` — **deprecated upstream** |

> **Deprecation:** `EnableManagedAlerts` and `DisableManagedAlerts` are flagged `deprecated: true` in the official Cockpit Regional v1 OpenAPI schema; the replacement is the per-rule `POST /cockpit/v1/regions/{region}/alert-manager/enable-alert-rules` / `disable-alert-rules` pair (not exposed as tools). The two tools are kept for compatibility, carry " (deprecated upstream)" in their MCP descriptions, and are marked `deprecated_upstream: true` in `tests/parity-matrix.json`. `list_managed_alerts_contact_points` is not deprecated.

## Implementation Notes / Verification / Deviations

- Grafana user, token, and cockpit management endpoints verified against the
  official Cockpit regional v1 OpenAPI schema
  (`https://www.scaleway.com/en/developers/api/cockpit/regional/v1/schema.yml`)
  and the Scaleway Go SDK `api/cockpit/v1/cockpit_sdk.go`.
- **Fixed (2026-07) — token scopes**: the regional v1 CreateToken endpoint
  (`POST /cockpit/v1/regions/{region}/tokens`) accepts the `token_scopes` body
  field with the `scaleway.cockpit.v1.Token.Scope` enum
  (`read_only_metrics`, `write_only_metrics`, `full_access_metrics_rules`,
  `read_only_logs`, `write_only_logs`, `full_access_logs_rules`,
  `full_access_alert_manager`, `read_only_traces`, `write_only_traces`). The
  `query_metrics`/`write_metrics`/`setup_alerts` literals belong to the
  deprecated global-API boolean-object token model and are NOT accepted here.
  Corrected: the enum literals (`full_access_metrics`→`full_access_metrics_rules`,
  `full_access_logs`→`full_access_logs_rules`,
  `full_access_alerts_manager`→`full_access_alert_manager`; removed
  `full_access_traces` and `read_only_alerts_manager`) and the request body
  field (`scopes`→`token_scopes`).
- **Fixed (2026-07) — grafana users path**: the global Grafana user endpoints
  use `/cockpit/v1/grafana/users` (slash), not the hyphenated
  `/cockpit/v1/grafana-users`.
- **Deviation — grafana-users path**: the server uses
  `/cockpit/v1/grafana-users`; some quickstart snippets in the official docs
  show `/cockpit/v1/grafana/users`. The hyphenated form matches the Scaleway
  SDK. Flagged, not changed.
- **Not independently confirmable from the public HTML reference**: the exact
  managed-alerts sub-paths (`managed-alerts/enable`, `managed-alerts/disable`,
  `managed-alerts-contact-points`) and the `activate-cockpit` /
  `deactivate-cockpit` action paths render inside interactive examples rather
  than a static path list. They match the Scaleway SDK conventions and are
  documented here as implemented.
