# Research: Site-to-Site VPN API

## Sources
- Product API reference: https://www.scaleway.com/en/developers/api/site-to-site-vpn/
- OpenAPI schema: https://www.scaleway.com/en/developers/api/s2s-vpn/v1alpha1/schema.yml
- Connections reference: https://www.scaleway.com/en/developers/api/s2s-vpn/connections/
- Authoritative SDK cross-check: `github.com/scaleway/scaleway-sdk-go/api/s2s_vpn/v1alpha1`
  (via pkg.go.dev) — used to resolve response wrapper keys and action request shapes.

## Decisions

### D1 - API slug, version, scope
The product is served at `s2s-vpn/v1alpha1` and is **regional**
(`/s2s-vpn/v1alpha1/regions/{region}/...`). Regions: fr-par, nl-ams, pl-waw, it-mil. Public Beta.

### D2 - Resources
Verified four resource groups + one read-only catalog:
- VPN gateways (`/vpn-gateways`)
- VPN gateway types (`/vpn-gateway-types`, read-only)
- Customer gateways (`/customer-gateways`)
- Connections (`/connections`) + six action sub-paths
- Routing policies (`/routing-policies`)

### D3 - List response wrapper keys
The doc's rendered summary ambiguously labelled both gateway lists as `"gateways"`. The Go SDK
(authoritative) resolved these to distinct keys: `vpn_gateways`, `customer_gateways`,
`connections`, `routing_policies`, `gateway_types` — each alongside `total_count`.

### D4 - Customer gateway IP field asymmetry
Create/Update requests use `ipv4_public` / `ipv6_public`; the response entity uses
`public_ipv4` / `public_ipv6`. Schemas model both faithfully.

### D5 - Connection is immutable except name/tags
`UpdateConnection` only accepts `name` and `tags` (SDK confirmed). Ciphers, initiation policy,
and BGP config are set at creation. PSK and routing-policy changes go through dedicated actions.

### D6 - Cipher / BGP config as pass-through objects
Ciphers (`{ encryption, integrity?, dh_group? }`) and BGP configs
(`{ routing_policy_id, private_ip?, peer_private_ip? }`) are modelled with snake_case keys so
they are forwarded to the API without per-element remapping.

### D7 - Action endpoint paths
Confirmed literal suffixes: `/renew-psk`, `/change-psk`, `/set-routing-policy`,
`/detach-routing-policy`, `/enable-route-propagation`, `/disable-route-propagation`. Renew/enable/
disable take an empty body; set/detach take `{ routing_policy_v4?, routing_policy_v6? }`.

## Open items / ambiguities
- **`/change-psk` request body**: The endpoint is listed in the public API reference, but the Go
  SDK exposes only `RenewConnectionPsk` and does not enumerate a change-PSK request struct. The
  OpenAPI schema description indicates a `{ secret: { id, revision? } }` body (a Secret Manager
  reference). We implemented `scaleway_vpn_change_connection_psk` with that body but flag it as
  best-effort; it should be confirmed against a live Public-Beta account. `renew-psk` (which the
  SDK confirms) is fully verified.
- **order_by on customer gateways / connections**: `order_by` is documented for VPN gateways
  (6 values incl. status). We reuse the standard enum for customer gateways (4 values) and
  connections (6 values); routing policies do not document `order_by` and therefore expose none.
