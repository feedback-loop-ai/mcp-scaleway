# Scaleway InterLink API Reference

InterLink provides dedicated (self-hosted) and partner-hosted private Layer 3
connectivity between a customer network and Scaleway VPCs, over a BGP peering
session.

- API slug: `interlink`
- Version: `v1beta1`
- Scope: **region** (`fr-par`, `nl-ams`, `pl-waw`)
- Base URL: `https://api.scaleway.com/interlink/v1beta1/regions/{region}`
- Source: https://www.scaleway.com/en/developers/api/interlink/ (cross-checked
  against the official Go SDK `scaleway/scaleway-sdk-go/api/interlink/v1beta1`)

## Authentication

- Header: `X-Auth-Token: <secret_key>`

## Pagination (list endpoints)

- Query: `page` (int, 1-indexed), `page_size` (int, max 100), `order_by` (enum)
- Response envelope: `{ <collection>: T[], total_count: number }`

## Resources & entities

### Link

A logical InterLink resource representing a BGP peering session. A link is
either **hosted** (through a `partner`) or **self_hosted** (through a dedicated
`connection`).

```
{
  id, project_id, organization_id, name, tags[],
  pop_id, bandwidth_mbps, status,
  bgp_v4_status, bgp_v6_status,
  vpc_id?, routing_policy_id? (deprecated), enable_route_propagation,
  created_at, updated_at,
  partner? { partner_id, pairing_key, disapproved_reason? },
  self? { connection_id },
  vlan, scw_bgp_config? { asn, ipv4, ipv6 }, peer_bgp_config? { asn, ipv4, ipv6 },
  routing_policy_v4_id?, routing_policy_v6_id?, region
}
```

- `status` enum: `unknown_link_status`, `configuring`, `failed`, `requested`,
  `refused`, `expired`, `provisioning`, `active`, `limited_connectivity`,
  `all_down`, `deprovisioning`, `deleted`, `locked`, `ready`
- `bgp_v4_status` / `bgp_v6_status` enum (**BGP session data**):
  `unknown_bgp_status`, `up`, `down`, `disabled`
- `kind` (list filter only) enum: `hosted`, `self_hosted`

### RoutingPolicy

Defines the IP prefixes to allow inbound (accepted from peer) and outbound
(advertised to peer). A policy is IPv4 or IPv6 (`is_ipv6`).

```
{ id, project_id, organization_id, name, tags[],
  prefix_filter_in[], prefix_filter_out[], created_at, updated_at, is_ipv6, region }
```

### Partner

A third-party hosting provider offering InterLink connectivity.

```
{ id, name, contact_email, logo_url, portal_url, created_at, updated_at }
```

### Pop (Point of Presence)

A datacenter location where an InterLink connection is available.

```
{ id, name, hosting_provider_name, address, city, logo_url,
  available_link_bandwidths_mbps[], display_name, region }
```

### DedicatedConnection

A physical, self-hosted connection between customer equipment and Scaleway.

```
{ id, project_id, organization_id, status, name, tags[], pop_id,
  bandwidth_mbps, available_link_bandwidths[], created_at, updated_at,
  demarcation_info?, vlan_range? { start, end }, region }
```

- `status` enum: `unknown_status`, `created`, `configuring`, `failed`,
  `active`, `disabled`, `deleted`, `locked`

## Endpoints

### Links

#### List Links
`GET /links`
- Query: page, page_size, order_by (`created_at_asc|created_at_desc|name_asc|name_desc|status_asc|status_desc`),
  project_id, organization_id, name, tags[], status, bgp_v4_status,
  bgp_v6_status, pop_id, bandwidth_mbps, partner_id, vpc_id, routing_policy_id,
  pairing_key, kind, connection_id
- Response: `{ links: Link[], total_count }`

#### Get Link
`GET /links/{link_id}` → `Link` (includes BGP session status/config)

#### Create Link
`POST /links`
- Body: `{ name, pop_id, bandwidth_mbps, project_id?, tags?, connection_id?, partner_id?, peer_asn?, vlan?, routing_policy_v4_id?, routing_policy_v6_id? }`
- `connection_id` for self-hosted links; `partner_id` for partner-hosted links.
- Response: `Link`

