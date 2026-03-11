# Tool Contracts: Scaleway Instances MCP Tools

**Feature**: 002-instances | **Date**: 2026-03-11

## Server Tools

### scaleway_instances_list_servers

**Scaleway API**: `GET /instance/v1/zones/{zone}/servers`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| zone | string | yes | - | Availability zone (e.g., fr-par-1) |
| page | number | no | 1 | Page number (1-indexed) |
| page_size | number | no | 50 | Items per page (1-100) |
| project | string | no | - | Filter by project ID |
| name | string | no | - | Filter by name |
| tags | string[] | no | - | Filter by tags |
| state | string | no | - | Filter by state |

**Output**: `{ servers: Server[], total_count: number }`

---

### scaleway_instances_get_server

**Scaleway API**: `GET /instance/v1/zones/{zone}/servers/{server_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | yes | Availability zone |
| server_id | string | yes | Server UUID |

**Output**: `{ server: Server }`

---

### scaleway_instances_create_server

**Scaleway API**: `POST /instance/v1/zones/{zone}/servers`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | yes | Availability zone |
| name | string | yes | Server name |
| commercial_type | string | yes | Instance type (e.g., DEV1-S) |
| image | string | yes | Image UUID |
| project | string | no | Project ID |
| tags | string[] | no | Tags |
| dynamic_ip_required | boolean | no | Whether to assign a dynamic IP |

**Output**: `{ server: Server }`

---

### scaleway_instances_delete_server

**Scaleway API**: `DELETE /instance/v1/zones/{zone}/servers/{server_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | yes | Availability zone |
| server_id | string | yes | Server UUID |

**Output**: `{ success: true }`

---

### scaleway_instances_server_action

**Scaleway API**: `POST /instance/v1/zones/{zone}/servers/{server_id}/action`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | yes | Availability zone |
| server_id | string | yes | Server UUID |
| action | enum | yes | poweron, poweroff, reboot, terminate, stop_in_place, backup |

**Output**: `{ task: Task }`

---

## Volume Tools

### scaleway_instances_list_volumes

**Scaleway API**: `GET /instance/v1/zones/{zone}/volumes`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| zone | string | yes | - | Availability zone |
| page | number | no | 1 | Page number |
| page_size | number | no | 50 | Items per page |
| name | string | no | - | Filter by name |
| volume_type | string | no | - | Filter by type |
| project | string | no | - | Filter by project |

**Output**: `{ volumes: Volume[], total_count: number }`

---

### scaleway_instances_get_volume

**Scaleway API**: `GET /instance/v1/zones/{zone}/volumes/{volume_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | yes | Availability zone |
| volume_id | string | yes | Volume UUID |

**Output**: `{ volume: Volume }`

---

### scaleway_instances_create_volume

**Scaleway API**: `POST /instance/v1/zones/{zone}/volumes`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | yes | Availability zone |
| name | string | yes | Volume name |
| size | number | yes | Size in bytes |
| volume_type | enum | yes | l_ssd, b_ssd |
| project | string | no | Project ID |
| tags | string[] | no | Tags |

**Output**: `{ volume: Volume }`

---

### scaleway_instances_delete_volume

**Scaleway API**: `DELETE /instance/v1/zones/{zone}/volumes/{volume_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | yes | Availability zone |
| volume_id | string | yes | Volume UUID |

**Output**: `{ success: true }`

---

## Security Group Tools

### scaleway_instances_list_security_groups

**Scaleway API**: `GET /instance/v1/zones/{zone}/security_groups`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| zone | string | yes | - | Availability zone |
| page | number | no | 1 | Page number |
| page_size | number | no | 50 | Items per page |
| name | string | no | - | Filter by name |
| project | string | no | - | Filter by project |

**Output**: `{ security_groups: SecurityGroup[], total_count: number }`

---

### scaleway_instances_get_security_group

**Scaleway API**: `GET /instance/v1/zones/{zone}/security_groups/{security_group_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | yes | Availability zone |
| security_group_id | string | yes | Security group UUID |

**Output**: `{ security_group: SecurityGroup }`

---

### scaleway_instances_create_security_group

**Scaleway API**: `POST /instance/v1/zones/{zone}/security_groups`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | yes | Availability zone |
| name | string | yes | Security group name |
| description | string | no | Description |
| inbound_default_policy | enum | no | accept, drop (default: accept) |
| outbound_default_policy | enum | no | accept, drop (default: accept) |
| stateful | boolean | no | Whether stateful (default: true) |
| project | string | no | Project ID |

**Output**: `{ security_group: SecurityGroup }`

---

### scaleway_instances_delete_security_group

**Scaleway API**: `DELETE /instance/v1/zones/{zone}/security_groups/{security_group_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | yes | Availability zone |
| security_group_id | string | yes | Security group UUID |

**Output**: `{ success: true }`

---

## IP Tools

### scaleway_instances_list_ips

**Scaleway API**: `GET /instance/v1/zones/{zone}/ips`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| zone | string | yes | - | Availability zone |
| page | number | no | 1 | Page number |
| page_size | number | no | 50 | Items per page |
| name | string | no | - | Filter by name |
| project | string | no | - | Filter by project |
| type | string | no | - | Filter by IP type |

**Output**: `{ ips: IP[], total_count: number }`

---

### scaleway_instances_create_ip

**Scaleway API**: `POST /instance/v1/zones/{zone}/ips`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | yes | Availability zone |
| project | string | no | Project ID |
| type | enum | no | routed_ipv4 (default), routed_ipv6 |
| server | string | no | Server UUID to attach to |
| tags | string[] | no | Tags |

**Output**: `{ ip: IP }`

---

### scaleway_instances_delete_ip

**Scaleway API**: `DELETE /instance/v1/zones/{zone}/ips/{ip_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | yes | Availability zone |
| ip_id | string | yes | IP UUID |

**Output**: `{ success: true }`

---

### scaleway_instances_attach_ip

**Scaleway API**: `PATCH /instance/v1/zones/{zone}/ips/{ip_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | yes | Availability zone |
| ip_id | string | yes | IP UUID |
| server_id | string | yes | Server UUID to attach to |

**Output**: `{ ip: IP }`

---

## Snapshot Tools

### scaleway_instances_list_snapshots

**Scaleway API**: `GET /instance/v1/zones/{zone}/snapshots`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| zone | string | yes | - | Availability zone |
| page | number | no | 1 | Page number |
| page_size | number | no | 50 | Items per page |
| name | string | no | - | Filter by name |
| project | string | no | - | Filter by project |

**Output**: `{ snapshots: Snapshot[], total_count: number }`

---

### scaleway_instances_create_snapshot

**Scaleway API**: `POST /instance/v1/zones/{zone}/snapshots`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | yes | Availability zone |
| name | string | yes | Snapshot name |
| volume_id | string | yes | Source volume UUID |
| project | string | no | Project ID |
| tags | string[] | no | Tags |

**Output**: `{ snapshot: Snapshot }`

---

### scaleway_instances_delete_snapshot

**Scaleway API**: `DELETE /instance/v1/zones/{zone}/snapshots/{snapshot_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | yes | Availability zone |
| snapshot_id | string | yes | Snapshot UUID |

**Output**: `{ success: true }`
