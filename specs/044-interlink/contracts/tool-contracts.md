# Tool Contracts: Scaleway InterLink

All tools are region-scoped and require `region` (format `xx-xxx`). Auth via
`X-Auth-Token`. List tools accept `page` (default 1) and `pageSize`
(default 50, max 100) and return `{ items, totalCount, page, pageSize }`.
Reference: `specs/scaleway-api/interlink/api-reference.md`.

## Links

### scaleway_interlink_list_links
GET `/links` — filters: projectId, organizationId, name, tags[], status,
bgpV4Status, bgpV6Status, popId, bandwidthMbps, partnerId, vpcId,
routingPolicyId, pairingKey, kind, orderBy, connectionId → paginated `Link[]`.

### scaleway_interlink_get_link
GET `/links/{link_id}` — `linkId` → `Link` (includes BGP session status/config).

### scaleway_interlink_create_link
POST `/links` — required: name, popId, bandwidthMbps; optional: projectId, tags,
connectionId (self-hosted) | partnerId (hosted), peerAsn, vlan,
routingPolicyV4Id, routingPolicyV6Id → `Link`.

### scaleway_interlink_update_link
PATCH `/links/{link_id}` — linkId; optional name, tags, peerAsn → `Link`.

### scaleway_interlink_delete_link
DELETE `/links/{link_id}` — linkId → `Link`.

### scaleway_interlink_attach_vpc
POST `/links/{link_id}/attach-vpc` — linkId, vpcId → `Link`.

### scaleway_interlink_detach_vpc
POST `/links/{link_id}/detach-vpc` — linkId → `Link`.

### scaleway_interlink_attach_routing_policy
POST `/links/{link_id}/attach-routing-policy` — linkId, routingPolicyId → `Link`.

### scaleway_interlink_detach_routing_policy
POST `/links/{link_id}/detach-routing-policy` — linkId, routingPolicyId → `Link`.

### scaleway_interlink_set_routing_policy
POST `/links/{link_id}/set-routing-policy` — linkId, routingPolicyId → `Link`.

### scaleway_interlink_enable_route_propagation
POST `/links/{link_id}/enable-route-propagation` — linkId → `Link`.

### scaleway_interlink_disable_route_propagation
POST `/links/{link_id}/disable-route-propagation` — linkId → `Link`.

## Routing policies

### scaleway_interlink_list_routing_policies
GET `/routing-policies` — filters: projectId, organizationId, name, tags[],
ipv6, orderBy → paginated `RoutingPolicy[]`.

### scaleway_interlink_get_routing_policy
GET `/routing-policies/{id}` — routingPolicyId → `RoutingPolicy`.

### scaleway_interlink_create_routing_policy
POST `/routing-policies` — required: name, isIpv6; optional: projectId, tags,
prefixFilterIn[], prefixFilterOut[] → `RoutingPolicy`.

### scaleway_interlink_update_routing_policy
PATCH `/routing-policies/{id}` — routingPolicyId; optional name, tags,
prefixFilterIn[], prefixFilterOut[] → `RoutingPolicy`.

### scaleway_interlink_delete_routing_policy
DELETE `/routing-policies/{id}` — routingPolicyId → `RoutingPolicy`.

## Partners

### scaleway_interlink_list_partners
GET `/partners` — filters: popIds[], orderBy → paginated `Partner[]`.

### scaleway_interlink_get_partner
GET `/partners/{id}` — partnerId → `Partner`.

## Points of Presence

### scaleway_interlink_list_pops
GET `/pops` — filters: name, hostingProviderName, partnerId, linkBandwidthMbps,
dedicatedAvailable, orderBy → paginated `Pop[]`.

### scaleway_interlink_get_pop
GET `/pops/{id}` — popId → `Pop`.

## Dedicated connections

### scaleway_interlink_list_dedicated_connections
GET `/dedicated-connections` — filters: projectId, organizationId, name, tags[],
status, bandwidthMbps, popId, orderBy → paginated `DedicatedConnection[]`.

### scaleway_interlink_get_dedicated_connection
GET `/dedicated-connections/{id}` — connectionId → `DedicatedConnection`.

## Error mapping

400 → invalid_input · 401/403 → permission_denied · 404 → not_found ·
429 → rate_limited · other → server_error. Errors returned as
`{ content: [...], isError: true }`.
