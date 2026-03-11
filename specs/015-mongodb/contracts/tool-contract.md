# Tool Contracts: Scaleway Managed MongoDB MCP Tools

**Feature**: 015-mongodb | **Date**: 2026-03-11

## Instance Tools

### scaleway_mongodb_list_instances

**Scaleway API**: `GET /mongodb/v1alpha1/regions/{region}/instances`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | default region | Region (e.g., fr-par) |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| name | string | no | - | Filter by instance name |
| tags | string[] | no | - | Filter by tags |
| project_id | string (UUID) | no | - | Filter by project ID |
| organization_id | string (UUID) | no | - | Filter by organization ID |
| order_by | enum | no | - | created_at_asc, created_at_desc, name_asc, name_desc, status_asc, status_desc |

**Output**: `{ items: Instance[], total_count: number, page: number, page_size: number, total_pages: number }`

---

### scaleway_mongodb_get_instance

**Scaleway API**: `GET /mongodb/v1alpha1/regions/{region}/instances/{instance_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| instance_id | string (UUID) | yes | Instance ID |

**Output**: `{ id, name, status, version, node_type, node_number, region, project_id, tags, volume, endpoints, created_at, updated_at }`

---

### scaleway_mongodb_create_instance

**Scaleway API**: `POST /mongodb/v1alpha1/regions/{region}/instances`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| project_id | string (UUID) | no | Project ID (defaults to SCW_DEFAULT_PROJECT_ID) |
| name | string | yes | Instance name |
| version | string | yes | MongoDB version (e.g., 7.0.12) |
| node_type | string | yes | Node type (e.g., MGDB-PLAY2-NANO) |
| node_number | number | yes | Number of nodes (min: 1) |
| user_name | string | yes | Initial admin username |
| password | string | yes | Initial admin password |
| tags | string[] | no | Tags |
| volume | object | no | Volume config: { volume_type: "sbs_5k" or "sbs_15k", volume_size: number } |

**Output**: `{ id, name, status, version, node_type, node_number, region, project_id, ... }`

---

### scaleway_mongodb_update_instance

**Scaleway API**: `PATCH /mongodb/v1alpha1/regions/{region}/instances/{instance_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| instance_id | string (UUID) | yes | Instance ID |
| name | string | no | New instance name |
| tags | string[] | no | New tags |

**Output**: `{ id, name, status, version, node_type, node_number, region, project_id, tags, ... }`

---

### scaleway_mongodb_delete_instance

**Scaleway API**: `DELETE /mongodb/v1alpha1/regions/{region}/instances/{instance_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| instance_id | string (UUID) | yes | Instance ID |

**Output**: Instance object (deletion in progress)

---

## User Tools

### scaleway_mongodb_list_users

**Scaleway API**: `GET /mongodb/v1alpha1/regions/{region}/instances/{instance_id}/users`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | default region | Region (e.g., fr-par) |
| instance_id | string (UUID) | yes | - | Instance ID |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| name | string | no | - | Filter by user name |
| order_by | enum | no | - | name_asc, name_desc |

**Output**: `{ items: User[], total_count: number, page: number, page_size: number, total_pages: number }`

---

### scaleway_mongodb_create_user

**Scaleway API**: `POST /mongodb/v1alpha1/regions/{region}/instances/{instance_id}/users`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| instance_id | string (UUID) | yes | Instance ID |
| name | string | yes | Username |
| password | string | yes | Password |

**Output**: `{ name }`

---

### scaleway_mongodb_update_user

**Scaleway API**: `PATCH /mongodb/v1alpha1/regions/{region}/instances/{instance_id}/users/{name}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| instance_id | string (UUID) | yes | Instance ID |
| name | string | yes | Username |
| password | string | no | New password |

**Output**: `{ name }`

---

### scaleway_mongodb_delete_user

**Scaleway API**: `DELETE /mongodb/v1alpha1/regions/{region}/instances/{instance_id}/users/{name}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| instance_id | string (UUID) | yes | Instance ID |
| name | string | yes | Username |

**Output**: `{ message: "User '{name}' deleted successfully" }`

---

## Snapshot Tools

### scaleway_mongodb_list_snapshots

**Scaleway API**: `GET /mongodb/v1alpha1/regions/{region}/snapshots`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | default region | Region (e.g., fr-par) |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| instance_id | string (UUID) | no | - | Filter by instance ID |
| name | string | no | - | Filter by snapshot name |
| project_id | string (UUID) | no | - | Filter by project ID |
| organization_id | string (UUID) | no | - | Filter by organization ID |
| order_by | enum | no | - | created_at_asc, created_at_desc, name_asc, name_desc |

**Output**: `{ items: Snapshot[], total_count: number, page: number, page_size: number, total_pages: number }`

---

### scaleway_mongodb_create_snapshot

**Scaleway API**: `POST /mongodb/v1alpha1/regions/{region}/instances/{instance_id}/snapshots`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| instance_id | string (UUID) | yes | Instance ID |
| name | string | yes | Snapshot name |
| expires_at | string (ISO 8601) | no | Expiration date |

**Output**: `{ id, name, status, instance_id, instance_name, size, expires_at, created_at }`

---

### scaleway_mongodb_restore_snapshot

**Scaleway API**: `POST /mongodb/v1alpha1/regions/{region}/snapshots/{snapshot_id}/restore`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| snapshot_id | string (UUID) | yes | Snapshot ID |
| instance_name | string | yes | Name for the restored instance |
| node_type | string | yes | Node type for restored instance |
| node_number | number | yes | Number of nodes (min: 1) |
| volume | object | no | Volume config: { volume_type: "sbs_5k" or "sbs_15k", volume_size: number } |

**Output**: `{ id, name, status, version, node_type, node_number, ... }` (new instance)

---

### scaleway_mongodb_delete_snapshot

**Scaleway API**: `DELETE /mongodb/v1alpha1/regions/{region}/snapshots/{snapshot_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| snapshot_id | string (UUID) | yes | Snapshot ID |

**Output**: Snapshot object (deletion in progress)

---

## Node Type & Version Tools

### scaleway_mongodb_list_node_types

**Scaleway API**: `GET /mongodb/v1alpha1/regions/{region}/node-types`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | default region | Region (e.g., fr-par) |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| include_disabled_types | boolean | no | - | Include disabled node types |

**Output**: `{ items: NodeType[], total_count: number, page: number, page_size: number, total_pages: number }`

---

### scaleway_mongodb_list_versions

**Scaleway API**: `GET /mongodb/v1alpha1/regions/{region}/versions`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | default region | Region (e.g., fr-par) |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| version | string | no | - | Filter by version string |

**Output**: `{ items: Version[], total_count: number, page: number, page_size: number, total_pages: number }`
