# Research: Data Lab for Apache Spark

## Source

- Official API reference: https://www.scaleway.com/en/developers/api/data-lab/
- Scaleway Go SDK: `github.com/scaleway/scaleway-sdk-go/api/datalab/v1beta1` (used to confirm exact JSON field names and enum values).

## Decisions

| Question | Finding | Decision |
|---|---|---|
| API slug | `datalab` | Path prefix `datalab/v1beta1/regions/{region}`. |
| Version | `v1beta1` | Use as-is. |
| Scoping | Region-based (`fr-par`, `it-mil`) | `region` is a required param on every tool. |
| Resource path for clusters | `datalabs` (a "Datalab" == a Spark cluster) | Tools use the user-facing word "cluster"; paths use `datalabs`. |
| Cluster status enum | unknown_status, creating, updating, ready, error, deleting, locked, deleted | Encoded in `DatalabStatus`. |
| Node type stock | unknown_stock, low_stock, out_of_stock, available | Encoded in `NodeTypeStock`. |
| Node type targets | unknown_target, notebook, worker | Encoded in `NodeTypeTarget`. |
| Create body | name, spark_version, worker{node_type,node_count}, main{node_type}?, description?, tags?, has_notebook?, total_storage{type,size}?, private_network_id?, project_id? | `worker` required (a Spark cluster needs workers); `main` optional per SDK. |
| Update body | name?, description?, tags?, node_count? | `node_count` scales the worker pool. |
| List wrappers | datalabs / node_types / clusters / notebooks | Cluster-versions endpoint wraps items in `clusters`; notebook-versions in `notebooks`. |
| Pagination | page + page_size, `total_count` in response | Reuse shared `PaginationParams` + `buildPaginatedResponse`. |
| Volume size unit | bytes (`scw.Size`, uint64) | `size` documented as bytes. |
| Volume `type` values | Block Storage volume class strings (not enumerated in public docs) | Modeled as `z.string()` to avoid inventing enum values. |

## Rationale for the "cluster" naming

Scaleway's own console and marketing call the resource a "cluster" (Apache Spark
cluster), while the API path segment is `datalabs` and the SDK struct is
`Datalab`. Tool names use the friendlier `..._cluster` verb-noun; response
schemas keep the API field names (`datalabs`, `datalab_id`).

## Endpoints considered but excluded

- No run/session/job endpoints exist in v1beta1 (see spec Out of Scope).
- No GET-by-id for node types or versions (list only).
