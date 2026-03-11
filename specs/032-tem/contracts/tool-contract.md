# Tool Contracts: Scaleway Transactional Email (TEM) MCP Tools

**Feature**: 032-tem | **Date**: 2026-03-11

## Domain Tools

### scaleway_tem_list_domains

**Scaleway API**: `GET /transactional-email/v1alpha1/regions/{region}/domains`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | fr-par | Scaleway region |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| project_id | string | no | - | Filter by project ID |
| status | enum | no | - | Filter by domain status |
| name | string | no | - | Filter by domain name |
| organization_id | string | no | - | Filter by organization ID |

**Output**: `{ items: Domain[], total_count: number, page: number, page_size: number, total_pages: number }`

---

### scaleway_tem_get_domain

**Scaleway API**: `GET /transactional-email/v1alpha1/regions/{region}/domains/{domain_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region |
| domain_id | string | yes | Domain UUID |

**Output**: `{ Domain }` (full domain object)

---

### scaleway_tem_create_domain

**Scaleway API**: `POST /transactional-email/v1alpha1/regions/{region}/domains`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region |
| project_id | string | yes | Project ID |
| domain_name | string | yes | Domain name to register |
| accept_tos | boolean | yes | Accept terms of service |
| autoconfig | boolean | no | Enable DNS autoconfig |

**Output**: `{ Domain }` (created domain object)

---

### scaleway_tem_revoke_domain

**Scaleway API**: `POST /transactional-email/v1alpha1/regions/{region}/domains/{domain_id}/revoke`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region |
| domain_id | string | yes | Domain UUID to revoke |

**Output**: `{ Domain }` (revoked domain object)

---

### scaleway_tem_check_domain

**Scaleway API**: `POST /transactional-email/v1alpha1/regions/{region}/domains/{domain_id}/check`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region |
| domain_id | string | yes | Domain UUID to check |

**Output**: `{ Domain }` (domain object with updated check status)

---

### scaleway_tem_get_domain_last_status

**Scaleway API**: `GET /transactional-email/v1alpha1/regions/{region}/domains/{domain_id}/verification`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region |
| domain_id | string | yes | Domain UUID |

**Output**: `{ DomainLastStatus }` (SPF, DKIM, DMARC record statuses)

---

## Email Tools

### scaleway_tem_list_emails

**Scaleway API**: `GET /transactional-email/v1alpha1/regions/{region}/emails`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | fr-par | Scaleway region |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| project_id | string | no | - | Filter by project ID |
| domain_id | string | no | - | Filter by domain ID |
| status | enum | no | - | Filter by email status |
| mail_from | string | no | - | Filter by sender |
| mail_to | string | no | - | Filter by recipient |
| subject | string | no | - | Filter by subject (contains) |
| search | string | no | - | Search term |
| message_id | string | no | - | Filter by message ID |
| since | string | no | - | Filter emails created after (RFC 3339) |
| until | string | no | - | Filter emails created before (RFC 3339) |

**Output**: `{ items: Email[], total_count: number, page: number, page_size: number, total_pages: number }`

---

### scaleway_tem_get_email

**Scaleway API**: `GET /transactional-email/v1alpha1/regions/{region}/emails/{email_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region |
| email_id | string | yes | Email UUID |

**Output**: `{ Email }` (full email object)

---

### scaleway_tem_create_email

**Scaleway API**: `POST /transactional-email/v1alpha1/regions/{region}/emails`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region |
| from | object | yes | Sender { email: string, name?: string } |
| to | array | yes | Recipients [{ email: string, name?: string }] (min 1) |
| subject | string | yes | Email subject |
| text | string | no | Plain text body |
| html | string | no | HTML body |
| project_id | string | yes | Project ID |
| attachments | array | no | Attachments [{ name, type, content (base64) }] |

**Output**: `{ Email }` (created email object)

---

### scaleway_tem_cancel_email

**Scaleway API**: `POST /transactional-email/v1alpha1/regions/{region}/emails/{email_id}/cancel`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region |
| email_id | string | yes | Email UUID to cancel |

**Output**: `{ Email }` (canceled email object)

---

## Statistics Tool

### scaleway_tem_get_statistics

**Scaleway API**: `GET /transactional-email/v1alpha1/regions/{region}/statistics`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | fr-par | Scaleway region |
| project_id | string | no | - | Filter by project ID |
| domain_id | string | no | - | Filter by domain ID |
| since | string | no | - | Start date (RFC 3339) |
| until | string | no | - | End date (RFC 3339) |
| mail_from | string | no | - | Filter by sender |

**Output**: `{ Statistics }` (aggregated counts)

---

## Webhook Tools

### scaleway_tem_list_webhooks

**Scaleway API**: `GET /transactional-email/v1alpha1/regions/{region}/webhooks`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | fr-par | Scaleway region |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| domain_id | string | yes | - | Domain ID |
| organization_id | string | no | - | Filter by organization ID |

**Output**: `{ items: Webhook[], total_count: number, page: number, page_size: number, total_pages: number }`

---

### scaleway_tem_create_webhook

**Scaleway API**: `POST /transactional-email/v1alpha1/regions/{region}/webhooks`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region |
| domain_id | string | yes | Domain ID |
| name | string | yes | Webhook name |
| event_types | enum[] | yes | Event types (min 1): unknown_type, email_queued, email_dropped, email_deferred, email_delivered, email_spam, email_mailbox_not_found |
| sns_arn | string | yes | SNS ARN endpoint |

**Output**: `{ Webhook }` (created webhook object)

---

### scaleway_tem_update_webhook

**Scaleway API**: `PATCH /transactional-email/v1alpha1/regions/{region}/webhooks/{webhook_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region |
| webhook_id | string | yes | Webhook UUID |
| name | string | no | New webhook name |
| event_types | enum[] | no | New event types |
| sns_arn | string | no | New SNS ARN |

**Output**: `{ Webhook }` (updated webhook object)

---

### scaleway_tem_delete_webhook

**Scaleway API**: `DELETE /transactional-email/v1alpha1/regions/{region}/webhooks/{webhook_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region |
| webhook_id | string | yes | Webhook UUID |

**Output**: `{ message: "Webhook deleted successfully" }`
