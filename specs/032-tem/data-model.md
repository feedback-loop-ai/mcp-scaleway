# Data Model: Scaleway Transactional Email (TEM) MCP Tools

**Feature**: 032-tem | **Date**: 2026-03-11

## Entities

### Domain

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique domain identifier |
| name | string | yes | Domain name (e.g., example.com) |
| region | string | yes | Scaleway region (e.g., fr-par) |
| project_id | string (UUID) | yes | Project ID |
| status | enum | yes | unknown, checked, unchecked, invalid, locked, revoked, pending |
| created_at | string (ISO 8601)/null | no | Creation timestamp |
| next_check_at | string (ISO 8601)/null | no | Next scheduled DNS check |
| last_valid_at | string (ISO 8601)/null | no | Last time domain was validated |
| dkim_config | DkimConfig/null | no | DKIM configuration |
| spf_config | SpfConfig/null | no | SPF configuration |
| statistics | DomainStatistics/null | no | Aggregated email statistics |
| revoked_at | string (ISO 8601)/null | no | Revocation timestamp |
| last_error | string/null | no | Last error message |
| autoconfig | boolean | no | Whether DNS autoconfig is enabled |

### DkimConfig

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| public_key | string | yes | DKIM public key |
| selector | string | yes | DKIM selector |

### SpfConfig

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| is_valid | boolean | yes | Whether SPF record is valid |

### DomainStatistics

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| total_count | number | yes | Total emails sent |
| sent_count | number | yes | Successfully sent count |
| failed_count | number | yes | Failed count |
| canceled_count | number | yes | Canceled count |

### DomainLastStatus

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| domain_id | string (UUID) | yes | Domain identifier |
| spf_record | object | no | SPF record status and value |
| dkim_record | object | no | DKIM record status and value |
| dmarc_record | object | no | DMARC record status and value |

### Email

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique email identifier |
| message_id | string | no | SMTP message ID |
| project_id | string (UUID) | yes | Project ID |
| status | enum | yes | unknown, new, sending, sent, failed, canceled |
| created_at | string (ISO 8601)/null | no | Creation timestamp |
| updated_at | string (ISO 8601)/null | no | Last update timestamp |
| mail_from | string | yes | Sender email address |
| rcpt_to | string/null | no | Recipient email address |
| subject | string/null | no | Email subject |
| try_count | number | no | Number of delivery attempts |
| last_tries | array | no | Last delivery attempt details (rank, tried_at, code, message) |

### Statistics

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| total_count | number | yes | Total email count |
| new_count | number | yes | New (queued) email count |
| sending_count | number | yes | Currently sending count |
| sent_count | number | yes | Successfully sent count |
| failed_count | number | yes | Failed count |
| canceled_count | number | yes | Canceled count |

### Webhook

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique webhook identifier |
| domain_id | string (UUID) | yes | Associated domain ID |
| name | string | yes | Webhook name |
| event_types | WebhookEventType[] | yes | Subscribed event types |
| sns_arn | string | yes | SNS ARN endpoint for notifications |
| created_at | string (ISO 8601)/null | no | Creation timestamp |
| updated_at | string (ISO 8601)/null | no | Last update timestamp |

### WebhookEventType (enum)

| Value | Description |
|-------|-------------|
| unknown_type | Unknown event type |
| email_queued | Email was queued for delivery |
| email_dropped | Email was dropped |
| email_deferred | Email delivery was deferred |
| email_delivered | Email was delivered |
| email_spam | Email was flagged as spam |
| email_mailbox_not_found | Recipient mailbox not found |
