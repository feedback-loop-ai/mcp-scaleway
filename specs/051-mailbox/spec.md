# 051-mailbox: Mailbox API (Beta)

## Overview
MCP tools for the Scaleway Mailbox API (`mailbox/v1alpha1`, Beta) — a professional
email service that lets you register domains and manage mailboxes and aliases with
IMAP/POP3/SMTP and webmail access. The API is **global** (no region/zone segment)
and falls under the "Domains & Web Hosting" product catalog group.

## User Stories

### P1 - Domain lifecycle
- As a user, I can list, get, register (create), and delete Mailbox domains
- As a user, I can fetch the DNS records required to configure a domain and trigger
  their validation

### P1 - Mailbox lifecycle
- As a user, I can batch-create one or more mailboxes in a domain
- As a user, I can list, get, update (subscription period / password), delete, and
  restore mailboxes

### P2 - Alias management
- As a user, I can create, list, get, and delete email aliases for a mailbox

## Entities

### Domain
- id: string (UUID)
- project_id: string (UUID)
- name: string (FQDN)
- status: enum (unknown_status, creating, waiting_validation, validating, validation_failed, provisioning, ready, deleting)
- mailbox_total_count: number
- created_at / updated_at: string (ISO datetime, nullable)
- webmail_url / imap_url / pop3_url / smtp_url: string

### Mailbox
- id: string (UUID)
- domain_id: string (UUID)
- email: string (local_part@domain)
- status: enum (unknown_status, creating, waiting_payment, waiting_domain, ready, deletion_scheduled, locked, renewing, deleting, restoring, payment_failed)
- subscription_period / next_subscription_period: enum (unknown_subscription_period, canceled, monthly, yearly)
- subscription_period_started_at / next_subscription_period_starts_at / deletion_scheduled_at: string (ISO datetime, nullable)
- created_at / updated_at: string (ISO datetime, nullable)

### Alias
- id: string (UUID)
- email: string
- mailbox_id: string (UUID)
- description: string
- status: enum (unknown_status, provisioning, deleting, ready)
- created_at / updated_at: string (ISO datetime, nullable)

### DomainRecord
- id, domain_id: string (UUID)
- status: enum (unknown_status, validating, valid, invalid, not_found)
- level: enum (unknown_level, required, recommended, optional)
- dns_type: enum (unknown_dns_type, cname_dns_type, mx_dns_type, srv_dns_type, txt_dns_type)
- dns_name, dns_value: string
- error: string | null
- created_at / updated_at: string (ISO datetime, nullable)

## Tools

| Tool | HTTP | Priority |
|------|------|----------|
| scaleway_mailbox_list_domains | GET /mailbox/v1alpha1/domains | P1 |
| scaleway_mailbox_get_domain | GET /mailbox/v1alpha1/domains/{domain_id} | P1 |
| scaleway_mailbox_create_domain | POST /mailbox/v1alpha1/domains | P1 |
| scaleway_mailbox_delete_domain | DELETE /mailbox/v1alpha1/domains/{domain_id} | P1 |
| scaleway_mailbox_get_domain_records | GET /mailbox/v1alpha1/domains/{domain_id}/records | P1 |
| scaleway_mailbox_validate_domain_records | POST /mailbox/v1alpha1/domains/{domain_id}/validate-records | P1 |
| scaleway_mailbox_create_mailboxes | POST /mailbox/v1alpha1/batch-create-mailboxes | P1 |
| scaleway_mailbox_list_mailboxes | GET /mailbox/v1alpha1/mailboxes | P1 |
| scaleway_mailbox_get_mailbox | GET /mailbox/v1alpha1/mailboxes/{mailbox_id} | P1 |
| scaleway_mailbox_update_mailbox | PATCH /mailbox/v1alpha1/mailboxes/{mailbox_id} | P1 |
| scaleway_mailbox_delete_mailbox | DELETE /mailbox/v1alpha1/mailboxes/{mailbox_id} | P1 |
| scaleway_mailbox_restore_mailbox | POST /mailbox/v1alpha1/mailboxes/{mailbox_id}/restore | P1 |
| scaleway_mailbox_create_alias | POST /mailbox/v1alpha1/aliases | P2 |
| scaleway_mailbox_list_aliases | GET /mailbox/v1alpha1/aliases | P2 |
| scaleway_mailbox_get_alias | GET /mailbox/v1alpha1/aliases/{alias_id} | P2 |
| scaleway_mailbox_delete_alias | DELETE /mailbox/v1alpha1/aliases/{alias_id} | P2 |

## Out of Scope

- **Offers / plans**: The product literature references mailbox "offers", but the
  `mailbox/v1alpha1` API surface exposes no `offers` endpoint (no List/Get Offer in
  the reference or SDK). No tool is provided; subscription selection is expressed
  through the `subscription_period` field on mailbox create/update instead.
- **Webmail / IMAP / SMTP protocol access**: These are end-user mail protocols, not
  management API operations. The connection URLs are surfaced on the Domain entity.
- **Wait-for-status polling helpers**: The SDK offers `WaitForDomain/Mailbox/Alias`
  convenience loops; MCP tools stay stateless and return the current resource state.
