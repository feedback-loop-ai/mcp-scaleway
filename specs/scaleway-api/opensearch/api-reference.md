# Scaleway Cloud Essentials for OpenSearch API Reference

Official reference: https://www.scaleway.com/en/developers/api/cloud-essentials-for-opensearch/
Authoritative shapes verified against the Scaleway Go SDK generated client:
https://github.com/scaleway/scaleway-sdk-go/blob/main/api/searchdb/v1alpha1/searchdb_sdk.go

- API slug / version: `searchdb/v1alpha1`
- Product name: Cloud Essentials for OpenSearch (Public Beta)
- Scope: **region-scoped**. Available region: `fr-par` only (at time of writing).
- Base URL: `https://api.scaleway.com/searchdb/v1alpha1/regions/{region}`

Tools live in `src/tools/opensearch/`. Each endpoint below is annotated with the
MCP tool that invokes it. Verified against `src/tools/opensearch/handlers.ts`.

## Authentication
- Header: `X-Auth-Token: <secret_key>`

## Pagination
List endpoints return `{ <collection>: [...], total_count: number }` and accept
`page` (int, 1-indexed) and `page_size` (int) query parameters, plus an `order_by`
enum specific to each resource.

## Error codes
Standard Scaleway HTTP status codes: `400` invalid_input, `401`/`403`
permission_denied, `404` not_found, `429` rate_limited, `5xx` server_error.

## Entities

### Deployment
`{ id, name, organization_id, project_id, status, tags: string[], node_amount?
(deprecated), node_count, node_type, volume: Volume|null, endpoints: Endpoint[],
created_at, updated_at, version, region }`
- `status`: `unknown_status | ready | creating | initializing | upgrading |
  deleting | error | locked | locking | unlocking`

### Volume
`{ type: "unknown_type" | "sbs_5k" | "sbs_15k", size_bytes: number }`

### Endpoint
`{ id, dns_record? (deprecated), services: EndpointService[], public?: {} ,
private_network?: { private_network_id } }`
- `EndpointService`: `{ name, port, url }`

### NodeType
`{ stock_status: "unknown_stock" | "low_stock" | "out_of_stock" | "available",
name, description, vcpus, memory_bytes, disabled, beta, instance_range,
available_volume_types: NodeTypeVolumeType[] }`
- `NodeTypeVolumeType`: `{ type, description, min_size_bytes, max_size_bytes, chunk_size_bytes }`

### User
`{ username }`

### Version
`{ version, end_of_life?: date|null, disabled, beta }`

## Deployments

### List Deployments — `scaleway_opensearch_list_deployments`
`GET /deployments`
- Query: page, page_size, organization_id, project_id, name, tags (string[]), order_by
- order_by: `created_at_asc | created_at_desc | name_asc | name_desc | updated_at_asc | updated_at_desc`
- Response: `{ deployments: Deployment[], total_count: number }`

### Get Deployment — `scaleway_opensearch_get_deployment`
`GET /deployments/{deployment_id}`
- Response: Deployment object

### Create Deployment — `scaleway_opensearch_create_deployment`
`POST /deployments`
- Body: `{ name, node_type, version, project_id?, tags?, node_count?, user_name?,
  password?, volume?: { type, size_bytes }, endpoints?: EndpointSpec[] }`
- EndpointSpec: `{ public: {} }` OR `{ private_network: { private_network_id } }`
- Response: Deployment object (status: creating)

### Update Deployment — `scaleway_opensearch_update_deployment`
`PATCH /deployments/{deployment_id}`
- Body: `{ name?, tags? }`
- Response: Deployment object

### Upgrade Deployment — `scaleway_opensearch_upgrade_deployment`
`POST /deployments/{deployment_id}/upgrade`
- Body: precisely one of `{ node_count }` or `{ volume_size_bytes }` (node_amount deprecated)
- Response: Deployment object (status: upgrading)

### Delete Deployment — `scaleway_opensearch_delete_deployment`
`DELETE /deployments/{deployment_id}`
- Response: Deployment object (status: deleting)

### Download Certificate Authority — `scaleway_opensearch_get_certificate_authority`
`GET /deployments/{deployment_id}/certificate-authority`
- Response: file payload (name, content-type, content)

## Node Types

### List Node Types — `scaleway_opensearch_list_node_types`
`GET /node-types`
- Query: page, page_size, order_by
- order_by: `name_asc | name_desc | vcpus_asc | vcpus_desc | memory_asc | memory_desc`
- Response: `{ node_types: NodeType[], total_count: number }`

## Versions

### List Versions — `scaleway_opensearch_list_versions`
`GET /versions`
- Query: page, page_size, version, order_by
- order_by: `version_asc | version_desc`
- Response: `{ versions: Version[], total_count: number }`

## Users

### List Users — `scaleway_opensearch_list_users`
`GET /deployments/{deployment_id}/users`
- Query: page, page_size, name, order_by
- order_by: `name_asc | name_desc`
- Response: `{ users: User[], total_count: number }`

### Create User — `scaleway_opensearch_create_user`
`POST /deployments/{deployment_id}/users`
- Body: `{ username, password }`
- Response: User object

### Update User — `scaleway_opensearch_update_user`
`PATCH /deployments/{deployment_id}/users/{username}`
- Body: `{ password? }`
- Response: User object

### Delete User — `scaleway_opensearch_delete_user`
`DELETE /deployments/{deployment_id}/users/{username}`
- Response: empty (204)

## Endpoints

### Create Endpoint — `scaleway_opensearch_create_endpoint`
`POST /endpoints`
- Body: `{ deployment_id, endpoint_spec: { public: {} } | { private_network: { private_network_id } } }`
- Response: Endpoint object

### Delete Endpoint — `scaleway_opensearch_delete_endpoint`
`DELETE /endpoints/{endpoint_id}`
- Response: empty (204)

## Not exposed (no public API endpoint)

The product concepts documentation mentions **snapshots/backups** and **ACLs**,
but the `searchdb/v1alpha1` API surface exposes **no** endpoints for them (no
snapshot, backup, acl-rule, or allowed-IP paths exist in the reference or SDK).
They are therefore out of scope for this vertical until the API adds them.
