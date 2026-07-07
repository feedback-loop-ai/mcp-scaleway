# Scaleway Apple Silicon API Reference

Base URL: `https://api.scaleway.com/apple-silicon/v1alpha1/zones/{zone}`

- Official docs: https://www.scaleway.com/en/developers/api/apple-silicon/
- API version: **v1alpha1** (alpha — shapes may change; no v1 GA published as of this writing)
- Scope: **zonal**. Available zones: `fr-par-1`, `fr-par-3` (validated by `ScalewayZone`; handler falls back to the server's configured `defaultZone` when `zone` is omitted).
- A minimum allocation period of 24 hours applies; servers cannot be deleted before it elapses. Per-organization quotas cap concurrent servers.

## Authentication

- Header: `X-Auth-Token: <secret_key>` (injected automatically by `@scaleway/sdk-client`).

## Pagination

- Query params: `page` (int, 1-indexed), `page_size` (int). Defaults applied by the tool: `page=1`, `page_size=50`.
- List responses include `total_count` alongside the collection array.

## Servers

### List Servers
`GET /apple-silicon/v1alpha1/zones/{zone}/servers`
- Tool: `scaleway_apple_silicon_list_servers`
- Query: `order_by` (`created_at_asc` | `created_at_desc`), `project_id` (string), `organization_id` (string), `page` (int), `page_size` (int)
- Response: `{ servers: Server[], total_count: number }`

### Get Server
`GET /apple-silicon/v1alpha1/zones/{zone}/servers/{server_id}`
- Tool: `scaleway_apple_silicon_get_server`
- Response: `Server` object (id, name, type, status, ip, os, project_id, zone, created_at, updated_at, deletable_at, vnc_url, …)

### Create Server
`POST /apple-silicon/v1alpha1/zones/{zone}/servers`
- Tool: `scaleway_apple_silicon_create_server`
- Body: `{ type (required), name?, project_id?, os_id?, enable_vpc (default false), enable_kext (default false), commitment_type? (duration_24h | renewed_monthly | none), public_bandwidth_bps? }`
- Response: `Server` object (status typically `starting`)

### Delete Server
`DELETE /apple-silicon/v1alpha1/zones/{zone}/servers/{server_id}`
- Tool: `scaleway_apple_silicon_delete_server`
- Response: empty body (tool returns `{ message: "Server deleted successfully" }`)

### Reboot Server
`POST /apple-silicon/v1alpha1/zones/{zone}/servers/{server_id}/reboot`
- Tool: `scaleway_apple_silicon_reboot_server`
- Body: `{}` (empty)
- Response: `Server` object

### Reinstall Server
`POST /apple-silicon/v1alpha1/zones/{zone}/servers/{server_id}/reinstall`
- Tool: `scaleway_apple_silicon_reinstall_server`
- Body: `{ enable_kext (default false), os_id? }`. Erases all data on disk.
- Response: `Server` object

## Server Types

### List Server Types
`GET /apple-silicon/v1alpha1/zones/{zone}/server-types`
- Tool: `scaleway_apple_silicon_list_server_types`
- Query: none (not paginated)
- Response: `{ server_types: ServerType[] }` — each with `name`, `cpu`, `memory`, `disk`, `stock`, and pricing metadata

## Operating Systems

### List OS
`GET /apple-silicon/v1alpha1/zones/{zone}/os`
- Tool: `scaleway_apple_silicon_list_os`
- Query: `server_type` (string), `name` (string), `page` (int), `page_size` (int)
- Response: `{ os: OS[], total_count: number }` — each OS with `id`, `name`, `label`, `image_url`, `family`, `is_beta`, `version`, `xcode_version`, `compatible_server_types`

## Private Networks

Apple silicon servers can be attached to VPC Private Networks. These endpoints are exposed by the SDK's dedicated `PrivateNetworkAPI` (group "Apple silicon - Private Networks", `@scaleway/sdk-applesilicon@2.4.1`, `v1alpha1`). Scope is **zonal** (`fr-par-1`, `fr-par-3`). A `ServerPrivateNetwork` (attachment) object has: `id`, `project_id`, `server_id`, `private_network_id`, `vlan?` (int), `status` (`vpc_unknown_status` | `vpc_enabled` | `vpc_updating` | `vpc_disabled`), `created_at?`, `updated_at?`, `ipam_ip_ids` (string[]).

### List Server Private Networks
`GET /apple-silicon/v1alpha1/zones/{zone}/server-private-networks`
- Tool: `scaleway_apple_silicon_list_server_private_networks`
- Query: `order_by` (`created_at_asc` | `created_at_desc` | `updated_at_asc` | `updated_at_desc`), `server_id` (string), `private_network_id` (string), `organization_id` (string), `project_id` (string), `ipam_ip_ids` (repeated string), `page` (int), `page_size` (int)
- Response: `{ server_private_networks: ServerPrivateNetwork[], total_count: number }`
- Note: this is a **collection** endpoint at `/server-private-networks` (not nested under a server).

### Get Server Private Network
`GET /apple-silicon/v1alpha1/zones/{zone}/servers/{server_id}/private-networks/{private_network_id}`
- Tool: `scaleway_apple_silicon_get_server_private_network`
- Response: `ServerPrivateNetwork` object

### Add Server Private Network
`POST /apple-silicon/v1alpha1/zones/{zone}/servers/{server_id}/private-networks`
- Tool: `scaleway_apple_silicon_add_server_private_network`
- Body: `{ private_network_id (required), ipam_ip_ids? (string[]) }`
- Response: `ServerPrivateNetwork` object (status typically `vpc_updating`)

### Set Server Private Networks
`PUT /apple-silicon/v1alpha1/zones/{zone}/servers/{server_id}/private-networks`
- Tool: `scaleway_apple_silicon_set_server_private_networks`
- Body: `{ per_private_network_ipam_ip_ids: { [private_network_id]: string[] } }` — replaces the full set of attachments. An empty array for a Private Network auto-assigns the next available IP from its CIDR block.
- Response: `{ server_private_networks: ServerPrivateNetwork[] }`

### Delete Server Private Network
`DELETE /apple-silicon/v1alpha1/zones/{zone}/servers/{server_id}/private-networks/{private_network_id}`
- Tool: `scaleway_apple_silicon_delete_server_private_network`
- Response: empty body (tool returns `{ message: "Private Network detached successfully" }`)

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

- The `server-types` and `os` endpoints are **zone-scoped** (`.../zones/{zone}/server-types`, `.../zones/{zone}/os`) in the SDK-generated client and in this implementation. The auto-summarized public docs occasionally render these without the zone segment; the zone-scoped path is authoritative.
- `type` is accepted as a free-form string by the tool (examples: `M1-M`, `M2-M`, `M2-L`, `M2-128`, `M4-128`); the API validates the concrete catalog value.
- API is **alpha** (`v1alpha1`); no deprecation notice, but response shapes are not covered by API-stability guarantees.
