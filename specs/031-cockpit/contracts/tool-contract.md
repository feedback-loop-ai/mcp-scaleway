# Tool Contracts: Scaleway Cockpit (Observability) MCP Tools

**Feature**: 031-cockpit | **Date**: 2026-03-11

## Cockpit Lifecycle Tools

### scaleway_cockpit_get_cockpit

**Scaleway API**: `GET /cockpit/v1/regions/{region}/cockpit`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| project_id | string | yes | Project ID |
| region | string | no | Region (e.g., fr-par) |

**Output**: `{ project_id, status, endpoints[], created_at, updated_at }`

---

### scaleway_cockpit_activate_cockpit

**Scaleway API**: `POST /cockpit/v1/regions/{region}/activate-cockpit`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| project_id | string | yes | Project ID |
| region | string | no | Region (e.g., fr-par) |

**Output**: `{ project_id, status, endpoints[], created_at, updated_at }`

---

### scaleway_cockpit_deactivate_cockpit

**Scaleway API**: `POST /cockpit/v1/regions/{region}/deactivate-cockpit`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| project_id | string | yes | Project ID |
| region | string | no | Region (e.g., fr-par) |

**Output**: `{ project_id, status, endpoints[], created_at, updated_at }`

---

## Data Source Tools

### scaleway_cockpit_list_data_sources

**Scaleway API**: `GET /cockpit/v1/regions/{region}/data-sources`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| project_id | string | yes | - | Project ID |
| region | string | no | - | Region (e.g., fr-par) |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| order_by | string | no | - | Order by field |
| types | string[] | no | - | Filter by data source types (metrics, logs, traces) |

**Output**: `{ data: DataSource[], pagination: { page, pageSize, totalCount } }`

---

### scaleway_cockpit_create_data_source

**Scaleway API**: `POST /cockpit/v1/regions/{region}/data-sources`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| project_id | string | yes | Project ID |
| name | string | yes | Data source name |
| type | enum | no | Data source type (metrics, logs, traces) |
| region | string | no | Region (e.g., fr-par) |

**Output**: `{ id, project_id, name, type, url, created_at, updated_at, synchronized_with_grafana, region }`

---

### scaleway_cockpit_delete_data_source

