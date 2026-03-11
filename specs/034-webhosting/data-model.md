# Data Model: Scaleway Web Hosting MCP Tools

**Feature**: 034-webhosting | **Date**: 2026-03-11

## Entities

### Hosting

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique hosting identifier |
| region | string | yes | Region (e.g., fr-par) |
| project_id | string (UUID) | yes | Project ID |
| status | enum | yes | unknown_status, delivering, ready, deleting, error, locked, migrating |
| platform_hostname | string | yes | Platform hostname |
| platform_number | number | no | Platform number |
| offer_id | string (UUID) | yes | Associated offer ID |
| offer_name | string | yes | Associated offer name |
| domain | string | yes | Domain name for the hosting |
| tags | string[] | yes | User-defined tags |
| dns_status | enum | yes | unknown_dns_status, valid, invalid, pending |
| cpanel_urls | object/null | no | cPanel dashboard and webmail URLs |
| username | string | yes | Hosting username |
| contact_email | string | yes | Contact email address |
| platform_group | string | yes | Platform group |
| ipv4 | string | no | IPv4 address |
| ipv6 | string | no | IPv6 address |
| protected | boolean | no | Whether the hosting is protected against deletion |
| one_time_password | string | no | One-time password (only on create) |
| offer_end_date | string (ISO 8601) | no | Offer end date |
| created_at | string (ISO 8601) | no | Creation timestamp |
| updated_at | string (ISO 8601) | no | Last update timestamp |

### CpanelUrls

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| dashboard | string (URL) | no | cPanel dashboard URL |
| webmail | string (URL) | no | Webmail URL |

### Offer

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique offer identifier |
| billing_operation_path | string | yes | Billing operation path |
| product | object | no | Product info (name, option flag) |
| price | object | no | Price info (currency_code, units, nanos) |
| available | boolean | yes | Whether the offer is currently available |
| quota_warnings | enum[] | no | Quota warning types (email_count_exceeded, database_count_exceeded, disk_usage_exceeded) |
| end_of_life | boolean | yes | Whether the offer is end-of-life |
| control_panel_name | string | yes | Associated control panel name |

### ControlPanel

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Control panel name (e.g., cpanel) |
| available | boolean | yes | Whether available for new hostings |
| logo_url | string | yes | Logo URL |

### DnsRecord

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | DNS record name |
| type | string | yes | Record type (A, AAAA, CNAME, MX, TXT, etc.) |
| ttl | number | yes | Time to live in seconds |
| value | string | yes | Record value |
| priority | number | no | Priority (for MX records) |
| status | string | no | Configuration status |

### NameServer

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| hostname | string | yes | Name server hostname |
| is_default | boolean | no | Whether this is the default name server |
| status | string | no | Configuration status |
