# Tool Contracts: Scaleway RabbitMQ (MessageQ) MCP Tools

**Feature**: 050-rabbitmq | **Date**: 2026-07-07

All paths are prefixed with `/messageq/v1alpha1/regions/{region}`. Auth:
`X-Auth-Token: <secret_key>`. List outputs are wrapped as
`{ items, totalCount, page, pageSize }`.

## Deployment Tools

### scaleway_rabbitmq_list_deployments
**API**: `GET /deployments`

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | yes | - | Scaleway region (fr-par) |
| organization_id | string (UUID) | no | - | Filter by Organization ID |
| project_id | string (UUID) | no | - | Filter by Project ID |
| name | string | no | - | Filter by name substring |
| tags | string[] | no | - | Filter by matching tags |
| order_by | enum | no | - | created_at_asc/desc, name_asc/desc, updated_at_asc/desc |
| page | number | no | 1 | Page number |
| pageSize | number | no | 50 | Items per page (1-100) |

**Output**: `{ items: Deployment[], totalCount, page, pageSize }`

### scaleway_rabbitmq_get_deployment
**API**: `GET /deployments/{deployment_id}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| deployment_id | string (UUID) | yes | Deployment ID |

**Output**: Deployment object

### scaleway_rabbitmq_create_deployment
**API**: `POST /deployments`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| name | string | yes | Deployment name |
| node_type | string | yes | Node type (see list_node_types) |
| node_count | number | yes | Number of nodes |
| version | string | yes | RabbitMQ version |
| project_id | string (UUID) | no | Project ID (default if omitted) |
| tags | string[] | no | Tags |
| user_name | string | no | Initial user username |
| password | string | no | Initial user password |
| volume | { type, size_bytes } | no | Data volume |
| endpoints | EndpointSpec[] | no | Endpoints ({ is_public } or { private_network_id }) |

**Output**: Deployment object (status: creating)

### scaleway_rabbitmq_update_deployment
**API**: `PATCH /deployments/{deployment_id}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| deployment_id | string (UUID) | yes | Deployment ID |
| name | string | no | New name |
| tags | string[] | no | New tags |

**Output**: Deployment object

### scaleway_rabbitmq_upgrade_deployment
**API**: `POST /deployments/{deployment_id}/upgrade`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| deployment_id | string (UUID) | yes | Deployment ID |
| node_count | number | conditional | Target node count (exactly one of node_count/volume_size_bytes) |
| volume_size_bytes | number | conditional | Target volume size in bytes |

**Output**: Deployment object (status: upgrading)

### scaleway_rabbitmq_delete_deployment
**API**: `DELETE /deployments/{deployment_id}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| deployment_id | string (UUID) | yes | Deployment ID |

**Output**: Deployment object (status: deleting)

### scaleway_rabbitmq_get_deployment_certificate
**API**: `GET /deployments/{deployment_id}/certificate-authority`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| deployment_id | string (UUID) | yes | Deployment ID |

**Output**: certificate authority file content

## User Tools

### scaleway_rabbitmq_list_users
**API**: `GET /deployments/{deployment_id}/users`

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | yes | - | Scaleway region |
| deployment_id | string (UUID) | yes | - | Deployment ID |
| name | string | no | - | Filter by username substring |
| order_by | enum | no | - | name_asc, name_desc |
| page | number | no | 1 | Page number |
| pageSize | number | no | 50 | Items per page |

**Output**: `{ items: User[], totalCount, page, pageSize }`

### scaleway_rabbitmq_create_user
**API**: `POST /deployments/{deployment_id}/users`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| deployment_id | string (UUID) | yes | Deployment ID |
| username | string | yes | Username |
| password | string | yes | Password |

**Output**: User object

### scaleway_rabbitmq_update_user
**API**: `PATCH /deployments/{deployment_id}/users/{username}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| deployment_id | string (UUID) | yes | Deployment ID |
| username | string | yes | Username |
| password | string | no | New password |

**Output**: User object

### scaleway_rabbitmq_delete_user
**API**: `DELETE /deployments/{deployment_id}/users/{username}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| deployment_id | string (UUID) | yes | Deployment ID |
| username | string | yes | Username |

**Output**: `{ deleted: true, username }`

## Endpoint Tools

### scaleway_rabbitmq_create_endpoint
**API**: `POST /endpoints`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| deployment_id | string (UUID) | yes | Deployment ID |
| is_public | boolean | no | Create a public endpoint |
| private_network_id | string (UUID) | no | Private Network ID (takes precedence) |

**Output**: Endpoint object

### scaleway_rabbitmq_delete_endpoint
**API**: `DELETE /endpoints/{endpoint_id}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| endpoint_id | string (UUID) | yes | Endpoint ID |

**Output**: `{ deleted: true, id }`

## Catalog Tools

### scaleway_rabbitmq_list_node_types
**API**: `GET /node-types`

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | yes | - | Scaleway region |
| order_by | enum | no | - | name_asc/desc, vcpus_asc/desc, memory_asc/desc |
| page | number | no | 1 | Page number |
| pageSize | number | no | 50 | Items per page |

**Output**: `{ items: NodeType[], totalCount, page, pageSize }`

### scaleway_rabbitmq_list_versions
**API**: `GET /versions`

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | yes | - | Scaleway region |
| version | string | no | - | Filter by engine version |
| order_by | enum | no | - | version_asc, version_desc |
| page | number | no | 1 | Page number |
| pageSize | number | no | 50 | Items per page |

**Output**: `{ items: Version[], totalCount, page, pageSize }`
