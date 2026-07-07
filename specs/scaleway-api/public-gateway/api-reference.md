# Scaleway Public Gateway API Reference

Official reference: https://www.scaleway.com/en/developers/api/public-gateway/

Base URL: `https://api.scaleway.com/vpc-gw/{version}/zones/{zone}`

- **Locality:** zonal (e.g. `fr-par-1`, `fr-par-2`, `nl-ams-1`, `pl-waw-1`). Handlers default the zone to `SCW_DEFAULT_ZONE` or `fr-par-1`.
- **Authentication:** header `X-Auth-Token: <secret_key>`.
- **Pagination:** query `page` / `page_size`; list responses return `{ <collection>: [...], total_count }`, re-wrapped by the MCP layer into `{ items, totalCount, page, pageSize }`.

## API version split (important)

This product deliberately spans two upstream API versions:

- **v2 (`/vpc-gw/v2/zones/{zone}`)** — used for gateways, gateway-networks, PAT rules, IPs, and gateway-types. This is the current API; on v2, per-gateway addressing is IPAM-managed and there are **no `/dhcps` endpoints**.
- **v1 (`/vpc-gw/v1/zones/{zone}`)** — used **only** for the legacy DHCP endpoints (`/dhcps`). DHCP-as-a-standalone-resource was **removed in v2** (gateways now use IPAM-managed DHCP), so these endpoints are **deprecated upstream** and retained for backward compatibility. Marked `deprecated-upstream` in the parity fragment.

Helpers: `buildUrl(zone, path)` → v2 prefix; `buildV1Url(zone, path)` → v1 prefix (`src/tools/public-gateway/handlers.ts`).

## Gateways (v2)

### List — `scaleway_public_gateway_list_gateways`
`GET /vpc-gw/v2/zones/{zone}/gateways`
- Query: `page`, `page_size`, `order_by`, `organization_id`, `project_id`, `name`, `tags`, `types`, `status`, `private_network_ids`, `include_legacy`.
- Response: `{ gateways: Gateway[], total_count }`

### Get — `scaleway_public_gateway_get_gateway`
`GET /vpc-gw/v2/zones/{zone}/gateways/{gateway_id}`

### Create — `scaleway_public_gateway_create_gateway`
`POST /vpc-gw/v2/zones/{zone}/gateways`
- Body: `{ type, enable_smtp, enable_bastion, project_id?, name?, tags?, ip_id?, bastion_port? }`

### Update — `scaleway_public_gateway_update_gateway`
`PATCH /vpc-gw/v2/zones/{zone}/gateways/{gateway_id}`
- Body (partial): `{ name?, tags?, enable_bastion?, bastion_port?, enable_smtp? }`

### Delete — `scaleway_public_gateway_delete_gateway`
`DELETE /vpc-gw/v2/zones/{zone}/gateways/{gateway_id}` — query `delete_ip` (bool).

## Gateway Networks (v2)

### List — `scaleway_public_gateway_list_gateway_networks`
`GET /vpc-gw/v2/zones/{zone}/gateway-networks`
- Query: `page`, `page_size`, `order_by`, `status`, `gateway_ids`, `private_network_ids`, `masquerade_enabled`.

### Get — `scaleway_public_gateway_get_gateway_network`
`GET /vpc-gw/v2/zones/{zone}/gateway-networks/{gateway_network_id}`

### Create — `scaleway_public_gateway_create_gateway_network`
`POST /vpc-gw/v2/zones/{zone}/gateway-networks`
- Body: `{ gateway_id, private_network_id, enable_masquerade, push_default_route, ipam_ip_id? }`

### Update — `scaleway_public_gateway_update_gateway_network`
`PATCH /vpc-gw/v2/zones/{zone}/gateway-networks/{gateway_network_id}`
- Body (partial): `{ enable_masquerade?, push_default_route?, ipam_ip_id? }`

### Delete — `scaleway_public_gateway_delete_gateway_network`
`DELETE /vpc-gw/v2/zones/{zone}/gateway-networks/{gateway_network_id}`

## DHCP (v1 — deprecated upstream)

