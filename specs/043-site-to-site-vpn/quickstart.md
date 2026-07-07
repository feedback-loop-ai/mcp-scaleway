# Quickstart: Site-to-Site VPN MCP Tools

Prerequisites: valid Scaleway credentials in the environment (see `.env.test.local.example`),
and an existing Private Network in the target region.

## 1. Discover gateway types
```
scaleway_vpn_list_gateway_types { "region": "fr-par" }
```

## 2. Create a VPN gateway (attached to a Private Network)
```
scaleway_vpn_create_gateway {
  "region": "fr-par",
  "name": "my-vpn-gw",
  "gatewayType": "VGW-S",
  "privateNetworkId": "<private-network-uuid>"
}
```

## 3. Create a customer gateway (remote device)
```
scaleway_vpn_create_customer_gateway {
  "region": "fr-par",
  "name": "hq-firewall",
  "asn": 65000,
  "ipv4Public": "203.0.113.10"
}
```

## 4. Create a routing policy
```
scaleway_vpn_create_routing_policy {
  "region": "fr-par",
  "name": "allow-lan",
  "isIpv6": false,
  "prefixFilterIn": ["192.168.0.0/16"],
  "prefixFilterOut": ["10.0.0.0/8"]
}
```

## 5. Create the connection (IPsec tunnel)
```
scaleway_vpn_create_connection {
  "region": "fr-par",
  "name": "hq-tunnel",
  "initiationPolicy": "vpn_gateway",
  "vpnGatewayId": "<vpn-gateway-uuid>",
  "customerGatewayId": "<customer-gateway-uuid>",
  "ikev2Ciphers": [{ "encryption": "aes256", "integrity": "sha256", "dh_group": "modp2048" }],
  "espCiphers": [{ "encryption": "aes256gcm" }],
  "enableRoutePropagation": true,
  "bgpConfigIpv4": { "routing_policy_id": "<routing-policy-uuid>" }
}
```

## 6. Manage the connection lifecycle
```
scaleway_vpn_renew_connection_psk { "region": "fr-par", "connectionId": "<id>" }
scaleway_vpn_set_connection_routing_policy { "region": "fr-par", "connectionId": "<id>", "routingPolicyV4": "<rp-id>" }
scaleway_vpn_enable_route_propagation { "region": "fr-par", "connectionId": "<id>" }
```

## 7. Inspect
```
scaleway_vpn_list_connections { "region": "fr-par" }
scaleway_vpn_get_connection { "region": "fr-par", "connectionId": "<id>" }
```
