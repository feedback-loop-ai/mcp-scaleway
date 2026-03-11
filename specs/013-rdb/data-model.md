# Data Model: Scaleway Managed Database (RDB) MCP Tools

**Feature**: 013-rdb | **Date**: 2026-03-11

## Entities

### Instance

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique instance identifier |
| name | string | yes | Instance name |
| engine | string | yes | Database engine (e.g., PostgreSQL-15, MySQL-8) |
| node_type | string | yes | Commercial node type (e.g., db-dev-s, db-play2-pico) |
| status | enum | yes | unknown, ready, provisioning, configuring, deleting, error, autohealing, locked, initializing, disk_full, backuping, snapshotting |
| region | string | yes | Region (e.g., fr-par) |
| project_id | string (UUID) | yes | Project ID |
| is_ha_cluster | boolean | yes | Whether high availability is enabled |
| volume | object/null | no | Volume configuration (type, size) |
| endpoints | array | no | Connection endpoints |
| backup_schedule | object/null | no | Backup schedule (frequency, retention, disabled) |
| tags | string[] | no | User-defined tags |
| created_at | string (ISO 8601) | no | Creation timestamp |

### Database

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Database name |
| owner | string | yes | Database owner username |
| managed | boolean | yes | Whether database is managed by Scaleway |
| size | number | yes | Database size in bytes |

### User

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Username |
| is_admin | boolean | yes | Whether user has admin privileges |

### Backup

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Backup identifier |
| instance_id | string (UUID) | yes | Source instance ID |
| name | string | yes | Backup name |
| status | enum | yes | unknown, creating, ready, restoring, deleting, error, exporting, locked |
| size | number | no | Backup size in bytes |
| created_at | string (ISO 8601) | no | Creation timestamp |
| expires_at | string (ISO 8601) | no | Expiration timestamp |
| database_name | string | no | Specific database backed up |
| instance_name | string | no | Source instance name |
| region | string | no | Region |

### Endpoint

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Endpoint identifier |
| ip | string | no | IPv4 address |
| port | number | yes | TCP port number |
| name | string | no | Endpoint name |

### Volume

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | string | yes | Volume type (lssd, bssd) |
| size | number | yes | Volume size in bytes |

### BackupSchedule

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| frequency | number | yes | Backup frequency in hours |
| retention | number | yes | Backup retention in days |
| disabled | boolean | yes | Whether automatic backups are disabled |

### ACL Rule

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| ip | string | yes | IP range in CIDR notation |
| port | number | no | Port number |
| protocol | enum | no | tcp, udp, icmp |
| direction | enum | yes | inbound, outbound |
| action | enum | yes | allow, deny |
| description | string | no | Rule description |

### Snapshot

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Snapshot identifier |
| instance_id | string (UUID) | yes | Source instance ID |
| name | string | yes | Snapshot name |
| status | enum | yes | unknown, creating, ready, restoring, deleting, error, locked |
| size | number | no | Snapshot size in bytes |
| created_at | string (ISO 8601) | no | Creation timestamp |
| instance_name | string | no | Source instance name |
| node_type | string | no | Node type of source instance |
| region | string | no | Region |
| expires_at | string (ISO 8601) | no | Expiration timestamp |

### NodeType

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Node type name (e.g., db-dev-s) |
| stock_status | string | yes | Stock availability status |
| description | string | no | Human-readable description |
| vcpus | number | no | Number of vCPUs |
| memory | number | no | Memory in bytes |
| disabled | boolean | no | Whether node type is currently disabled |
| region | string | no | Region |

### DatabaseEngine

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Engine name (e.g., PostgreSQL, MySQL) |
| default_version | string | yes | Default engine version |
| versions | array | yes | Available versions with settings |
| versions[].version | string | yes | Engine version string |
| versions[].name | string | yes | Version display name |
| versions[].end_of_life | string | no | End of life date |
| versions[].available_settings | array | no | Configurable settings for this version |
