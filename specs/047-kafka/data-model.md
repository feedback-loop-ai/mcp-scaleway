# Data Model: Clusters for Apache Kafka® MCP Tools

**Feature**: 047-kafka | **Date**: 2026-07-07

## Entities

### Cluster

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique cluster identifier |
| name | string | yes | Cluster name |
| project_id | string (UUID) | yes | Project ID |
| organization_id | string (UUID) | yes | Organization ID |
| status | enum | yes | unknown_status, ready, creating, configuring, deleting, error, locked, stopped |
| version | string | yes | Apache Kafka version |
| tags | string[] | yes | User-defined tags |
| settings | ClusterSetting[] | no | Effective cluster settings |
| node_amount | number | yes | Number of nodes (brokers) |
| node_type | string | yes | Node type name |
| volume | Volume | no | Per-node volume |
| endpoints | Endpoint[] | no | Cluster endpoints |
| created_at | string (ISO 8601) | no | Creation timestamp |
| updated_at | string (ISO 8601) | no | Last modification timestamp |
| region | string | yes | Scaleway region |

### Volume

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | enum | yes | unknown_type, sbs_5k, sbs_15k |
| size_bytes | number | yes | Volume size in bytes |

### ClusterSetting

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Setting name |
| bool_value | boolean | no | Boolean value (one of the *_value fields set) |
| string_value | string | no | String value |
| int_value | number | no | Integer value |
| float_value | number | no | Float value |

### Endpoint

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique endpoint identifier |
| dns_records | string[] | no | DNS records for the endpoint |
| port | number | no | Kafka port |
| private_network | { private_network_id } | no | Private-network details (one-of) |
| public_network | {} | no | Public-network details (one-of) |

### User

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| username | string | yes | SASL principal / username |

### NodeType

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Node type name |
| stock_status | enum | yes | unknown_stock, low_stock, out_of_stock, available |
| description | string | yes | Human-readable description |
| vcpus | number | yes | Number of vCPUs |
| memory_bytes | number | yes | Memory in bytes |
| available_volume_types | NodeTypeVolumeType[] | no | Supported volume types |
| disabled | boolean | yes | Whether the node type is disabled |
| beta | boolean | yes | Whether the node type is in beta |
| cluster_range | string | no | Allowed node-count range |

### NodeTypeVolumeType

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | enum | yes | Volume type |
| description | string | yes | Description |
| min_size_bytes | number | yes | Minimum volume size |
| max_size_bytes | number | yes | Maximum volume size |
| chunk_size_bytes | number | yes | Resize chunk size |

### Version

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| version | string | yes | Kafka version string |
| end_of_life_at | string (ISO 8601) | no | End-of-life date |
| available_settings | VersionAvailableSetting[] | no | Configurable settings for this version |

### VersionAvailableSetting

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Setting name |
| hot_configurable | boolean | yes | Whether it can be changed without restart |
| description | string | yes | Description |

## Input-only shapes

### EndpointSpec (used when creating clusters/endpoints)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| privateNetworkId | string (UUID) | no | Attach endpoint to this Private Network |
| publicNetwork | boolean | no | Request a public-network endpoint |
