# Data Model: Scaleway Cockpit (Observability) MCP Tools

**Feature**: 031-cockpit | **Date**: 2026-03-11

## Entities

### Cockpit

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| project_id | string (UUID) | yes | Project ID this Cockpit belongs to |
| status | enum | yes | unknown_status, creating, ready, deleting, updating, error |
| endpoints | CockpitEndpoint[] | yes | List of observability endpoints (metrics, logs, traces, alertmanager) |
| created_at | string (ISO 8601)/null | no | Creation timestamp |
| updated_at | string (ISO 8601)/null | no | Last update timestamp |

### CockpitEndpoint

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| url | string | yes | Endpoint URL |
| name | string | yes | Endpoint name |
| type | string | yes | Endpoint type (e.g., metrics_url, logs_url, traces_url, alertmanager_url) |

### DataSource

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique data source identifier |
| project_id | string (UUID) | yes | Project ID |
| name | string | yes | Data source name |
| type | enum | yes | unknown_type, metrics, logs, traces |
| url | string | yes | Data source URL |
| created_at | string (ISO 8601)/null | no | Creation timestamp |
| updated_at | string (ISO 8601)/null | no | Last update timestamp |
| synchronized_with_grafana | boolean | yes | Whether synchronized with Grafana |
| region | string | yes | Region (e.g., fr-par) |

### Token

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique token identifier |
| project_id | string (UUID) | yes | Project ID |
| name | string | yes | Token name |
| created_at | string (ISO 8601)/null | no | Creation timestamp |
| updated_at | string (ISO 8601)/null | no | Last update timestamp |
| scopes | TokenScope[] | yes | Token access scopes |
| secret_key | string | no | Secret key (only returned on creation) |

### TokenScope (enum)

Values: `unknown_scope`, `read_only_metrics`, `write_only_metrics`, `full_access_metrics`, `read_only_logs`, `write_only_logs`, `full_access_logs`, `read_only_traces`, `write_only_traces`, `full_access_traces`, `full_access_alerts_manager`, `read_only_alerts_manager`

### GrafanaUser

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | number | yes | Grafana user ID |
| login | string | yes | Grafana user login |
| role | enum | yes | unknown_role, editor, viewer |
| password | string | no | Password (only returned on creation or reset) |

### ContactPoint

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | no | Contact point email configuration |
| region | string | no | Region |

### AlertManager

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| alert_manager_url | string | yes | Alert manager URL |
| alert_manager_enabled | boolean | yes | Whether alert manager is enabled |
| region | string | yes | Region |
