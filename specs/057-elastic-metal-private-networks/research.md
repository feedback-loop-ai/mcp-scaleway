# Research: Elastic Metal Private Networks

## Goal

Determine the current, authoritative API surface for attaching Elastic Metal (Bare Metal)
servers to Scaleway VPC Private Networks, and expose it as MCP tools.

## Sources

- Official docs entry point: https://www.scaleway.com/en/developers/api/elastic-metal/private-network/
- **Authoritative**: Scaleway Go SDK `api/baremetal/v1/baremetal_sdk.go` (`PrivateNetworkAPI`),
  fetched at commit `9aef648`. Used because the public docs summary omitted exact request
  bodies and the delete path template, and an outdated third-party OpenAPI mirror lacked the
  private-networks operations entirely.
- Product docs: https://www.scaleway.com/en/docs/bare-metal/elastic-metal/how-to/use-private-networks/

## Decisions

- **API version / base path**: `baremetal/v1`, zonal —
  `https://api.scaleway.com/baremetal/v1/zones/{zone}`. The "v3 variant" mentioned in the
  assignment does not apply here; Bare Metal Private Networks live in `baremetal/v1` (the v3
  naming belongs to the VPC Private Network API that manages the networks themselves).
- **List path is a zone-level collection**: `GET .../server-private-networks` (NOT nested under
  a server). Filtering by `server_id` is a query parameter. Verified in `ListServerPrivateNetworks`.
- **Add / Set / Delete are nested** under `/servers/{server_id}/private-networks`:
  - Add: `POST` with body `{ private_network_id }` → returns a `ServerPrivateNetwork`.
  - Set: `PUT` with body `{ private_network_ids: [] }` → returns
    `{ server_private_networks: [...] }` (no `total_count`).
  - Delete: `DELETE .../private-networks/{private_network_id}` → `204`.
- **ServerPrivateNetwork fields** (from the SDK struct): `id`, `project_id`, `server_id`,
  `private_network_id`, `vlan` (uint32, nullable), `status`, `created_at`, `updated_at`.
- **Status enum**: `unknown | attaching | attached | error | detaching | locked`.
- **order_by enum**: `created_at_asc | created_at_desc | updated_at_asc | updated_at_desc`.
- **Max 8 networks per server** — enforced client-side with `.max(8)` on the set schema.

## Rationale for exclusions

- IPAM options (`ipam_ip_ids` on add, `per_pn_ipam_ip_ids` on set) exist in the raw API for
  reserving specific IPAM IPs. Excluded to keep the tool minimal; additive and non-breaking to
  add later.
- Managing the Private Networks themselves is out of scope (VPC API).

## Implementation notes

- Reuse the existing elastic-metal `apiCall` transport helper (absolute-URL `client.fetch`),
  `paginationSearchParams`, `buildPaginatedResponse`, and shared error mapping — consistent
  with the other 14 tools in the area.
