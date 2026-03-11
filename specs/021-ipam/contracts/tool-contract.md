# Tool Contracts: Scaleway IPAM MCP Tools

**Feature**: 021-ipam | **Date**: 2026-03-11

## IP Management Tools

### scaleway_ipam_list_ips

**Scaleway API**: `GET /ipam/v1/regions/{region}/ips`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | yes | - | Region (e.g., fr-par) |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| order_by | enum | no | created_at_desc | Sort order |
| project_id | string (UUID) | no | - | Filter by project ID |
| zonal | string | no | - | Filter by zone |
| private_network_id | string (UUID) | no | - | Filter by private network ID |
| subnet_id | string (UUID) | no | - | Filter by subnet ID |
| vpc_id | string (UUID) | no | - | Filter by VPC ID |
| attached | boolean | no | - | Filter by attached status |
| resource_type | enum | no | - | Filter by resource type |
| resource_id | string (UUID) | no | - | Filter by resource ID |
| mac_address | string | no | - | Filter by MAC address |
| tags | string[] | no | - | Filter by tags |
| is_ipv6 | boolean | no | - | Filter by IPv6 status |
| resource_name | string | no | - | Filter by resource name |
| organization_id | string (UUID) | no | - | Filter by organization ID |

**Output**: `{ data: IP[], total_count: number, page: number, page_size: number, total_pages: number }`

---

### scaleway_ipam_get_ip

**Scaleway API**: `GET /ipam/v1/regions/{region}/ips/{ip_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Region (e.g., fr-par) |
| ip_id | string (UUID) | yes | IP UUID |

**Output**: IP object (id, address, project_id, is_ipv6, created_at, updated_at, source, resource, tags, reverses, region, zone)

---

### scaleway_ipam_book_ip

**Scaleway API**: `POST /ipam/v1/regions/{region}/ips`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | yes | - | Region (e.g., fr-par) |
| project_id | string (UUID) | yes | - | Project ID |
| source | Source | yes | - | Source (zonal, private_network_id, or subnet_id) |
| is_ipv6 | boolean | no | false | Whether to book an IPv6 address |
| address | string | no | - | Specific IP in CIDR notation (auto-allocated if omitted) |
| tags | string[] | no | [] | Tags for the IP |
| resource | CustomResource | no | - | Custom resource to attach (type=custom only) |

**Output**: IP object

---

### scaleway_ipam_release_ip

**Scaleway API**: `DELETE /ipam/v1/regions/{region}/ips/{ip_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Region (e.g., fr-par) |
| ip_id | string (UUID) | yes | IP UUID to release |

**Output**: `{ success: true, ip_id: string }`

---

### scaleway_ipam_update_ip

**Scaleway API**: `PATCH /ipam/v1/regions/{region}/ips/{ip_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Region (e.g., fr-par) |
| ip_id | string (UUID) | yes | IP UUID to update |
| tags | string[] | no | New tags for the IP |
| reverses | Reverse[] | no | New reverse DNS entries |

**Output**: IP object
