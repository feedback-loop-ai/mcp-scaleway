# Tool Contracts: Scaleway VPC & Private Networks MCP Tools

**Feature**: 016-vpc | **Date**: 2026-03-11

## VPC Tools

### scaleway_vpc_list_vpcs

**Scaleway API**: `GET /vpc/v2/regions/{region}/vpcs`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | yes | - | Region (e.g., fr-par) |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| name | string | no | - | Filter by VPC name |
| tags | string[] | no | - | Filter by tags |
| project | string (UUID) | no | - | Filter by project ID |

**Output**: `{ items: Vpc[], totalCount: number, page: number, pageSize: number }`

---

### scaleway_vpc_get_vpc

**Scaleway API**: `GET /vpc/v2/regions/{region}/vpcs/{vpc_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Region (e.g., fr-par) |
| vpc_id | string (UUID) | yes | VPC ID |

**Output**: `{ Vpc }`

---

### scaleway_vpc_create_vpc

**Scaleway API**: `POST /vpc/v2/regions/{region}/vpcs`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Region (e.g., fr-par) |
| name | string | yes | VPC name (min 1 char) |
| project | string (UUID) | yes | Project ID |
| tags | string[] | no | Tags for the VPC |

**Output**: `{ Vpc }`

---

### scaleway_vpc_update_vpc

**Scaleway API**: `PATCH /vpc/v2/regions/{region}/vpcs/{vpc_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Region (e.g., fr-par) |
| vpc_id | string (UUID) | yes | VPC ID |
| name | string | no | New VPC name (min 1 char) |
| tags | string[] | no | New tags |

**Output**: `{ Vpc }`

---

### scaleway_vpc_delete_vpc

**Scaleway API**: `DELETE /vpc/v2/regions/{region}/vpcs/{vpc_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Region (e.g., fr-par) |
| vpc_id | string (UUID) | yes | VPC ID |

**Output**: `{ success: true, vpc_id: string }`

---

## Private Network Tools

### scaleway_vpc_list_private_networks

**Scaleway API**: `GET /vpc/v2/regions/{region}/private-networks`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | yes | - | Region (e.g., fr-par) |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| name | string | no | - | Filter by name |
| tags | string[] | no | - | Filter by tags |
| vpc_id | string (UUID) | no | - | Filter by VPC ID |
| project_id | string (UUID) | no | - | Filter by project ID |

**Output**: `{ items: PrivateNetwork[], totalCount: number, page: number, pageSize: number }`

---

### scaleway_vpc_get_private_network

**Scaleway API**: `GET /vpc/v2/regions/{region}/private-networks/{private_network_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Region (e.g., fr-par) |
| private_network_id | string (UUID) | yes | Private Network ID |

**Output**: `{ PrivateNetwork }`

---

### scaleway_vpc_create_private_network

**Scaleway API**: `POST /vpc/v2/regions/{region}/private-networks`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Region (e.g., fr-par) |
| name | string | yes | Private network name (min 1 char) |
| project_id | string (UUID) | yes | Project ID |
| vpc_id | string (UUID) | yes | VPC ID to attach to |
| tags | string[] | no | Tags |
| subnets | string[] | no | CIDR subnets (e.g., 192.168.1.0/24) |

**Output**: `{ PrivateNetwork }`

---

### scaleway_vpc_update_private_network

**Scaleway API**: `PATCH /vpc/v2/regions/{region}/private-networks/{private_network_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Region (e.g., fr-par) |
| private_network_id | string (UUID) | yes | Private Network ID |
| name | string | no | New name (min 1 char) |
| tags | string[] | no | New tags |
| subnets | string[] | no | New CIDR subnets |

**Output**: `{ PrivateNetwork }`

---

### scaleway_vpc_delete_private_network

**Scaleway API**: `DELETE /vpc/v2/regions/{region}/private-networks/{private_network_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Region (e.g., fr-par) |
| private_network_id | string (UUID) | yes | Private Network ID |

**Output**: `{ success: true, private_network_id: string }`
