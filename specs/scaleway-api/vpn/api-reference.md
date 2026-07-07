# Scaleway Site-to-Site VPN API Reference

Base URL: `https://api.scaleway.com/s2s-vpn/v1alpha1/regions/{region}`

- **API slug / version**: `s2s-vpn/v1alpha1`
- **Scope**: Regional (regions: `fr-par`, `nl-ams`, `pl-waw`, `it-mil`)
- **Status**: Public Beta (v1alpha1)
- **Source**: https://www.scaleway.com/en/developers/api/site-to-site-vpn/ and
  https://www.scaleway.com/en/developers/api/s2s-vpn/v1alpha1/schema.yml
- **Authoritative SDK cross-check**: `github.com/scaleway/scaleway-sdk-go/api/s2s_vpn/v1alpha1`

## Authentication
- Header: `X-Auth-Token: <secret_key>`

## Pagination
- Query params: `page` (int, 1-indexed), `page_size` (int)
- List responses wrap items in a named array plus `total_count`.

## Error Codes
- 400: Invalid input
- 401 / 403: Permission denied
- 404: Not found
- 409: Conflict
- 429: Rate limited
- 500: Server error

---

## VPN Gateways

Managed IPsec peers hosted by Scaleway, attached to a Private Network.

### List VPN Gateways
`GET /vpn-gateways`
- Query: `page`, `page_size`, `project_id`, `name`, `order_by`
- `order_by`: `created_at_asc|created_at_desc|name_asc|name_desc|status_asc|status_desc`
- Response: `{ vpn_gateways: VpnGateway[], total_count: number }`

### Get VPN Gateway
`GET /vpn-gateways/{id}`
- Response: `VpnGateway`

### Create VPN Gateway
`POST /vpn-gateways`
- Body: `{ project_id, name, gateway_type, private_network_id, tags?, zone?, ipam_private_ipv4_id?, ipam_private_ipv6_id? }`
- Response: `VpnGateway`

### Update VPN Gateway
`PATCH /vpn-gateways/{id}`
- Body: `{ name?, tags? }` (only name and tags are mutable)
- Response: `VpnGateway`

### Delete VPN Gateway
`DELETE /vpn-gateways/{id}`
- Response: empty / `VpnGateway`

### VpnGateway entity
`{ id, project_id, organization_id, name, tags[], status, gateway_type, private_network_id|null, asn?, connection_ids[]?, zone?, region, created_at, updated_at }`
- `status`: `unknown_status|configuring|failed|provisioning|active|deprovisioning|locked`

---

## VPN Gateway Types

Commercial offer types (read-only catalog).

### List VPN Gateway Types
`GET /vpn-gateway-types`
- Query: `page`, `page_size`
- Response: `{ gateway_types: VpnGatewayType[], total_count: number }`
- `VpnGatewayType`: `{ name, bandwidth, allowed_connections, zones[]?, region }`

---

## Customer Gateways

Logical representations of the remote (on-premise) network devices.

### List Customer Gateways
`GET /customer-gateways`
- Query: `page`, `page_size`, `project_id`, `name`, `order_by`
- `order_by`: `created_at_asc|created_at_desc|name_asc|name_desc`
- Response: `{ customer_gateways: CustomerGateway[], total_count: number }`

### Get Customer Gateway
`GET /customer-gateways/{id}`
- Response: `CustomerGateway`

### Create Customer Gateway
`POST /customer-gateways`
- Body: `{ project_id, name, asn, tags?, ipv4_public?, ipv6_public? }`
- Response: `CustomerGateway`

### Update Customer Gateway
`PATCH /customer-gateways/{id}`
- Body: `{ name?, tags?, ipv4_public?, ipv6_public?, asn? }`
- Response: `CustomerGateway`

### Delete Customer Gateway
`DELETE /customer-gateways/{id}`
- Response: empty / `CustomerGateway`

### CustomerGateway entity
`{ id, project_id, organization_id, name, tags[], public_ipv4|null, public_ipv6|null, asn, connection_ids[]?, region, created_at, updated_at }`
- Note the asymmetry: create/update request uses `ipv4_public`/`ipv6_public`; the response entity uses `public_ipv4`/`public_ipv6`.
- `asn` cannot be `12876` (reserved for Scaleway).

---

## Connections

