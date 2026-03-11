# 029-inference: Managed Inference API

## Overview
MCP tools for Scaleway Managed Inference API. Regional API managing AI model deployments, endpoints, models, and node types.

## User Stories

### P1 - Deployment CRUD
- As a user, I can list, get, create, update, and delete inference deployments
- As a user, I can list events for a deployment

### P1 - Manage Deployment Endpoints
- As a user, I can list, create, update, and delete endpoints on a deployment

### P2 - List Models and Node Types
- As a user, I can list and get available models
- As a user, I can list available node types

### P3 - EULA Acceptance
- As a user, I can get and accept model EULAs

## Entities

### Deployment
- id: string (UUID)
- name: string
- status: enum (unknown, queued, allocating, deploying, ready, deleting, error, locked)
- region: string
- project_id: string
- model_id: string
- model_name: string
- node_type: string
- tags: string[]
- endpoints: Endpoint[]
- size: number (replica count)
- min_size: number
- max_size: number
- created_at: string (ISO datetime)
- updated_at: string (ISO datetime)

### Endpoint
- id: string (UUID)
- url: string
- public_access: boolean (is_public)
- private_network_id: string | null
- disable_auth: boolean

### Model
- id: string (UUID)
- name: string
- description: string
- provider: string
- tags: string[]
- compatible_node_types: string[]
- quantization_level: string
- has_eula: boolean
- created_at: string (ISO datetime)
- updated_at: string (ISO datetime)

### NodeType
- name: string
- stock_status: enum (unknown, available, low_stock, out_of_stock)
- description: string
- vcpus: number
- memory: number (bytes)
- vram: number (bytes)
- gpus: number

## Tools

| Tool | HTTP | Priority |
|------|------|----------|
| scaleway_inference_list_deployments | GET /inference/v1/regions/{region}/deployments | P1 |
| scaleway_inference_get_deployment | GET /inference/v1/regions/{region}/deployments/{deployment_id} | P1 |
| scaleway_inference_create_deployment | POST /inference/v1/regions/{region}/deployments | P1 |
| scaleway_inference_update_deployment | PATCH /inference/v1/regions/{region}/deployments/{deployment_id} | P1 |
| scaleway_inference_delete_deployment | DELETE /inference/v1/regions/{region}/deployments/{deployment_id} | P1 |
| scaleway_inference_list_deployment_events | GET /inference/v1/regions/{region}/deployments/{deployment_id}/events | P1 |
| scaleway_inference_list_endpoints | GET /inference/v1/regions/{region}/endpoints | P1 |
| scaleway_inference_create_endpoint | POST /inference/v1/regions/{region}/endpoints | P1 |
| scaleway_inference_update_endpoint | PATCH /inference/v1/regions/{region}/endpoints/{endpoint_id} | P1 |
| scaleway_inference_delete_endpoint | DELETE /inference/v1/regions/{region}/endpoints/{endpoint_id} | P1 |
| scaleway_inference_list_models | GET /inference/v1/regions/{region}/models | P2 |
| scaleway_inference_get_model | GET /inference/v1/regions/{region}/models/{model_id} | P2 |
| scaleway_inference_list_node_types | GET /inference/v1/regions/{region}/node-types | P2 |
| scaleway_inference_get_eula | GET /inference/v1/regions/{region}/models/{model_id}/eula | P3 |
| scaleway_inference_accept_eula | POST /inference/v1/regions/{region}/models/{model_id}/eula | P3 |
