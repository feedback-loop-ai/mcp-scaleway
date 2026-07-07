# Scaleway Block Storage (SBS) API Reference — block/v1 (GA)

Base URL: `https://api.scaleway.com/block/v1/zones/{zone}`

This documents the GA `block/v1` API. It replaces the deprecated `block/v1alpha1`
(all endpoint paths change from `/block/v1alpha1/...` to `/block/v1/...`; see
"Migration notes vs v1alpha1" below).

## Authentication

- Header: `X-Auth-Token: <secret_key>`

## Zones

`fr-par-1`, `fr-par-2`, `fr-par-3`, `nl-ams-1`, `nl-ams-2`, `nl-ams-3`,
`pl-waw-1`, `pl-waw-2`, `pl-waw-3`

## Pagination

List endpoints accept `page` (int, 1-indexed) and `page_size` (int, ≤ 100).
Responses wrap the collection plus a `total_count` (uint64).

## Volumes

### List Volumes
`GET /block/v1/zones/{zone}/volumes`
- Query: `page`, `page_size`, `project_id`, `organization_id`, `name`,
  `order_by` (`created_at_asc` | `created_at_desc` | `name_asc` | `name_desc`),
  `tags` (string[]), `product_resource_id`, `volume_type`, `volume_ids` (string[]),
  `include_deleted` (bool, required)
- Response: `{ volumes: Volume[], total_count: number }`

### Get Volume
`GET /block/v1/zones/{zone}/volumes/{volume_id}`
- Response: `Volume` (returned directly, not wrapped)

### Create Volume
`POST /block/v1/zones/{zone}/volumes`
- Body: `{ name, project_id, perf_iops?, from_empty?: { size }, from_snapshot?: { snapshot_id, size? }, tags?, kms_key_id? }`
- `name` and `project_id` are required. Provide exactly one of `from_empty` or `from_snapshot`.
- Response: `Volume`

### Update Volume
`PATCH /block/v1/zones/{zone}/volumes/{volume_id}`
- Body: `{ name?, size?, tags?, perf_iops? }` (all nullable/optional)
- `size` may only be increased. Response: `Volume`

### Delete Volume
`DELETE /block/v1/zones/{zone}/volumes/{volume_id}`
- Deletes a detached volume. Response: empty (204)

## Snapshots

### List Snapshots
`GET /block/v1/zones/{zone}/snapshots`
- Query: `page`, `page_size`, `project_id`, `organization_id`, `name`,
  `order_by` (same enum as volumes), `volume_id`, `tags` (string[]),
  `include_deleted` (bool, required)
- Response: `{ snapshots: Snapshot[], total_count: number }`

### Get Snapshot
`GET /block/v1/zones/{zone}/snapshots/{snapshot_id}`
- Response: `Snapshot`

### Create Snapshot
`POST /block/v1/zones/{zone}/snapshots`
- Body: `{ volume_id, name, project_id, tags?, public? }`
- The source volume must be `in_use` or `available`. Response: `Snapshot`

### Update Snapshot
`PATCH /block/v1/zones/{zone}/snapshots/{snapshot_id}`
- Body: `{ name?, tags?, public? }` (all nullable/optional). Response: `Snapshot`

### Delete Snapshot
`DELETE /block/v1/zones/{zone}/snapshots/{snapshot_id}`
- Response: empty (204)

> Note: `POST .../snapshots/{snapshot_id}/export-to-object-storage` and
> `POST .../snapshots/import-from-object-storage` also exist in v1 but are not
> exposed as MCP tools in this server.

## Volume Types

### List Volume Types
`GET /block/v1/zones/{zone}/volume-types`
- Query: `page`, `page_size`
- Response: `{ volume_types: VolumeType[], total_count: number }`

## Object schemas

### Volume
`{ id (uuid), name, type (string, e.g. sbs_5k/sbs_15k), size (bytes),
project_id (uuid), created_at (nullable), updated_at (nullable),
references (Reference[]), parent_snapshot_id (uuid, nullable), status,
tags (string[]), zone, specs: { perf_iops (nullable), class }, last_detached_at
(nullable), kms_key_id (uuid, nullable) }`

- `status` enum: `unknown_status`, `creating`, `available`, `in_use`,
  `deleting`, `deleted`, `resizing`, `error`, `snapshotting`, `locked`, `updating`

### Snapshot
`{ id (uuid), name, parent_volume: { id, name, type, status } | null,
size (bytes), project_id (uuid), created_at (nullable), updated_at (nullable),
references (Reference[]), status, tags (string[]), zone, class, public (bool) }`

- `status` enum: `unknown_status`, `creating`, `available`, `error`,
  `deleting`, `deleted`, `in_use`, `locked`, `exporting`

### VolumeType
`{ type (string), pricing: Money, snapshot_pricing: Money,
specs: { perf_iops (nullable), class }, zone }`

- `Money`: `{ currency_code, units (int64), nanos (int32) }`

### Reference
`{ id (uuid), product_resource_type, product_resource_id (uuid),
created_at (nullable), type, status }`

- `type` enum: `unknown_type`, `link`, `exclusive`, `read_only`
- `status` enum: `unknown_status`, `attaching`, `attached`, `detaching`,
  `detached`, `creating`, `error`

### Storage class (shared by Volume.specs.class, Snapshot.class, VolumeType.specs.class)
`unknown_storage_class`, `unspecified`, `bssd`, `sbs`

## Error Codes
- 400: Invalid input
- 401/403: Permission denied
- 404: Not found
- 409: Conflict (e.g. volume still attached)
- 429: Rate limited
- 500: Server error

## Migration notes vs v1alpha1
- Path prefix `block/v1alpha1` → `block/v1` on every endpoint.
- Single-resource responses (Get/Create/Update) return the object directly
  (e.g. a `Volume`), not wrapped in `{ "volume": ... }`.
- `Volume.status` / parent-volume status add `updating`.
- `Snapshot.status` adds `exporting`.
- Snapshot/volume storage `class` uses the storage-class enum
  (`unknown_storage_class | unspecified | bssd | sbs`) — the old
  `standard`/`instant` snapshot-class values are gone.
- `VolumeType` uses `type` (not `name`), a `Money` pricing object
  (`currency_code`/`units`/`nanos`), and `specs.perf_iops`.
- List endpoints replace the `status` filter with `order_by`, `tags`,
  `include_deleted` (required), `product_resource_id`, and `volume_type`.
- Create volume adds `kms_key_id`; create/update snapshot add `public`.
