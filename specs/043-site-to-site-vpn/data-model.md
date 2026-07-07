# Data Model: Site-to-Site VPN

All entities are regional. Timestamps are RFC 3339 strings.

## VpnGateway
- id: string (UUID)
- project_id: string (UUID)
- organization_id: string (UUID)
- name: string
- tags: string[]
- status: enum (unknown_status, configuring, failed, provisioning, active, deprovisioning, locked)
- gateway_type: string (commercial type, e.g. VGW-S)
- private_network_id: string (UUID) | null
- asn: number (uint32, optional) — 12876 reserved for Scaleway
- connection_ids: string[] (optional)
- zone: string (optional)
- region: string
- created_at / updated_at: string

## VpnGatewayType (read-only)
- name: string
- bandwidth: number (bytes/s)
- allowed_connections: number (max concurrent tunnels)
- zones: string[] (optional)
- region: string

## CustomerGateway
- id: string (UUID)
- project_id / organization_id: string (UUID)
- name: string
- tags: string[]
- public_ipv4: string | null
- public_ipv6: string | null
- asn: number (uint32) — cannot be 12876
- connection_ids: string[] (optional)
- region: string
- created_at / updated_at: string

Request field note: create/update use `ipv4_public` / `ipv6_public`.

## Connection
- id: string (UUID)
- project_id / organization_id: string (UUID)
- name: string
- tags: string[]
- status: enum (unknown_status, active, limited_connectivity, down, locked)
- is_ipv6: boolean
- initiation_policy: enum (unknown_initiation_policy, vpn_gateway, customer_gateway)
- secret_id: string (UUID) | null — Secret Manager reference for the PSK
- secret_revision: number (optional)
- ikev2_ciphers: Cipher[]
- esp_ciphers: Cipher[]
- route_propagation_enabled: boolean
- vpn_gateway_id: string (UUID)
- customer_gateway_id: string (UUID)
- region: string
- created_at / updated_at: string

### Cipher
- encryption: enum (unknown_encryption, aes128, aes192, aes256, aes128gcm, aes192gcm, aes256gcm, aes128ccm, aes256ccm, chacha20poly1305)
- integrity: enum (unknown_integrity, sha256, sha384, sha512) — optional
- dh_group: enum (unknown_dhgroup, modp2048, modp3072, modp4096, ecp256, ecp384, ecp521, curve25519) — optional

### BgpConfig (create request only)
- routing_policy_id: string (UUID)
- private_ip: string (CIDR) — optional
- peer_private_ip: string (CIDR) — optional

## RoutingPolicy
- id: string (UUID)
- project_id / organization_id: string (UUID)
- name: string
- tags: string[]
- is_ipv6: boolean
- prefix_filter_in: string[] (CIDR prefixes accepted from peer)
- prefix_filter_out: string[] (CIDR prefixes advertised to peer)
- region: string
- created_at / updated_at: string

## Relationships
- A VpnGateway is attached to one Private Network.
- A Connection binds exactly one VpnGateway to one CustomerGateway.
- A Connection may reference up to two RoutingPolicies (one IPv4, one IPv6) via BGP config /
  set-routing-policy.
