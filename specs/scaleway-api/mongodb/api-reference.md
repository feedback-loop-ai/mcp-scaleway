# Scaleway Managed MongoDB® API Reference (v1 — GA)

Official reference: https://www.scaleway.com/en/developers/api/managed-database-mongodb
Cross-checked against the Go SDK: https://pkg.go.dev/github.com/scaleway/scaleway-sdk-go/api/mongodb/v1

Base URL: `https://api.scaleway.com/mongodb/v1/regions/{region}`

Tools live in `src/tools/mongodb/`. Each endpoint below is annotated with the MCP
tool that invokes it. Verified against the implementation in
`src/tools/mongodb/handlers.ts`.

## Migration note: v1alpha1 → v1

This area was migrated from the deprecated `mongodb/v1alpha1` API to the GA
`mongodb/v1` API. Notable renames vs v1alpha1:

- Base path `/mongodb/v1alpha1/regions` → `/mongodb/v1/regions`.
- Instance node count field `node_number` → `node_amount`
  (Create Instance and Restore Snapshot request bodies).
- Volume detail fields `{ volume_type, volume_size }` → `{ type, size_bytes }`
  (Create Instance request body / Instance response).
- Restore Snapshot no longer takes a full `volume` object; it takes a single
  `volume_type` (a `VolumeType` enum value).
- List Node Types query parameter `include_disabled_types` → `include_disabled`.
- Create Instance gained an optional `endpoints` array (EndpointSpec).
- Update Instance gained snapshot-schedule fields
  (`snapshot_schedule_frequency_hours`, `snapshot_schedule_retention_days`,
  `is_snapshot_schedule_enabled`).

Snapshots remain **region-level** in v1 (`/snapshots`), i.e. list / create /
get / delete / restore are not nested under an instance path; the instance is
referenced by `instance_id` in the query (list) or body (create).

## Authentication
- Header: `X-Auth-Token: <secret_key>`

## Pagination
- Query params: `page` (int, 1-indexed), `page_size` (int, max 100).
- List responses: `{ <collection>: T[], total_count: number }`.

## Enums

- `InstanceStatus`: unknown_status, ready, provisioning, configuring, deleting,
  error, initializing, locked, snapshotting
- `SnapshotStatus`: unknown_status, creating, ready, restoring, deleting, error,
  locked
- `VolumeType`: sbs_5k, sbs_15k

## Instances

### List Instances — `scaleway_mongodb_list_instances`
`GET /instances`
- Query: `page` (int), `page_size` (int), `name` (string), `tags` (string[]),
  `project_id` (string), `organization_id` (string), `order_by` (string:
  created_at_asc|created_at_desc|name_asc|name_desc|status_asc|status_desc)
- Response: `{ instances: Instance[], total_count: number }`

### Get Instance — `scaleway_mongodb_get_instance`
`GET /instances/{instance_id}`
- Response: Instance object

### Create Instance — `scaleway_mongodb_create_instance`
`POST /instances`
- Body: `{ project_id, name, version, node_type, node_amount, user_name,
  password, tags?, volume?, endpoints? }`
- `volume`: `{ type: VolumeType, size_bytes: number }`
- `endpoints`: `EndpointSpec[]` where EndpointSpec is
  `{ private_network?: { private_network_id }, public_network?: {} }`
- Response: Instance object (status: provisioning)

### Update Instance — `scaleway_mongodb_update_instance`
`PATCH /instances/{instance_id}`
- Body: `{ name?, tags?, snapshot_schedule_frequency_hours?,
  snapshot_schedule_retention_days?, is_snapshot_schedule_enabled? }`
- Response: Instance object

### Delete Instance — `scaleway_mongodb_delete_instance`
`DELETE /instances/{instance_id}`
- Response: Instance object (status: deleting)

### Instance object (response shape)
`{ id, name, project_id, organization_id, status, version, tags, node_amount,
node_type, volume, endpoints, created_at, region, snapshot_schedule }`

## Users

### List Users — `scaleway_mongodb_list_users`
`GET /instances/{instance_id}/users`
- Query: `page` (int), `page_size` (int), `name` (string), `order_by` (string:
  name_asc|name_desc)
- Response: `{ users: User[], total_count: number }`

### Create User — `scaleway_mongodb_create_user`
`POST /instances/{instance_id}/users`
- Body: `{ name, password }`
- Response: User object

### Update User — `scaleway_mongodb_update_user`
`PATCH /instances/{instance_id}/users/{user_name}`
- Body: `{ password? }`
- Response: User object

### Delete User — `scaleway_mongodb_delete_user`
`DELETE /instances/{instance_id}/users/{user_name}`
- Response: empty (204)

## Snapshots (region-level)

### List Snapshots — `scaleway_mongodb_list_snapshots`
`GET /snapshots`
- Query: `page` (int), `page_size` (int), `instance_id` (string), `name`
  (string), `project_id` (string), `organization_id` (string), `order_by`
  (string: created_at_asc|created_at_desc|name_asc|name_desc)
- Response: `{ snapshots: Snapshot[], total_count: number }`

### Create Snapshot — `scaleway_mongodb_create_snapshot`
`POST /snapshots`
- Body: `{ instance_id, name, expires_at? }` (expires_at is ISO 8601)
- Response: Snapshot object (status: creating)

### Restore Snapshot — `scaleway_mongodb_restore_snapshot`
`POST /snapshots/{snapshot_id}/restore`
- Body: `{ instance_name, node_type, node_amount, volume_type? }`
- Response: Instance object (the newly restored instance)

### Delete Snapshot — `scaleway_mongodb_delete_snapshot`
`DELETE /snapshots/{snapshot_id}`
- Response: Snapshot object (status: deleting)

### Snapshot object (response shape)
`{ id, instance_id, name, status, size_bytes, expires_at, created_at,
updated_at, instance_name, node_type, volume_type, region }`

## Reference

### List Node Types — `scaleway_mongodb_list_node_types`
`GET /node-types`
- Query: `page` (int), `page_size` (int), `include_disabled` (bool)
- Response: `{ node_types: NodeType[], total_count: number }`
- NodeType: `{ name, stock_status, description, vcpus, memory_bytes,
  available_volume_types, disabled, beta, instance_range }`

### List Versions — `scaleway_mongodb_list_versions`
`GET /versions`
- Query: `page` (int), `page_size` (int), `version` (string)
- Response: `{ versions: Version[], total_count: number }`

## Error codes
Standard Scaleway error envelope. Mapped by `src/shared/errors.ts`:
- 400 → invalid_input
- 401/403 → permission_denied
- 404 → not_found
- 429 → rate_limited
- 5xx → server_error
