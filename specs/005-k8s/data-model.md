# Data Model: Scaleway Kubernetes (Kapsule & Kosmos) MCP Tools

**Feature**: 005-k8s | **Date**: 2026-03-11

## Entities

### Cluster

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Cluster unique identifier |
| name | string | yes | Cluster name |
| status | enum | yes | unknown, creating, ready, deleting, deleted, updating, locked, pool_required |
| version | string | yes | Kubernetes version (e.g., 1.30.2) |
| region | string | yes | Scaleway region (fr-par, nl-ams, pl-waw) |
| project_id | string (UUID) | yes | Project ID |
| cni | enum | yes | CNI plugin: unknown_cni, cilium, calico, kilo, flannel, none |
| description | string | no | Cluster description |
| tags | string[] | no | User-defined tags |
| type | enum | yes | Cluster type: unknown, kapsule, multicloud |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last modification timestamp |
| cluster_url | string | no | Cluster API server URL |
| dns_wildcard | string | no | Wildcard DNS resolving to cluster nodes |
| upgrade_available | boolean | no | Whether an upgrade is available |
| autoscaler_config | object | no | Cluster autoscaler configuration |
| auto_upgrade | object | no | Auto-upgrade policy configuration |
| feature_gates | string[] | no | Enabled Kubernetes feature gates |
| admission_plugins | string[] | no | Enabled admission plugins |

### NodePool

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Node pool unique identifier |
| cluster_id | string (UUID) | yes | Parent cluster ID |
| name | string | yes | Node pool name |
| node_type | string | yes | Commercial node type (e.g., DEV1-M, GP1-S) |
| size | number | yes | Current number of nodes |
| min_size | number | yes | Minimum for autoscaling |
| max_size | number | yes | Maximum for autoscaling |
| status | enum | yes | unknown, ready, deleting, creating, scaling, warning, locked, upgrading |
| autoscaling | boolean | yes | Whether autoscaling is enabled |
| autohealing | boolean | yes | Whether autohealing is enabled |
| version | string | yes | Kubernetes version of pool |
| tags | string[] | no | User-defined tags |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last modification timestamp |
| region | string | yes | Scaleway region |
| container_runtime | string | no | Container runtime (containerd) |
| root_volume_type | string | no | Root volume type (default_volume, l_ssd, b_ssd) |
| root_volume_size | number | no | Root volume size in bytes |
| placement_group_id | string (UUID)/null | no | Placement group for pool nodes |

### Version

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Version string (e.g., "1.30.2") |
| label | string | no | Human-readable label |
| available_cnis | CNI[] | yes | Available CNI plugins for this version |
| available_container_runtimes | string[] | no | Available container runtimes |
| available_feature_gates | string[] | no | Available feature gates |
| available_admission_plugins | string[] | no | Available admission plugins |

### CNI

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | CNI plugin name (cilium, calico, kilo, flannel, none) |
| versions | string[] | yes | Supported versions of this CNI |

## Enums

### ClusterStatus
`unknown` | `creating` | `ready` | `deleting` | `deleted` | `updating` | `locked` | `pool_required`

### ClusterCni
`unknown_cni` | `cilium` | `calico` | `kilo` | `flannel` | `none`

### ClusterType
`unknown` | `kapsule` | `multicloud`

### PoolStatus
`unknown` | `ready` | `deleting` | `creating` | `scaling` | `warning` | `locked` | `upgrading`
