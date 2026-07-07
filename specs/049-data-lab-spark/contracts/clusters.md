# Tool Contracts: Data Lab Clusters

API: `datalab` v1beta1, region-scoped. Base: `datalab/v1beta1/regions/{region}`.
Auth: `X-Auth-Token`. Reference: `specs/scaleway-api/data-lab/api-reference.md`.

## scaleway_data_lab_list_clusters
- API: `GET /datalabs`
- Input: `region` (req); `page`, `pageSize`, `projectId`, `name`, `tags`, `orderBy` (opt)
- Output: `{ items: Datalab[], totalCount, page, pageSize }`

## scaleway_data_lab_get_cluster
- API: `GET /datalabs/{datalab_id}`
- Input: `region`, `datalabId` (req)
- Output: Datalab

## scaleway_data_lab_create_cluster
- API: `POST /datalabs`
- Input: `region`, `name`, `sparkVersion`, `worker{nodeType,nodeCount}` (req); `main{nodeType}`, `description`, `tags`, `hasNotebook`, `totalStorage{type,size}`, `privateNetworkId`, `projectId` (opt)
- Body maps camelCase → snake_case (`sparkVersion`→`spark_version`, `nodeType`→`node_type`, etc.)
- Output: Datalab (status: creating)

## scaleway_data_lab_update_cluster
- API: `PATCH /datalabs/{datalab_id}`
- Input: `region`, `datalabId` (req); `name`, `description`, `tags`, `nodeCount` (opt)
- Output: Datalab

## scaleway_data_lab_delete_cluster
- API: `DELETE /datalabs/{datalab_id}`
- Input: `region`, `datalabId` (req)
- Output: Datalab (status: deleting)

## Errors (all)
400→invalid_input, 401/403→permission_denied, 404→not_found, 429→rate_limited, 5xx→server_error.
