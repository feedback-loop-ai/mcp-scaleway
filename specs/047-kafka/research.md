# Research: Clusters for Apache Kafka® MCP Tools

**Feature**: 047-kafka | **Date**: 2026-07-07

## Sources

- Official API reference: https://www.scaleway.com/en/developers/api/clusters-for-kafka/
- Product docs: https://www.scaleway.com/en/docs/clusters-for-kafka/
- Authoritative type/endpoint cross-check (Go SDK):
  https://pkg.go.dev/github.com/scaleway/scaleway-sdk-go/api/kafka/v1alpha1

## Decisions

### D1 - API slug, version, scope
- **Decision**: Service path `kafka`, version `v1alpha1`, **regional** scope (currently `fr-par`).
- **Rationale**: Confirmed from the developers API reference base URL
  `https://api.scaleway.com/kafka/v1alpha1/regions/{region}` and cross-checked against the Go SDK package
  `api/kafka/v1alpha1`.

### D2 - Product maturity
- **Decision**: Treat as **Public Beta**; implement the full documented surface.
- **Rationale**: The product is labelled "(Beta)" in the API index but has a complete, published
  v1alpha1 REST reference and a released Go SDK — unlike console-only/private-beta products, it is fully
  implementable. (Contrast with 041-quota-query-tool, which was Blocked for lack of a public API.)

### D3 - Tool surface
- **Decision**: 13 tools — cluster CRUD (5), certificate authority get/renew (2), endpoint create/delete
  (2), user list/update (2), node-type list (1), version list (1).
- **Rationale**: Mirrors every REST operation in the reference. Operations that do not exist as REST
  endpoints (ACL CRUD, standalone user create/delete, endpoint list/get, settings update) are excluded and
  documented in spec.md "Out of Scope".

### D4 - Endpoint spec modelling
- **Decision**: Model the API one-of (`private_network` vs `public_network`) as two optional inputs
  (`privateNetworkId`, `publicNetwork`); a private network ID takes precedence, otherwise a public-network
  endpoint (`{ public_network: {} }`) is requested.
- **Rationale**: Keeps the MCP tool input flat and JSON-schema friendly while producing the exact API body.
  During Beta, private-network endpoints are the supported path.

### D5 - Delete semantics
- **Decision**: `DeleteCluster` returns the (deleting) cluster object and is passed through; `DeleteEndpoint`
  returns 204, so the handler returns `{ deleted: true, id }`.
- **Rationale**: Matches Go SDK return types (`*Cluster` vs `error`).

### D6 - Certificate authority paths
- **Decision**: Get at `GET .../clusters/{id}/certificate-authority`; renew at
  `POST .../clusters/{id}/renew-certificate-authority`.
- **Rationale**: Exact path strings taken from the Go SDK source (`kafka_sdk.go`). Note the renew path is
  `renew-certificate-authority` (not `certificate-authority/renew`).

## Open Questions / Ambiguities Resolved

- The developers-portal HTML did not expose full response field names; these were resolved from the Go SDK
  struct definitions and json tags (`clusters`, `node_types`, `users`, `versions`, `total_count`).
- `DeleteEndpoint` takes only `region` + `endpoint_id` (no cluster_id in the path), confirmed via the Go SDK.
