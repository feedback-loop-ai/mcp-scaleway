# Tool Contracts: Scaleway Managed Database (RDB) MCP Tools

**Feature**: 013-rdb | **Date**: 2026-03-11

## Instance Tools

### scaleway_rdb_list_instances

**Scaleway API**: `GET /rdb/v1/regions/{region}/instances`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | default region | Region (e.g., fr-par) |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| project_id | string | no | - | Filter by project ID |
| name | string | no | - | Filter by name |
| tags | string[] | no | - | Filter by tags |
| order_by | enum | no | - | created_at_asc, created_at_desc, name_asc, name_desc |

**Output**: `{ items: Instance[], total_count: number, page: number, page_size: number, total_pages: number }`

---

### scaleway_rdb_get_instance

**Scaleway API**: `GET /rdb/v1/regions/{region}/instances/{instance_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| instance_id | string | yes | Instance UUID |

**Output**: `{ id, name, engine, node_type, status, region, project_id, is_ha_cluster, volume, endpoints, backup_schedule, tags, created_at }`

---

### scaleway_rdb_create_instance

**Scaleway API**: `POST /rdb/v1/regions/{region}/instances`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| project_id | string | no | Project ID (defaults to SCW_DEFAULT_PROJECT_ID) |
| name | string | yes | Instance name |
| engine | string | yes | Database engine (e.g., PostgreSQL-15, MySQL-8) |
| node_type | string | yes | Node type (e.g., db-dev-s) |
| is_ha_cluster | boolean | no | Enable high availability |
| disable_backup | boolean | no | Disable automatic backups |
| volume_type | enum | no | lssd, bssd |
| volume_size | number | no | Volume size in bytes |
| user_name | string | no | Initial admin username |
| password | string | no | Initial admin password |
| tags | string[] | no | Tags |
| backup_same_region | boolean | no | Store backups in same region |
| init_endpoints | array | no | Initial endpoints configuration |

**Output**: `{ id, name, engine, node_type, status, ... }`

---

### scaleway_rdb_update_instance

**Scaleway API**: `PATCH /rdb/v1/regions/{region}/instances/{instance_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| instance_id | string | yes | Instance UUID |
| name | string | no | New name |
| tags | string[] | no | New tags |
| backup_schedule_frequency | number | no | Backup frequency in hours |
| backup_schedule_retention | number | no | Backup retention in days |
| is_backup_schedule_disabled | boolean | no | Disable automatic backups |
| backup_same_region | boolean | no | Store backups in same region |

**Output**: `{ id, name, engine, node_type, status, ... }`

---

### scaleway_rdb_delete_instance

**Scaleway API**: `DELETE /rdb/v1/regions/{region}/instances/{instance_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| instance_id | string | yes | Instance UUID |

**Output**: `{ id, name, engine, node_type, status, ... }`

---

### scaleway_rdb_upgrade_instance

**Scaleway API**: `POST /rdb/v1/regions/{region}/instances/{instance_id}/upgrade`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| instance_id | string | yes | Instance UUID |
| node_type | string | no | New node type |
| enable_ha | boolean | no | Enable high availability |
| volume_size | number | no | New volume size in bytes |
| volume_type | enum | no | lssd, bssd |
| upgradable_version_id | string | no | Target engine version UUID |
| major_upgrade_workflow | object | no | Major upgrade workflow config |

**Output**: `{ id, name, engine, node_type, status, ... }`

---

## Database Tools

### scaleway_rdb_list_databases

**Scaleway API**: `GET /rdb/v1/regions/{region}/instances/{instance_id}/databases`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | default region | Region |
| instance_id | string | yes | - | Instance UUID |
| page | number | no | 1 | Page number |
| pageSize | number | no | 50 | Items per page |
| name | string | no | - | Filter by name |
| managed | boolean | no | - | Filter by managed status |
| owner | string | no | - | Filter by owner |
| order_by | enum | no | - | name_asc, name_desc, size_asc, size_desc |

**Output**: `{ items: Database[], total_count: number, page: number, page_size: number, total_pages: number }`

---

### scaleway_rdb_create_database

**Scaleway API**: `POST /rdb/v1/regions/{region}/instances/{instance_id}/databases`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| instance_id | string | yes | Instance UUID |
| name | string | yes | Database name |

**Output**: `{ name, owner, managed, size }`

---

### scaleway_rdb_delete_database

**Scaleway API**: `DELETE /rdb/v1/regions/{region}/instances/{instance_id}/databases/{name}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| instance_id | string | yes | Instance UUID |
| name | string | yes | Database name |

**Output**: `{}`

---

## User Tools

### scaleway_rdb_list_users

**Scaleway API**: `GET /rdb/v1/regions/{region}/instances/{instance_id}/users`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | default region | Region |
| instance_id | string | yes | - | Instance UUID |
| page | number | no | 1 | Page number |
| pageSize | number | no | 50 | Items per page |
| name | string | no | - | Filter by username |
| order_by | enum | no | - | name_asc, name_desc, is_admin_asc, is_admin_desc |

**Output**: `{ items: User[], total_count: number, page: number, page_size: number, total_pages: number }`

---

### scaleway_rdb_create_user

**Scaleway API**: `POST /rdb/v1/regions/{region}/instances/{instance_id}/users`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| instance_id | string | yes | Instance UUID |
| name | string | yes | Username |
| password | string | yes | User password |
| is_admin | boolean | no | Grant admin privileges |

**Output**: `{ name, is_admin }`

---

### scaleway_rdb_update_user

**Scaleway API**: `PATCH /rdb/v1/regions/{region}/instances/{instance_id}/users/{name}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| instance_id | string | yes | Instance UUID |
| name | string | yes | Username |
| password | string | no | New password |
| is_admin | boolean | no | Update admin status |

**Output**: `{ name, is_admin }`

---

### scaleway_rdb_delete_user

**Scaleway API**: `DELETE /rdb/v1/regions/{region}/instances/{instance_id}/users/{name}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| instance_id | string | yes | Instance UUID |
| name | string | yes | Username to delete |

**Output**: `{}`

---

## Backup Tools

### scaleway_rdb_list_backups

**Scaleway API**: `GET /rdb/v1/regions/{region}/backups`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | default region | Region |
| page | number | no | 1 | Page number |
| pageSize | number | no | 50 | Items per page |
| instance_id | string | no | - | Filter by instance |
| name | string | no | - | Filter by name |
| order_by | enum | no | - | created_at_asc, created_at_desc, name_asc, name_desc |
| project_id | string | no | - | Filter by project |

**Output**: `{ items: Backup[], total_count: number, page: number, page_size: number, total_pages: number }`

---

### scaleway_rdb_create_backup

**Scaleway API**: `POST /rdb/v1/regions/{region}/backups`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| instance_id | string | yes | Instance UUID |
| name | string | yes | Backup name |
| database_name | string | no | Specific database to backup |
| expires_at | string | no | Expiration date (RFC 3339) |

**Output**: `{ id, instance_id, name, status, size, created_at, expires_at, database_name }`

---

### scaleway_rdb_restore_backup

**Scaleway API**: `POST /rdb/v1/regions/{region}/backups/{backup_id}/restore`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| backup_id | string | yes | Backup UUID |
| instance_id | string | yes | Target instance UUID |
| database_name | string | no | Target database name |

**Output**: `{ id, instance_id, name, status, ... }`

---

## Endpoint Tools

### scaleway_rdb_list_endpoints

**Scaleway API**: `GET /rdb/v1/regions/{region}/instances/{instance_id}` (endpoints derived from instance)

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| instance_id | string | yes | Instance UUID |

**Output**: `{ endpoints: Endpoint[] }`

---

### scaleway_rdb_create_endpoint

**Scaleway API**: `POST /rdb/v1/regions/{region}/instances/{instance_id}/endpoints`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| instance_id | string | yes | Instance UUID |
| endpoint_spec | object | yes | Endpoint specification (private_network or load_balancer) |

**Output**: `{ id, ip, port, name }`

---

### scaleway_rdb_delete_endpoint

**Scaleway API**: `DELETE /rdb/v1/regions/{region}/endpoints/{endpoint_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| endpoint_id | string | yes | Endpoint UUID |

**Output**: `{}`

---

## ACL Tools

### scaleway_rdb_list_acl_rules

**Scaleway API**: `GET /rdb/v1/regions/{region}/instances/{instance_id}/acls`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | default region | Region |
| instance_id | string | yes | - | Instance UUID |
| page | number | no | 1 | Page number |
| pageSize | number | no | 50 | Items per page |

**Output**: `{ items: AclRule[], total_count: number, page: number, page_size: number, total_pages: number }`

---

### scaleway_rdb_add_acl_rules

**Scaleway API**: `POST /rdb/v1/regions/{region}/instances/{instance_id}/acls`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| instance_id | string | yes | Instance UUID |
| rules | array | yes | ACL rules to add (ip in CIDR, optional description) |

**Output**: `{ rules: AclRule[] }`

---

### scaleway_rdb_delete_acl_rules

**Scaleway API**: `DELETE /rdb/v1/regions/{region}/instances/{instance_id}/acls`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| instance_id | string | yes | Instance UUID |
| acl_rule_ips | string[] | yes | IP ranges to remove |

**Output**: `{ rules: AclRule[] }`

---

## Snapshot Tools

### scaleway_rdb_list_snapshots

**Scaleway API**: `GET /rdb/v1/regions/{region}/snapshots`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | default region | Region |
| page | number | no | 1 | Page number |
| pageSize | number | no | 50 | Items per page |
| instance_id | string | no | - | Filter by instance |
| name | string | no | - | Filter by name |
| order_by | enum | no | - | created_at_asc, created_at_desc, name_asc, name_desc |
| project_id | string | no | - | Filter by project |

**Output**: `{ items: Snapshot[], total_count: number, page: number, page_size: number, total_pages: number }`

---

### scaleway_rdb_create_snapshot

**Scaleway API**: `POST /rdb/v1/regions/{region}/snapshots`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| instance_id | string | yes | Instance UUID |
| name | string | yes | Snapshot name |
| expires_at | string | no | Expiration date (RFC 3339) |

**Output**: `{ id, instance_id, name, status, size, created_at, expires_at }`

---

### scaleway_rdb_restore_snapshot

**Scaleway API**: `POST /rdb/v1/regions/{region}/snapshots/{snapshot_id}/create-instance-from-snapshot`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| snapshot_id | string | yes | Snapshot UUID |
| instance_name | string | yes | Name for the new instance |
| node_type | string | no | Node type for restored instance |
| is_ha_cluster | boolean | no | Enable HA on restored instance |

**Output**: `{ id, name, engine, node_type, status, ... }`

---

## Reference Tools

### scaleway_rdb_list_node_types

**Scaleway API**: `GET /rdb/v1/regions/{region}/node-types`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| include_disabled_types | boolean | no | Include disabled node types |

**Output**: `{ node_types: NodeType[], total_count: number }`

---

### scaleway_rdb_list_database_engines

**Scaleway API**: `GET /rdb/v1/regions/{region}/database-engines`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| name | string | no | Filter by engine name |
| version | string | no | Filter by version |

**Output**: `{ engines: DatabaseEngine[], total_count: number }`
