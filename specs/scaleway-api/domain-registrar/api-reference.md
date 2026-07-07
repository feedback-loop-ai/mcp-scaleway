# Scaleway Domain Registrar API Reference

Official reference: https://www.scaleway.com/en/developers/api/domains-and-dns/registrar-api/

Base URL: `https://api.scaleway.com/domain/v2beta1`

This document describes the endpoints **as invoked by the MCP tools** in
`src/tools/domain-registrar/`. Where the implemented path differs from the
current official reference, the deviation is called out in the
[Deviations](#deviations-from-official-reference) section below.

## Authentication

- Header: `X-Auth-Token: <secret_key>` (added by the shared Scaleway client).

## Pagination

List endpoints accept `page` (int, 1-indexed) and `page_size` (int, max 100)
query parameters and return `{ <collection>: T[], total_count: number }`. The
MCP layer normalizes this to `{ items, totalCount, page, pageSize }` via
`buildPaginatedResponse`.

## Domains

### List Domains — `scaleway_domain_registrar_list_domains`
`GET /domains`
- Query: `page`, `page_size`, `project_id?`, `organization_id?`, `order_by?`
  (`domain_asc|domain_desc|expired_at_asc|expired_at_desc`)
- Response: `{ domains: Domain[], total_count: number }`

### Get Domain — `scaleway_domain_registrar_get_domain`
`GET /domains/{domain}`
- Response: `Domain`

### Register Domain — `scaleway_domain_registrar_register_domain`
`POST /buy-domains`
- Tool params: `{ domain, duration_in_years, project_id, owner_contact_id, admin_contact_id?, tech_contact_id? }`
- Wire body: `{ domains: [domain], duration_in_years, project_id, owner_contact_id, administrative_contact_id?, technical_contact_id? }`
- Response: `OrderResponse` (`{ domains, organization_id, project_id, task_id, created_at }`)

### Renew Domain — `scaleway_domain_registrar_renew_domain`
`POST /renew-domains`
- Tool params: `{ domain, duration_in_years }`
- Wire body: `{ domains: [domain], duration_in_years }`
- Response: `OrderResponse`

### Transfer Domain — `scaleway_domain_registrar_transfer_domain`
`POST /domains/transfer-domains`
- Tool params: `{ domain, auth_code, project_id, owner_contact_id }`
- Wire body: `{ domains: [{ domain, auth_code }], project_id, owner_contact_id }`
- Response: `OrderResponse`

### Update Domain — `scaleway_domain_registrar_update_domain`
`PATCH /domains/{domain}`
- Tool params: `{ owner_contact_id?, admin_contact_id?, tech_contact_id? }`
- Wire body: `{ owner_contact_id?, administrative_contact_id?, technical_contact_id? }`
- Response: `Domain`

### Enable Auto-Renew — `scaleway_domain_registrar_enable_auto_renew`
`POST /domains/{domain}/enable-auto-renew`
- Response: `Domain`

### Disable Auto-Renew — `scaleway_domain_registrar_disable_auto_renew`
`POST /domains/{domain}/disable-auto-renew`
- Response: `Domain`

### Check Domain Availability — `scaleway_domain_registrar_check_domain_availability`
`GET /search-domains`
- Query: `domains` (the searched domain; the API accepts a repeatable list)
- Response: `SearchAvailableDomainsResponse` (`{ available_domains: AvailableDomain[], exact_match_domain? }`)

## Contacts

### List Contacts — `scaleway_domain_registrar_list_contacts`
`GET /contacts`
- Query: `page`, `page_size`, `domain?`, `project_id?`, `organization_id?`
- Response: `{ contacts: Contact[], total_count: number }`

### Get Contact — `scaleway_domain_registrar_get_contact`
`GET /contacts/{contact_id}`
- Response: `Contact`

> **Removed:** `scaleway_domain_registrar_create_contact`. The Registrar API has
> **no** standalone create-contact endpoint (`POST /contacts` does not exist;
> `/contacts` only supports `GET`). Contacts are created inline via the
> buy/transfer requests using an `owner_contact` (NewContact) object. Verified
> against the official OpenAPI schema and the Go SDK — no `CreateContact`
> operation exists. The tool was removed rather than pointed at a non-existent
> endpoint.

### Update Contact — `scaleway_domain_registrar_update_contact`
`PATCH /contacts/{contact_id}`
- Body: partial contact (`email?, phone_number?, address_line_1?, city?, zip?, country?, state?`)
- Response: `Contact`

## TLDs

### List TLDs — `scaleway_domain_registrar_list_tlds`
`GET /tlds`
- Query: `page`, `page_size`, `tlds?` (filter), `order_by?`
- Response: `{ tlds: Tld[], total_count: number }`
- Verified correct: `GET /tlds` is the official ListTlds endpoint (there is no
  `/tld-offers` path).

### Get TLD — `scaleway_domain_registrar_get_tld`
`GET /tlds?tlds={tld_name}`
- The Registrar API has no standalone `GET /tlds/{tld}` endpoint. `get_tld`
  retrieves the specific TLD by filtering the documented ListTlds endpoint and
  returns the single matching `Tld` (or the raw list response if none matched).

## Entities

### Domain
`{ domain, registrar, status, auto_renew_status, dnssec_status, epp_code?, expired_at?, updated_at, registrar_lock_status, organization_id, project_id }`
- `status`: `active | expired | pending_transfer | pending_registration | redemption | deleting`
- `auto_renew_status`: `enabled | disabled | not_supported`
- `dnssec_status`: `enabled | disabled`
- `registrar_lock_status`: `locked | unlocked`

### Contact
`{ id, firstname, lastname, email, phone_number, company_name?, address_line_1, city, zip, country, state? }`

### Tld
`{ name, dnssec_support: boolean, duration_in_years_min, duration_in_years_max, idn_support: boolean, offers: Record<action, TldOffer>, specifications: Record<string,string> }`
- `TldOffer`: `{ action, operation_path, price: { currency_code?, units?, nanos? } }`

### AvailableDomain
`{ domain, available: boolean, tld?: Tld }`

### OrderResponse (buy / renew / transfer)
`{ domains: string[], organization_id, project_id, task_id, created_at? }`

## Error Codes
- 400: Invalid input
- 401 / 403: Permission denied
- 404: Not found
- 429: Rate limited
- 500: Server error

## Deviations from official reference — reconciled (2026-07)

The handlers were realigned to the official Domain Registrar v2beta1 API,
verified against the official OpenAPI schema
(`https://www.scaleway.com/en/developers/api/domains-and-dns/registrar/v2beta1/schema.yml`)
and the Scaleway Go SDK `api/domain/v2beta1/domain_sdk.go`.

| Tool | Was | Now (official) | Status |
|------|-----|----------------|--------|
| register_domain | `POST /domains` | `POST /buy-domains` (body `domains[]`, `administrative_contact_id`, `technical_contact_id`) | fixed |
| renew_domain | `POST /domains/{domain}/renew` | `POST /renew-domains` (body `domains[]`) | fixed |
| transfer_domain | `POST /domains/transfer` | `POST /domains/transfer-domains` (body `domains[{domain,auth_code}]`) | fixed |
| update_domain | `PATCH /domains/{domain}` (`admin_/tech_contact_id`) | same path, body `administrative_/technical_contact_id` | fixed |
| check_domain_availability | `GET /domains/availability?domain=` | `GET /search-domains?domains=` | fixed |
| get_tld | `GET /tlds/{tld_name}` | `GET /tlds?tlds={tld_name}` (filter ListTlds; no standalone path) | fixed |
| create_contact | `POST /contacts` | **no such endpoint** | **tool removed** |
| list_tlds | `GET /tlds` | `GET /tlds` | already correct (no `/tld-offers` path exists) |

The contract tests in
`tests/contract/domain-registrar/domain-registrar.contract.test.ts` assert the
corrected paths and request shapes.
