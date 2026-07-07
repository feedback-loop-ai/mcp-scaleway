# Scaleway Domains & DNS API Reference

Base URL: `https://api.scaleway.com/domain/v2beta1`

Official docs: https://www.scaleway.com/en/developers/api/domains-and-dns/

## Authentication
- Header: `X-Auth-Token: <secret_key>`

DNS is a global (non-regional) product. Zones are addressed by their fully-qualified
name (e.g. `example.com` or `sub.example.com`), URL-encoded in the path.

## DNS Zones

### List DNS Zones
`GET /dns-zones`
- Query: `page` (int), `page_size` (int), `domain` (string), `project_id` (string),
  `order_by` (domain_asc|domain_desc|subdomain_asc|subdomain_desc|created_at_asc|created_at_desc|updated_at_asc|updated_at_desc),
  `dns_zones` (comma-separated zone names)
- Response: `{ dns_zones: DnsZone[], total_count: number }`
- DnsZone: `{ domain, subdomain, ns, ns_default, ns_master, status, message, updated_at, project_id }`
- Tool: `scaleway_dns_list_zones`

### Create DNS Zone
`POST /dns-zones`
- Body: `{ domain, subdomain, project_id }`
- Response: DnsZone object
- Tool: `scaleway_dns_create_zone`

### Update DNS Zone
`PATCH /dns-zones/{dns_zone}`
- Body: `{ new_dns_zone?, project_id? }`
- Response: DnsZone object
- Tool: `scaleway_dns_update_zone`

### Delete DNS Zone
`DELETE /dns-zones/{dns_zone}`
- Query: `project_id`
- Response: deletion acknowledgement
- Tool: `scaleway_dns_delete_zone`

### Clone DNS Zone
`POST /dns-zones/{dns_zone}/clone`
- Body: `{ dest_dns_zone, overwrite, project_id? }`
- Response: DnsZone object (destination)
- Tool: `scaleway_dns_clone_zone`

### Refresh DNS Zone
`POST /dns-zones/{dns_zone}/refresh`
- Body: `{ recreate_dns_zone, recreate_sub_dns_zone }`
- Response: DnsZone object
- Tool: `scaleway_dns_refresh_zone`

## DNS Records

### List DNS Records
`GET /dns-zones/{dns_zone}/records`
- Query: `page`, `page_size`, `name`, `type` (RecordType), `id`, `project_id`,
  `order_by` (name_asc|name_desc|type_asc|type_desc)
- Response: `{ records: DnsRecord[], total_count: number }`
- DnsRecord: `{ id, name, type, data, ttl, priority?, comment? }`
- Tool: `scaleway_dns_list_records`

### Update DNS Records
`PATCH /dns-zones/{dns_zone}/records`
- Body: `{ changes: RecordChange[], disallow_new_zone_creation, return_all_records, serial? }`
- RecordChange is one of `add`, `set`, `delete`, `clear`:
  - `add`: `{ add: { records: RecordInput[] } }`
  - `set`: `{ set: { id_fields: { name, type }, records: RecordInput[] } }`
  - `delete`: `{ delete: { id? , id_fields?: { name, type } } }`
  - `clear`: `{ clear: {} }`
- RecordInput: `{ name, type, data, ttl, priority?, comment? }`
- Response: `{ records: DnsRecord[] }`
- Tool: `scaleway_dns_update_records`

### Clear DNS Records
`DELETE /dns-zones/{dns_zone}/records`
- Response: acknowledgement
- Tool: `scaleway_dns_clear_records`

## Raw Zone (import/export)

