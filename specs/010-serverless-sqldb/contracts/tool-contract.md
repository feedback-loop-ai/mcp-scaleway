# Tool Contracts: Scaleway Serverless SQL DB MCP Tools

**Feature**: 010-serverless-sqldb | **Date**: 2026-03-11

## Database Tools

### scaleway_serverless_sqldb_list_databases

**Scaleway API**: `GET /serverless-sqldb/v1alpha1/regions/{region}/databases`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | fr-par | Region (e.g., fr-par, nl-ams, pl-waw) |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| project_id | string (UUID) | no | - | Filter by project ID |
| organization_id | string (UUID) | no | - | Filter by organization ID |
| name | string | no | - | Filter by database name |
| order_by | enum | no | created_at_asc | Sort order: created_at_asc, created_at_desc, name_asc, name_desc |

**Output**: `{ items: Database[], total_count: number, page: number, page_size: number }`

---

### scaleway_serverless_sqldb_get_database

**Scaleway API**: `GET /serverless-sqldb/v1alpha1/regions/{region}/databases/{database_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| database_id | string (UUID) | yes | Database ID |

**Output**: `Database`

---

### scaleway_serverless_sqldb_create_database

**Scaleway API**: `POST /serverless-sqldb/v1alpha1/regions/{region}/databases`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| project_id | string (UUID) | no | Project ID |
| name | string | yes | Database name (min 1 char) |
| cpu_min | number (int) | yes | Minimum vCPU allocation (>= 0) |
| cpu_max | number (int) | yes | Maximum vCPU allocation (>= 0) |
| from_backup_id | string (UUID) | no | Backup ID to restore from on creation |

**Output**: `Database`

---

### scaleway_serverless_sqldb_update_database

**Scaleway API**: `PATCH /serverless-sqldb/v1alpha1/regions/{region}/databases/{database_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| database_id | string (UUID) | yes | Database ID |
| cpu_min | number (int) | no | Minimum vCPU allocation (>= 0) |
| cpu_max | number (int) | no | Maximum vCPU allocation (>= 0) |

**Output**: `Database`

---

### scaleway_serverless_sqldb_delete_database

**Scaleway API**: `DELETE /serverless-sqldb/v1alpha1/regions/{region}/databases/{database_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| database_id | string (UUID) | yes | Database ID |

**Output**: `Database`

---

## Backup Tools

### scaleway_serverless_sqldb_list_database_backups

**Scaleway API**: `GET /serverless-sqldb/v1alpha1/regions/{region}/backups`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | fr-par | Region (e.g., fr-par) |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| database_id | string (UUID) | yes | - | Database ID to list backups for |
| project_id | string (UUID) | no | - | Filter by project ID |
| organization_id | string (UUID) | no | - | Filter by organization ID |
| order_by | enum | no | created_at_asc | Sort order: created_at_asc, created_at_desc |

**Output**: `{ items: DatabaseBackup[], total_count: number, page: number, page_size: number }`

---

### scaleway_serverless_sqldb_get_database_backup

**Scaleway API**: `GET /serverless-sqldb/v1alpha1/regions/{region}/backups/{backup_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| backup_id | string (UUID) | yes | Backup ID |

**Output**: `DatabaseBackup`

---

### scaleway_serverless_sqldb_export_database_backup

**Scaleway API**: `POST /serverless-sqldb/v1alpha1/regions/{region}/backups/{backup_id}/export`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| backup_id | string (UUID) | yes | Backup ID to export |

**Output**: `DatabaseBackup` (with download_url and download_url_expires_at populated)

---

### scaleway_serverless_sqldb_restore_database

**Scaleway API**: `POST /serverless-sqldb/v1alpha1/regions/{region}/databases/{database_id}/restore`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| database_id | string (UUID) | yes | Database ID to restore into |
| backup_id | string (UUID) | yes | Backup ID to restore from |

**Output**: `Database`
