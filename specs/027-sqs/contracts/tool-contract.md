# Tool Contracts: Scaleway SQS (Queues) MCP Tools

**Feature**: 027-sqs | **Date**: 2026-03-11

## Service Management Tools

### scaleway_sqs_activate

**Scaleway API**: `POST /mnq/v1beta1/regions/{region}/activate-sqs`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region (e.g., fr-par), defaults to config |
| project_id | string (UUID) | no | Project ID, defaults to config |

**Output**: `{ project_id, region, status, sqs_endpoint_url, created_at, updated_at }`

---

### scaleway_sqs_deactivate

**Scaleway API**: `POST /mnq/v1beta1/regions/{region}/deactivate-sqs`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region, defaults to config |
| project_id | string (UUID) | no | Project ID, defaults to config |

**Output**: `{ project_id, region, status, sqs_endpoint_url, created_at, updated_at }`

---

### scaleway_sqs_get_info

**Scaleway API**: `GET /mnq/v1beta1/regions/{region}/sqs-info`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region, defaults to config |
| project_id | string (UUID) | no | Project ID, defaults to config |

**Output**: `{ project_id, region, status, sqs_endpoint_url, created_at, updated_at }`

---

## Credentials Tools

### scaleway_sqs_create_credentials

**Scaleway API**: `POST /mnq/v1beta1/regions/{region}/sqs-credentials`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region, defaults to config |
| project_id | string (UUID) | no | Project ID, defaults to config |
| name | string | yes | Credential name |
| permissions | object | no | Permission set (can_publish, can_receive, can_manage) |

**Output**: `{ id, name, project_id, region, access_key, secret_key, created_at, updated_at, permissions }`

---

### scaleway_sqs_delete_credentials

**Scaleway API**: `DELETE /mnq/v1beta1/regions/{region}/sqs-credentials/{credential_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region, defaults to config |
| credential_id | string (UUID) | yes | Credential ID to delete |

**Output**: `{ message: "Credentials deleted successfully" }`

---

### scaleway_sqs_get_credentials

**Scaleway API**: `GET /mnq/v1beta1/regions/{region}/sqs-credentials/{credential_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region, defaults to config |
| credential_id | string (UUID) | yes | Credential ID |

**Output**: `{ id, name, project_id, region, access_key, secret_key, created_at, updated_at, permissions }`

---

### scaleway_sqs_list_credentials

**Scaleway API**: `GET /mnq/v1beta1/regions/{region}/sqs-credentials`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | config | Scaleway region |
| project_id | string (UUID) | no | config | Project ID |
| page | number | no | 1 | Page number (1-indexed) |
| page_size | number | no | 50 | Items per page (1-100) |
| order_by | enum | no | created_at_asc | Order by field |

**Output**: `{ sqs_credentials: SqsCredentials[], total_count: number }`

---

### scaleway_sqs_update_credentials

**Scaleway API**: `PATCH /mnq/v1beta1/regions/{region}/sqs-credentials/{credential_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region, defaults to config |
| credential_id | string (UUID) | yes | Credential ID |
| name | string | no | New credential name |
| permissions | object | no | Updated permission set |

**Output**: `{ id, name, project_id, region, access_key, secret_key, created_at, updated_at, permissions }`
