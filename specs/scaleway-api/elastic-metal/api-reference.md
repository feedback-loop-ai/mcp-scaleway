# Scaleway Elastic Metal (Bare Metal) API Reference

Base URL: `https://api.scaleway.com/baremetal/v1/zones/{zone}`

- Official docs: https://www.scaleway.com/en/developers/api/elastic-metal/
- API version: **v1**
- Scope: **zonal**. Zones include `fr-par-1`, `fr-par-2`, `nl-ams-1`, `nl-ams-2`, `pl-waw-2`, `pl-waw-3` (validated by `ScalewayZone`).
- Transport note: this area's handlers call the raw `client.fetch(url, init)` overload with an absolute URL (`https://api.scaleway.com/baremetal/v1/zones/{zone}/...`) rather than the structured `{ method, path }` form used elsewhere. A `204 No Content` is normalized to `{}`.

## Authentication

- Header: `X-Auth-Token: <secret_key>` (injected by `@scaleway/sdk-client`).

## Pagination

- Query params: `page` (int, 1-indexed), `page_size` (int). Tool defaults `page=1`, `page_size=50`.
- List responses include `total_count`; the tool wraps collections with `buildPaginatedResponse()`.

## Servers

### List Servers
`GET /baremetal/v1/zones/{zone}/servers`
- Tool: `scaleway_elastic_metal_list_servers`
- Query: `project_id`, `name`, `tags` (repeatable), `status`, `order_by`, `page`, `page_size`
- Response: `{ servers: Server[], total_count: number }`

### Get Server
`GET /baremetal/v1/zones/{zone}/servers/{server_id}`
- Tool: `scaleway_elastic_metal_get_server`
- Response: `Server` object (id, name, offer_id, status, ips, domain, boot_type, install, options, tags, …)

### Create Server
`POST /baremetal/v1/zones/{zone}/servers`
- Tool: `scaleway_elastic_metal_create_server`
- Body: `{ offer_id (required), name (required), description, tags, project_id? }` (API also accepts `option_ids`; not sent by the tool)
- Response: `Server` object (status typically `delivering`)

### Delete Server
`DELETE /baremetal/v1/zones/{zone}/servers/{server_id}`
- Tool: `scaleway_elastic_metal_delete_server`
- Response: `Server` object (status `deleting`)

### Install Server
`POST /baremetal/v1/zones/{zone}/servers/{server_id}/install`
- Tool: `scaleway_elastic_metal_install_server`
- Body: `{ os_id (required), hostname (required), ssh_key_ids (required, min 1), password?, service_user?, service_password? }` (API also accepts `user`; not sent by the tool)
- Response: `Server` object

## Server Actions

The Bare Metal API exposes **separate** action endpoints (not a single `/action` endpoint).

### Reboot Server
`POST /baremetal/v1/zones/{zone}/servers/{server_id}/reboot`
- Tool: `scaleway_elastic_metal_reboot_server`
- Body: `{ boot_type? }` (e.g. `normal`, `rescue`)
- Response: `Server` object

### Start Server
`POST /baremetal/v1/zones/{zone}/servers/{server_id}/start`
- Tool: `scaleway_elastic_metal_start_server`
- Body: `{ boot_type? }`
- Response: `Server` object

### Stop Server
`POST /baremetal/v1/zones/{zone}/servers/{server_id}/stop`
- Tool: `scaleway_elastic_metal_stop_server`
- Body: `{}`
- Response: `Server` object

## Offers & OS

### List Offers
`GET /baremetal/v1/zones/{zone}/offers`
- Tool: `scaleway_elastic_metal_list_offers`
- Query: `subscription_period`, `page`, `page_size`
- Response: `{ offers: Offer[], total_count: number }`

### List OS
`GET /baremetal/v1/zones/{zone}/os`
- Tool: `scaleway_elastic_metal_list_oss`
- Query: `offer_id`, `page`, `page_size`
- Response: `{ oss: OS[], total_count: number }` — note the API/tool wrapper key is `oss`

