# Tool Contracts: Scaleway NATS Messaging MCP Tools

**Feature**: 026-nats | **Date**: 2026-03-11

## Account Tools

### scaleway_nats_list_accounts

**Scaleway API**: `GET /mnq/v1beta1/regions/{region}/nats-accounts`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | yes | - | Region (e.g., fr-par) |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| projectId | string (UUID) | no | - | Filter by project ID |
| name | string | no | - | Filter by name |
| orderBy | enum | no | - | created_at_asc, created_at_desc, updated_at_asc, updated_at_desc, name_asc, name_desc |

**Output**: `{ items: NatsAccount[], total_count: number, page: number, page_size: number, total_pages: number }`

---

### scaleway_nats_get_account

**Scaleway API**: `GET /mnq/v1beta1/regions/{region}/nats-accounts/{nats_account_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Region |
| natsAccountId | string (UUID) | yes | NATS account ID |

**Output**: `NatsAccount`

---

### scaleway_nats_create_account

**Scaleway API**: `POST /mnq/v1beta1/regions/{region}/nats-accounts`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Region |
| name | string | yes | Account name |
| projectId | string (UUID) | no | Project ID (uses default if omitted) |

**Output**: `NatsAccount`

---

### scaleway_nats_update_account

**Scaleway API**: `PATCH /mnq/v1beta1/regions/{region}/nats-accounts/{nats_account_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Region |
| natsAccountId | string (UUID) | yes | NATS account ID |
| name | string | no | New name for the account |

**Output**: `NatsAccount`

---

### scaleway_nats_delete_account

**Scaleway API**: `DELETE /mnq/v1beta1/regions/{region}/nats-accounts/{nats_account_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Region |
| natsAccountId | string (UUID) | yes | NATS account ID |

**Output**: `{ deleted: true, id: string }`

---

## Credentials Tools

### scaleway_nats_list_credentials

**Scaleway API**: `GET /mnq/v1beta1/regions/{region}/nats-accounts/{nats_account_id}/nats-credentials`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | yes | - | Region |
| natsAccountId | string (UUID) | yes | - | NATS account ID |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| orderBy | enum | no | - | created_at_asc, created_at_desc, updated_at_asc, updated_at_desc, name_asc, name_desc |

**Output**: `{ items: NatsCredentials[], total_count: number, page: number, page_size: number, total_pages: number }`

---

### scaleway_nats_get_credentials

**Scaleway API**: `GET /mnq/v1beta1/regions/{region}/nats-credentials/{nats_credentials_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Region |
| natsCredentialsId | string (UUID) | yes | Credentials ID |

**Output**: `NatsCredentials`

---

### scaleway_nats_create_credentials

**Scaleway API**: `POST /mnq/v1beta1/regions/{region}/nats-credentials`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Region |
| natsAccountId | string (UUID) | yes | NATS account ID |
| name | string | yes | Credentials name |

**Output**: `NatsCredentialsContent` (includes credentials.content, only available at creation time)

---

### scaleway_nats_delete_credentials

**Scaleway API**: `DELETE /mnq/v1beta1/regions/{region}/nats-credentials/{nats_credentials_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Region |
| natsCredentialsId | string (UUID) | yes | Credentials ID |

**Output**: `{ deleted: true, id: string }`
