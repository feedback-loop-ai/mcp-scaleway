# Research: Scaleway InterLink API

## Decision: API slug, version, scoping

- **Slug**: `interlink`
- **Version**: `v1beta1`
- **Scoping**: region (`fr-par`, `nl-ams`, `pl-waw`) — every path is
  `/interlink/v1beta1/regions/{region}/...`

**Source**: https://www.scaleway.com/en/developers/api/interlink/ (official
developers reference), cross-checked against the official Go SDK
`scaleway/scaleway-sdk-go/api/interlink/v1beta1/interlink_sdk.go` for exact
field JSON names, enum values, and endpoint paths.

**Rationale**: The developers reference SPA does not expose full request/response
schemas to a scraper, so the Go SDK (generated from the same API definition) was
used as the authoritative source for field names and enums. Both sources agree
on paths and version.

## Decision: Resource set and operations

23 operations confirmed present on the Go SDK `API` struct:

- Links: List, Get, Create, Update, Delete, AttachVpc, DetachVpc,
  AttachRoutingPolicy, DetachRoutingPolicy, SetRoutingPolicy,
  EnableRoutePropagation, DisableRoutePropagation (12)
- RoutingPolicies: List, Get, Create, Update, Delete (5)
- Partners: List, Get (2)
- Pops: List, Get (2)
- DedicatedConnections: List, Get (2)

Each maps 1:1 to an MCP tool with the `scaleway_interlink_` prefix.

## Decision: BGP session data

The reference calls a Link "a BGP peering session". BGP session data is exposed
as fields on the Link entity — `bgp_v4_status`, `bgp_v6_status`
(`unknown_bgp_status|up|down|disabled`) plus `scw_bgp_config` and
`peer_bgp_config` (`{asn, ipv4, ipv6}`). There is **no** standalone BGP endpoint,
so BGP data is delivered via Get/List Link rather than a dedicated tool.

## Decision: Dedicated connections path

The developers-reference summary showed `/connections`, but the Go SDK builds
`/interlink/v1beta1/regions/{region}/dedicated-connections`. The SDK path is
authoritative and was used. The list envelope key is `connections`.

## Decision: Hosted vs self-hosted create

`CreateLink` accepts `partner_id` (partner-hosted) OR `connection_id`
(self-hosted). Both are optional in the schema; the API validates that exactly
one is provided. We keep both optional and let the API enforce the constraint
(surfaced as `invalid_input` on 400), matching how the SDK models it.

## Decision: Deprecated routing_policy_id

`Link.routing_policy_id` is deprecated in favor of `routing_policy_v4_id` /
`routing_policy_v6_id`. We keep it in the response schema (nullable/optional) for
backward-compatible parsing, and the attach/detach/set-routing-policy operations
take a single `routing_policy_id` (the API infers IP version from the policy's
`is_ipv6`).

## Decision: List envelope keys

Confirmed from the Go SDK `List*Response` structs: `links`, `routing_policies`,
`partners`, `pops`, `connections`, each alongside `total_count`.

## Alternatives considered

- **Modeling params in snake_case (like `inference`)**: rejected in favor of
  camelCase params mapped to snake_case bodies/query (like `nats`), per the
  repo convention the BRIEF points to.
- **Adding a synthetic BGP tool**: rejected — no backing endpoint; would be an
  invented API.
