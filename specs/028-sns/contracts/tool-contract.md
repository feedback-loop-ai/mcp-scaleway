# Tool Contracts: Scaleway SNS (Topics & Events) MCP Tools

**Feature**: 028-sns | **Date**: 2026-03-11

## Service Tools

### scaleway_sns_activate

**Scaleway API**: `POST /mnq/v1beta1/regions/{region}/activate-sns`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region to target (e.g., fr-par, nl-ams, pl-waw). Defaults to config |
| projectId | string | no | Project on which to activate the SNS service |

**Output**: `{ projectId, region, createdAt, updatedAt, status, snsEndpointUrl }`

---

### scaleway_sns_deactivate

**Scaleway API**: `POST /mnq/v1beta1/regions/{region}/deactivate-sns`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region to target. Defaults to config |
| projectId | string | no | Project on which to deactivate the SNS service |

**Output**: `{ projectId, region, createdAt, updatedAt, status, snsEndpointUrl }`

---

### scaleway_sns_get_info

**Scaleway API**: `GET /mnq/v1beta1/regions/{region}/sns-info`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region to target. Defaults to config |
| projectId | string | no | Project to retrieve SNS info from |

**Output**: `{ projectId, region, createdAt, updatedAt, status, snsEndpointUrl }`

---

## Credentials Tools

### scaleway_sns_list_credentials

**Scaleway API**: `GET /mnq/v1beta1/regions/{region}/sns-credentials`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | config | Region to target |
| projectId | string | no | - | Filter by project ID |
| orderBy | enum | no | - | Sort order (created_at_asc, created_at_desc, updated_at_asc, updated_at_desc, name_asc, name_desc) |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |

**Output**: `{ data: SnsCredentials[], pagination: { current_page, page_size, total_count, total_pages } }`

---

### scaleway_sns_get_credentials

**Scaleway API**: `GET /mnq/v1beta1/regions/{region}/sns-credentials/{sns_credentials_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region to target. Defaults to config |
| snsCredentialsId | string | yes | ID of the SNS credentials to get |

**Output**: `{ id, name, projectId, region, createdAt, updatedAt, accessKey, secretKey, secretChecksum, permissions }`

---

### scaleway_sns_create_credentials

**Scaleway API**: `POST /mnq/v1beta1/regions/{region}/sns-credentials`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region to target. Defaults to config |
| projectId | string | no | Project containing the credentials |
| name | string | no | Name of the credentials |
| permissions | object | no | Permissions: { canPublish?: boolean, canReceive?: boolean, canManage?: boolean } |

**Output**: `{ id, name, projectId, region, createdAt, updatedAt, accessKey, secretKey, secretChecksum, permissions }`

---

### scaleway_sns_update_credentials

**Scaleway API**: `PATCH /mnq/v1beta1/regions/{region}/sns-credentials/{sns_credentials_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region to target. Defaults to config |
| snsCredentialsId | string | yes | ID of the SNS credentials to update |
| name | string | no | Updated name |
| permissions | object | no | Updated permissions: { canPublish?: boolean, canReceive?: boolean, canManage?: boolean } |

**Output**: `{ id, name, projectId, region, createdAt, updatedAt, accessKey, secretKey, secretChecksum, permissions }`

---

### scaleway_sns_delete_credentials

**Scaleway API**: `DELETE /mnq/v1beta1/regions/{region}/sns-credentials/{sns_credentials_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region to target. Defaults to config |
| snsCredentialsId | string | yes | ID of the credentials to delete |

**Output**: `{ success: true }`
