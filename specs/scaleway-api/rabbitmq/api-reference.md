# Scaleway RabbitMQ (Cloud Essentials MessageQ) API Reference

Official reference: https://www.scaleway.com/en/developers/api/messageq/
Product docs: https://www.scaleway.com/en/docs/rabbitmq/
Verified against the generated Go SDK:
https://github.com/scaleway/scaleway-sdk-go/blob/master/api/messageq/v1alpha1/messageq_sdk.go

Scaleway markets this product as "Cloud Essentials for RabbitMQ". The underlying
control-plane API is named **MessageQ**, API slug `messageq`, version `v1alpha1`.

Base URL: `https://api.scaleway.com/messageq/v1alpha1/regions/{region}`

Scope: **Region-scoped**. Currently available only in `fr-par` (Paris).

Tools live in `src/tools/rabbitmq/`. Each endpoint below is annotated with the MCP
tool that invokes it. Verified against `src/tools/rabbitmq/handlers.ts`.

## Authentication
- Header: `X-Auth-Token: <secret_key>`

## Deployments

### List Deployments — `scaleway_rabbitmq_list_deployments`
`GET /deployments`
- Query: page (int), page_size (int), organization_id (string), project_id (string), name (string), tags (string[]), order_by (enum)
- Response: `{ deployments: Deployment[], total_count: number }`

### Get Deployment — `scaleway_rabbitmq_get_deployment`
`GET /deployments/{deployment_id}`
- Response: Deployment object

### Create Deployment — `scaleway_rabbitmq_create_deployment`
`POST /deployments`
- Body: `{ project_id?, name, tags?, node_count, node_type, user_name?, password?, volume?, endpoints?, version }`
- `volume`: `{ type: VolumeType, size_bytes: number }`
- `endpoints`: array of EndpointSpec — each `{ public: {} }` or `{ private_network: { private_network_id } }`
- Response: Deployment object (status: creating)

### Update Deployment — `scaleway_rabbitmq_update_deployment`
`PATCH /deployments/{deployment_id}`
- Body: `{ name?, tags? }`
- Response: Deployment object

### Upgrade Deployment — `scaleway_rabbitmq_upgrade_deployment`
`POST /deployments/{deployment_id}/upgrade`
- Body: exactly one of `{ node_count }` or `{ volume_size_bytes }`
- Response: Deployment object (status: upgrading)

### Delete Deployment — `scaleway_rabbitmq_delete_deployment`
`DELETE /deployments/{deployment_id}`
- Response: Deployment object (status: deleting)

### Download Certificate Authority — `scaleway_rabbitmq_get_deployment_certificate`
`GET /deployments/{deployment_id}/certificate-authority`
- Response: file (certificate authority content)

## Users

Users are identified by their `username` (there is no user UUID and no
get-single-user endpoint).

### List Users — `scaleway_rabbitmq_list_users`
`GET /deployments/{deployment_id}/users`
- Query: page (int), page_size (int), order_by (enum: name_asc|name_desc), name (string)
- Response: `{ users: User[], total_count: number }`
- User: `{ username: string }`

### Create User — `scaleway_rabbitmq_create_user`
`POST /deployments/{deployment_id}/users`
- Body: `{ username, password }`
- Response: User object

### Update User — `scaleway_rabbitmq_update_user`
`PATCH /deployments/{deployment_id}/users/{username}`
- Body: `{ password? }`
- Response: User object

### Delete User — `scaleway_rabbitmq_delete_user`
`DELETE /deployments/{deployment_id}/users/{username}`
- Response: empty (204)

## Endpoints

Note: endpoint create/delete operate on the `/endpoints` collection at the region
root (not nested under the deployment path); the deployment is referenced by
`deployment_id` in the request body.

### Create Endpoint — `scaleway_rabbitmq_create_endpoint`
`POST /endpoints`
- Body: `{ deployment_id, endpoint_spec: { public: {} } | { private_network: { private_network_id } } }`
- Response: Endpoint object

### Delete Endpoint — `scaleway_rabbitmq_delete_endpoint`
`DELETE /endpoints/{endpoint_id}`
- Response: empty (204)

## Node Types

### List Node Types — `scaleway_rabbitmq_list_node_types`
`GET /node-types`
- Query: page (int), page_size (int), order_by (enum: name_asc|name_desc|vcpus_asc|vcpus_desc|memory_asc|memory_desc)
- Response: `{ node_types: NodeType[], total_count: number }`

## Versions

### List Versions — `scaleway_rabbitmq_list_versions`
`GET /versions`
- Query: page (int), page_size (int), order_by (enum: version_asc|version_desc), version (string)
- Response: `{ versions: Version[], total_count: number }`

## Entities

### Deployment
`{ id, name, organization_id, project_id, status, tags[], node_count, node_type, volume, endpoints[], created_at, updated_at, version, region }`

### Endpoint
`{ id, dns_record (deprecated, nullable), services: [{ name, port, url }], public?: {}, private_network?: { private_network_id } }`

### Volume
`{ type: VolumeType, size_bytes: number }`

### NodeType
`{ stock_status, name, description, vcpus, memory_bytes, disabled, beta, instance_range, available_volume_types: [{ type, description, min_size_bytes, max_size_bytes, chunk_size_bytes }] }`

### User
`{ username: string }`

### Version
`{ version, end_of_life (nullable), disabled, beta }`

## Enums

### Deployment Status
`unknown_status, ready, creating, initializing, upgrading, deleting, error, locked, locking, unlocking`

### Volume Type
`unknown_type, sbs_5k, sbs_15k`

### Node Type Stock Status
`unknown_stock, low_stock, out_of_stock, available`

### List Deployments Order By
`created_at_asc, created_at_desc, name_asc, name_desc, updated_at_asc, updated_at_desc`

### List Node Types Order By
`name_asc, name_desc, vcpus_asc, vcpus_desc, memory_asc, memory_desc`

### List Users Order By
`name_asc, name_desc`

### List Versions Order By
`version_asc, version_desc`

## Error Codes
- 400: Invalid input
- 401/403: Permission denied
- 404: Not found
- 409: Conflict (e.g. name already in use)
- 429: Rate limited
- 500: Server error

## Out of Scope
- RabbitMQ vhosts, queues, exchanges, bindings and per-user permissions are not
  managed by this control-plane API. They are managed at runtime via the RabbitMQ
  Management REST API / AMQP against a running deployment, not via `messageq`.
