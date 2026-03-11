# Tool Contracts: Scaleway Block Storage MCP Tools

**Feature**: 011-block-storage | **Date**: 2026-03-11

## Volume Tools

### scaleway_block_storage_list_volumes

**Scaleway API**: `GET /block/v1alpha1/zones/{zone}/volumes`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| zone | string | no | default zone | Availability zone (e.g., fr-par-1) |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| projectId | string | no | - | Filter by project ID |
| name | string | no | - | Filter by volume name |
| status | enum | no | - | Filter by status (available, in_use, creating, etc.) |

**Output**: `{ data: Volume[], total_count: number, page: number, page_size: number, total_pages: number }`

---

### scaleway_block_storage_get_volume

**Scaleway API**: `GET /block/v1alpha1/zones/{zone}/volumes/{volume_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| volumeId | string (UUID) | yes | Volume UUID |

**Output**: `{ volume: Volume }`

---

### scaleway_block_storage_create_volume

**Scaleway API**: `POST /block/v1alpha1/zones/{zone}/volumes`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| name | string | yes | Volume name (min 1 char) |
| projectId | string (UUID) | no | Project ID (defaults to SCW_DEFAULT_PROJECT_ID) |
| fromEmpty | object | no | Create empty volume: `{ size: number }` (bytes) |
| fromSnapshot | object | no | Create from snapshot: `{ snapshotId: string, size?: number }` |
| perfIops | number | no | Maximum IOPS |
| tags | string[] | no | Tags |

**Output**: `{ volume: Volume }`

**Notes**: Exactly one of `fromEmpty` or `fromSnapshot` should be provided.

---

### scaleway_block_storage_update_volume

**Scaleway API**: `PATCH /block/v1alpha1/zones/{zone}/volumes/{volume_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| volumeId | string (UUID) | yes | Volume UUID |
| name | string | no | New volume name |
| size | number | no | New size in bytes (can only grow) |
| perfIops | number | no | New IOPS limit |
| tags | string[] | no | New tags |

**Output**: `{ volume: Volume }`

---

### scaleway_block_storage_delete_volume

**Scaleway API**: `DELETE /block/v1alpha1/zones/{zone}/volumes/{volume_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| volumeId | string (UUID) | yes | Volume UUID |

**Output**: `{ success: true, volumeId: string }`

---

## Snapshot Tools

### scaleway_block_storage_list_snapshots

**Scaleway API**: `GET /block/v1alpha1/zones/{zone}/snapshots`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| zone | string | no | default zone | Availability zone |
| page | number | no | 1 | Page number |
| pageSize | number | no | 50 | Items per page |
| projectId | string | no | - | Filter by project ID |
| name | string | no | - | Filter by snapshot name |
| volumeId | string (UUID) | no | - | Filter by source volume ID |
| status | enum | no | - | Filter by status |

**Output**: `{ data: Snapshot[], total_count: number, page: number, page_size: number, total_pages: number }`

---

### scaleway_block_storage_get_snapshot

**Scaleway API**: `GET /block/v1alpha1/zones/{zone}/snapshots/{snapshot_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| snapshotId | string (UUID) | yes | Snapshot UUID |

**Output**: `{ snapshot: Snapshot }`

---

### scaleway_block_storage_create_snapshot

**Scaleway API**: `POST /block/v1alpha1/zones/{zone}/snapshots`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| name | string | yes | Snapshot name (min 1 char) |
| projectId | string (UUID) | no | Project ID (defaults to SCW_DEFAULT_PROJECT_ID) |
| volumeId | string (UUID) | yes | Source volume UUID |
| tags | string[] | no | Tags |

**Output**: `{ snapshot: Snapshot }`

---

### scaleway_block_storage_update_snapshot

**Scaleway API**: `PATCH /block/v1alpha1/zones/{zone}/snapshots/{snapshot_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| snapshotId | string (UUID) | yes | Snapshot UUID |
| name | string | no | New snapshot name |
| tags | string[] | no | New tags |

**Output**: `{ snapshot: Snapshot }`

---

### scaleway_block_storage_delete_snapshot

**Scaleway API**: `DELETE /block/v1alpha1/zones/{zone}/snapshots/{snapshot_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| snapshotId | string (UUID) | yes | Snapshot UUID |

**Output**: `{ success: true, snapshotId: string }`

---

## Volume Type Tools

### scaleway_block_storage_list_volume_types

**Scaleway API**: `GET /block/v1alpha1/zones/{zone}/volume-types`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| zone | string | no | default zone | Availability zone |
| page | number | no | 1 | Page number |
| pageSize | number | no | 50 | Items per page |

**Output**: `{ data: VolumeTypeInfo[], total_count: number, page: number, page_size: number, total_pages: number }`
