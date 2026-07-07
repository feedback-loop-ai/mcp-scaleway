# Tool Contracts: 048-data-warehouse

All tools are region-scoped; `region` is required. Auth via `X-Auth-Token`.
Backing API reference: `specs/scaleway-api/data-warehouse/api-reference.md`.

## Deployments
| Tool | Method / Path | Key params |
|------|---------------|------------|
| `scaleway_data_warehouse_list_deployments` | GET /deployments | page, pageSize, projectId?, organizationId?, name?, tags?, orderBy? |
| `scaleway_data_warehouse_get_deployment` | GET /deployments/{id} | deploymentId |
| `scaleway_data_warehouse_create_deployment` | POST /deployments | name, projectId?, tags?, version?, replicaCount?, shardCount?, password?, cpuMin?, cpuMax?, ramPerCpu?, moveFactor?, endpoints? |
| `scaleway_data_warehouse_update_deployment` | PATCH /deployments/{id} | deploymentId, name?, tags?, cpuMin?, cpuMax?, replicaCount?, moveFactor? |
| `scaleway_data_warehouse_delete_deployment` | DELETE /deployments/{id} | deploymentId |
| `scaleway_data_warehouse_start_deployment` | POST /deployments/{id}/start | deploymentId |
| `scaleway_data_warehouse_stop_deployment` | POST /deployments/{id}/stop | deploymentId |
| `scaleway_data_warehouse_get_deployment_certificate` | GET /deployments/{id}/certificate | deploymentId |

## Databases
| Tool | Method / Path | Key params |
|------|---------------|------------|
| `scaleway_data_warehouse_list_databases` | GET /deployments/{id}/databases | deploymentId, page, pageSize, name?, orderBy? |
| `scaleway_data_warehouse_create_database` | POST /deployments/{id}/databases | deploymentId, name |
| `scaleway_data_warehouse_delete_database` | DELETE /deployments/{id}/databases/{name} | deploymentId, name |

## Users
| Tool | Method / Path | Key params |
|------|---------------|------------|
| `scaleway_data_warehouse_list_users` | GET /deployments/{id}/users | deploymentId, page, pageSize, name?, orderBy? |
| `scaleway_data_warehouse_create_user` | POST /deployments/{id}/users | deploymentId, name, password, isAdmin? |
| `scaleway_data_warehouse_update_user` | PATCH /deployments/{id}/users/{name} | deploymentId, name, password?, isAdmin? |
| `scaleway_data_warehouse_delete_user` | DELETE /deployments/{id}/users/{name} | deploymentId, name |

## Endpoints
| Tool | Method / Path | Key params |
|------|---------------|------------|
| `scaleway_data_warehouse_create_endpoint` | POST /endpoints | deploymentId, privateNetworkId? |
| `scaleway_data_warehouse_delete_endpoint` | DELETE /endpoints/{endpoint_id} | endpointId |

## Presets & Versions
| Tool | Method / Path | Key params |
|------|---------------|------------|
| `scaleway_data_warehouse_list_presets` | GET /presets | page, pageSize |
| `scaleway_data_warehouse_list_versions` | GET /versions | page, pageSize, version? |
