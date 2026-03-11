# Tool Contracts: Scaleway Managed Redis MCP Tools

**Feature**: 014-redis | **Date**: 2026-03-11

## Cluster Tools

### scaleway_redis_list_clusters

**Scaleway API**: `GET /redis/v1/regions/{region}/clusters`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | fr-par | Region (e.g., fr-par) |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| project_id | string | no | - | Filter by project ID |
| name | string | no | - | Filter by cluster name |
| tags | string[] | no | - | Filter by tags |
| order_by | enum | no | - | created_at_asc, created_at_desc, name_asc, name_desc |
| organization_id | string | no | - | Filter by organization ID |

**Output**: `{ items: Cluster[], total_count: number, page: number, page_size: number }`

---

### scaleway_redis_get_cluster

**Scaleway API**: `GET /redis/v1/regions/{region}/clusters/{cluster_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region of the cluster |
| cluster_id | string | yes | Cluster UUID |

**Output**: `{ id, name, version, status, region, project_id, node_type, cluster_size, endpoints, acl_rules, tags, tls_enabled, cluster_settings, created_at, updated_at, user_name }`

---

### scaleway_redis_create_cluster

**Scaleway API**: `POST /redis/v1/regions/{region}/clusters`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region to create the cluster in |
| project_id | string | yes | Project ID |
| name | string | yes | Cluster name |
| version | string | yes | Redis version |
| node_type | string | yes | Node type (e.g., RED1-XS) |
| cluster_size | number | yes | Number of nodes (min 1) |
| user_name | string | yes | Default user name |
| password | string | yes | Default user password |
| tags | string[] | no | Tags |
| tls_enabled | boolean | no | Enable TLS |
| cluster_settings | ClusterSetting[] | no | Cluster settings |
| acl_rules | ACLRuleSpec[] | no | ACL rules |
| endpoints | EndpointSpec[] | no | Endpoints |

**Output**: `{ id, name, version, status, ... }` (full Cluster object)

---

### scaleway_redis_update_cluster

**Scaleway API**: `PATCH /redis/v1/regions/{region}/clusters/{cluster_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region of the cluster |
| cluster_id | string | yes | Cluster UUID |
| name | string | no | New cluster name |
| tags | string[] | no | New tags |
| user_name | string | no | New user name |
| password | string | no | New password |

**Output**: `{ id, name, version, status, ... }` (full Cluster object)

---

### scaleway_redis_delete_cluster

**Scaleway API**: `DELETE /redis/v1/regions/{region}/clusters/{cluster_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region of the cluster |
| cluster_id | string | yes | Cluster UUID |

**Output**: `{ id, name, version, status, ... }` (full Cluster object, status: deleting)

---

## Metrics & Certificate Tools

### scaleway_redis_list_cluster_metrics

**Scaleway API**: `GET /redis/v1/regions/{region}/clusters/{cluster_id}/metrics`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region of the cluster |
| cluster_id | string | yes | Cluster UUID |
| start_at | string | no | Start of time range (ISO 8601) |
| end_at | string | no | End of time range (ISO 8601) |
| metric_name | string | no | Specific metric to retrieve |

**Output**: `{ timeseries: [{ name, points: [{ timestamp, value }] }] }`

---

### scaleway_redis_get_cluster_certificate

**Scaleway API**: `GET /redis/v1/regions/{region}/clusters/{cluster_id}/certificate`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region of the cluster |
| cluster_id | string | yes | Cluster UUID |

**Output**: `{ content: string }` (PEM-encoded certificate)

---

### scaleway_redis_renew_cluster_certificate

**Scaleway API**: `POST /redis/v1/regions/{region}/clusters/{cluster_id}/renew-certificate`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region of the cluster |
| cluster_id | string | yes | Cluster UUID |

**Output**: `{ id, name, version, status, ... }` (full Cluster object)

---

## ACL Rule Tools

### scaleway_redis_add_acl_rules

**Scaleway API**: `POST /redis/v1/regions/{region}/clusters/{cluster_id}/acls`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region of the cluster |
| cluster_id | string | yes | Cluster UUID |
| acl_rules | ACLRuleSpec[] | yes | Rules to add (ip_cidr, description) |

**Output**: `{ acl_rules: ACLRule[] }` (list of all ACL rules after addition)

---

### scaleway_redis_delete_acl_rules

**Scaleway API**: `DELETE /redis/v1/regions/{region}/clusters/{cluster_id}/acls`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region of the cluster |
| cluster_id | string | yes | Cluster UUID |
| acl_rule_ids | string[] | yes | IDs of ACL rules to delete |

**Output**: `{ acl_rules: ACLRule[] }` (list of remaining ACL rules)

---

### scaleway_redis_set_acl_rules

**Scaleway API**: `PUT /redis/v1/regions/{region}/clusters/{cluster_id}/acls`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region of the cluster |
| cluster_id | string | yes | Cluster UUID |
| acl_rules | ACLRuleSpec[] | yes | Rules to set (replaces all existing) |

**Output**: `{ acl_rules: ACLRule[] }` (list of all ACL rules after replacement)

---

## Endpoint Tools

### scaleway_redis_add_endpoints

**Scaleway API**: `POST /redis/v1/regions/{region}/clusters/{cluster_id}/endpoints`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region of the cluster |
| cluster_id | string | yes | Cluster UUID |
| endpoints | EndpointSpec[] | yes | Endpoints to add |

**Output**: `{ endpoints: Endpoint[] }` (list of all endpoints after addition)

---

### scaleway_redis_delete_endpoints

**Scaleway API**: `DELETE /redis/v1/regions/{region}/clusters/{cluster_id}/endpoints/{endpoint_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region of the cluster |
| cluster_id | string | yes | Cluster UUID |
| endpoint_id | string | yes | Endpoint UUID to delete |

**Output**: `{}` (empty on success)

---

### scaleway_redis_set_endpoints

**Scaleway API**: `PUT /redis/v1/regions/{region}/clusters/{cluster_id}/endpoints`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region of the cluster |
| cluster_id | string | yes | Cluster UUID |
| endpoints | EndpointSpec[] | yes | Endpoints to set (replaces all existing) |

**Output**: `{ endpoints: Endpoint[] }` (list of all endpoints after replacement)

---

## Discovery Tools

### scaleway_redis_list_node_types

**Scaleway API**: `GET /redis/v1/regions/{region}/node-types`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | fr-par | Region |
| page | number | no | 1 | Page number |
| pageSize | number | no | 50 | Items per page |
| include_disabled_types | boolean | no | - | Include disabled node types |

**Output**: `{ items: NodeType[], total_count: number, page: number, page_size: number }`

---

### scaleway_redis_list_cluster_versions

**Scaleway API**: `GET /redis/v1/regions/{region}/cluster-versions`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | fr-par | Region |
| page | number | no | 1 | Page number |
| pageSize | number | no | 50 | Items per page |
| include_disabled | boolean | no | - | Include disabled versions |
| include_beta | boolean | no | - | Include beta versions |
| include_deprecated | boolean | no | - | Include deprecated versions |
| version | string | no | - | Filter by specific version string |

**Output**: `{ items: Version[], total_count: number, page: number, page_size: number }`
