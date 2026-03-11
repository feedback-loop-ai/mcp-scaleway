# Data Model: Scaleway Managed Redis MCP Tools

**Feature**: 014-redis | **Date**: 2026-03-11

## Entities

### Cluster

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique cluster identifier |
| name | string | yes | Cluster name |
| version | string | yes | Redis version (e.g., "7.0.12") |
| status | enum | yes | unknown, ready, provisioning, configuring, deleting, error, autohealing, locked, suspended, initializing |
| region | string | yes | Region (e.g., fr-par) |
| project_id | string (UUID) | yes | Project ID |
| node_type | string | yes | Node type (e.g., RED1-XS) |
| cluster_size | number | yes | Number of nodes in the cluster |
| endpoints | Endpoint[] | yes | List of cluster endpoints |
| acl_rules | ACLRule[] | yes | List of ACL rules |
| tags | string[] | yes | User-defined tags |
| tls_enabled | boolean | yes | Whether TLS is enabled |
| cluster_settings | ClusterSetting[] | yes | Cluster configuration settings |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | no | Last update timestamp |
| user_name | string | yes | Default user name |

### ACLRule

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | ACL rule identifier |
| ip_cidr | string | yes | CIDR notation for allowed IP range (e.g., "192.168.1.0/24") |
| description | string | yes | Description of the ACL rule |

### ACLRuleSpec (input for creating/setting ACL rules)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| ip_cidr | string | yes | CIDR notation for allowed IP range |
| description | string | yes | Description of the ACL rule |

### Endpoint

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Endpoint identifier |
| ips | string[] | yes | List of IPs of the endpoint |
| port | number | yes | TCP port of the endpoint |

### EndpointSpec (input for creating/setting endpoints)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| private_network | object | no | Private network config: { id: string, service_ips: string[] } |
| public | object | no | Public endpoint config (empty object to enable) |

### ClusterSetting

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Setting name (e.g., "maxmemory-policy") |
| value | string | yes | Setting value (e.g., "allkeys-lru") |

### NodeType

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Node type name (e.g., RED1-XS) |
| description | string | yes | Human-readable description |
| memory | number | yes | Memory in bytes |
| available_cluster_sizes | number[] | yes | Available cluster sizes for this node type |
| disabled | boolean | yes | Whether this node type is disabled |
| beta | boolean | yes | Whether this node type is in beta |

### Version

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| version | string | yes | Redis version string (e.g., "7.0.12") |
| available_settings | VersionSetting[] | yes | Available settings for this version |
| end_of_life_at | string (ISO 8601) | no | End of life date |
| logo_url | string | no | URL to the version logo |

### VersionSetting (nested within Version)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Setting name |
| default_value | string | yes | Default value |
| type | string | yes | Setting type |
| description | string | yes | Setting description |

### ClusterMetrics

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| timeseries | TimeSeries[] | yes | Time series data |

### TimeSeries (nested within ClusterMetrics)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Metric name (e.g., "cpu_usage_percent") |
| points | DataPoint[] | yes | Data points |

### DataPoint (nested within TimeSeries)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| timestamp | string (ISO 8601) | yes | Point timestamp |
| value | number | yes | Metric value |