DHCP standalone resources exist only on `/vpc-gw/v1`. Deprecated: v2 gateways use IPAM-managed DHCP instead.

### List — `scaleway_public_gateway_list_dhcps`
`GET /vpc-gw/v1/zones/{zone}/dhcps` — query `page`, `page_size`, `order_by`, `organization_id`, `project_id`, `address`, `has_address`.

### Get — `scaleway_public_gateway_get_dhcp`
`GET /vpc-gw/v1/zones/{zone}/dhcps/{dhcp_id}`

### Create — `scaleway_public_gateway_create_dhcp`
`POST /vpc-gw/v1/zones/{zone}/dhcps`
- Body: `{ subnet, project_id?, address?, pool_low?, pool_high?, enable_dynamic?, valid_lifetime?, renew_timer?, rebind_timer?, push_default_route?, push_dns_server?, dns_servers_override?, dns_search?, dns_local_name? }`

### Update — `scaleway_public_gateway_update_dhcp`
`PATCH /vpc-gw/v1/zones/{zone}/dhcps/{dhcp_id}` — same fields as create, all optional.

### Delete — `scaleway_public_gateway_delete_dhcp`
`DELETE /vpc-gw/v1/zones/{zone}/dhcps/{dhcp_id}` — MCP returns `{ success: true }`.

## PAT Rules (v2)

### List — `scaleway_public_gateway_list_pat_rules`
`GET /vpc-gw/v2/zones/{zone}/pat-rules` — query `page`, `page_size`, `order_by`, `gateway_ids`, `private_ips`, `protocol`.

### Get — `scaleway_public_gateway_get_pat_rule`
`GET /vpc-gw/v2/zones/{zone}/pat-rules/{pat_rule_id}`

### Create — `scaleway_public_gateway_create_pat_rule`
`POST /vpc-gw/v2/zones/{zone}/pat-rules`
- Body: `{ gateway_id, public_port, private_ip, private_port, protocol? }` (`protocol`: tcp/udp/both)

### Update — `scaleway_public_gateway_update_pat_rule`
`PATCH /vpc-gw/v2/zones/{zone}/pat-rules/{pat_rule_id}` — Body (partial): `{ public_port?, private_ip?, private_port?, protocol? }`

### Delete — `scaleway_public_gateway_delete_pat_rule`
`DELETE /vpc-gw/v2/zones/{zone}/pat-rules/{pat_rule_id}` — MCP returns `{ success: true }`.

## IPs (v2)

### List — `scaleway_public_gateway_list_ips`
`GET /vpc-gw/v2/zones/{zone}/ips` — query `page`, `page_size`, `order_by`, `organization_id`, `project_id`, `tags`, `reverse`, `is_free`.

### Get — `scaleway_public_gateway_get_ip`
`GET /vpc-gw/v2/zones/{zone}/ips/{ip_id}`

### Create — `scaleway_public_gateway_create_ip`
`POST /vpc-gw/v2/zones/{zone}/ips` — Body: `{ project_id?, tags? }`

### Update — `scaleway_public_gateway_update_ip`
`PATCH /vpc-gw/v2/zones/{zone}/ips/{ip_id}` — Body (partial): `{ tags?, reverse?, gateway_id? }`

### Delete — `scaleway_public_gateway_delete_ip`
`DELETE /vpc-gw/v2/zones/{zone}/ips/{ip_id}` — MCP returns `{ success: true }`.

## Gateway Types (v2)

### List — `scaleway_public_gateway_list_gateway_types`
`GET /vpc-gw/v2/zones/{zone}/gateway-types`
- Response: `{ types: GatewayType[] }` — each `{ name, bandwidth, ... }` (not paginated).

## Endpoints present in the official v2 API but NOT exposed as tools
- `POST /gateways/{gateway_id}/refresh-ssh-keys`, `POST /gateways/{gateway_id}/upgrade`
- `/vpc-gw/v2/zones/{zone}/allowed-ips` (allowed-IPs sub-resource).

## Error codes
- 400 invalid input · 401/403 permission denied · 404 not found · 409 conflict · 429 rate limited · 500 server error.
