# Tool Contracts: Data Lab Catalog (read-only)

API: `datalab` v1beta1, region-scoped. Reference:
`specs/scaleway-api/data-lab/api-reference.md`.

## scaleway_data_lab_list_node_types
- API: `GET /node-types`
- Input: `region` (req); `page`, `pageSize`, `orderBy` (opt)
- orderBy: name_/vcpus_/memory_gigabytes_/vram_bytes_/gpus_ (asc|desc)
- Output: `{ items: NodeType[], totalCount, page, pageSize }`
- NodeType: `{ stock_status, name, description, vcpus, memory_gigabytes, vram_gigabytes, gpus, disabled, beta, created_at?, updated_at?, targets[] }`

## scaleway_data_lab_list_cluster_versions
- API: `GET /cluster-versions`
- Input: `region` (req); `page`, `pageSize` (opt)
- Output: `{ items: Cluster[], totalCount, page, pageSize }`
- Cluster: `{ name, description?, versions: ClusterVersion[] }`

## scaleway_data_lab_list_notebook_versions
- API: `GET /notebook-versions`
- Input: `region` (req); `page`, `pageSize` (opt)
- Output: `{ items: NotebookVersion[], totalCount, page, pageSize }`
- NotebookVersion: `{ version, end_of_life?, created_at?, updated_at?, disabled, beta }`

## Errors (all)
401/403→permission_denied, 429→rate_limited, 5xx→server_error.
