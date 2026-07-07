# Research: 046-opensearch

## Product & API discovery

- **Product**: Cloud Essentials for OpenSearch (Public Beta).
- **API entry point**: https://www.scaleway.com/en/developers/api/cloud-essentials-for-opensearch/
- **Discovered slug/version**: `searchdb/v1alpha1` (NOT `opensearch/*`). This was the
  key discovery — the console product name is "OpenSearch" but the API namespace is
  `searchdb`.
- **Scope**: region-scoped. Path template
  `/searchdb/v1alpha1/regions/{region}/...`. Only `fr-par` is currently served
  (Go SDK `API.Regions()` returns `[fr-par]`).
- **Auth**: `X-Auth-Token: <secret_key>` (standard Scaleway).

### Sources
- Developer API reference (endpoint list, base path, create-deployment body).
- Quickstart / docs (node_type `SEARCHDB-SHARED-2C-8G`, volume `sbs_5k`, version `2.0`).
- **Authoritative shapes**: Scaleway Go SDK generated client
  `github.com/scaleway/scaleway-sdk-go/api/searchdb/v1alpha1/searchdb_sdk.go` — used
  to pin every entity field, enum value, request body, order_by set, and path.

## Decisions

| Decision | Rationale |
|----------|-----------|
| Directory `src/tools/opensearch/`, prefix `scaleway_opensearch_` | Assigned by brief; matches user-facing product name even though API is `searchdb`. |
| API prefix constant `searchdb/v1alpha1/regions` | Real slug from SDK/reference; no leading slash to match existing verticals (e.g. nats `mnq/v1beta1/regions`). |
| Friendly endpoint inputs (`public: bool`, `privateNetworkId`) mapped to API `{ public: {} }` / `{ private_network: {...} }` in handlers | The raw API "oneof empty object" shape is awkward for MCP callers. |
| `volume` accepted as `{ type, sizeBytes }`, mapped to `{ type, size_bytes }` | camelCase input, snake_case wire body — consistent with repo conventions. |
| `upgrade` exposes `nodeCount` and `volumeSizeBytes`, both optional | API requires *precisely one*; enforced server-side (returns 400 → invalid_input). Kept as a plain ZodObject so `.shape` works for `server.tool`. |
| No snapshot/ACL tools | No such endpoints exist in the API (see Out of Scope). |
| `dns_record` and `node_amount` modeled as optional/deprecated | Present in SDK but deprecated; kept for response compatibility. |

## Enum values (pinned from SDK)

- DeploymentStatus: unknown_status, ready, creating, initializing, upgrading, deleting, error, locked, locking, unlocking
- NodeTypeStockStatus: unknown_stock, low_stock, out_of_stock, available
- VolumeType: unknown_type, sbs_5k, sbs_15k
- Deployment order_by: created_at_asc/desc, name_asc/desc, updated_at_asc/desc
- NodeType order_by: name_asc/desc, vcpus_asc/desc, memory_asc/desc
- User order_by: name_asc/desc
- Version order_by: version_asc/desc

## Open questions / ambiguities resolved

- **Snapshots & ACLs** appear in concepts docs but not in the API — confirmed absent
  in both the developer reference and the SDK. Documented as Out of Scope rather than
  invented.
- **Endpoint read**: no standalone GET/LIST endpoints route; endpoints are embedded
  in the Deployment object. No list/get endpoint tools created.
