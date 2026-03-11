# Data Model: Scaleway Serverless SQL DB MCP Tools

**Feature**: 010-serverless-sqldb | **Date**: 2026-03-11

## Entities

### Database

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique database identifier |
| name | string | yes | Database name |
| status | enum | yes | unknown_status, error, creating, ready, deleting, restoring, locked |
| endpoint | string | yes | PostgreSQL connection endpoint |
| organization_id | string (UUID) | yes | Organization ID |
| project_id | string (UUID) | yes | Project ID |
| region | string | yes | Region (e.g., fr-par) |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| cpu_min | number (int) | yes | Minimum vCPU allocation |
| cpu_max | number (int) | yes | Maximum vCPU allocation |
| cpu_current | number (int) | yes | Current vCPU allocation (read-only) |
| started | boolean | yes | Whether the database is currently running |
| engine_major_version | number (int) | yes | PostgreSQL engine major version |

### DatabaseBackup

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique backup identifier |
| status | enum | yes | unknown_status, error, ready, locked |
| organization_id | string (UUID) | yes | Organization ID |
| project_id | string (UUID) | yes | Project ID |
| database_id | string (UUID) | yes | Source database ID |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| expires_at | string (ISO 8601) | no | Expiration timestamp |
| size | number (int) | no | Backup size in bytes |
| db_size | number (int) | no | Database size at backup time in bytes |
| download_url | string | no | Temporary download URL (populated after export) |
| download_url_expires_at | string (ISO 8601) | no | Download URL expiration timestamp |
| region | string | yes | Region (e.g., fr-par) |

## Enums

### DatabaseStatus

| Value | Description |
|-------|-------------|
| unknown_status | Status is unknown |
| error | Database is in error state |
| creating | Database is being created |
| ready | Database is ready for use |
| deleting | Database is being deleted |
| restoring | Database is being restored from backup |
| locked | Database is locked |

### DatabaseBackupStatus

| Value | Description |
|-------|-------------|
| unknown_status | Status is unknown |
| error | Backup is in error state |
| ready | Backup is ready for use |
| locked | Backup is locked |

### ListDatabasesOrderBy

| Value | Description |
|-------|-------------|
| created_at_asc | Sort by creation date ascending |
| created_at_desc | Sort by creation date descending |
| name_asc | Sort by name ascending |
| name_desc | Sort by name descending |

### ListDatabaseBackupsOrderBy

| Value | Description |
|-------|-------------|
| created_at_asc | Sort by creation date ascending |
| created_at_desc | Sort by creation date descending |
