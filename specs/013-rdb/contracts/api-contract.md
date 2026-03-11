# API Contract - Managed Database (RDB) for PostgreSQL & MySQL

## Base URL
`https://api.scaleway.com/rdb/v1/regions/{region}`

## Endpoints

### Instance CRUD (P1)
| Method | Path | Tool |
|--------|------|------|
| GET | /instances | scaleway_rdb_list_instances |
| GET | /instances/{instance_id} | scaleway_rdb_get_instance |
| POST | /instances | scaleway_rdb_create_instance |
| PATCH | /instances/{instance_id} | scaleway_rdb_update_instance |
| DELETE | /instances/{instance_id} | scaleway_rdb_delete_instance |
| POST | /instances/{instance_id}/upgrade | scaleway_rdb_upgrade_instance |

### Database & User Management (P1)
| Method | Path | Tool |
|--------|------|------|
| GET | /instances/{instance_id}/databases | scaleway_rdb_list_databases |
| POST | /instances/{instance_id}/databases | scaleway_rdb_create_database |
| DELETE | /instances/{instance_id}/databases/{name} | scaleway_rdb_delete_database |
| GET | /instances/{instance_id}/users | scaleway_rdb_list_users |
| POST | /instances/{instance_id}/users | scaleway_rdb_create_user |
| PATCH | /instances/{instance_id}/users/{name} | scaleway_rdb_update_user |
| DELETE | /instances/{instance_id}/users/{name} | scaleway_rdb_delete_user |

### Backup & Restore (P2)
| Method | Path | Tool |
|--------|------|------|
| GET | /backups | scaleway_rdb_list_backups |
| POST | /backups | scaleway_rdb_create_backup |
| POST | /backups/{backup_id}/restore | scaleway_rdb_restore_backup |

### Endpoints & ACL Rules (P2)
| Method | Path | Tool |
|--------|------|------|
| GET | /instances/{instance_id} (endpoints) | scaleway_rdb_list_endpoints |
| POST | /instances/{instance_id}/endpoints | scaleway_rdb_create_endpoint |
| DELETE | /endpoints/{endpoint_id} | scaleway_rdb_delete_endpoint |
| GET | /instances/{instance_id}/acls | scaleway_rdb_list_acl_rules |
| POST | /instances/{instance_id}/acls | scaleway_rdb_add_acl_rules |
| DELETE | /instances/{instance_id}/acls | scaleway_rdb_delete_acl_rules |

### Snapshots (P3)
| Method | Path | Tool |
|--------|------|------|
| GET | /snapshots | scaleway_rdb_list_snapshots |
| POST | /snapshots | scaleway_rdb_create_snapshot |
| POST | /snapshots/{snapshot_id}/create-instance-from-snapshot | scaleway_rdb_restore_snapshot |

### Reference
| Method | Path | Tool |
|--------|------|------|
| GET | /node-types | scaleway_rdb_list_node_types |
| GET | /database-engines | scaleway_rdb_list_database_engines |