IPsec tunnels binding a VPN gateway to a customer gateway.

### List Connections
`GET /connections`
- Query: `page`, `page_size`, `project_id`, `name`, `is_ipv6`, `vpn_gateway_ids`, `customer_gateway_ids`, `order_by`
- Response: `{ connections: Connection[], total_count: number }`

### Get Connection
`GET /connections/{id}`
- Response: `Connection`

### Create Connection
`POST /connections`
- Body: `{ project_id, name, initiation_policy, ikev2_ciphers[], esp_ciphers[], vpn_gateway_id, customer_gateway_id, tags?, is_ipv6?, enable_route_propagation?, bgp_config_ipv4?, bgp_config_ipv6? }`
- `initiation_policy`: `unknown_initiation_policy|vpn_gateway|customer_gateway`
- `BgpConfig`: `{ routing_policy_id, private_ip?, peer_private_ip? }`
- Response: `Connection`

### Update Connection
`PATCH /connections/{id}`
- Body: `{ name?, tags? }` (only name and tags are mutable; ciphers are set at creation)
- Response: `Connection`

### Delete Connection
`DELETE /connections/{id}`
- Response: empty / `Connection`

### Renew Pre-Shared Key
`POST /connections/{id}/renew-psk`
- Body: `{}` (empty)
- Response: `Connection`

### Change Pre-Shared Key
`POST /connections/{id}/change-psk`
- Body: `{ secret: { id, revision? } }` — points the connection at a Secret Manager secret holding the new PSK
- Response: `Connection`
- NOTE: the `/change-psk` endpoint is listed in the public API reference, but the request-body shape is not
  enumerated in the SDK; the `{ secret: { id, revision? } }` shape is taken from the OpenAPI schema description
  and should be treated as best-effort until confirmed against a live account.

### Set Routing Policy
`POST /connections/{id}/set-routing-policy`
- Body: `{ routing_policy_v4?, routing_policy_v6? }`
- Response: `Connection`

### Detach Routing Policy
`POST /connections/{id}/detach-routing-policy`
- Body: `{ routing_policy_v4?, routing_policy_v6? }`
- Response: `Connection`

### Enable / Disable Route Propagation
`POST /connections/{id}/enable-route-propagation`
`POST /connections/{id}/disable-route-propagation`
- Body: `{}` (empty)
- Response: `Connection`

### Connection entity
`{ id, project_id, organization_id, name, tags[], status, is_ipv6, initiation_policy, secret_id|null, secret_revision?, ikev2_ciphers[], esp_ciphers[], route_propagation_enabled, vpn_gateway_id, customer_gateway_id, region, created_at, updated_at }`
- `status`: `unknown_status|active|limited_connectivity|down|locked`
- `Cipher`: `{ encryption, integrity?, dh_group? }`
  - `encryption`: `unknown_encryption|aes128|aes192|aes256|aes128gcm|aes192gcm|aes256gcm|aes128ccm|aes256ccm|chacha20poly1305`
  - `integrity`: `unknown_integrity|sha256|sha384|sha512`
  - `dh_group`: `unknown_dhgroup|modp2048|modp3072|modp4096|ecp256|ecp384|ecp521|curve25519`

---

## Routing Policies

Traffic filters describing which IPv4/IPv6 prefixes may traverse a connection.

### List Routing Policies
`GET /routing-policies`
- Query: `page`, `page_size`, `project_id`, `name`, `is_ipv6`
- Response: `{ routing_policies: RoutingPolicy[], total_count: number }`

### Get Routing Policy
`GET /routing-policies/{id}`
- Response: `RoutingPolicy`

### Create Routing Policy
`POST /routing-policies`
- Body: `{ project_id, name, is_ipv6, prefix_filter_in[], prefix_filter_out[], tags? }`
- Response: `RoutingPolicy`

### Update Routing Policy
`PATCH /routing-policies/{id}`
- Body: `{ name?, tags?, prefix_filter_in?, prefix_filter_out? }`
- Response: `RoutingPolicy`

### Delete Routing Policy
`DELETE /routing-policies/{id}`
- Response: empty / `RoutingPolicy`

### RoutingPolicy entity
`{ id, project_id, organization_id, name, tags[], is_ipv6, prefix_filter_in[], prefix_filter_out[], region, created_at, updated_at }`
