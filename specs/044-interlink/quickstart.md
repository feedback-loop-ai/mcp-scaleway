# Quickstart: Scaleway InterLink MCP Tools

## Prerequisites

- Scaleway credentials configured for the shared client (`SCW_ACCESS_KEY`,
  `SCW_SECRET_KEY`, default project/region) — see `.env.test.local.example`.
- InterLink is available in regions `fr-par`, `nl-ams`, `pl-waw`.

## Concepts

- A **link** is a BGP peering session between your network and a Scaleway VPC.
  It is **hosted** (through a partner) or **self-hosted** (through a dedicated
  connection you own).
- A **routing policy** filters which IP prefixes are accepted from / advertised
  to the peer. Policies are IPv4 or IPv6 and are attached to links.
- **Route propagation** must be enabled for a link to advertise allowed routes.

## Typical workflow

### 1. Discover where to connect

```
scaleway_interlink_list_pops        { region: "fr-par" }
scaleway_interlink_list_partners    { region: "fr-par", popIds: ["<pop_id>"] }
```

### 2. Create a hosted link

```
scaleway_interlink_create_link {
  region: "fr-par",
  name: "prod-interlink",
  popId: "<pop_id>",
  bandwidthMbps: 1000,
  partnerId: "<partner_id>"
}
```

For a self-hosted link, first list your dedicated connections and pass
`connectionId` (and `vlan`) instead of `partnerId`:

```
scaleway_interlink_list_dedicated_connections { region: "fr-par" }
scaleway_interlink_create_link {
  region: "fr-par", name: "prod-interlink",
  popId: "<pop_id>", bandwidthMbps: 1000,
  connectionId: "<connection_id>", vlan: 100
}
```

### 3. Attach a VPC and routing policy

```
scaleway_interlink_attach_vpc { region: "fr-par", linkId: "<link_id>", vpcId: "<vpc_id>" }

scaleway_interlink_create_routing_policy {
  region: "fr-par", name: "allow-rfc1918", isIpv6: false,
  prefixFilterIn: ["10.0.0.0/8"], prefixFilterOut: ["192.168.0.0/16"]
}
scaleway_interlink_attach_routing_policy {
  region: "fr-par", linkId: "<link_id>", routingPolicyId: "<policy_id>"
}
```

### 4. Enable route propagation and check BGP status

```
scaleway_interlink_enable_route_propagation { region: "fr-par", linkId: "<link_id>" }
scaleway_interlink_get_link { region: "fr-par", linkId: "<link_id>" }
# → inspect bgp_v4_status / bgp_v6_status, scw_bgp_config, peer_bgp_config
```

### 5. Tear down

```
scaleway_interlink_detach_routing_policy { region, linkId, routingPolicyId }
scaleway_interlink_detach_vpc            { region, linkId }
scaleway_interlink_delete_link           { region, linkId }
```

## Running the tests

```bash
bun x vitest run --config tests/vitest.config.ts \
  tests/unit/tools/interlink.test.ts \
  tests/contract/interlink/interlink.contract.test.ts
```
