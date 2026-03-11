# Data Model: Scaleway Managed Inference MCP Tools

**Feature**: 029-inference | **Date**: 2026-03-11

## Entities

### Deployment

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique deployment identifier |
| name | string | yes | Deployment name |
| status | enum | yes | unknown, queued, allocating, deploying, ready, deleting, error, locked |
| region | string | yes | Scaleway region (e.g., fr-par) |
| project_id | string (UUID) | yes | Project ID |
| model_id | string (UUID) | yes | ID of the deployed model |
| model_name | string | yes | Human-readable model name |
| node_type | string | yes | Node type used (e.g., L4, H100) |
| tags | string[] | no | User-defined tags |
| endpoints | Endpoint[] | no | Attached endpoints |
| size | number | yes | Current number of replicas |
| min_size | number | yes | Minimum number of replicas (autoscaling) |
| max_size | number | yes | Maximum number of replicas (autoscaling) |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last modification timestamp |

### DeploymentEvent

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique event identifier |
| deployment_id | string (UUID) | yes | Parent deployment ID |
| type | string | yes | Event type |
| details | string | yes | Event details/message |
| created_at | string (ISO 8601) | yes | Event timestamp |

### Endpoint

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique endpoint identifier |
| url | string | yes | Endpoint URL |
| is_public | boolean | yes | Whether the endpoint is publicly accessible |
| private_network_id | string/null | no | Private network ID if attached |
| disable_auth | boolean | yes | Whether authentication is disabled |

### EndpointSpec (input only, used when creating deployments/endpoints)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| is_public | boolean | no | Whether the endpoint is publicly accessible |
| private_network_id | string (UUID) | no | Private network ID to attach to |
| disable_auth | boolean | no | Disable authentication on this endpoint |

### Model

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique model identifier |
| name | string | yes | Model name |
| description | string | yes | Model description |
| provider | string | yes | Model provider (e.g., meta, mistral) |
| tags | string[] | no | Tags |
| compatible_node_types | string[] | yes | Node types that can run this model |
| quantization_level | string | yes | Quantization level (e.g., f16, int8) |
| has_eula | boolean | yes | Whether the model requires EULA acceptance |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last modification timestamp |

### NodeType

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Node type name (e.g., L4, H100) |
| stock_status | enum | yes | unknown, available, low_stock, out_of_stock |
| description | string | yes | Human-readable description |
| vcpus | number | yes | Number of vCPUs |
| memory | number | yes | Memory in bytes |
| vram | number | yes | GPU VRAM in bytes |
| gpus | number | yes | Number of GPUs |
