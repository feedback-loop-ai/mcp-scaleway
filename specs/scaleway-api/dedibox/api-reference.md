# Scaleway Dedibox API Reference (v1)

Source: https://www.scaleway.com/en/developers/api/dedibox/
Authoritative shapes cross-checked against the official generated Go SDK
(`github.com/scaleway/scaleway-sdk-go/api/dedibox/v1`).

- **Host**: `https://api.scaleway.com`
- **Base path**: `/dedibox/v1`
- **Scoping**: Zone-scoped. Server/offer/OS resources live under
  `/dedibox/v1/zones/{zone}/...`. Zones use the standard Scaleway format
  (e.g. `fr-par-1`, `fr-par-2`).
- **Auth**: Standard Scaleway `X-Auth-Token: <secret_key>` header (same as every
  other product served from `api.scaleway.com`). This is NOT the legacy
  `api.online.net` API — Dedibox is fully exposed under the unified Scaleway API
  and works with the shared MCP client.
- **Pagination**: Offset-based. Requests take `page` (1-indexed) and `page_size`
  query params; list responses return `total_count` plus the item array.
- **Resource IDs**: Numeric (uint64), NOT UUIDs. Zone/project IDs remain UUIDs.
- **Error codes**: Standard Scaleway HTTP codes — `400` invalid_input,
  `401`/`403` permission_denied, `404` not_found, `429` rate_limited, `5xx`
  server_error. Mapped by `src/shared/errors.ts`.

## Servers

### List servers
`GET /dedibox/v1/zones/{zone}/servers`
Query: `page`, `page_size`, `order_by` (`created_at_asc|created_at_desc`),
`project_id`, `search` (hostname filter).
Response: `{ total_count: number, servers: ServerSummary[] }`.

`ServerSummary`: `id`, `datacenter_name`, `organization_id`, `project_id`,
`hostname`, `created_at`, `updated_at`, `expired_at`, `offer_id`, `offer_name`,
`status`, `os_id`, `interfaces[]`, `zone`, `level`, `is_outsourced`, `qinq`,
`rpn_version`, `is_hds`.

### Get server
`GET /dedibox/v1/zones/{zone}/servers/{server_id}`
Response: `Server` — `id`, `organization_id`, `project_id`, `hostname`,
`rebooted_at`, `created_at`, `updated_at`, `expired_at`, `offer`, `status`,
`location` (`rack`, `room`, `datacenter_name`), `os`, `interfaces[]`, `zone`,
`options[]`, `level`, `has_bmc`, `rescue_os`, `tags[]`, `is_outsourced`,
`ipv6_slaac`, `qinq`, `is_rpnv2_member`, `is_hds`.

`ServerStatus`: `unknown | delivering | error | installing | locked | ready |
rescue | stopped | busy`.

### Update server
`PATCH /dedibox/v1/zones/{zone}/servers/{server_id}`
Body: `{ hostname?: string, enable_ipv6?: boolean }`. Response: `Server`.

### Server power actions
- `POST /dedibox/v1/zones/{zone}/servers/{server_id}/reboot`
- `POST /dedibox/v1/zones/{zone}/servers/{server_id}/start`
- `POST /dedibox/v1/zones/{zone}/servers/{server_id}/stop`
Body: empty `{}`. Return: `204`/empty on success.

### Delete server
`DELETE /dedibox/v1/zones/{zone}/servers/{server_id}` — releases the server.

## Installation

### Install server
`POST /dedibox/v1/zones/{zone}/servers/{server_id}/install`
Body: `os_id` (required), `hostname` (required), `user_login?`, `user_password?`,
`panel_password?`, `root_password?`, `partitions?` (`InstallPartition[]`),
`ssh_key_ids?` (string[]), `license_offer_id?`, `ip_id?`.
`InstallPartition`: `file_system` (`PartitionFileSystem`), `mount_point?`,
`raid_level` (`RaidArrayRaidLevel`: `no_raid|raid0|raid1|raid5|raid6|raid10`),
`capacity` (bytes), `connectors[]`.
Response: `ServerInstall`.

### Get server install status
`GET /dedibox/v1/zones/{zone}/servers/{server_id}/install`
Response: `ServerInstall` — `os_id`, `hostname`, `user_login`, `partitions[]`,
`ssh_key_ids[]`, `status`, `panel_url`.
`ServerInstallStatus`: `unknown | booting | configuring |
configuring_bootloader | formatting | installed | installing | partitioning |
rebooting | setting_up_raid`.

### Cancel server install
`POST /dedibox/v1/zones/{zone}/servers/{server_id}/cancel-install` — body `{}`.

## Offers

### List offers
`GET /dedibox/v1/zones/{zone}/offers`
Query: `page`, `page_size`, `order_by`
(`created_at_asc|created_at_desc|name_asc|name_desc|price_asc|price_desc`),
`commercial_range`, `catalog` (`all|default|beta|premium|admin|inactive|
reseller|volume`), `project_id`, `available_only`.
Response: `{ total_count, offers: Offer[] }`.
`Offer`: `id`, `name`, `catalog`, `payment_frequency` (`monthly|oneshot`),
`pricing` (`scw.Money`: `currency_code`, `units`, `nanos`), plus exactly one
typed `*_info` block (`server_info`, `service_level_info`, `rpn_info`, ...).

### Get offer
`GET /dedibox/v1/zones/{zone}/offers/{offer_id}`
Query: `project_id?`. Response: `Offer`.

## Operating systems

### List OS
`GET /dedibox/v1/zones/{zone}/os`
Query: `page`, `page_size`, `order_by`
(`created_at_asc|created_at_desc|released_at_asc|released_at_desc`), `type`
(`OSType`: `unknown_type|custom|desktop|panel|rescue|server|virtu`),
`server_id` (compatibility filter), `project_id`.
Response: `{ total_count, os: OS[] }`.
`OS`: `id`, `name`, `type`, `version`, `arch`
(`unknown_arch|x86|amd64|arm|arm64`), `allow_custom_partitioning`,
`allow_ssh_keys`, `requires_user`, `requires_admin_password`,
`requires_panel_password`, `allowed_filesystems[]`, `requires_license`,
`license_offers[]`, `max_partitions`, `display_name`, `password_regex`, ...

### Get OS
`GET /dedibox/v1/zones/{zone}/os/{os_id}`
Query: `server_id` (required), `project_id?`. Response: `OS`.

## BMC (Baseboard Management Controller) access

### Get BMC access
`GET /dedibox/v1/zones/{zone}/servers/{server_id}/bmc-access`
Response: `BMCAccess` — `url`, `login`, `password`, `expires_at`, `status`
(`unknown|created|creating|deleting`).

### Start BMC access
`POST /dedibox/v1/zones/{zone}/servers/{server_id}/bmc-access`
Body: `{ ip: string }` (the IP authorized to reach the console).

### Stop BMC access
`DELETE /dedibox/v1/zones/{zone}/servers/{server_id}/bmc-access`

## Endpoints intentionally not exposed by the MCP server

The Dedibox v1 API also covers (out of scope for this vertical — see
`specs/055-dedibox/spec.md`): server ordering/creation (`POST /servers` order
flow), services & ordered-services, backups, subscribable server/storage
options, server events/disks, failover IPs, reverse DNS, RAID configuration,
rescue mode, remaining quota, default partitioning, plus the global sub-APIs
(RPN v1/v2, IPv6 blocks, invoices/refunds/billing).
