# Quickstart: Scaleway Mailbox MCP Tools

The Mailbox tools let an agent register a domain, provision mailboxes and aliases,
and manage their lifecycle through the Scaleway Mailbox API (`mailbox/v1alpha1`,
Beta, global scope). Authentication uses your Scaleway secret key
(`X-Auth-Token`) via the shared client configuration.

## Typical flow

### 1. Register a domain

```json
// scaleway_mailbox_create_domain
{ "name": "example.com" }
```

The domain starts in `creating`, then `waiting_validation`.

### 2. Fetch and set the required DNS records

```json
// scaleway_mailbox_get_domain_records
{ "domainId": "<domain-uuid>" }
```

The response contains nullable record slots (`mx`, `spf`, `dkim`, `dmarc`,
`domain_validation`, ...). Add every `required` record to your DNS zone.

### 3. Trigger validation

```json
// scaleway_mailbox_validate_domain_records
{ "domainId": "<domain-uuid>" }
// → { "validated": true, "domainId": "<domain-uuid>" }
```

Poll the domain until `status: ready`:

```json
// scaleway_mailbox_get_domain
{ "domainId": "<domain-uuid>" }
```

### 4. Create mailboxes (batch)

```json
// scaleway_mailbox_create_mailboxes
{
  "domainId": "<domain-uuid>",
  "subscriptionPeriod": "monthly",
  "mailboxes": [
    { "localPart": "john", "password": "s3cret!" },
    { "localPart": "jane", "password": "an0ther!" }
  ]
}
```

### 5. Manage a mailbox

```json
// scaleway_mailbox_update_mailbox  (change password)
{ "mailboxId": "<mailbox-uuid>", "newPassword": "n3wp4ss!" }

// scaleway_mailbox_update_mailbox  (switch to yearly billing)
{ "mailboxId": "<mailbox-uuid>", "subscriptionPeriod": "yearly" }
```

### 6. Add an alias

```json
// scaleway_mailbox_create_alias
{ "mailboxId": "<mailbox-uuid>", "localPart": "sales", "description": "Sales inbox" }
```

### 7. Delete and restore

```json
// scaleway_mailbox_delete_mailbox  → status deletion_scheduled
{ "mailboxId": "<mailbox-uuid>" }

// scaleway_mailbox_restore_mailbox  → status restoring (before final deletion)
{ "mailboxId": "<mailbox-uuid>" }
```

## Listing & filtering

All list tools accept `page`/`pageSize` and return
`{ items, totalCount, page, pageSize }`.

```json
// scaleway_mailbox_list_mailboxes
{ "domainId": "<domain-uuid>", "statuses": ["ready"], "search": "john", "orderBy": "email_asc" }
```

## Notes

- **No region.** The Mailbox API is global — no tool takes a `region`.
- **Beta limits.** During Beta, quotas apply (e.g., a capped number of mailboxes per
  project and per-mailbox storage). Consult the Scaleway docs for current limits.
- **Offers.** There is no offers/plans endpoint; pick a billing cadence via
  `subscriptionPeriod` (monthly/yearly) at create time.
