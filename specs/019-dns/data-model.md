# Data Model: Scaleway Domains and DNS MCP Tools

**Feature**: 019-dns | **Date**: 2026-03-11

## Entities

### DNSZone

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| domain | string | yes | Root domain name (e.g. example.com) |
| subdomain | string | yes | Subdomain prefix (empty string for root zone) |
| ns | string[] | yes | Current nameservers |
| ns_default | string[] | yes | Default Scaleway nameservers |
| ns_master | string[] | yes | Master nameservers |
| status | enum | yes | unknown, active, pending, error, locked |
| project_id | string (UUID) | yes | Owning project ID |
| updated_at | string (ISO 8601) | yes | Last modification timestamp |
| message | string | no | Status message or error detail |

### Record

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | yes | Unique record identifier |
| name | string | yes | Record name (e.g. www, @, sub.domain) |
| type | RecordType | yes | DNS record type |
| data | string | yes | Record data (e.g. IP address, CNAME target) |
| ttl | number | yes | Time to live in seconds (minimum 60) |
| priority | number | no | Priority value (for MX, SRV records) |
| comment | string | no | Optional human-readable comment |

### RecordType (enum)

Supported values: `A`, `AAAA`, `CNAME`, `TXT`, `SRV`, `TLSA`, `MX`, `NS`, `PTR`, `CAA`, `ALIAS`, `LOC`, `SSHFP`, `HINFO`, `RP`, `URI`, `DS`, `NAPTR`, `DNAME`, `HTTPS`, `SVCB`

### RecordChange (union)

One of four change operations for batch DNS record updates:

| Variant | Structure | Description |
|---------|-----------|-------------|
| add | `{ add: { records: Record[] } }` | Add new records |
| set | `{ set: { id_fields: { name, type }, records: Record[] } }` | Replace records matching name+type |
| delete | `{ delete: { id?: string, id_fields?: { name, type } } }` | Delete by ID or by name+type |
| clear | `{ clear: {} }` | Clear all records |

### Nameserver

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Nameserver hostname (e.g. ns1.example.com) |
| ip | string[] | no | Nameserver IP addresses (glue records) |

### TsigKey

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | TSIG key name |
| key | string | yes | TSIG key value (base64-encoded) |
| algorithm | string | yes | TSIG algorithm (e.g. hmac-sha256) |

### SSLCertificate

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| dns_zone | string | yes | Primary DNS zone for the certificate |
| alternative_dns_zones | string[] | yes | Subject Alternative Name DNS zones |
| status | string | yes | Certificate status |
| certificate_chain | string | yes | PEM-encoded certificate chain |
| private_key | string | yes | PEM-encoded private key |
| created_at | string (ISO 8601) | yes | Creation timestamp |
