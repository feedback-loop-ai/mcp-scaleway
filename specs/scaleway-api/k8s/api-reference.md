# Scaleway Kubernetes (Kapsule / Kosmos) API Reference

> **Provenance (D3).**
> - schema-url: https://www.scaleway.com/en/developers/api/kubernetes/v1/schema.yml
> - version: v1
> - fetched: 2026-09-19
> - sha256: dc396cf42aee6a0ad78755f8e8e1d6c1fed33c4d1f709fb06996338ddf60c7d9

> **Envelope boundary (Decision 1).** Upstream Scaleway JSON is snake_case and is
> passed through by this server without renaming — `total_count` and any other
> `*count*` field in a response body is the upstream field, verbatim. The MCP
> list envelope is this server's own camelCase boundary and is defined once in
> `src/shared/pagination.ts` (`buildPaginatedResponse`): `{ items, totalCount,
> page, pageSize }`. Wherever this document says `total_count`, that is the
> upstream field on the wire; wherever it says `totalCount`, that is the MCP
> envelope field. `total_pages` is neither: it belongs to the MCP envelope only
> when this server computes it — it is not an upstream Scaleway field.

Base URL: `https://api.scaleway.com/k8s/v1/regions/{region}`

Official docs: https://www.scaleway.com/en/developers/api/kubernetes/

> See `README.md` in this directory for the condensed endpoint list. This file is
> the full reference used for contract traceability.

## Authentication

- Header: `X-Auth-Token: <secret_key>`
- Kubernetes is a **regional** API. Zone-formatted values (e.g. `fr-par-1`) are rejected.

## Pagination

List endpoints accept `page` (1-indexed) and `page_size` (default 20, max 100).
Responses include `total_count`. The MCP layer normalizes list responses into
`{ items, totalCount, page, pageSize }` via `buildPaginatedResponse`.

## Regions

`fr-par`, `nl-ams`, `pl-waw`.

## Clusters

### List Clusters
`GET /clusters`
- Query: `page`, `page_size`, `order_by`, `name`, `status`, `type`, `project_id`, `organization_id`
- Response: `{ clusters: Cluster[], total_count: number }`

### Get Cluster
`GET /clusters/{cluster_id}`
- Response: `Cluster`

### Create Cluster
`POST /clusters`
- Body: `{ name, version, cni, description?, tags?, type?, project_id?, pools? }`
- `cni`: `unknown_cni | cilium | calico | kilo | flannel | none`
- `type`: `kapsule | multicloud` (also `unknown`)
- Response: `Cluster`

### Delete Cluster
`DELETE /clusters/{cluster_id}`
- Query: `with_additional_resources` (deletes attached LBs and volumes)
- Response: `Cluster` (status: `deleting`)

### Upgrade Cluster
`POST /clusters/{cluster_id}/upgrade`
- Body: `{ version, upgrade_pools? }`
- Response: `Cluster`

### List Cluster Available Versions
`GET /clusters/{cluster_id}/available-versions`
- Response: `{ versions: string[] }` (Cluster object with available upgrade targets)

### Get Cluster Kubeconfig
`GET /clusters/{cluster_id}/kubeconfig`
- Response: `{ content: string, name?, type? }` (base64-encoded kubeconfig in `content`)

## Node Pools

### List Pools
`GET /clusters/{cluster_id}/pools`
- Query: `page`, `page_size`, `order_by`, `name`, `status`
- Response: `{ pools: Pool[], total_count: number }`
  - Note: the MCP handler reads the collection under the `nodes` key from the raw
    Scaleway envelope before normalizing.

### Get Pool
`GET /pools/{pool_id}`
- Response: `Pool`

### Create Pool
`POST /clusters/{cluster_id}/pools`
- Body: `{ name, node_type, size, min_size?, max_size?, autoscaling?, autohealing?, tags? }`
- `node_type`: commercial type (e.g. `DEV1-M`, `GP1-S`)
- Response: `Pool`

### Update Pool
`PATCH /pools/{pool_id}`
- Body: `{ size?, min_size?, max_size?, autoscaling?, autohealing?, tags? }`
- Response: `Pool`

### Delete Pool
`DELETE /pools/{pool_id}`
- Response: `Pool` (status: `deleting`)

### Upgrade Pool
`POST /pools/{pool_id}/upgrade`
- Body: `{ version }`
- Response: `Pool`

## Cluster Status Enum

`unknown, creating, ready, deleting, deleted, updating, locked, pool_required`

## Pool Status Enum

`unknown, ready, deleting, creating, scaling, warning, locked, upgrading`

## Error Codes

- 400: Invalid request parameters
- 401: Authentication required
- 403: Insufficient permissions
- 404: Resource not found
- 409: Conflict
- 429: Rate limited
- 500: Server error

## Deviations (implementation vs. public docs)

For single-pool operations the implementation uses the flat pool paths exposed by
the Scaleway SDK, while the public docs render the nested form:

| Operation | Implementation | Public docs page |
|-----------|----------------|------------------|
| Get Pool | `GET /pools/{pool_id}` | `GET /clusters/{cluster_id}/pools/{pool_id}` |
| Update Pool | `PATCH /pools/{pool_id}` | `PATCH /clusters/{cluster_id}/pools/{pool_id}` |
| Delete Pool | `DELETE /pools/{pool_id}` | `DELETE /clusters/{cluster_id}/pools/{pool_id}` |
| Upgrade Pool | `POST /pools/{pool_id}/upgrade` | `POST /clusters/{cluster_id}/pools/{pool_id}/upgrade` |

The flat `/pools/{pool_id}` paths are the canonical Scaleway API routes (a pool ID
is globally unique within a region); both forms resolve to the same resource.
List and Create pools are nested under the cluster in both.

## Kubeconfig endpoint selection (2026-09-19)

`scaleway_k8s_get_cluster_kubeconfig` accepts optional `endpoint: "public" | "vpc"`, sent as the query parameter on `GET /clusters/{cluster_id}/kubeconfig`. Omitting it retains the upstream public endpoint default. Unsupported values fail validation before transport.

Contract proof: `tests/contract/transport/current-capabilities.transport.test.ts`.
