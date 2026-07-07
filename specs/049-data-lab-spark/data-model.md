# Data Model: Data Lab for Apache Spark

All schemas are defined in `src/tools/data-lab/types.ts` (zod). Field names match
the Scaleway `datalab` v1beta1 API JSON exactly.

## Entities

### Datalab (Cluster)
| Field | Type | Notes |
|---|---|---|
| id | uuid | |
| project_id | uuid | |
| name | string | |
| description | string? | nullable |
| tags | string[] | |
| main | DatalabSparkMain? | main node config |
| worker | DatalabSparkWorker? | worker pool config |
| status | DatalabStatus | enum |
| created_at / updated_at | datetime? | RFC3339 |
| region | string | |
| has_notebook | boolean | |
| notebook_url / notebook_master_url | string? | nullable |
| spark_version | string | |
| total_storage | Volume? | |
| private_network_id | string? | nullable |

### DatalabSparkMain
`{ node_type, spark_ui_url?, spark_master_url?, root_volume? }`

### DatalabSparkWorker
`{ node_type, node_count, root_volume? }`

### Volume
`{ type: string, size: int(bytes) }`

### NodeType
`{ stock_status, name, description, vcpus, memory_gigabytes, vram_gigabytes, gpus, disabled, beta, created_at?, updated_at?, targets[] }`

### Cluster (version offering)
`{ name, description?, versions: ClusterVersion[] }`

### ClusterVersion / NotebookVersion
`{ version, end_of_life?, created_at?, updated_at?, disabled, beta }`

## Enums

- **DatalabStatus**: unknown_status, creating, updating, ready, error, deleting, locked, deleted
- **NodeTypeStock**: unknown_stock, low_stock, out_of_stock, available
- **NodeTypeTarget**: unknown_target, notebook, worker
- **ListClustersOrderBy**: name_(asc|desc), created_at_(asc|desc), updated_at_(asc|desc)
- **ListNodeTypesOrderBy**: name_/vcpus_/memory_gigabytes_/vram_bytes_/gpus_ (asc|desc)

## Request params (tool inputs)

| Schema | Required | Optional |
|---|---|---|
| ListClustersParams | region | page, pageSize, projectId, name, tags, orderBy |
| GetClusterParams | region, datalabId | — |
| CreateClusterParams | region, name, sparkVersion, worker{nodeType,nodeCount} | main{nodeType}, description, tags, hasNotebook, totalStorage{type,size}, privateNetworkId, projectId |
| UpdateClusterParams | region, datalabId | name, description, tags, nodeCount |
| DeleteClusterParams | region, datalabId | — |
| ListNodeTypesParams | region | page, pageSize, orderBy |
| ListClusterVersionsParams | region | page, pageSize |
| ListNotebookVersionsParams | region | page, pageSize |

## Response envelopes

- List tools return `{ items, totalCount, page, pageSize }` via `buildPaginatedResponse`.
- Get/Create/Update/Delete return the raw Datalab JSON.
