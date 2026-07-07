# Scaleway Mailbox API Reference

Official reference: https://www.scaleway.com/en/developers/api/mailbox/
Verified against the auto-generated SDK definition
`scaleway-sdk-go/api/mailbox/v1alpha1/mailbox_sdk.go` (authoritative source of exact paths).

Base URL: `https://api.scaleway.com/mailbox/v1alpha1`

- **API version**: `v1alpha1` (Beta)
- **Scope**: Global (no `region`/`zone` path segment)
- **Product catalog**: Domains & Web Hosting → Mailbox (Beta)

Tools live in `src/tools/mailbox/`. Each endpoint below is annotated with the MCP
tool that invokes it. Verified against `src/tools/mailbox/handlers.ts`.

## Authentication
- Header: `X-Auth-Token: <secret_key>`

## Pagination pattern
List endpoints accept `page` (int, ≥1) and `page_size` (int) query parameters and
return `{ <collection>: T[], total_count: number }`. MCP tools re-wrap this as
`{ items, totalCount, page, pageSize }` via `buildPaginatedResponse`.

## Domains

### List Domains — `scaleway_mailbox_list_domains`
`GET /domains`
- Query: page (int), page_size (int), project_id (string), statuses (DomainStatus[], repeated), search (string), order_by (string)
- Response: `{ domains: Domain[], total_count: number }`

### Get Domain — `scaleway_mailbox_get_domain`
`GET /domains/{domain_id}`
- Response: Domain object

### Create Domain — `scaleway_mailbox_create_domain`
`POST /domains`
- Body: `{ name, project_id? }` (`project_id` defaults to the account default project)
- Response: Domain object (status: creating)

### Delete Domain — `scaleway_mailbox_delete_domain`
`DELETE /domains/{domain_id}`
- Response: Domain object (status: deleting)

### Get Domain Records — `scaleway_mailbox_get_domain_records`
`GET /domains/{domain_id}/records`
- Response: `GetDomainRecordsResponse` — a fixed set of nullable `DomainRecord` slots:
  `autoconfig, autodiscover, caldav, carddav, dkim, dmarc, domain_validation, imap, mx, pop3, spf, submission`

### Validate Domain Records — `scaleway_mailbox_validate_domain_records`
`POST /domains/{domain_id}/validate-records`
- Body: none
- Response: empty (validation triggered asynchronously)

## Mailboxes

### Create Mailboxes (batch) — `scaleway_mailbox_create_mailboxes`
`POST /batch-create-mailboxes`
- Body: `{ domain_id, subscription_period, mailboxes: [{ local_part, password }, ...] }`
- `subscription_period`: monthly | yearly
- Response: `{ mailboxes: Mailbox[] }`

### List Mailboxes — `scaleway_mailbox_list_mailboxes`
`GET /mailboxes`
- Query: page (int), page_size (int), domain_id (string), project_id (string), statuses (MailboxStatus[], repeated), search (string), order_by (string)
- Response: `{ mailboxes: Mailbox[], total_count: number }`

### Get Mailbox — `scaleway_mailbox_get_mailbox`
`GET /mailboxes/{mailbox_id}`
- Response: Mailbox object

### Update Mailbox — `scaleway_mailbox_update_mailbox`
`PATCH /mailboxes/{mailbox_id}`
- Body: `{ subscription_period?, new_password? }`
- Response: Mailbox object

### Delete Mailbox — `scaleway_mailbox_delete_mailbox`
`DELETE /mailboxes/{mailbox_id}`
- Response: Mailbox object (status: deletion_scheduled)

### Restore Mailbox — `scaleway_mailbox_restore_mailbox`
`POST /mailboxes/{mailbox_id}/restore`
- Body: none
- Response: Mailbox object (status: restoring)

## Aliases

### Create Alias — `scaleway_mailbox_create_alias`
`POST /aliases`
- Body: `{ mailbox_id, local_part, description? }`
- Response: Alias object

### List Aliases — `scaleway_mailbox_list_aliases`
`GET /aliases`
- Query: page (int), page_size (int), mailbox_id (string), project_id (string), status (AliasStatus), order_by (string)
- Response: `{ aliases: Alias[], total_count: number }`

### Get Alias — `scaleway_mailbox_get_alias`
`GET /aliases/{alias_id}`
- Response: Alias object

### Delete Alias — `scaleway_mailbox_delete_alias`
`DELETE /aliases/{alias_id}`
- Response: Alias object (status: deleting)

## Entities

### Domain
`{ id, project_id, name, status, mailbox_total_count, created_at, updated_at, webmail_url, imap_url, pop3_url, smtp_url }`

### Mailbox
`{ id, domain_id, email, status, subscription_period, subscription_period_started_at, next_subscription_period, next_subscription_period_starts_at, created_at, updated_at, deletion_scheduled_at }`

### Alias
`{ id, email, mailbox_id, description, status, created_at, updated_at }`

### DomainRecord
`{ id, domain_id, status, level, dns_type, dns_name, dns_value, error, created_at, updated_at }`

## Enums

- **DomainStatus**: unknown_status, creating, waiting_validation, validating, validation_failed, provisioning, ready, deleting
- **MailboxStatus**: unknown_status, creating, waiting_payment, waiting_domain, ready, deletion_scheduled, locked, renewing, deleting, restoring, payment_failed
- **AliasStatus**: unknown_status, provisioning, deleting, ready
- **MailboxSubscriptionPeriod**: unknown_subscription_period, canceled, monthly, yearly
- **DomainRecordStatus**: unknown_status, validating, valid, invalid, not_found
- **DomainRecordLevel**: unknown_level, required, recommended, optional
- **DomainRecordDNSType**: unknown_dns_type, cname_dns_type, mx_dns_type, srv_dns_type, txt_dns_type

## Error Codes
- 400: Invalid input
- 401/403: Permission denied
- 404: Not found
- 429: Rate limited
- 500: Server error

## Notes / discrepancies
- The public developer-portal navigation groups aliases under a mailbox
  (`/mailboxes/{id}/aliases`), but the authoritative auto-generated SDK exposes
  aliases as a **top-level** collection (`/aliases`) with `mailbox_id` as a body
  field (create) or query filter (list). The implementation follows the SDK.
- Mailbox creation is a **batch** operation: `POST /batch-create-mailboxes` (there
  is no single-mailbox create endpoint).
- **Offers/plans**: the product literature references "offers", but no `offers`
  endpoint exists in the v1alpha1 API surface (no List/Get Offer). Not exposed.
