# Data Model: Scaleway RabbitMQ (MessageQ) MCP Tools

**Feature**: 050-rabbitmq | **Date**: 2026-07-07

## Entities

### Deployment

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique deployment identifier |
| name | string | yes | Deployment name |
| organization_id | string (UUID) | yes | Organization ID |
| project_id | string (UUID) | yes | Project ID |
| status | enum | yes | unknown_status, ready, creating, initializing, upgrading, deleting, error, locked, locking, unlocking |
| tags | string[] | yes | User-defined tags |
| node_count | number | yes | Number of nodes |
| node_type | string | yes | Node type used |
| volume | Volume \| null | yes | Volume type and size |
| endpoints | Endpoint[] | yes | Exposed endpoints |
| version | string | yes | RabbitMQ (MessageQ) version |
| region | string | yes | Scaleway region |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last modification timestamp |

### Volume

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | enum | yes | unknown_type, sbs_5k, sbs_15k |
| size_bytes | number | yes | Volume size in bytes |

### Endpoint

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique endpoint identifier |
| dns_record | string \| null | no | Deprecated; use services[].url |
| services | EndpointService[] | yes | Available services (name, port, url) |
| public | {} | no | Present for public endpoints |
| private_network | { private_network_id } | no | Present for Private Network endpoints |

### EndpointService

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Service name (e.g. amqps) |
| port | number | yes | Service port |
| url | string | yes | Connection URL |

### EndpointSpec (input only)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| is_public | boolean | no | Create a public endpoint |
| private_network_id | string (UUID) | no | Private Network ID for a private endpoint (takes precedence) |

### User

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| username | string | yes | Username (users are keyed by username; no UUID) |

### NodeType

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Node type name |
| description | string | yes | Human-readable description |
| stock_status | enum | yes | unknown_stock, low_stock, out_of_stock, available |
| vcpus | number | yes | Number of vCPUs |
| memory_bytes | number | yes | Memory in bytes |
| disabled | boolean | yes | Whether the node type is disabled |
| beta | boolean | yes | Whether the node type is in beta |
| instance_range | string | yes | Instance range for the node type offer |
| available_volume_types | NodeTypeVolumeType[] | yes | Storage options |

### NodeTypeVolumeType

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | enum | yes | Volume type |
| description | string | yes | Description |
| min_size_bytes | number | yes | Minimum size |
| max_size_bytes | number | yes | Maximum size |
| chunk_size_bytes | number | yes | Allocation chunk size |

### Version

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| version | string | yes | RabbitMQ (MessageQ) version |
| end_of_life | string (ISO 8601) \| null | no | Date support ends |
| disabled | boolean | yes | Whether the version is disabled |
| beta | boolean | yes | Whether the version is in beta |
