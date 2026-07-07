# 043-site-to-site-vpn: Site-to-Site VPN API

## Overview
MCP tools for the Scaleway Site-to-Site VPN API (`s2s-vpn/v1alpha1`). Regional API for
building IPsec VPN tunnels between a Scaleway Private Network (via a managed VPN gateway)
and a remote on-premise network (via a customer gateway), with BGP dynamic routing support.

**Status**: Implemented (API is Public Beta, v1alpha1).

## User Stories

### P1 - VPN Gateway CRUD
- As a user, I can list, get, create, update, and delete VPN gateways.
- As a user, I can list available VPN gateway commercial types.

### P1 - Customer Gateway CRUD
- As a user, I can list, get, create, update, and delete customer gateways (remote devices).

### P1 - Connection CRUD
- As a user, I can list, get, create, update, and delete VPN connections (IPsec tunnels).

### P2 - Connection lifecycle actions
- As a user, I can renew or change the pre-shared key of a connection.
- As a user, I can attach/detach IPv4 and IPv6 routing policies to a connection.
- As a user, I can enable or disable BGP route propagation on a connection.

### P2 - Routing Policy CRUD
- As a user, I can list, get, create, update, and delete routing policies.

## Acceptance Scenarios
1. Given a Private Network, when I create a VPN gateway with a valid `gateway_type`, then a
   gateway resource is returned in a provisioning state.
2. Given a VPN gateway and a customer gateway, when I create a connection with IKEv2 and ESP
   ciphers, then an IPsec tunnel connection is returned.
3. Given a connection, when I enable route propagation, then the connection reflects BGP
   propagation enabled.
4. Given a routing policy, when I attach it to a connection, then the connection references it.
5. Given an invalid region, when I call any tool, then a structured validation error is returned.

## Functional Requirements
- FR-1: All tools are regional and require a `region` parameter validated as `xx-xxx`.
- FR-2: List tools support pagination (`page`, `pageSize`) and return `{ items, totalCount, page, pageSize }`.
- FR-3: Create/update tools only send fields explicitly provided by the caller.
- FR-4: Every tool maps Scaleway API errors to structured `{ error: { type, message, statusCode } }`.
- FR-5: Cipher and BGP configuration objects are passed through to the API using snake_case keys.

## Out of Scope / Excluded
- `public_config` nested object on gateway creation (public IPAM IP wiring) — advanced, rarely
  set via API; gateways are provisioned with default public config. Excluded to keep the create
  surface simple; can be added later if needed.
- Tag-array list filters (`tags`) and `statuses[]`/`routing_policy_ids[]` connection filters —
  the most common filters (project, name, is_ipv6, gateway ids, order_by) are exposed; the
  remaining array filters are omitted for simplicity.
- Any console-only workflow (tunnel diagnostics UI) that has no public API endpoint.

## Tools

| Tool | HTTP | Priority |
|------|------|----------|
| scaleway_vpn_list_gateways | GET /vpn-gateways | P1 |
| scaleway_vpn_get_gateway | GET /vpn-gateways/{id} | P1 |
| scaleway_vpn_create_gateway | POST /vpn-gateways | P1 |
| scaleway_vpn_update_gateway | PATCH /vpn-gateways/{id} | P1 |
| scaleway_vpn_delete_gateway | DELETE /vpn-gateways/{id} | P1 |
| scaleway_vpn_list_gateway_types | GET /vpn-gateway-types | P2 |
| scaleway_vpn_list_customer_gateways | GET /customer-gateways | P1 |
| scaleway_vpn_get_customer_gateway | GET /customer-gateways/{id} | P1 |
| scaleway_vpn_create_customer_gateway | POST /customer-gateways | P1 |
| scaleway_vpn_update_customer_gateway | PATCH /customer-gateways/{id} | P1 |
| scaleway_vpn_delete_customer_gateway | DELETE /customer-gateways/{id} | P1 |
| scaleway_vpn_list_connections | GET /connections | P1 |
| scaleway_vpn_get_connection | GET /connections/{id} | P1 |
| scaleway_vpn_create_connection | POST /connections | P1 |
| scaleway_vpn_update_connection | PATCH /connections/{id} | P1 |
| scaleway_vpn_delete_connection | DELETE /connections/{id} | P1 |
| scaleway_vpn_renew_connection_psk | POST /connections/{id}/renew-psk | P2 |
| scaleway_vpn_change_connection_psk | POST /connections/{id}/change-psk | P2 |
| scaleway_vpn_set_connection_routing_policy | POST /connections/{id}/set-routing-policy | P2 |
| scaleway_vpn_detach_connection_routing_policy | POST /connections/{id}/detach-routing-policy | P2 |
| scaleway_vpn_enable_route_propagation | POST /connections/{id}/enable-route-propagation | P2 |
| scaleway_vpn_disable_route_propagation | POST /connections/{id}/disable-route-propagation | P2 |
| scaleway_vpn_list_routing_policies | GET /routing-policies | P2 |
| scaleway_vpn_get_routing_policy | GET /routing-policies/{id} | P2 |
| scaleway_vpn_create_routing_policy | POST /routing-policies | P2 |
| scaleway_vpn_update_routing_policy | PATCH /routing-policies/{id} | P2 |
| scaleway_vpn_delete_routing_policy | DELETE /routing-policies/{id} | P2 |

All paths are relative to `s2s-vpn/v1alpha1/regions/{region}`.
