# 005-k8s: Kubernetes (Kapsule & Kosmos) MCP Tools

## User Stories

### P1 - Cluster Management
- **US-K8S-01**: As a user, I can list all Kubernetes clusters in a region so I can see my infrastructure.
- **US-K8S-02**: As a user, I can get details of a specific cluster by ID.
- **US-K8S-03**: As a user, I can create a new Kubernetes cluster with a name, version, CNI, and description.
- **US-K8S-04**: As a user, I can delete a Kubernetes cluster by ID.

### P1 - Node Pool Management
- **US-K8S-05**: As a user, I can list node pools for a cluster.
- **US-K8S-06**: As a user, I can get details of a specific node pool.
- **US-K8S-07**: As a user, I can create a node pool with node type, size, and autoscaling config.
- **US-K8S-08**: As a user, I can update a node pool (size, autoscaling, tags).
- **US-K8S-09**: As a user, I can delete a node pool.
- **US-K8S-10**: As a user, I can upgrade a node pool to a new Kubernetes version.

### P2 - Cluster Operations
- **US-K8S-11**: As a user, I can retrieve the kubeconfig for a cluster.
- **US-K8S-12**: As a user, I can list available Kubernetes versions for a cluster.

### P3 - Cluster Upgrades
- **US-K8S-13**: As a user, I can upgrade a cluster to a newer Kubernetes version.

## Entities

### Cluster
| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Cluster unique identifier |
| name | string | Cluster name |
| status | enum | Cluster status (pool_required, creating, ready, deleting, ...) |
| version | string | Kubernetes version |
| region | string | Scaleway region (fr-par, nl-ams, pl-waw) |
| project_id | string | Project UUID |
| cni | enum | CNI plugin (cilium, calico, kilo, flannel, none) |
| description | string | Cluster description |
| tags | string[] | User tags |
| type | string | Cluster type (kapsule, multicloud/kosmos) |
| created_at | string | ISO 8601 timestamp |
| updated_at | string | ISO 8601 timestamp |

### NodePool
| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Node pool unique identifier |
| cluster_id | string (UUID) | Parent cluster ID |
| name | string | Node pool name |
| node_type | string | Commercial node type (e.g., DEV1-M) |
| size | number | Current number of nodes |
| min_size | number | Minimum for autoscaling |
| max_size | number | Maximum for autoscaling |
| status | enum | Node pool status |
| autoscaling | boolean | Whether autoscaling is enabled |
| autohealing | boolean | Whether autohealing is enabled |
| version | string | Kubernetes version of pool |
| tags | string[] | User tags |
| created_at | string | ISO 8601 timestamp |
| updated_at | string | ISO 8601 timestamp |

### Version
| Field | Type | Description |
|-------|------|-------------|
| name | string | Version string (e.g., "1.30.2") |
| available_cnis | object[] | Available CNI plugins for this version |

## MCP Tools

| Tool Name | Method | Endpoint | Priority |
|-----------|--------|----------|----------|
| scaleway_k8s_list_clusters | GET | /k8s/v1/regions/{region}/clusters | P1 |
| scaleway_k8s_get_cluster | GET | /k8s/v1/regions/{region}/clusters/{cluster_id} | P1 |
| scaleway_k8s_create_cluster | POST | /k8s/v1/regions/{region}/clusters | P1 |
| scaleway_k8s_delete_cluster | DELETE | /k8s/v1/regions/{region}/clusters/{cluster_id} | P1 |
| scaleway_k8s_upgrade_cluster | POST | /k8s/v1/regions/{region}/clusters/{cluster_id}/upgrade | P3 |
| scaleway_k8s_list_cluster_available_versions | GET | /k8s/v1/regions/{region}/clusters/{cluster_id}/available-versions | P2 |
| scaleway_k8s_get_cluster_kubeconfig | GET | /k8s/v1/regions/{region}/clusters/{cluster_id}/kubeconfig | P2 |
| scaleway_k8s_list_pools | GET | /k8s/v1/regions/{region}/clusters/{cluster_id}/pools | P1 |
| scaleway_k8s_get_pool | GET | /k8s/v1/regions/{region}/pools/{pool_id} | P1 |
| scaleway_k8s_create_pool | POST | /k8s/v1/regions/{region}/clusters/{cluster_id}/pools | P1 |
| scaleway_k8s_update_pool | PATCH | /k8s/v1/regions/{region}/pools/{pool_id} | P1 |
| scaleway_k8s_delete_pool | DELETE | /k8s/v1/regions/{region}/pools/{pool_id} | P1 |
| scaleway_k8s_upgrade_pool | POST | /k8s/v1/regions/{region}/pools/{pool_id}/upgrade | P1 |

## Checklist

- [x] Spec written
- [x] Entities defined
- [x] Tools listed with endpoints
- [x] Types file (src/tools/k8s/types.ts)
- [x] Handlers file (src/tools/k8s/handlers.ts)
- [x] Index file (src/tools/k8s/index.ts)
- [x] Unit tests (tests/unit/tools/k8s/)
- [x] Contract tests (tests/contract/tools/k8s/)
- [x] Parity matrix updated
- [x] Lint passes
- [x] Type check passes
- [x] Tests pass with 100% coverage
