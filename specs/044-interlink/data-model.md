# Data Model: Scaleway InterLink

All entities are region-scoped (`v1beta1`). Timestamps are ISO 8601 with offset.

## Link

A logical InterLink resource = one BGP peering session.

| Field | Type | Notes |
|-------|------|-------|
| id | string (UUID) | |
| project_id | string (UUID) | |
| organization_id | string (UUID) | |
| name | string | |
| tags | string[] | |
| pop_id | string (UUID) | Point of Presence |
| bandwidth_mbps | number | |
| status | enum | see LinkStatus |
| bgp_v4_status | enum | BGP session data (BgpStatus) |
| bgp_v6_status | enum | BGP session data (BgpStatus) |
| vpc_id | string (UUID) \| null | attached VPC |
| routing_policy_id | string (UUID) \| null | **deprecated** |
| enable_route_propagation | boolean | |
| created_at / updated_at | string | |
| partner | PartnerHost \| null | present for hosted links |
| self | SelfHost \| null | present for self-hosted links |
| vlan | number | |
| scw_bgp_config | BgpConfig \| null | Scaleway side BGP config |
| peer_bgp_config | BgpConfig \| null | peer side BGP config |
| routing_policy_v4_id | string (UUID) \| null | |
| routing_policy_v6_id | string (UUID) \| null | |
| region | string | |

**LinkStatus**: `unknown_link_status`, `configuring`, `failed`, `requested`,
`refused`, `expired`, `provisioning`, `active`, `limited_connectivity`,
`all_down`, `deprovisioning`, `deleted`, `locked`, `ready`

**BgpStatus**: `unknown_bgp_status`, `up`, `down`, `disabled`

**LinkKind** (list filter): `hosted`, `self_hosted`

### BgpConfig
`{ asn: number, ipv4: string, ipv6: string }`

### PartnerHost
`{ partner_id: string, pairing_key: string, disapproved_reason?: string|null }`

### SelfHost
`{ connection_id: string }`

## RoutingPolicy

| Field | Type |
|-------|------|
| id | string (UUID) |
| project_id / organization_id | string (UUID) |
| name | string |
| tags | string[] |
| prefix_filter_in | string[] (CIDR) |
| prefix_filter_out | string[] (CIDR) |
| is_ipv6 | boolean |
| created_at / updated_at | string |
| region | string |

## Partner

`{ id, name, contact_email, logo_url, portal_url, created_at, updated_at }`

## Pop

| Field | Type |
|-------|------|
| id | string (UUID) |
| name | string |
| hosting_provider_name | string |
| address | string |
| city | string |
| logo_url | string |
| available_link_bandwidths_mbps | number[] |
| display_name | string |
| region | string |

## DedicatedConnection

| Field | Type |
|-------|------|
| id | string (UUID) |
| project_id / organization_id | string (UUID) |
| status | enum (DedicatedConnectionStatus) |
| name | string |
| tags | string[] |
| pop_id | string (UUID) |
| bandwidth_mbps | number |
| available_link_bandwidths | number[] |
| demarcation_info | string \| null |
| vlan_range | { start: number, end: number } \| null |
| created_at / updated_at | string |
| region | string |

**DedicatedConnectionStatus**: `unknown_status`, `created`, `configuring`,
`failed`, `active`, `disabled`, `deleted`, `locked`

## Relationships

- A **Link** references one **Pop**; a hosted link references a **Partner**
  (via PartnerHost), a self-hosted link references a **DedicatedConnection**
  (via SelfHost).
- A **Link** may attach one **VPC** and up to two **RoutingPolicy** resources
  (one IPv4, one IPv6).
- A **DedicatedConnection** lives at a **Pop** and can back multiple self-hosted
  **Link**s (subject to `available_link_bandwidths`).
