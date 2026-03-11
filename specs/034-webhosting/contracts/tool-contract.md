# Tool Contracts: Scaleway Web Hosting MCP Tools

**Feature**: 034-webhosting | **Date**: 2026-03-11

## Hosting Tools

### scaleway_webhosting_list_hostings

**Scaleway API**: `GET /webhosting/v1/regions/{region}/hostings`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | default region | Region (e.g., fr-par) |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 20 | Items per page (1-100) |
| order_by | enum | no | - | Sort order (created_at_asc, created_at_desc) |
| project_id | string | no | - | Filter by project ID |
| tags | string[] | no | - | Filter by tags |
| statuses | enum[] | no | - | Filter by statuses |
| domain | string | no | - | Filter by domain name |
| organization_id | string | no | - | Filter by organization ID |
| control_panels | string[] | no | - | Filter by control panel names |

**Output**: `{ items: Hosting[], total_count: number, page: number, page_size: number }`

---

### scaleway_webhosting_get_hosting

**Scaleway API**: `GET /webhosting/v1/regions/{region}/hostings/{hosting_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| hosting_id | string | yes | Hosting UUID |

**Output**: `Hosting`

---

### scaleway_webhosting_create_hosting

**Scaleway API**: `POST /webhosting/v1/regions/{region}/hostings`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| offer_id | string | yes | Offer UUID |
| domain | string | yes | Domain name |
| project_id | string | no | Project ID |
| tags | string[] | no | Tags |
| option_ids | string[] | no | Option IDs to enable |
| language | string | no | Language (e.g., fr_FR) |
| domain_configuration | object | no | DNS domain configuration |
| skip_welcome_email | boolean | no | Skip welcome email |

**Output**: `Hosting`

---

### scaleway_webhosting_update_hosting

**Scaleway API**: `PATCH /webhosting/v1/regions/{region}/hostings/{hosting_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| hosting_id | string | yes | Hosting UUID |
| email | string | no | New contact email |
| tags | string[] | no | New tags |
| option_ids | string[] | no | New option IDs |
| offer_id | string | no | New offer ID |
| protected | boolean | no | Deletion protection |

**Output**: `Hosting`

---

### scaleway_webhosting_delete_hosting

**Scaleway API**: `DELETE /webhosting/v1/regions/{region}/hostings/{hosting_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| hosting_id | string | yes | Hosting UUID |

**Output**: `Hosting`

---

### scaleway_webhosting_restore_hosting

**Scaleway API**: `POST /webhosting/v1/regions/{region}/hostings/{hosting_id}/restore`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| hosting_id | string | yes | Hosting UUID |

**Output**: `Hosting`

---

## DNS Tools

### scaleway_webhosting_get_dns_records

**Scaleway API**: `GET /webhosting/v1/regions/{region}/hostings/{hosting_id}/dns-records`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| hosting_id | string | yes | Hosting UUID |

**Output**: `{ dns_records: DnsRecord[], name_servers: NameServer[] }`

---

## Offer & Control Panel Tools

### scaleway_webhosting_list_offers

**Scaleway API**: `GET /webhosting/v1/regions/{region}/offers`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |
| order_by | enum | no | Sort order (price_asc) |
| hosting_id | string | no | Filter by hosting ID |
| control_panels | string[] | no | Filter by control panel names |
| without_options | boolean | no | Exclude option offers |
| only_options | boolean | no | Only include option offers |

**Output**: `{ offers: Offer[] }`

---

### scaleway_webhosting_list_control_panels

**Scaleway API**: `GET /webhosting/v1/regions/{region}/control-panels`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region (e.g., fr-par) |

**Output**: `{ control_panels: ControlPanel[] }`
