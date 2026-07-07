# Scaleway Kubernetes (Kapsule / Kosmos) API Reference

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
