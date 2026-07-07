# Tool Contracts: Site-to-Site VPN

Every tool is regional. Inputs are validated by zod schemas in `src/tools/vpn/types.ts`.
Success returns `{ content: [{ type: "text", text: <json> }] }`. List tools return
`{ items, totalCount, page, pageSize }`. Errors return
`{ content: [...], isError: true }` with `{ error: { type, message, statusCode } }`.

Reference: `specs/scaleway-api/vpn/api-reference.md`.

## VPN Gateways
- **scaleway_vpn_list_gateways** — `ListVpnGatewaysParams` { region, page?, pageSize?, projectId?, name?, orderBy? } → paginated VpnGateway[]
- **scaleway_vpn_get_gateway** — { region, gatewayId } → VpnGateway
- **scaleway_vpn_create_gateway** — { region, name, gatewayType, privateNetworkId, projectId?, tags?, zone?, ipamPrivateIpv4Id?, ipamPrivateIpv6Id? } → VpnGateway
- **scaleway_vpn_update_gateway** — { region, gatewayId, name?, tags? } → VpnGateway
- **scaleway_vpn_delete_gateway** — { region, gatewayId } → { deleted, id }
- **scaleway_vpn_list_gateway_types** — { region, page?, pageSize? } → paginated VpnGatewayType[]

## Customer Gateways
- **scaleway_vpn_list_customer_gateways** — { region, page?, pageSize?, projectId?, name?, orderBy? } → paginated CustomerGateway[]
- **scaleway_vpn_get_customer_gateway** — { region, customerGatewayId } → CustomerGateway
- **scaleway_vpn_create_customer_gateway** — { region, name, asn, projectId?, tags?, ipv4Public?, ipv6Public? } → CustomerGateway
- **scaleway_vpn_update_customer_gateway** — { region, customerGatewayId, name?, tags?, ipv4Public?, ipv6Public?, asn? } → CustomerGateway
- **scaleway_vpn_delete_customer_gateway** — { region, customerGatewayId } → { deleted, id }

## Connections
- **scaleway_vpn_list_connections** — { region, page?, pageSize?, projectId?, name?, isIpv6?, vpnGatewayId?, customerGatewayId?, orderBy? } → paginated Connection[]
- **scaleway_vpn_get_connection** — { region, connectionId } → Connection
- **scaleway_vpn_create_connection** — { region, name, initiationPolicy, ikev2Ciphers[], espCiphers[], vpnGatewayId, customerGatewayId, projectId?, tags?, isIpv6?, enableRoutePropagation?, bgpConfigIpv4?, bgpConfigIpv6? } → Connection
- **scaleway_vpn_update_connection** — { region, connectionId, name?, tags? } → Connection
- **scaleway_vpn_delete_connection** — { region, connectionId } → { deleted, id }
- **scaleway_vpn_renew_connection_psk** — { region, connectionId } → Connection
- **scaleway_vpn_change_connection_psk** — { region, connectionId, secretId, secretRevision? } → Connection
- **scaleway_vpn_set_connection_routing_policy** — { region, connectionId, routingPolicyV4?, routingPolicyV6? } → Connection
- **scaleway_vpn_detach_connection_routing_policy** — { region, connectionId, routingPolicyV4?, routingPolicyV6? } → Connection
- **scaleway_vpn_enable_route_propagation** — { region, connectionId } → Connection
- **scaleway_vpn_disable_route_propagation** — { region, connectionId } → Connection

## Routing Policies
- **scaleway_vpn_list_routing_policies** — { region, page?, pageSize?, projectId?, name?, isIpv6? } → paginated RoutingPolicy[]
- **scaleway_vpn_get_routing_policy** — { region, routingPolicyId } → RoutingPolicy
- **scaleway_vpn_create_routing_policy** — { region, name, isIpv6, prefixFilterIn[], prefixFilterOut[], projectId?, tags? } → RoutingPolicy
- **scaleway_vpn_update_routing_policy** — { region, routingPolicyId, name?, tags?, prefixFilterIn?, prefixFilterOut? } → RoutingPolicy
- **scaleway_vpn_delete_routing_policy** — { region, routingPolicyId } → { deleted, id }
