# 031-cockpit: Cockpit (Observability) API

## User Stories

### P1 - Cockpit Activation & Info
- As a user, I want to get my Cockpit info so I can see endpoints and status
- As a user, I want to activate/deactivate Cockpit for my project

### P1 - Token Management
- As a user, I want to list, create, and delete Cockpit tokens for data ingestion/querying

### P2 - Data Source Management
- As a user, I want to list, create, and delete data sources for observability

### P2 - Grafana User Management
- As a user, I want to manage Grafana users (list, create, delete, reset password)

### P3 - Alert Manager & Contact Points
- As a user, I want to enable/disable alert manager and manage contact points
- As a user, I want to manage managed alerts and their contact points

## MCP Tools

| Tool | Method | API Endpoint | Priority |
|------|--------|-------------|----------|
| scaleway_cockpit_get_cockpit | GET | /cockpit/v1/regions/{region}/cockpit | P1 |
| scaleway_cockpit_activate_cockpit | POST | /cockpit/v1/regions/{region}/activate-cockpit | P1 |
| scaleway_cockpit_deactivate_cockpit | POST | /cockpit/v1/regions/{region}/deactivate-cockpit | P1 |
| scaleway_cockpit_list_data_sources | GET | /cockpit/v1/regions/{region}/data-sources | P2 |
| scaleway_cockpit_create_data_source | POST | /cockpit/v1/regions/{region}/data-sources | P2 |
| scaleway_cockpit_delete_data_source | DELETE | /cockpit/v1/regions/{region}/data-sources/{data_source_id} | P2 |
| scaleway_cockpit_list_tokens | GET | /cockpit/v1/regions/{region}/tokens | P1 |
| scaleway_cockpit_create_token | POST | /cockpit/v1/regions/{region}/tokens | P1 |
| scaleway_cockpit_delete_token | DELETE | /cockpit/v1/regions/{region}/tokens/{token_id} | P1 |
| scaleway_cockpit_list_grafana_users | GET | /cockpit/v1/grafana-users | P2 |
| scaleway_cockpit_create_grafana_user | POST | /cockpit/v1/grafana-users | P2 |
| scaleway_cockpit_delete_grafana_user | DELETE | /cockpit/v1/grafana-users/{grafana_user_id} | P2 |
| scaleway_cockpit_reset_grafana_user_password | POST | /cockpit/v1/grafana-users/{grafana_user_id}/reset-password | P2 |
| scaleway_cockpit_get_alert_manager | GET | /cockpit/v1/regions/{region}/alert-manager | P3 |
| scaleway_cockpit_enable_alert_manager | POST | /cockpit/v1/regions/{region}/alert-manager/enable | P3 |
| scaleway_cockpit_disable_alert_manager | POST | /cockpit/v1/regions/{region}/alert-manager/disable | P3 |
| scaleway_cockpit_list_contact_points | GET | /cockpit/v1/regions/{region}/alert-manager/contact-points | P3 |
| scaleway_cockpit_create_contact_point | POST | /cockpit/v1/regions/{region}/alert-manager/contact-points | P3 |
| scaleway_cockpit_delete_contact_point | DELETE | /cockpit/v1/regions/{region}/alert-manager/contact-points/{contact_point_id} | P3 |
| scaleway_cockpit_list_managed_alerts_contact_points | GET | /cockpit/v1/regions/{region}/alert-manager/managed-alerts-contact-points | P3 |
| scaleway_cockpit_enable_managed_alerts | POST | /cockpit/v1/regions/{region}/alert-manager/managed-alerts/enable | P3 |
| scaleway_cockpit_disable_managed_alerts | POST | /cockpit/v1/regions/{region}/alert-manager/managed-alerts/disable | P3 |

## Entities

- **Cockpit**: project_id, status, endpoints[], created_at, updated_at
- **DataSource**: id, project_id, name, type, url, created_at, updated_at, synchronized_with_grafana, region
- **Token**: id, project_id, name, created_at, updated_at, scopes
- **GrafanaUser**: id, login, role, password
- **ContactPoint**: id, name, email, region
- **AlertManager**: alert_manager_url, alert_manager_enabled, region

## Locality

- Most endpoints: **regional** (fr-par, nl-ams, pl-waw)
- Grafana users: **global** (no region parameter)
