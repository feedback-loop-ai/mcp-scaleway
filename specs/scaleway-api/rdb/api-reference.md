# Scaleway Managed Database (RDB) API Reference

Base URL: `https://api.scaleway.com/rdb/v1/regions/{region}`

Regions: `fr-par`, `nl-ams`, `pl-waw`

Official reference: https://www.scaleway.com/en/developers/api/managed-database-postgre-mysql/

## Authentication

- Header: `X-Auth-Token: <secret_key>`

All operations are **regional** (`/rdb/v1/regions/{region}/...`).

## Pagination

List operations accept `page` (int, 1-based) and `page_size` (int, max 100) query
parameters and return `{ <collection>: T[], total_count: number }`. Most list
operations also accept `order_by` and resource-specific filters.

## Instances

### List Instances
`GET /instances`
- Query: `page`, `page_size`, `project_id`, `name`, `order_by`
  (`created_at_asc|created_at_desc|name_asc|name_desc`), `tags` (repeatable)
- Response: `{ instances: Instance[], total_count: number }`

### Get Instance
`GET /instances/{instance_id}`
- Response: Instance object (includes `endpoints`, `volume`, `backup_schedule`)

### Create Instance
`POST /instances`
- Body: `{ project_id, name, engine, node_type, is_ha_cluster?, disable_backup?,
  volume_type? (lssd|bssd), volume_size?, user_name?, password?, tags?,
  backup_same_region?, init_endpoints? }`
- Response: Instance object (status: `provisioning`)

### Update Instance
`PATCH /instances/{instance_id}`
- Body: `{ name?, tags?, backup_schedule_frequency?, backup_schedule_retention?,
  is_backup_schedule_disabled?, backup_same_region? }`
- Response: Instance object

### Delete Instance
`DELETE /instances/{instance_id}`
- Response: Instance object (status: `deleting`)

### Upgrade Instance
`POST /instances/{instance_id}/upgrade`
- Body: `{ node_type?, enable_ha?, volume_size?, volume_type?,
  upgradable_version_id?, major_upgrade_workflow? }`
- Response: Instance object

## Databases

### List Databases
`GET /instances/{instance_id}/databases`
- Query: `page`, `page_size`, `name`, `managed`, `owner`, `order_by`
  (`name_asc|name_desc|size_asc|size_desc`)
- Response: `{ databases: Database[], total_count: number }`
- Database: `{ name, owner, managed, size }`

### Create Database
`POST /instances/{instance_id}/databases`
- Body: `{ name }`
- Response: Database object

### Delete Database
`DELETE /instances/{instance_id}/databases/{name}`
- Response: empty

## Users

### List Users
`GET /instances/{instance_id}/users`
- Query: `page`, `page_size`, `name`, `order_by`
  (`name_asc|name_desc|is_admin_asc|is_admin_desc`)
- Response: `{ users: User[], total_count: number }`
- User: `{ name, is_admin }`

### Create User
`POST /instances/{instance_id}/users`
- Body: `{ name, password, is_admin? }`
- Response: User object

### Update User
`PATCH /instances/{instance_id}/users/{name}`
- Body: `{ password?, is_admin? }`
- Response: User object

### Delete User
`DELETE /instances/{instance_id}/users/{name}`
- Response: empty

## Backups

### List Backups
`GET /backups`
- Query: `page`, `page_size`, `instance_id`, `name`, `order_by`, `project_id`
- Response: `{ database_backups: Backup[], total_count: number }`
- Backup: `{ id, instance_id, name, status, size?, created_at?, expires_at?,
  database_name?, instance_name?, region? }`

### Create Backup
`POST /backups`
- Body: `{ instance_id, name, database_name?, expires_at? }`
- Response: Backup object

### Restore Backup
`POST /backups/{backup_id}/restore`
- Body: `{ instance_id, database_name? }`
- Response: Backup / Instance object

## Endpoints

RDB does not expose a dedicated list-endpoints operation; endpoints are read from
the `endpoints` field of the Instance object (`GET /instances/{instance_id}`).

### Create Endpoint
`POST /instances/{instance_id}/endpoints`
- Body: `{ endpoint_spec: { private_network?: { private_network_id, service_ip? },
  load_balancer?: bool } }`
- Response: Endpoint object

### Delete Endpoint
`DELETE /endpoints/{endpoint_id}`
- Response: empty

## ACL Rules

### List ACL Rules
`GET /instances/{instance_id}/acls`
- Query: `page`, `page_size`
- Response: `{ rules: AclRule[], total_count: number }`
- AclRule: `{ ip, port?, protocol? (tcp|udp|icmp), direction (inbound|outbound),
  action (allow|deny), description? }`

### Add ACL Rules
`POST /instances/{instance_id}/acls`
- Body: `{ rules: [{ ip, description? }] }`
- Response: `{ rules: AclRule[] }`

### Delete ACL Rules
`DELETE /instances/{instance_id}/acls`
- Body: `{ acl_rule_ips: string[] }`
- Response: empty / `{ rules: AclRule[] }`

## Snapshots

### List Snapshots
`GET /snapshots`
- Query: `page`, `page_size`, `instance_id`, `name`, `order_by`, `project_id`
- Response: `{ snapshots: Snapshot[], total_count: number }`
- Snapshot: `{ id, instance_id, name, status, size?, created_at?, instance_name?,
  node_type?, region?, expires_at? }`

### Create Snapshot
`POST /snapshots`
- Body: `{ instance_id, name, expires_at? }`
- Response: Snapshot object

### Create Instance from Snapshot
`POST /snapshots/{snapshot_id}/create-instance-from-snapshot`
- Body: `{ instance_name, node_type?, is_ha_cluster? }`
- Response: Instance object

## Reference Data

### List Node Types
`GET /node-types`
- Query: `include_disabled_types`
- Response: `{ node_types: NodeType[], total_count: number }`
- NodeType: `{ name, stock_status, description?, vcpus?, memory?, disabled?, region? }`

### List Database Engines
`GET /database-engines`
- Query: `name`, `version`
- Response: `{ engines: Engine[], total_count: number }`
- Engine: `{ name, default_version, versions: [{ version, name, end_of_life?,
  available_settings? }] }`

## Enums

- **Instance status**: unknown, ready, provisioning, configuring, deleting, error,
  autohealing, locked, initializing, disk_full, backuping, snapshotting
- **Backup status**: unknown, creating, ready, restoring, deleting, error,
  exporting, locked
- **Snapshot status**: unknown, creating, ready, restoring, deleting, error, locked

## Error Codes

- 400: Invalid input / validation error
- 401: Missing or invalid auth token
- 403: Permission denied
- 404: Resource not found
- 409: Conflict (e.g. name already in use)
- 429: Too many requests
- 500: Internal server error
