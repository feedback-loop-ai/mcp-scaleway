# Data Model: Scaleway Mailbox MCP Tools

**Feature**: 051-mailbox | **Date**: 2026-07-07

## Entities

### Domain

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique domain identifier |
| project_id | string (UUID) | yes | Project the domain belongs to |
| name | string | yes | Fully qualified domain name |
| status | enum | yes | unknown_status, creating, waiting_validation, validating, validation_failed, provisioning, ready, deleting |
| mailbox_total_count | number | yes | Number of mailboxes in the domain |
| created_at | string (ISO 8601) \| null | yes | Creation timestamp |
| updated_at | string (ISO 8601) \| null | yes | Last update timestamp |
| webmail_url | string | yes | Webmail service URL |
| imap_url | string | yes | IMAP service URL |
| pop3_url | string | yes | POP3 service URL |
| smtp_url | string | yes | SMTP service URL |

### Mailbox

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique mailbox identifier |
| domain_id | string (UUID) | yes | Parent domain |
| email | string | yes | Full email address (local_part@domain) |
| status | enum | yes | unknown_status, creating, waiting_payment, waiting_domain, ready, deletion_scheduled, locked, renewing, deleting, restoring, payment_failed |
| subscription_period | enum | yes | unknown_subscription_period, canceled, monthly, yearly |
| subscription_period_started_at | string (ISO 8601) \| null | yes | Current period start |
| next_subscription_period | enum | yes | Same enum as subscription_period |
| next_subscription_period_starts_at | string (ISO 8601) \| null | yes | Next period start |
| created_at | string (ISO 8601) \| null | yes | Creation timestamp |
| updated_at | string (ISO 8601) \| null | yes | Last update timestamp |
| deletion_scheduled_at | string (ISO 8601) \| null | yes | Unrecoverable deletion time |

### Alias

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique alias identifier |
| email | string | yes | Alias email address |
| mailbox_id | string (UUID) | yes | Mailbox the alias forwards to |
| description | string | yes | Alias description |
| status | enum | yes | unknown_status, provisioning, deleting, ready |
| created_at | string (ISO 8601) \| null | yes | Creation timestamp |
| updated_at | string (ISO 8601) \| null | yes | Last update timestamp |

### DomainRecord

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique record identifier |
| domain_id | string (UUID) | yes | Parent domain |
| status | enum | yes | unknown_status, validating, valid, invalid, not_found |
| level | enum | yes | unknown_level, required, recommended, optional |
| dns_type | enum | yes | unknown_dns_type, cname_dns_type, mx_dns_type, srv_dns_type, txt_dns_type |
| dns_name | string | yes | DNS record name |
| dns_value | string | yes | DNS record value |
| error | string \| null | yes | Error detail if the record is invalid |
| created_at | string (ISO 8601) \| null | yes | Creation timestamp |
| updated_at | string (ISO 8601) \| null | yes | Last update timestamp |

### GetDomainRecordsResponse (response only)

A fixed set of nullable `DomainRecord` slots (each may be `null` when not
applicable): `autoconfig, autodiscover, caldav, carddav, dkim, dmarc,
domain_validation, imap, mx, pop3, spf, submission`.

### MailboxParameters (input only, batch create)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| localPart | string | yes | Local part of the email (before @) |
| password | string | yes | Mailbox password |
