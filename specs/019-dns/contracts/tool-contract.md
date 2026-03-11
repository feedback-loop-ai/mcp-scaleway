# Tool Contracts: Scaleway Domains and DNS MCP Tools

**Feature**: 019-dns | **Date**: 2026-03-11

## DNS Zone Tools

### scaleway_dns_list_zones

**Scaleway API**: `GET /domain/v2beta1/dns-zones`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| domain | string | no | - | Filter by domain name |
| project_id | string (UUID) | no | - | Filter by project ID |
| order_by | enum | no | - | Sort order (domain_asc, domain_desc, subdomain_asc, subdomain_desc, created_at_asc, created_at_desc, updated_at_asc, updated_at_desc) |
| dns_zones | string | no | - | Comma-separated list of DNS zone names to filter |

**Output**: `{ data: DNSZone[], total_count: number, page: number, page_size: number, has_more: boolean }`

---

### scaleway_dns_create_zone

**Scaleway API**: `POST /domain/v2beta1/dns-zones`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| domain | string | yes | Domain name for the DNS zone |
| subdomain | string | no | Subdomain (empty for root zone, default: "") |
| project_id | string (UUID) | yes | Project ID to own the DNS zone |

**Output**: `DNSZone`

---

### scaleway_dns_update_zone

**Scaleway API**: `PATCH /domain/v2beta1/dns-zones/{dns_zone}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| dns_zone | string | yes | DNS zone name to update (e.g. example.com) |
| new_dns_zone | string | no | New DNS zone name (for renaming the subdomain) |
| project_id | string (UUID) | no | New project ID |

**Output**: `DNSZone`

---

### scaleway_dns_delete_zone

**Scaleway API**: `DELETE /domain/v2beta1/dns-zones/{dns_zone}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| dns_zone | string | yes | DNS zone name to delete |
| project_id | string (UUID) | yes | Project ID that owns the DNS zone |

**Output**: `{ status: "deleted", dns_zone: string }`

---

### scaleway_dns_clone_zone

**Scaleway API**: `POST /domain/v2beta1/dns-zones/{dns_zone}/clone`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| dns_zone | string | yes | Source DNS zone name to clone |
| dest_dns_zone | string | yes | Destination DNS zone name |
| overwrite | boolean | no | Overwrite destination if it exists (default: false) |
| project_id | string (UUID) | no | Project ID for the destination zone |

**Output**: `DNSZone`

---

### scaleway_dns_refresh_zone

**Scaleway API**: `POST /domain/v2beta1/dns-zones/{dns_zone}/refresh`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| dns_zone | string | yes | DNS zone name to refresh |
| recreate_dns_zone | boolean | no | Recreate the DNS zone if needed (default: false) |
| recreate_sub_dns_zone | boolean | no | Recreate sub DNS zones (default: false) |

**Output**: `DNSZone`

---

## DNS Record Tools

### scaleway_dns_list_records

**Scaleway API**: `GET /domain/v2beta1/dns-zones/{dns_zone}/records`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| dns_zone | string | yes | - | DNS zone name |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| name | string | no | - | Filter by record name |
| type | RecordType | no | - | Filter by record type |
| id | string | no | - | Filter by record ID |
| project_id | string (UUID) | no | - | Filter by project ID |
| order_by | enum | no | - | Sort order (name_asc, name_desc, type_asc, type_desc) |

**Output**: `{ data: Record[], total_count: number, page: number, page_size: number, has_more: boolean }`

---

### scaleway_dns_update_records

**Scaleway API**: `PATCH /domain/v2beta1/dns-zones/{dns_zone}/records`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| dns_zone | string | yes | DNS zone name |
| changes | RecordChange[] | yes | List of record changes (add/set/delete/clear) |
| disallow_new_zone_creation | boolean | no | Prevent creating new zones during update (default: false) |
| return_all_records | boolean | no | Return all records after update (default: false) |
| serial | number | no | Zone serial for conflict detection |

**Output**: `{ records: Record[] }`

---

### scaleway_dns_clear_records

**Scaleway API**: `DELETE /domain/v2beta1/dns-zones/{dns_zone}/records`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| dns_zone | string | yes | DNS zone name to clear all records from |

**Output**: `{ status: "cleared", dns_zone: string }`

---

## Raw Zone Tools

### scaleway_dns_export_raw_zone

**Scaleway API**: `GET /domain/v2beta1/dns-zones/{dns_zone}/raw`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| dns_zone | string | yes | DNS zone name to export |
| format | enum | no | Export format (default: "bind") |

**Output**: `{ content: string, dns_zone: string, format: string }`

---

### scaleway_dns_import_raw_zone

**Scaleway API**: `POST /domain/v2beta1/dns-zones/{dns_zone}/raw`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| dns_zone | string | yes | DNS zone name to import into |
| content | string | yes | Raw zone file content (BIND format) |
| project_id | string (UUID) | no | Project ID |

**Output**: `{ records: Record[] }`

---

## Nameserver Tools

### scaleway_dns_list_nameservers

**Scaleway API**: `GET /domain/v2beta1/dns-zones/{dns_zone}/nameservers`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| dns_zone | string | yes | DNS zone name |
| project_id | string (UUID) | no | Filter by project ID |

**Output**: `{ ns: Nameserver[] }`

---

### scaleway_dns_update_nameservers

**Scaleway API**: `PUT /domain/v2beta1/dns-zones/{dns_zone}/nameservers`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| dns_zone | string | yes | DNS zone name |
| ns | Nameserver[] | yes | New nameservers (each with name and optional ip array) |

**Output**: `{ ns: Nameserver[] }`

---

## SSL Certificate Tools

### scaleway_dns_get_ssl_certificate

**Scaleway API**: `GET /domain/v2beta1/ssl-certificates/{dns_zone}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| dns_zone | string | yes | DNS zone name |

**Output**: `SSLCertificate`

---

### scaleway_dns_create_ssl_certificate

**Scaleway API**: `POST /domain/v2beta1/ssl-certificates`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| dns_zone | string | yes | DNS zone name |
| alternative_dns_zones | string[] | no | Alternative DNS zones for the certificate (default: []) |

**Output**: `SSLCertificate`

---

### scaleway_dns_delete_ssl_certificate

**Scaleway API**: `DELETE /domain/v2beta1/ssl-certificates/{dns_zone}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| dns_zone | string | yes | DNS zone name |

**Output**: `{ status: "deleted", dns_zone: string }`

---

## TSIG Key Tools

### scaleway_dns_get_tsig_key

**Scaleway API**: `GET /domain/v2beta1/dns-zones/{dns_zone}/tsig-key`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| dns_zone | string | yes | DNS zone name |

**Output**: `TsigKey`

---

### scaleway_dns_delete_tsig_key

**Scaleway API**: `DELETE /domain/v2beta1/dns-zones/{dns_zone}/tsig-key`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| dns_zone | string | yes | DNS zone name |

**Output**: `{ status: "deleted", dns_zone: string }`
