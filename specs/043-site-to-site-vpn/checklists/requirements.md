# Requirements Checklist: Site-to-Site VPN

- [X] API slug, version, and scope verified against official docs (`s2s-vpn/v1alpha1`, regional)
- [X] All resource groups discovered (VPN gateways, gateway types, customer gateways, connections, routing policies)
- [X] List response wrapper keys verified against the Go SDK (authoritative)
- [X] Request/response entity fields documented in `specs/scaleway-api/vpn/api-reference.md`
- [X] Cipher and BGP config enum values captured from the OpenAPI schema + SDK
- [X] Connection action endpoint paths verified (`renew-psk`, `change-psk`, `set-routing-policy`, `detach-routing-policy`, `enable/disable-route-propagation`)
- [X] All 27 tools implemented with `scaleway_vpn_` prefix
- [X] `registerVpnTools` exported from `src/tools/vpn/index.ts`
- [X] Unit tests cover every handler (success, error, optional-param, pagination branches)
- [X] Contract tests cover every tool and reference `specs/scaleway-api/vpn/api-reference.md`
- [X] 100% line + branch coverage on `src/tools/vpn/**`
- [X] `bun x biome check` clean on all added files
- [X] `bun x tsc --noEmit` clean for the added files
- [X] Parity fragment written to scratchpad
- [X] Out-of-scope items documented in spec.md
- [X] `/change-psk` body shape flagged as best-effort (unverified against live account) in research.md