### Export Raw DNS Zone
`GET /dns-zones/{dns_zone}/raw`
- Query: `format` (bind)
- Response: raw BIND zone file (text/plain)
- Tool: `scaleway_dns_export_raw_zone`
- Verified against [`scaleway-sdk-go` `api/domain/v2beta1`](https://github.com/scaleway/scaleway-sdk-go/blob/master/api/domain/v2beta1/domain_sdk.go)
  (`ExportRawDNSZone` → `GET /domain/v2beta1/dns-zones/{dns_zone}/raw`). The `/export-raw`
  path suggested by AI-summarized docs does not exist; the implementation `/raw` is correct.

### Import Raw DNS Zone
`POST /dns-zones/{dns_zone}/raw`
- Body: `{ bind_source: { content }, project_id? }`
- Response: DnsZone / import result
- Tool: `scaleway_dns_import_raw_zone`
- Verified against `scaleway-sdk-go` `api/domain/v2beta1` (`ImportRawDNSZone` →
  `POST /domain/v2beta1/dns-zones/{dns_zone}/raw`). The `/import-raw` path suggested by
  AI-summarized docs does not exist; the implementation `/raw` is correct.

## Nameservers

### List Nameservers
`GET /dns-zones/{dns_zone}/nameservers`
- Query: `project_id?`
- Response: `{ ns: Nameserver[] }` where Nameserver = `{ name, ip? }`
- Tool: `scaleway_dns_list_nameservers`

### Update Nameservers
`PUT /dns-zones/{dns_zone}/nameservers`
- Body: `{ ns: Nameserver[] }`
- Response: `{ ns: Nameserver[] }`
- Tool: `scaleway_dns_update_nameservers`

## SSL / TLS Certificates

### Get SSL Certificate
`GET /ssl-certificates/{dns_zone}`
- Response: SSL certificate object
- Tool: `scaleway_dns_get_ssl_certificate`

### Create SSL Certificate
`POST /ssl-certificates`
- Body: `{ dns_zone, alternative_dns_zones }`
- Response: SSL certificate object
- Tool: `scaleway_dns_create_ssl_certificate`

### Delete SSL Certificate
`DELETE /ssl-certificates/{dns_zone}`
- Response: acknowledgement
- Tool: `scaleway_dns_delete_ssl_certificate`

> Verified against [`scaleway-sdk-go` `api/domain/v2beta1`](https://github.com/scaleway/scaleway-sdk-go/blob/master/api/domain/v2beta1/domain_sdk.go):
> the SDK models certificates as the `/domain/v2beta1/ssl-certificates` collection
> (`GetSSLCertificate` → `GET /ssl-certificates/{dns_zone}`, `CreateSSLCertificate` →
> `POST /ssl-certificates`, `DeleteSSLCertificate` → `DELETE /ssl-certificates/{dns_zone}`).
> The `/dns-zones/{dns_zone}/tls-certificate` path suggested by AI-summarized docs does
> not exist in the SDK; the implementation is correct.

## TSIG Keys

### Get TSIG Key
`GET /dns-zones/{dns_zone}/tsig-key`
- Response: `{ name, algorithm, key }`
- Tool: `scaleway_dns_get_tsig_key`

### Delete TSIG Key
`DELETE /dns-zones/{dns_zone}/tsig-key`
- Response: acknowledgement
- Tool: `scaleway_dns_delete_tsig_key`

## Record Types
`A`, `AAAA`, `CNAME`, `TXT`, `SRV`, `TLSA`, `MX`, `NS`, `PTR`, `CAA`, `ALIAS`, `LOC`,
`SSHFP`, `HINFO`, `RP`, `URI`, `DS`, `NAPTR`, `DNAME`, `HTTPS`, `SVCB`

## DNS Zone Status Enum
`unknown`, `active`, `pending`, `error`, `locked`

## Pagination
- Request: `page` (1-indexed), `page_size` (1-100)
- Response: `total_count` alongside the item array; the MCP wraps list results via
  `buildPaginatedResponse()`.

## Error Codes
- 400: Invalid input
- 401/403: Permission denied
- 404: Not found (zone/record/certificate)
- 409: Conflict (zone already exists)
- 429: Rate limited
- 500: Server error
