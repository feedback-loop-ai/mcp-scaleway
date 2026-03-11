# Scaleway Managed Inference API Reference

Base URL: `https://api.scaleway.com/inference/v1/regions/{region}`

## Authentication
- Header: `X-Auth-Token: <secret_key>`

## Deployments

### List Deployments
`GET /deployments`
- Query: page (int), page_size (int), name (string), project_id (string), tags (string[]), order_by (string)
- Response: `{ deployments: Deployment[], total_count: number }`

### Get Deployment
`GET /deployments/{deployment_id}`
- Response: Deployment object

### Create Deployment
`POST /deployments`
- Body: `{ name, model_id, node_type, project_id, tags?, endpoints?, min_size?, max_size? }`
- Response: Deployment object (status: queued)

### Update Deployment
`PATCH /deployments/{deployment_id}`
- Body: `{ name?, tags?, min_size?, max_size? }`
- Response: Deployment object

### Delete Deployment
`DELETE /deployments/{deployment_id}`
- Response: Deployment object (status: deleting)

### List Deployment Events
`GET /deployments/{deployment_id}/events`
- Query: page (int), page_size (int)
- Response: `{ events: DeploymentEvent[], total_count: number }`
- DeploymentEvent: `{ id, deployment_id, type, details, created_at }`

## Endpoints

### List Endpoints
`GET /endpoints`
- Query: page (int), page_size (int), deployment_id (string)
- Response: `{ endpoints: Endpoint[], total_count: number }`

### Create Endpoint
`POST /endpoints`
- Body: `{ deployment_id, is_public?, private_network_id?, disable_auth? }`
- Response: Endpoint object

### Update Endpoint
`PATCH /endpoints/{endpoint_id}`
- Body: `{ disable_auth? }`
- Response: Endpoint object

### Delete Endpoint
`DELETE /endpoints/{endpoint_id}`
- Response: empty (204)

## Models

### List Models
`GET /models`
- Query: page (int), page_size (int), name (string), project_id (string), tags (string[]), order_by (string)
- Response: `{ models: Model[], total_count: number }`

### Get Model
`GET /models/{model_id}`
- Response: Model object

## Node Types

### List Node Types
`GET /node-types`
- Query: page (int), page_size (int)
- Response: `{ node_types: NodeType[], total_count: number }`

## EULA

### Get EULA
`GET /models/{model_id}/eula`
- Response: `{ content: string }`

### Accept EULA
`POST /models/{model_id}/eula`
- Response: empty (204)

## Error Codes
- 400: Invalid input
- 401/403: Permission denied
- 404: Not found
- 409: Conflict (deployment already exists with name)
- 429: Rate limited
- 500: Server error

## Deployment Status Enum
unknown, queued, allocating, deploying, ready, deleting, error, locked

## Node Type Stock Status Enum
unknown, available, low_stock, out_of_stock
