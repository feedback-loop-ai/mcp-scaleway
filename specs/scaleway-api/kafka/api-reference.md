# Scaleway Clusters for Apache Kafka® API Reference

Product status: **Public Beta**.

Base URL: `https://api.scaleway.com/kafka/v1alpha1/regions/{region}`

- API slug: `clusters-for-kafka` (product), service path `kafka`
- Version: `v1alpha1`
- Scope: **Regional** (currently `fr-par`)
- Source: https://www.scaleway.com/en/developers/api/clusters-for-kafka/
- Authoritative types cross-checked against the Go SDK: https://pkg.go.dev/github.com/scaleway/scaleway-sdk-go/api/kafka/v1alpha1

## Authentication

- Header: `X-Auth-Token: <secret_key>`
- Mutations send `Content-Type: application/json`

## Pagination

List endpoints accept `page` (int, 1-indexed) and `page_size` (int) query params and return
`{ <collection>: [...], total_count: number }`.

## Error codes

Standard Scaleway error codes: `400` invalid input, `401`/`403` permission denied, `404` not found,
`429` rate limited, `5xx` server error.

## Clusters

### List Clusters
`GET /clusters`
- Query: `page`, `page_size`, `project_id`, `organization_id`, `name`, `tags` (repeatable), `order_by`
  (`created_at_asc|created_at_desc|name_asc|name_desc|status_asc|status_desc`)
- Response: `{ clusters: Cluster[], total_count: number }`

### Get Cluster
`GET /clusters/{cluster_id}`
- Response: `Cluster`

### Create Cluster
`POST /clusters`
- Body: `{ project_id?, name, version, tags?, node_amount, node_type, volume: { size_bytes, type }, endpoints?: EndpointSpec[], user_name?, password? }`
- Response: `Cluster` (status `creating`)

### Update Cluster
`PATCH /clusters/{cluster_id}`
- Body: `{ name?, tags? }`
- Response: `Cluster`

### Delete Cluster
`DELETE /clusters/{cluster_id}`
- Response: `Cluster` (status `deleting`)

### Get Cluster Certificate Authority
`GET /clusters/{cluster_id}/certificate-authority`
- Response: certificate file (PEM content)

### Renew Cluster Certificate Authority
`POST /clusters/{cluster_id}/renew-certificate-authority`
- Body: `{}`
- Response: certificate file (PEM content)

## Endpoints

An `EndpointSpec` is a one-of: `{ private_network: { private_network_id } }` or `{ public_network: {} }`.
During Public Beta access is via private endpoints only (attach to a Private Network).

### Create Endpoint
`POST /endpoints`
- Body: `{ cluster_id, endpoint: EndpointSpec }`
- Response: `Endpoint`

### Delete Endpoint
`DELETE /endpoints/{endpoint_id}`
- Response: empty (204)

## Users

### List Users
`GET /clusters/{cluster_id}/users`
- Query: `page`, `page_size`, `name`, `order_by` (`name_asc|name_desc`)
- Response: `{ users: User[], total_count: number }`

### Update User
`PATCH /clusters/{cluster_id}/users/{username}`
- Body: `{ password? }`
- Response: `User`

## Node Types

### List Node Types
`GET /node-types`
- Query: `page`, `page_size`, `include_disabled_types` (bool)
- Response: `{ node_types: NodeType[], total_count: number }`

## Versions

### List Versions
`GET /versions`
- Query: `page`, `page_size`, `version`
- Response: `{ versions: Version[], total_count: number }`

## Entities

### Cluster
`{ id, name, project_id, organization_id, status, version, tags[], settings?: ClusterSetting[], node_amount, node_type, volume?: Volume, endpoints?: Endpoint[], created_at?, updated_at?, region }`

- `status`: `unknown_status | ready | creating | configuring | deleting | error | locked | stopped`

### Volume
`{ type: VolumeType, size_bytes }` — `VolumeType`: `unknown_type | sbs_5k | sbs_15k`

### ClusterSetting
`{ name, bool_value? | string_value? | int_value? | float_value? }` (one value field set)

### Endpoint
`{ id, dns_records[]?, port?, private_network?: { private_network_id } | public_network?: {} }`

### User
`{ username }`

### NodeType
`{ name, stock_status, description, vcpus, memory_bytes, available_volume_types?: NodeTypeVolumeType[], disabled, beta, cluster_range? }`

- `stock_status`: `unknown_stock | low_stock | out_of_stock | available`
- `NodeTypeVolumeType`: `{ type, description, min_size_bytes, max_size_bytes, chunk_size_bytes }`

### Version
`{ version, end_of_life_at?, available_settings?: VersionAvailableSetting[] }`

- `VersionAvailableSetting`: `{ name, hot_configurable, description }`