## BMC Access

### Get BMC Access
`GET /baremetal/v1/zones/{zone}/servers/{server_id}/bmc-access`
- Tool: `scaleway_elastic_metal_get_bmc_access`
- Response: `BMCAccess` object (url, login, password, expires_at). Access is time-limited.

## Flexible IPs

### List IPs
`GET /baremetal/v1/zones/{zone}/ips`
- Tool: `scaleway_elastic_metal_list_ips`
- Query: `project_id`, `server_id`, `order_by`, `page`, `page_size`
- Response: `{ ips: IP[], total_count: number }`

### Create IP
`POST /baremetal/v1/zones/{zone}/ips`
- Tool: `scaleway_elastic_metal_create_ip`
- Body: `{ project_id (required), description, tags, server_id? }`
- Response: `IP` object

### Delete IP
`DELETE /baremetal/v1/zones/{zone}/ips/{ip_id}`
- Tool: `scaleway_elastic_metal_delete_ip`
- Response: empty body

## Private Networks

Elastic Metal servers can be attached to Scaleway VPC Private Networks (L2, up to 8 per
server, 1 Gbps). This is the Bare Metal **Private Network API** (part of `baremetal/v1`).

- Official docs: https://www.scaleway.com/en/developers/api/elastic-metal/private-network/
- Verified against the Scaleway Go SDK (`api/baremetal/v1/baremetal_sdk.go`,
  `PrivateNetworkAPI`) — the authoritative source. Note the **list** operation uses a
  zone-level collection path (`/server-private-networks`), while add/set/delete are nested
  under `/servers/{server_id}/private-networks`.

### ServerPrivateNetwork object

Fields: `id`, `project_id`, `server_id`, `private_network_id`, `vlan` (uint32, nullable),
`status` (`unknown` | `attaching` | `attached` | `error` | `detaching` | `locked`),
`created_at`, `updated_at`.

### List Server Private Networks
`GET /baremetal/v1/zones/{zone}/server-private-networks`
- Tool: `scaleway_elastic_metal_list_server_private_networks`
- Query: `server_id`, `private_network_id`, `organization_id`, `project_id`, `order_by`
  (`created_at_asc` | `created_at_desc` | `updated_at_asc` | `updated_at_desc`),
  `page`, `page_size`
- Response: `{ server_private_networks: ServerPrivateNetwork[], total_count: number }`
  (wrapped by `buildPaginatedResponse()`)

### Add Server Private Network
`POST /baremetal/v1/zones/{zone}/servers/{server_id}/private-networks`
- Tool: `scaleway_elastic_metal_add_server_private_network`
- Body: `{ private_network_id (required) }`
- Response: `ServerPrivateNetwork` object (status typically `attaching`)

### Set Server Private Networks
`PUT /baremetal/v1/zones/{zone}/servers/{server_id}/private-networks`
- Tool: `scaleway_elastic_metal_set_server_private_networks`
- Body: `{ private_network_ids: string[] }` — replaces the full set; pass `[]` to detach all
- Response: `{ server_private_networks: ServerPrivateNetwork[] }` (no `total_count`)

### Delete Server Private Network
`DELETE /baremetal/v1/zones/{zone}/servers/{server_id}/private-networks/{private_network_id}`
- Tool: `scaleway_elastic_metal_delete_server_private_network`
- Response: empty body (`204`, normalized to `{}`)

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

- Reboot/start/stop are **separate endpoints** per the official docs, matching the implementation. (An auto-summary of the docs at one point suggested a single `/action` endpoint — that is the *Instance* API pattern, not Bare Metal; it was ruled out by a targeted docs fetch.)
- `create_server` and `install_server` omit the optional `option_ids` / `user` fields the API accepts; not a correctness issue for the exposed tools.
