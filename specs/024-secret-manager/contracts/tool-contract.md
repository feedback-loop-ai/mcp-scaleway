# Tool Contracts: Scaleway Secret Manager MCP Tools

**Feature**: 024-secret-manager | **Date**: 2026-03-11

## Secret CRUD Tools

### scaleway_secret_manager_list_secrets

**Scaleway API**: `GET /secret-manager/v1beta1/regions/{region}/secrets`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | - | Region (e.g., fr-par) |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| projectId | string (UUID) | no | - | Filter by project ID |
| organizationId | string (UUID) | no | - | Filter by organization ID |
| name | string | no | - | Filter by secret name |
| tags | string[] | no | - | Filter by tags |
| type | enum | no | - | Filter by secret type |
| path | string | no | - | Filter by exact path |
| ephemeral | boolean | no | - | Filter by ephemeral status |
| orderBy | enum | no | - | Order by field (name_asc, name_desc, created_at_asc, etc.) |

**Output**: `{ items: Secret[], totalCount: number, page: number, pageSize: number }`

---

### scaleway_secret_manager_get_secret

**Scaleway API**: `GET /secret-manager/v1beta1/regions/{region}/secrets/{secret_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| secretId | string (UUID) | yes | Secret ID |

**Output**: `{ Secret object }`

---

### scaleway_secret_manager_create_secret

**Scaleway API**: `POST /secret-manager/v1beta1/regions/{region}/secrets`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| projectId | string (UUID) | no | Project ID |
| name | string | yes | Secret name |
| tags | string[] | no | Tags |
| description | string | no | Description |
| type | enum | no | Secret type (default: opaque) |
| path | string | no | Directory path (default: /) |
| ephemeralPolicy | object | no | Ephemeral policy |
| isProtected | boolean | no | Protection flag (default: false) |

**Output**: `{ Secret object }`

---

### scaleway_secret_manager_update_secret

**Scaleway API**: `PATCH /secret-manager/v1beta1/regions/{region}/secrets/{secret_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| secretId | string (UUID) | yes | Secret ID |
| name | string | no | Updated name |
| tags | string[] | no | Updated tags |
| description | string | no | Updated description |
| path | string | no | Updated path |
| ephemeralPolicy | object | no | Updated ephemeral policy |

**Output**: `{ Secret object }`

---

### scaleway_secret_manager_delete_secret

**Scaleway API**: `DELETE /secret-manager/v1beta1/regions/{region}/secrets/{secret_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| secretId | string (UUID) | yes | Secret ID |

**Output**: `{ success: true, secretId: string }`

---

## Secret Version Tools

### scaleway_secret_manager_list_secret_versions

**Scaleway API**: `GET /secret-manager/v1beta1/regions/{region}/secrets/{secret_id}/versions`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | - | Region (e.g., fr-par) |
| secretId | string (UUID) | yes | - | Secret ID |
| page | number | no | 1 | Page number |
| pageSize | number | no | 50 | Items per page |
| status | enum[] | no | - | Filter by version status |

**Output**: `{ items: SecretVersion[], totalCount: number, page: number, pageSize: number }`

---

### scaleway_secret_manager_get_secret_version

**Scaleway API**: `GET /secret-manager/v1beta1/regions/{region}/secrets/{secret_id}/versions/{revision}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| secretId | string (UUID) | yes | Secret ID |
| revision | string | yes | Revision number, 'latest', or 'latest_enabled' |

**Output**: `{ SecretVersion object }`

---

### scaleway_secret_manager_create_secret_version

**Scaleway API**: `POST /secret-manager/v1beta1/regions/{region}/secrets/{secret_id}/versions`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| secretId | string (UUID) | yes | Secret ID |
| data | string | yes | Base64-encoded secret payload |
| description | string | no | Version description |
| disablePrevious | boolean | no | Disable previous version |
| dataCrc32 | number | no | CRC32 checksum for integrity |

**Output**: `{ SecretVersion object }`

---

### scaleway_secret_manager_access_secret_version

**Scaleway API**: `GET /secret-manager/v1beta1/regions/{region}/secrets/{secret_id}/versions/{revision}/access`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| secretId | string (UUID) | yes | Secret ID |
| revision | string | yes | Revision number, 'latest', or 'latest_enabled' |

**Output**: `{ secretId: string, revision: number, data: string (base64), dataCrc32: number, type: string }`

---

### scaleway_secret_manager_disable_secret_version

**Scaleway API**: `POST /secret-manager/v1beta1/regions/{region}/secrets/{secret_id}/versions/{revision}/disable`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| secretId | string (UUID) | yes | Secret ID |
| revision | string | yes | Revision number, 'latest', or 'latest_enabled' |

**Output**: `{ SecretVersion object }`

---

### scaleway_secret_manager_enable_secret_version

**Scaleway API**: `POST /secret-manager/v1beta1/regions/{region}/secrets/{secret_id}/versions/{revision}/enable`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| secretId | string (UUID) | yes | Secret ID |
| revision | string | yes | Revision number, 'latest', or 'latest_enabled' |

**Output**: `{ SecretVersion object }`

---

### scaleway_secret_manager_destroy_secret_version

**Scaleway API**: `DELETE /secret-manager/v1beta1/regions/{region}/secrets/{secret_id}/versions/{revision}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| secretId | string (UUID) | yes | Secret ID |
| revision | string | yes | Revision number, 'latest', or 'latest_enabled' |

**Output**: `{ success: true, secretId: string, revision: string }`

---

## Protection Tools

### scaleway_secret_manager_protect_secret

**Scaleway API**: `POST /secret-manager/v1beta1/regions/{region}/secrets/{secret_id}/protect`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| secretId | string (UUID) | yes | Secret ID |

**Output**: `{ Secret object }`

---

### scaleway_secret_manager_unprotect_secret

**Scaleway API**: `POST /secret-manager/v1beta1/regions/{region}/secrets/{secret_id}/unprotect`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| secretId | string (UUID) | yes | Secret ID |

**Output**: `{ Secret object }`

---

## Tag Tools

### scaleway_secret_manager_list_tags

**Scaleway API**: `GET /secret-manager/v1beta1/regions/{region}/tags`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | - | Region (e.g., fr-par) |
| page | number | no | 1 | Page number |
| pageSize | number | no | 50 | Items per page |
| projectId | string (UUID) | no | - | Filter by project ID |

**Output**: `{ items: Tag[], totalCount: number, page: number, pageSize: number }`

---

## Ownership Tools

### scaleway_secret_manager_add_secret_owner

**Scaleway API**: `POST /secret-manager/v1beta1/regions/{region}/secrets/{secret_id}/add-owner`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| secretId | string (UUID) | yes | Secret ID |
| product | enum | no | Scaleway product (edge_services, s2s_vpn) |

**Output**: `{ success: true, secretId: string }`
