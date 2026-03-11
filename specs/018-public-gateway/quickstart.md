# Quickstart: Scaleway Public Gateway MCP Tools

**Feature**: 018-public-gateway | **Date**: 2026-03-11

## Prerequisites

1. Set environment variables:
   ```bash
   export SCW_ACCESS_KEY="your-access-key"
   export SCW_SECRET_KEY="your-secret-key"
   export SCW_DEFAULT_PROJECT_ID="your-project-id"
   export SCW_DEFAULT_ZONE="fr-par-1"
   ```

2. Start the MCP server:
   ```bash
   bun run start
   ```

## Usage Examples

### List Gateways

```json
{
  "tool": "scaleway_public_gateway_list_gateways",
  "arguments": {
    "zone": "fr-par-1",
    "page": 1,
    "pageSize": 10
  }
}
```

### Create a Gateway

```json
{
  "tool": "scaleway_public_gateway_create_gateway",
  "arguments": {
    "zone": "fr-par-1",
    "name": "my-gateway",
    "type": "VPC-GW-S",
    "enableSmtp": false,
    "enableBastion": true,
    "bastionPort": 22
  }
}
```

### Attach Gateway to Private Network

```json
{
  "tool": "scaleway_public_gateway_create_gateway_network",
  "arguments": {
    "zone": "fr-par-1",
    "gatewayId": "gateway-uuid",
    "privateNetworkId": "private-network-uuid",
    "enableMasquerade": true,
    "pushDefaultRoute": true
  }
}
```

### Create a DHCP Configuration

```json
{
  "tool": "scaleway_public_gateway_create_dhcp",
  "arguments": {
    "zone": "fr-par-1",
    "subnet": "192.168.1.0/24",
    "address": "192.168.1.1",
    "poolLow": "192.168.1.10",
    "poolHigh": "192.168.1.254",
    "enableDynamic": true,
    "pushDefaultRoute": true,
    "pushDnsServer": true
  }
}
```

### Create a PAT Rule (Port Forwarding)

```json
{
  "tool": "scaleway_public_gateway_create_pat_rule",
  "arguments": {
    "zone": "fr-par-1",
    "gatewayId": "gateway-uuid",
    "publicPort": 8080,
    "privateIp": "192.168.1.42",
    "privatePort": 80,
    "protocol": "tcp"
  }
}
```

### Reserve a Flexible IP

```json
{
  "tool": "scaleway_public_gateway_create_ip",
  "arguments": {
    "zone": "fr-par-1"
  }
}
```

### Update an IP (Attach to Gateway)

```json
{
  "tool": "scaleway_public_gateway_update_ip",
  "arguments": {
    "zone": "fr-par-1",
    "ipId": "ip-uuid",
    "gatewayId": "gateway-uuid",
    "reverse": "my-gateway.example.com"
  }
}
```

### List Available Gateway Types

```json
{
  "tool": "scaleway_public_gateway_list_gateway_types",
  "arguments": {
    "zone": "fr-par-1"
  }
}
```

### Delete a Gateway (with IP cleanup)

```json
{
  "tool": "scaleway_public_gateway_delete_gateway",
  "arguments": {
    "zone": "fr-par-1",
    "gatewayId": "gateway-uuid",
    "deleteIp": true
  }
}
```
