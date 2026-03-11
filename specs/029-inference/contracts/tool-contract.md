# Tool Contracts: Scaleway Managed Inference MCP Tools

**Feature**: 029-inference | **Date**: 2026-03-11

## Deployment Tools

### scaleway_inference_list_deployments

**Scaleway API**: `GET /inference/v1/regions/{region}/deployments`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | yes | - | Scaleway region (e.g., fr-par) |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| name | string | no | - | Filter by deployment name |
| project_id | string (UUID) | no | - | Filter by project ID |
| tags | string[] | no | - | Filter by tags |
| order_by | string | no | - | Order by field (e.g., created_at_asc) |

**Output**: `{ items: Deployment[], total_count: number, page: number, page_size: number }`

---

### scaleway_inference_get_deployment

**Scaleway API**: `GET /inference/v1/regions/{region}/deployments/{deployment_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| deployment_id | string (UUID) | yes | Deployment ID |

**Output**: `{ id, name, status, region, project_id, model_id, model_name, node_type, tags, endpoints, size, min_size, max_size, created_at, updated_at }`

---

### scaleway_inference_create_deployment

**Scaleway API**: `POST /inference/v1/regions/{region}/deployments`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| name | string | yes | Deployment name |
| model_id | string (UUID) | yes | Model ID to deploy |
| node_type | string | yes | Node type (e.g., L4) |
| project_id | string (UUID) | no | Project ID (uses default if not set) |
| tags | string[] | no | Tags for the deployment |
| endpoints | EndpointSpec[] | no | Endpoint specifications |
| min_size | number | no | Minimum number of replicas |
| max_size | number | no | Maximum number of replicas |

**Output**: `{ id, name, status, region, project_id, model_id, model_name, node_type, tags, endpoints, size, min_size, max_size, created_at, updated_at }`

---

### scaleway_inference_update_deployment

**Scaleway API**: `PATCH /inference/v1/regions/{region}/deployments/{deployment_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| deployment_id | string (UUID) | yes | Deployment ID |
| name | string | no | New deployment name |
| tags | string[] | no | New tags |
| min_size | number | no | Minimum number of replicas |
| max_size | number | no | Maximum number of replicas |

**Output**: `{ id, name, status, region, project_id, model_id, model_name, node_type, tags, endpoints, size, min_size, max_size, created_at, updated_at }`

---

### scaleway_inference_delete_deployment

**Scaleway API**: `DELETE /inference/v1/regions/{region}/deployments/{deployment_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| deployment_id | string (UUID) | yes | Deployment ID |

**Output**: `{ id, name, status, ... }` (the deleted deployment object)

---

### scaleway_inference_list_deployment_events

**Scaleway API**: `GET /inference/v1/regions/{region}/deployments/{deployment_id}/events`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | yes | - | Scaleway region |
| deployment_id | string (UUID) | yes | - | Deployment ID |
| page | number | no | 1 | Page number |
| pageSize | number | no | 50 | Items per page |

**Output**: `{ items: DeploymentEvent[], total_count: number, page: number, page_size: number }`

---

## Endpoint Tools

### scaleway_inference_list_endpoints

**Scaleway API**: `GET /inference/v1/regions/{region}/endpoints`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | yes | - | Scaleway region |
| deployment_id | string (UUID) | no | - | Filter by deployment ID |
| page | number | no | 1 | Page number |
| pageSize | number | no | 50 | Items per page |

**Output**: `{ items: Endpoint[], total_count: number, page: number, page_size: number }`

---

### scaleway_inference_create_endpoint

**Scaleway API**: `POST /inference/v1/regions/{region}/endpoints`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| deployment_id | string (UUID) | yes | Deployment ID to attach endpoint to |
| is_public | boolean | no | Whether the endpoint is publicly accessible |
| private_network_id | string (UUID) | no | Private network ID to attach to |
| disable_auth | boolean | no | Disable authentication on this endpoint |

**Output**: `{ id, url, is_public, private_network_id, disable_auth }`

---

### scaleway_inference_update_endpoint

**Scaleway API**: `PATCH /inference/v1/regions/{region}/endpoints/{endpoint_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| endpoint_id | string (UUID) | yes | Endpoint ID |
| disable_auth | boolean | no | Disable authentication on this endpoint |

**Output**: `{ id, url, is_public, private_network_id, disable_auth }`

---

### scaleway_inference_delete_endpoint

**Scaleway API**: `DELETE /inference/v1/regions/{region}/endpoints/{endpoint_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| endpoint_id | string (UUID) | yes | Endpoint ID |

**Output**: `{ success: true }`

---

## Model Tools

### scaleway_inference_list_models

**Scaleway API**: `GET /inference/v1/regions/{region}/models`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | yes | - | Scaleway region |
| name | string | no | - | Filter by model name |
| project_id | string (UUID) | no | - | Filter by project ID |
| tags | string[] | no | - | Filter by tags |
| order_by | string | no | - | Order by field |
| page | number | no | 1 | Page number |
| pageSize | number | no | 50 | Items per page |

**Output**: `{ items: Model[], total_count: number, page: number, page_size: number }`

---

### scaleway_inference_get_model

**Scaleway API**: `GET /inference/v1/regions/{region}/models/{model_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| model_id | string (UUID) | yes | Model ID |

**Output**: `{ id, name, description, provider, tags, compatible_node_types, quantization_level, has_eula, created_at, updated_at }`

---

## Node Type Tools

### scaleway_inference_list_node_types

**Scaleway API**: `GET /inference/v1/regions/{region}/node-types`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | yes | - | Scaleway region |
| page | number | no | 1 | Page number |
| pageSize | number | no | 50 | Items per page |

**Output**: `{ items: NodeType[], total_count: number, page: number, page_size: number }`

---

## EULA Tools

### scaleway_inference_get_eula

**Scaleway API**: `GET /inference/v1/regions/{region}/models/{model_id}/eula`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| model_id | string (UUID) | yes | Model ID |

**Output**: `{ content: string }` (EULA text content)

---

### scaleway_inference_accept_eula

**Scaleway API**: `POST /inference/v1/regions/{region}/models/{model_id}/eula`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| model_id | string (UUID) | yes | Model ID |

**Output**: `{ success: true }`
