# 019-dns: Domains and DNS API

## User Stories

### P1 - DNS Zone Management
- As a user, I can list, create, update, delete, clone, and refresh DNS zones
- As a user, I can export and import raw DNS zone files

### P1 - DNS Record Management
- As a user, I can list DNS records for a zone
- As a user, I can batch update DNS records (add/set/delete/clear operations)
- As a user, I can clear all records in a zone

### P2 - Nameserver Management
- As a user, I can list and update nameservers for a DNS zone

### P3 - SSL Certificates & TSIG Keys
- As a user, I can manage SSL certificates (list, create, get, delete)
- As a user, I can manage TSIG keys (get, delete)

## API Endpoints (Scaleway Domain v2beta1)

Base: `https://api.scaleway.com/domain/v2beta1` (global, no region)

### DNS Zones
| Method | Path | Tool |
|--------|------|------|
| GET | /dns-zones | scaleway_dns_list_zones |
| POST | /dns-zones | scaleway_dns_create_zone |
| PATCH | /dns-zones/{dns_zone} | scaleway_dns_update_zone |
| DELETE | /dns-zones/{dns_zone} | scaleway_dns_delete_zone |
| POST | /dns-zones/{dns_zone}/clone | scaleway_dns_clone_zone |
| POST | /dns-zones/{dns_zone}/refresh | scaleway_dns_refresh_zone |

### DNS Records
| Method | Path | Tool |
|--------|------|------|
| GET | /dns-zones/{dns_zone}/records | scaleway_dns_list_records |
| PATCH | /dns-zones/{dns_zone}/records | scaleway_dns_update_records |
| DELETE | /dns-zones/{dns_zone}/records | scaleway_dns_clear_records |

### Raw Zone
| Method | Path | Tool |
|--------|------|------|
| GET | /dns-zones/{dns_zone}/raw | scaleway_dns_export_raw_zone |
| POST | /dns-zones/{dns_zone}/raw | scaleway_dns_import_raw_zone |

### Nameservers
| Method | Path | Tool |
|--------|------|------|
| GET | /dns-zones/{dns_zone}/nameservers | scaleway_dns_list_nameservers |
| PUT | /dns-zones/{dns_zone}/nameservers | scaleway_dns_update_nameservers |

### SSL Certificates
| Method | Path | Tool |
|--------|------|------|
| GET | /ssl-certificates?dns_zone={dns_zone} | scaleway_dns_get_ssl_certificate |
| POST | /ssl-certificates | scaleway_dns_create_ssl_certificate |
| DELETE | /ssl-certificates/{dns_zone} | scaleway_dns_delete_ssl_certificate |

### TSIG Keys
| Method | Path | Tool |
|--------|------|------|
| GET | /dns-zones/{dns_zone}/tsig-key | scaleway_dns_get_tsig_key |
| DELETE | /dns-zones/{dns_zone}/tsig-key | scaleway_dns_delete_tsig_key |

## Entities

### DNSZone
- domain: string
- subdomain: string
- ns: string[]
- ns_default: string[]
- ns_master: string[]
- status: "unknown" | "active" | "pending" | "error" | "locked"
- project_id: string
- updated_at: string (ISO 8601)
- message: string

### Record
- id: string
- name: string
- type: RecordType
- data: string
- ttl: number
- priority: number
- comment: string

### RecordChange
- add: { records: Record[] }
- set: { id_fields: { name, type }, records: Record[] }
- delete: { id: string } | { id_fields: { name, type } }
- clear: {}

### Nameserver
- ns: string
- is_default: boolean

### TsigKey
- name: string
- key: string
- algorithm: string

### SSLCertificate
- dns_zone: string
- alternative_dns_zones: string[]
- status: string
- certificate_chain: string
- private_key: string
- created_at: string
