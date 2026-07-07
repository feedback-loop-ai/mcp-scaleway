# Scaleway Data Lab for Apache Spark™ API Reference

Official reference: https://www.scaleway.com/en/developers/api/data-lab/

- API slug: `datalab`
- Version: `v1beta1`
- Scope: **region-based**
- Base URL: `https://api.scaleway.com/datalab/v1beta1/regions/{region}`
- Available regions (at time of writing): `fr-par`, `it-mil`

Tools live in `src/tools/data-lab/`. Each endpoint below is annotated with the
MCP tool that invokes it. Verified against `src/tools/data-lab/handlers.ts` and
the Scaleway Go SDK (`api/datalab/v1beta1`).

## Authentication
- Header: `X-Auth-Token: <secret_key>`

## Clusters (Datalabs)

A "Datalab" is a managed Apache Spark cluster (main node + worker pool, optional
notebook). The API resource path segment is `datalabs`.

### List Clusters — `scaleway_data_lab_list_clusters`
`GET /datalabs`
- Query: page (int), page_size (int), project_id (string), name (string), tags (string[]), order_by (string)
- order_by: name_asc, name_desc, created_at_asc, created_at_desc, updated_at_asc, updated_at_desc
- Response: `{ datalabs: Datalab[], total_count: number }`

### Get Cluster — `scaleway_data_lab_get_cluster`
`GET /datalabs/{datalab_id}`
- Response: Datalab object

### Create Cluster — `scaleway_data_lab_create_cluster`
`POST /datalabs`
- Body: `{ name, spark_version, worker: { node_type, node_count }, main?: { node_type }, description?, tags?, has_notebook?, total_storage?: { type, size }, private_network_id?, project_id? }`
- Response: Datalab object (status: creating)

### Update Cluster — `scaleway_data_lab_update_cluster`
`PATCH /datalabs/{datalab_id}`
- Body: `{ name?, description?, tags?, node_count? }` (node_count scales the worker pool)
- Response: Datalab object

### Delete Cluster — `scaleway_data_lab_delete_cluster`
`DELETE /datalabs/{datalab_id}`
- Response: Datalab object (status: deleting)

## Node Types

### List Node Types — `scaleway_data_lab_list_node_types`
`GET /node-types`
- Query: page (int), page_size (int), order_by (string)
- order_by: name_asc, name_desc, vcpus_asc, vcpus_desc, memory_gigabytes_asc, memory_gigabytes_desc, vram_bytes_asc, vram_bytes_desc, gpus_asc, gpus_desc
- Response: `{ node_types: NodeType[], total_count: number }`

## Cluster Versions

### List Cluster Versions — `scaleway_data_lab_list_cluster_versions`
`GET /cluster-versions`
- Query: page (int), page_size (int)
- Response: `{ clusters: Cluster[], total_count: number }`
- Cluster: `{ name, description, versions: ClusterVersion[] }`
- ClusterVersion: `{ version, end_of_life, created_at, updated_at, disabled, beta }`

## Notebook Versions

### List Notebook Versions — `scaleway_data_lab_list_notebook_versions`
`GET /notebook-versions`
- Query: page (int), page_size (int)
- Response: `{ notebooks: NotebookVersion[], total_count: number }`
- NotebookVersion: `{ version, end_of_life, created_at, updated_at, disabled, beta }`

## Entities

### Datalab
`{ id, project_id, name, description, tags[], main, worker, status, created_at, updated_at, region, has_notebook, notebook_url, notebook_master_url, spark_version, total_storage, private_network_id }`
- main (DatalabSparkMain): `{ node_type, spark_ui_url, spark_master_url, root_volume }`
- worker (DatalabSparkWorker): `{ node_type, node_count, root_volume }`
- total_storage / root_volume (Volume): `{ type, size }` (size in bytes)

### NodeType
`{ stock_status, name, description, vcpus, memory_gigabytes, vram_gigabytes, gpus, disabled, beta, created_at, updated_at, targets[] }`
- targets: unknown_target, notebook, worker

## Enums

### Datalab status
unknown_status, creating, updating, ready, error, deleting, locked, deleted

### Node type stock status
unknown_stock, low_stock, out_of_stock, available

## Pagination
- Page-based: `page` (1-indexed) + `page_size` query params; responses include `total_count`.

## Error Codes
- 400: Invalid input
- 401/403: Permission denied
- 404: Not found
- 409: Conflict (e.g. name already in use)
- 429: Rate limited
- 500: Server error
