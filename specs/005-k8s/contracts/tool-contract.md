# Tool Contracts: Scaleway Kubernetes (Kapsule & Kosmos) MCP Tools

**Feature**: 005-k8s | **Date**: 2026-03-11

## Cluster Tools

### scaleway_k8s_list_clusters

**Scaleway API**: `GET /k8s/v1/regions/{region}/clusters`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | yes | - | Scaleway region (e.g., fr-par, nl-ams, pl-waw) |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| project_id | string | no | - | Filter by project ID |
| name | string | no | - | Filter by cluster name |
| status | enum | no | - | Filter by status (unknown, creating, ready, deleting, deleted, updating, locked, pool_required) |
| type | enum | no | - | Filter by type (unknown, kapsule, multicloud) |

**Output**: `{ data: Cluster[], total_count: number, page: number, page_size: number, has_more: boolean }`

---

### scaleway_k8s_get_cluster

**Scaleway API**: `GET /k8s/v1/regions/{region}/clusters/{cluster_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| cluster_id | string (UUID) | yes | Cluster unique identifier |

**Output**: `{ cluster: Cluster }`

---

### scaleway_k8s_create_cluster

**Scaleway API**: `POST /k8s/v1/regions/{region}/clusters`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| name | string | yes | Cluster name |
| version | string | yes | Kubernetes version (e.g., 1.30.2) |
| cni | enum | yes | CNI plugin (unknown_cni, cilium, calico, kilo, flannel, none) |
| description | string | no | Cluster description |
| tags | string[] | no | User-defined tags |
| type | enum | no | Cluster type (unknown, kapsule, multicloud) |
| project_id | string (UUID) | no | Project ID (uses default if not provided) |

**Output**: `{ cluster: Cluster }`

---

### scaleway_k8s_delete_cluster

**Scaleway API**: `DELETE /k8s/v1/regions/{region}/clusters/{cluster_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| cluster_id | string (UUID) | yes | Cluster unique identifier |
| with_additional_resources | boolean | no | Delete associated resources (LBs, volumes) |

**Output**: `{ cluster: Cluster }` (cluster in deleting state)

---

### scaleway_k8s_upgrade_cluster

**Scaleway API**: `POST /k8s/v1/regions/{region}/clusters/{cluster_id}/upgrade`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| cluster_id | string (UUID) | yes | Cluster unique identifier |
| version | string | yes | Target Kubernetes version |
| upgrade_pools | boolean | no | Also upgrade all pools to the new version |

**Output**: `{ cluster: Cluster }`

---

### scaleway_k8s_list_cluster_available_versions

**Scaleway API**: `GET /k8s/v1/regions/{region}/clusters/{cluster_id}/available-versions`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| cluster_id | string (UUID) | yes | Cluster unique identifier |

**Output**: `{ versions: Version[] }`

---

### scaleway_k8s_get_cluster_kubeconfig

**Scaleway API**: `GET /k8s/v1/regions/{region}/clusters/{cluster_id}/kubeconfig`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| cluster_id | string (UUID) | yes | Cluster unique identifier |

**Output**: `{ kubeconfig: string }` (base64-encoded or raw YAML kubeconfig)

---

## Node Pool Tools

### scaleway_k8s_list_pools

**Scaleway API**: `GET /k8s/v1/regions/{region}/clusters/{cluster_id}/pools`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | yes | - | Scaleway region |
| cluster_id | string (UUID) | yes | - | Cluster unique identifier |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| name | string | no | - | Filter by pool name |
| status | enum | no | - | Filter by status (unknown, ready, deleting, creating, scaling, warning, locked, upgrading) |

**Output**: `{ data: NodePool[], total_count: number, page: number, page_size: number, has_more: boolean }`

---

### scaleway_k8s_get_pool

**Scaleway API**: `GET /k8s/v1/regions/{region}/pools/{pool_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| pool_id | string (UUID) | yes | Node pool unique identifier |

**Output**: `{ pool: NodePool }`

---

### scaleway_k8s_create_pool

**Scaleway API**: `POST /k8s/v1/regions/{region}/clusters/{cluster_id}/pools`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| cluster_id | string (UUID) | yes | Cluster unique identifier |
| name | string | yes | Node pool name |
| node_type | string | yes | Commercial node type (e.g., DEV1-M, GP1-S) |
| size | number | yes | Number of nodes (min: 1) |
| min_size | number | no | Minimum nodes for autoscaling (min: 0) |
| max_size | number | no | Maximum nodes for autoscaling (min: 1) |
| autoscaling | boolean | no | Enable autoscaling |
| autohealing | boolean | no | Enable autohealing |
| tags | string[] | no | User-defined tags |

**Output**: `{ pool: NodePool }`

---

### scaleway_k8s_update_pool

**Scaleway API**: `PATCH /k8s/v1/regions/{region}/pools/{pool_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| pool_id | string (UUID) | yes | Node pool unique identifier |
| size | number | no | Number of nodes |
| min_size | number | no | Minimum nodes for autoscaling |
| max_size | number | no | Maximum nodes for autoscaling |
| autoscaling | boolean | no | Enable autoscaling |
| autohealing | boolean | no | Enable autohealing |
| tags | string[] | no | User-defined tags |

**Output**: `{ pool: NodePool }`

---

### scaleway_k8s_delete_pool

**Scaleway API**: `DELETE /k8s/v1/regions/{region}/pools/{pool_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| pool_id | string (UUID) | yes | Node pool unique identifier |

**Output**: `{ pool: NodePool }` (pool in deleting state)

---

### scaleway_k8s_upgrade_pool

**Scaleway API**: `POST /k8s/v1/regions/{region}/pools/{pool_id}/upgrade`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| pool_id | string (UUID) | yes | Node pool unique identifier |
| version | string | yes | Target Kubernetes version |

**Output**: `{ pool: NodePool }`