#### Update Link
`PATCH /links/{link_id}`
- Body: `{ name?, tags?, peer_asn? }`
- Response: `Link`

#### Delete Link
`DELETE /links/{link_id}` → `Link` (status transitions to deprovisioning/deleted)

#### Attach VPC
`POST /links/{link_id}/attach-vpc`
- Body: `{ vpc_id }` → `Link`

#### Detach VPC
`POST /links/{link_id}/detach-vpc`
- Body: `{}` → `Link`

#### Attach Routing Policy
`POST /links/{link_id}/attach-routing-policy`
- Body: `{ routing_policy_id }` → `Link`

#### Detach Routing Policy
`POST /links/{link_id}/detach-routing-policy`
- Body: `{ routing_policy_id }` → `Link`

#### Set Routing Policy
`POST /links/{link_id}/set-routing-policy`
- Body: `{ routing_policy_id }` → `Link`

#### Enable Route Propagation
`POST /links/{link_id}/enable-route-propagation`
- Body: `{}` → `Link`

#### Disable Route Propagation
`POST /links/{link_id}/disable-route-propagation`
- Body: `{}` → `Link`

### Routing Policies

#### List Routing Policies
`GET /routing-policies`
- Query: page, page_size, order_by (`created_at_asc|created_at_desc|name_asc|name_desc`),
  project_id, organization_id, name, tags[], ipv6
- Response: `{ routing_policies: RoutingPolicy[], total_count }`

#### Get Routing Policy
`GET /routing-policies/{routing_policy_id}` → `RoutingPolicy`

#### Create Routing Policy
`POST /routing-policies`
- Body: `{ name, is_ipv6, project_id?, tags?, prefix_filter_in?, prefix_filter_out? }`
- Response: `RoutingPolicy`

#### Update Routing Policy
`PATCH /routing-policies/{routing_policy_id}`
- Body: `{ name?, tags?, prefix_filter_in?, prefix_filter_out? }`
- Response: `RoutingPolicy`

#### Delete Routing Policy
`DELETE /routing-policies/{routing_policy_id}` → `RoutingPolicy`

### Partners

#### List Partners
`GET /partners`
- Query: page, page_size, order_by (`name_asc|name_desc`), pop_ids[]
- Response: `{ partners: Partner[], total_count }`

#### Get Partner
`GET /partners/{partner_id}` → `Partner`

### Points of Presence

#### List PoPs
`GET /pops`
- Query: page, page_size, order_by (`name_asc|name_desc`), name,
  hosting_provider_name, partner_id, link_bandwidth_mbps, dedicated_available
- Response: `{ pops: Pop[], total_count }`

#### Get PoP
`GET /pops/{pop_id}` → `Pop`

### Dedicated Connections

#### List Dedicated Connections
`GET /dedicated-connections`
- Query: page, page_size, order_by (`created_at_asc|created_at_desc|updated_at_asc|updated_at_desc|name_asc|name_desc|status_asc|status_desc`),
  project_id, organization_id, name, tags[], status, bandwidth_mbps, pop_id
- Response: `{ connections: DedicatedConnection[], total_count }`

#### Get Dedicated Connection
`GET /dedicated-connections/{connection_id}` → `DedicatedConnection`

## Error Codes

- 400: Invalid input
- 401 / 403: Permission denied
- 404: Not found
- 409: Conflict (e.g. VPC already attached)
- 429: Rate limited
- 500: Server error

## Notes

- **BGP session data** is exposed as part of the `Link` entity
  (`bgp_v4_status`, `bgp_v6_status`, `scw_bgp_config`, `peer_bgp_config`);
  there is no standalone BGP endpoint — read it via Get/List Link.
- `Link.routing_policy_id` is deprecated in favor of `routing_policy_v4_id` /
  `routing_policy_v6_id`; attach/detach/set-routing-policy operate per policy
  and the server infers the IP version from the policy's `is_ipv6` flag.