**Scaleway API**: `DELETE /cockpit/v1/regions/{region}/data-sources/{data_source_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| data_source_id | string | yes | Data source ID to delete |
| region | string | no | Region (e.g., fr-par) |

**Output**: `{ status: "deleted", data_source_id }`

---

## Token Tools

### scaleway_cockpit_list_tokens

**Scaleway API**: `GET /cockpit/v1/regions/{region}/tokens`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| project_id | string | yes | - | Project ID |
| region | string | no | - | Region (e.g., fr-par) |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| order_by | string | no | - | Order by field |

**Output**: `{ data: Token[], pagination: { page, pageSize, totalCount } }`

---

### scaleway_cockpit_create_token

**Scaleway API**: `POST /cockpit/v1/regions/{region}/tokens`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| project_id | string | yes | Project ID |
| name | string | yes | Token name |
| scopes | TokenScope[] | no | Token scopes |
| region | string | no | Region (e.g., fr-par) |

**Output**: `{ id, project_id, name, created_at, updated_at, scopes, secret_key }`

---

### scaleway_cockpit_delete_token

**Scaleway API**: `DELETE /cockpit/v1/regions/{region}/tokens/{token_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| token_id | string | yes | Token ID to delete |
| region | string | no | Region (e.g., fr-par) |

**Output**: `{ status: "deleted", token_id }`

---

## Grafana User Tools

### scaleway_cockpit_list_grafana_users

**Scaleway API**: `GET /cockpit/v1/grafana-users` (global, no region)

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| project_id | string | yes | - | Project ID |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| order_by | string | no | - | Order by field |

**Output**: `{ data: GrafanaUser[], pagination: { page, pageSize, totalCount } }`

---

### scaleway_cockpit_create_grafana_user

**Scaleway API**: `POST /cockpit/v1/grafana-users` (global, no region)

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| project_id | string | yes | Project ID |
| login | string | yes | Grafana user login |
| role | enum | no | Grafana user role (editor, viewer) |

**Output**: `{ id, login, role, password }`

---

### scaleway_cockpit_delete_grafana_user

**Scaleway API**: `DELETE /cockpit/v1/grafana-users/{grafana_user_id}` (global, no region)

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| grafana_user_id | number | yes | Grafana user ID to delete |
| project_id | string | yes | Project ID |

**Output**: `{ status: "deleted", grafana_user_id }`

---

### scaleway_cockpit_reset_grafana_user_password

**Scaleway API**: `POST /cockpit/v1/grafana-users/{grafana_user_id}/reset-password` (global, no region)

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| grafana_user_id | number | yes | Grafana user ID |
| project_id | string | yes | Project ID |

**Output**: `{ id, login, role, password }`

---

## Alert Manager Tools

### scaleway_cockpit_get_alert_manager

**Scaleway API**: `GET /cockpit/v1/regions/{region}/alert-manager`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| project_id | string | yes | Project ID |
| region | string | no | Region (e.g., fr-par) |

**Output**: `{ alert_manager_url, alert_manager_enabled, region }`

---

### scaleway_cockpit_enable_alert_manager

**Scaleway API**: `POST /cockpit/v1/regions/{region}/alert-manager/enable`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| project_id | string | yes | Project ID |
| region | string | no | Region (e.g., fr-par) |

**Output**: `{ alert_manager_url, alert_manager_enabled, region }`

---

### scaleway_cockpit_disable_alert_manager

**Scaleway API**: `POST /cockpit/v1/regions/{region}/alert-manager/disable`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| project_id | string | yes | Project ID |
| region | string | no | Region (e.g., fr-par) |

**Output**: `{ alert_manager_url, alert_manager_enabled, region }`

---

## Contact Point Tools

### scaleway_cockpit_list_contact_points

**Scaleway API**: `GET /cockpit/v1/regions/{region}/alert-manager/contact-points`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| project_id | string | yes | - | Project ID |
| region | string | no | - | Region (e.g., fr-par) |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |

**Output**: `{ data: ContactPoint[], pagination: { page, pageSize, totalCount } }`

---

### scaleway_cockpit_create_contact_point

**Scaleway API**: `POST /cockpit/v1/regions/{region}/alert-manager/contact-points`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| project_id | string | yes | Project ID |
| email | string | yes | Contact point email |
| region | string | no | Region (e.g., fr-par) |

**Output**: `{ email, region }`

---

### scaleway_cockpit_delete_contact_point

**Scaleway API**: `DELETE /cockpit/v1/regions/{region}/alert-manager/contact-points` (uses request body)

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| project_id | string | yes | Project ID |
| email | string | yes | Contact point email to delete |
| region | string | no | Region (e.g., fr-par) |

**Output**: `{ status: "deleted", email }`

**Note**: This endpoint uses a DELETE with request body rather than a path parameter for identifying the contact point.

---

## Managed Alerts Tools

### scaleway_cockpit_list_managed_alerts_contact_points

**Scaleway API**: `GET /cockpit/v1/regions/{region}/alert-manager/managed-alerts-contact-points`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| project_id | string | yes | - | Project ID |
| region | string | no | - | Region (e.g., fr-par) |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |

**Output**: `{ data: ContactPoint[], pagination: { page, pageSize, totalCount } }`

---

### scaleway_cockpit_enable_managed_alerts

**Scaleway API**: `POST /cockpit/v1/regions/{region}/alert-manager/managed-alerts/enable`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| project_id | string | yes | Project ID |
| region | string | no | Region (e.g., fr-par) |

**Output**: `{ alert_manager_url, alert_manager_enabled, region }`

---

### scaleway_cockpit_disable_managed_alerts

**Scaleway API**: `POST /cockpit/v1/regions/{region}/alert-manager/managed-alerts/disable`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| project_id | string | yes | Project ID |
| region | string | no | Region (e.g., fr-par) |

**Output**: `{ alert_manager_url, alert_manager_enabled, region }`
