# Scaleway Instance API Reference

Base URL: `https://api.scaleway.com/instance/v1/zones/{zone}`

- Official docs: https://www.scaleway.com/en/developers/api/instance/
- API version: **v1**
- Scope: **zonal**. Zones validated by `ScalewayZone` (e.g. `fr-par-1`, `nl-ams-2`, `pl-waw-3`).

## Authentication

- Header: `X-Auth-Token: <secret_key>` (injected by `@scaleway/sdk-client`).

## Pagination

- Query params: `page` (int, 1-indexed), `page_size` (int, max 100). Tool defaults `page=1`, `page_size=50`.
- List responses include `total_count`.

## Servers

### List Servers
`GET /instance/v1/zones/{zone}/servers`
- Tool: `scaleway_instances_list_servers`
- Query: `project`, `name`, `tags` (repeatable), `state`, `page`, `page_size`
- Response: `{ servers: Server[], total_count: number }`

### Get Server
`GET /instance/v1/zones/{zone}/servers/{server_id}`
- Tool: `scaleway_instances_get_server`
- Response: `{ server: Server }`

### Create Server
`POST /instance/v1/zones/{zone}/servers`
- Tool: `scaleway_instances_create_server`
- Body: `{ name (required), commercial_type (required), image (required, UUID), project?, tags?, dynamic_ip_required? }`
- Response: `{ server: Server }`

### Delete Server
`DELETE /instance/v1/zones/{zone}/servers/{server_id}`
- Tool: `scaleway_instances_delete_server`
- Response: empty (tool returns `{ success: true }`). Server must be stopped first.

### Server Action
`POST /instance/v1/zones/{zone}/servers/{server_id}/action`
- Tool: `scaleway_instances_server_action`
- Body: `{ action }` where action ∈ `poweron | poweroff | reboot | terminate | stop_in_place | backup`
- Response: `{ task: Task }`

## Volumes

### List Volumes
`GET /instance/v1/zones/{zone}/volumes`
- Tool: `scaleway_instances_list_volumes`
- Query: `name`, `volume_type` (`l_ssd` | `b_ssd`), `project`, `page`, `page_size`
- Response: `{ volumes: Volume[], total_count: number }`

### Get Volume
`GET /instance/v1/zones/{zone}/volumes/{volume_id}`
- Tool: `scaleway_instances_get_volume`
- Response: `{ volume: Volume }`

### Create Volume
`POST /instance/v1/zones/{zone}/volumes`
- Tool: `scaleway_instances_create_volume`
- Body: `{ name (required), size (bytes, required), volume_type (required, l_ssd | b_ssd), project?, tags? }`
- Response: `{ volume: Volume }`

### Delete Volume
`DELETE /instance/v1/zones/{zone}/volumes/{volume_id}`
- Tool: `scaleway_instances_delete_volume`
- Response: empty (tool returns `{ success: true }`). Volume must be detached.

## Security Groups

Paths use the underscore form `security_groups` (Instance API convention).

### List Security Groups
`GET /instance/v1/zones/{zone}/security_groups`
- Tool: `scaleway_instances_list_security_groups`
- Query: `name`, `project`, `page`, `page_size`
- Response: `{ security_groups: SecurityGroup[], total_count: number }`

### Get Security Group
`GET /instance/v1/zones/{zone}/security_groups/{security_group_id}`
- Tool: `scaleway_instances_get_security_group`
- Response: `{ security_group: SecurityGroup }`

### Create Security Group
`POST /instance/v1/zones/{zone}/security_groups`
- Tool: `scaleway_instances_create_security_group`
- Body: `{ name (required), inbound_default_policy (accept | drop, default accept), outbound_default_policy (accept | drop, default accept), stateful (default true), description?, project? }`
- Response: `{ security_group: SecurityGroup }`

### Delete Security Group
`DELETE /instance/v1/zones/{zone}/security_groups/{security_group_id}`
- Tool: `scaleway_instances_delete_security_group`
- Response: empty (tool returns `{ success: true }`)

## IPs

### List IPs
`GET /instance/v1/zones/{zone}/ips`
- Tool: `scaleway_instances_list_ips`
- Query: `name`, `project`, `type` (`routed_ipv4` | `routed_ipv6`), `page`, `page_size`
- Response: `{ ips: IP[], total_count: number }`

### Create IP
`POST /instance/v1/zones/{zone}/ips`
- Tool: `scaleway_instances_create_ip`
- Body: `{ type (routed_ipv4 | routed_ipv6, default routed_ipv4), project?, server?, tags? }`
- Response: `{ ip: IP }`

### Delete IP
`DELETE /instance/v1/zones/{zone}/ips/{ip_id}`
- Tool: `scaleway_instances_delete_ip`
- Response: empty (tool returns `{ success: true }`)

### Attach IP (Update IP)
`PATCH /instance/v1/zones/{zone}/ips/{ip_id}`
- Tool: `scaleway_instances_attach_ip`
- Body: `{ server }` (server UUID to attach the IP to; the API `UpdateIp` endpoint)
- Response: `{ ip: IP }`

## Snapshots

### List Snapshots
`GET /instance/v1/zones/{zone}/snapshots`
- Tool: `scaleway_instances_list_snapshots`
- Query: `name`, `project`, `page`, `page_size`
- Response: `{ snapshots: Snapshot[], total_count: number }`

### Create Snapshot
`POST /instance/v1/zones/{zone}/snapshots`
- Tool: `scaleway_instances_create_snapshot`
- Body: `{ name (required), volume_id (required), project?, tags? }`
- Response: `{ snapshot: Snapshot }`

### Delete Snapshot
`DELETE /instance/v1/zones/{zone}/snapshots/{snapshot_id}`
- Tool: `scaleway_instances_delete_snapshot`
- Response: empty (tool returns `{ success: true }`)

## Error Codes

| HTTP | Mapped type          |
|------|----------------------|
| 400  | `invalid_input`      |
| 401  | `permission_denied`  |
| 403  | `permission_denied`  |
| 404  | `not_found`          |
| 429  | `rate_limited`       |
| 500  | `server_error`       |
| other| `server_error`       |

## Notes / Deviations

- Security-group paths use `security_groups` (underscore), matching the Instance API; an auto-summary of the public docs rendered these with a hyphen (`security-groups`), which is incorrect for this product.
- Attach-IP is implemented as `PATCH /ips/{ip_id}` with a `server` body field (the `UpdateIp` operation), which is the documented mechanism for attaching a reserved IP to a server.
- `create_volume.size` is expressed in bytes, consistent with the Instance API.
