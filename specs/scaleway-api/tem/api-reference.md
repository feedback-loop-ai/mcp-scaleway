# Scaleway Transactional Email (TEM) API Reference

Base URL: `https://api.scaleway.com/transactional-email/v1alpha1/regions/{region}`

- Current API version: **v1alpha1** (verified against the official reference and the
  published OpenAPI schema `transactional-email/v1alpha1/schema.yml` on 2026-07-07).
- Regional API. Default region used by the tools: `fr-par`.

Official reference: https://www.scaleway.com/en/developers/api/transactional-email/

## Authentication
- Header: `X-Auth-Token: <secret_key>`

## Pagination
- List endpoints accept `page` (int, 1-based) and `page_size` (int) query params.
- List responses have shape `{ <collection>: T[], total_count: number }`.

## Domains

### List Domains
`GET /domains`
- Query: `page`, `page_size`, `project_id`, `status`, `name`, `organization_id`
- Response: `{ domains: Domain[], total_count: number }`
- Tool: `scaleway_tem_list_domains`

### Get Domain
`GET /domains/{domain_id}`
- Response: Domain object
- Tool: `scaleway_tem_get_domain`

### Create Domain
`POST /domains`
- Body: `{ project_id, domain_name, accept_tos, autoconfig? }`
- Response: Domain object
- Tool: `scaleway_tem_create_domain`

### Revoke Domain
`POST /domains/{domain_id}/revoke`
- Response: Domain object (status becomes `revoked`)
- Tool: `scaleway_tem_revoke_domain`

### Check Domain
`POST /domains/{domain_id}/check`
- Triggers a DNS check (DKIM/SPF/DMARC/MX).
- Response: Domain object
- Tool: `scaleway_tem_check_domain`

### Get Domain Last Status (DNS records verification)
`GET /domains/{domain_id}/verification`
- Response: DNS record status (SPF / DKIM / DMARC / MX records and errors).
- Tool: `scaleway_tem_get_domain_last_status`

## Emails

### List Emails
`GET /emails`
- Query: `page`, `page_size`, `project_id`, `domain_id`, `status`, `mail_from`, `mail_to`, `subject`, `search`, `message_id`, `since`, `until`
- Response: `{ emails: Email[], total_count: number }`
- Tool: `scaleway_tem_list_emails`

### Get Email
`GET /emails/{email_id}`
- Response: Email object
- Tool: `scaleway_tem_get_email`

### Create Email (send)
`POST /emails`
- Body: `{ from: {email, name?}, to: [{email, name?}], subject, text?, html?, project_id, attachments?: [{name, type, content}] }`
- Response: created Email object(s)
- Tool: `scaleway_tem_create_email`

### Cancel Email
`POST /emails/{email_id}/cancel`
- Response: Email object (status becomes `canceled`)
- Tool: `scaleway_tem_cancel_email`

## Statistics

### Get Statistics
`GET /statistics`
- Query: `project_id`, `domain_id`, `since`, `until`, `mail_from`
- Response: `{ total_count, new_count, sending_count, sent_count, failed_count, canceled_count }`
- Tool: `scaleway_tem_get_statistics`

## Webhooks

### List Webhooks
`GET /webhooks`
- Query: `page`, `page_size`, `domain_id`, `organization_id`
- Response: `{ webhooks: Webhook[], total_count: number }`
- Tool: `scaleway_tem_list_webhooks`

### Create Webhook
`POST /webhooks`
- Body: `{ domain_id, name, event_types, sns_arn }`
- Response: Webhook object
- Tool: `scaleway_tem_create_webhook`

### Update Webhook
`PATCH /webhooks/{webhook_id}`
- Body: `{ name?, event_types?, sns_arn? }`
- Response: Webhook object
- Tool: `scaleway_tem_update_webhook`

### Delete Webhook
`DELETE /webhooks/{webhook_id}`
- Response: empty
- Tool: `scaleway_tem_delete_webhook`

## Enums

### DomainStatus
`unknown`, `checked`, `unchecked`, `invalid`, `locked`, `revoked`, `pending`

### EmailStatus
`unknown`, `new`, `sending`, `sent`, `failed`, `canceled`

### WebhookEventType
`unknown_type`, `email_queued`, `email_dropped`, `email_deferred`, `email_delivered`, `email_spam`, `email_mailbox_not_found`

## Error Codes
Standard Scaleway HTTP error mapping applies:
- `400` invalid arguments
- `401` / `403` authentication / permission denied
- `404` resource not found
- `409` conflict
- `429` rate limited
- `5xx` server error
