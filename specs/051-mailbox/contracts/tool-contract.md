# Tool Contracts: Scaleway Mailbox MCP Tools

**Feature**: 051-mailbox | **Date**: 2026-07-07

All tools are **global-scoped** — no `region` parameter. List outputs are wrapped as
`{ items, totalCount, page, pageSize }`.

## Domain Tools

### scaleway_mailbox_list_domains
**Scaleway API**: `GET /mailbox/v1alpha1/domains`

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| projectId | string (UUID) | no | - | Filter by project ID |
| statuses | DomainStatus[] | no | - | Filter by one or more statuses |
| search | string | no | - | Search by domain name |
| orderBy | string | no | - | Order results (e.g., name_asc) |

**Output**: `{ items: Domain[], totalCount, page, pageSize }`

### scaleway_mailbox_get_domain
**Scaleway API**: `GET /mailbox/v1alpha1/domains/{domain_id}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| domainId | string (UUID) | yes | Domain ID |

**Output**: Domain object

### scaleway_mailbox_create_domain
**Scaleway API**: `POST /mailbox/v1alpha1/domains`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Fully qualified domain name |
| projectId | string (UUID) | no | Project ID (default project if omitted) |

**Output**: Domain object

### scaleway_mailbox_delete_domain
**Scaleway API**: `DELETE /mailbox/v1alpha1/domains/{domain_id}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| domainId | string (UUID) | yes | Domain ID |

**Output**: Domain object (status: deleting)

### scaleway_mailbox_get_domain_records
**Scaleway API**: `GET /mailbox/v1alpha1/domains/{domain_id}/records`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| domainId | string (UUID) | yes | Domain ID |

**Output**: GetDomainRecordsResponse (nullable record slots)

### scaleway_mailbox_validate_domain_records
**Scaleway API**: `POST /mailbox/v1alpha1/domains/{domain_id}/validate-records`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| domainId | string (UUID) | yes | Domain ID |

**Output**: `{ validated: true, domainId }`

## Mailbox Tools

### scaleway_mailbox_create_mailboxes
**Scaleway API**: `POST /mailbox/v1alpha1/batch-create-mailboxes`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| domainId | string (UUID) | yes | Domain to create mailboxes in |
| subscriptionPeriod | enum (monthly, yearly) | yes | Subscription renewal period |
| mailboxes | { localPart, password }[] | yes | One or more mailboxes (min 1) |

**Output**: `{ mailboxes: Mailbox[] }`

### scaleway_mailbox_list_mailboxes
**Scaleway API**: `GET /mailbox/v1alpha1/mailboxes`

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| page | number | no | 1 | Page number |
| pageSize | number | no | 50 | Items per page |
| domainId | string (UUID) | no | - | Filter by domain |
| projectId | string (UUID) | no | - | Filter by project |
| statuses | MailboxStatus[] | no | - | Filter by one or more statuses |
| search | string | no | - | Search by name/local_part |
| orderBy | string | no | - | Order results (e.g., email_asc) |

**Output**: `{ items: Mailbox[], totalCount, page, pageSize }`

### scaleway_mailbox_get_mailbox
**Scaleway API**: `GET /mailbox/v1alpha1/mailboxes/{mailbox_id}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| mailboxId | string (UUID) | yes | Mailbox ID |

**Output**: Mailbox object

### scaleway_mailbox_update_mailbox
**Scaleway API**: `PATCH /mailbox/v1alpha1/mailboxes/{mailbox_id}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| mailboxId | string (UUID) | yes | Mailbox ID |
| subscriptionPeriod | enum (monthly, yearly, canceled) | no | New subscription period |
| newPassword | string | no | New mailbox password |

**Output**: Mailbox object

### scaleway_mailbox_delete_mailbox
**Scaleway API**: `DELETE /mailbox/v1alpha1/mailboxes/{mailbox_id}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| mailboxId | string (UUID) | yes | Mailbox ID |

**Output**: Mailbox object (status: deletion_scheduled)

### scaleway_mailbox_restore_mailbox
**Scaleway API**: `POST /mailbox/v1alpha1/mailboxes/{mailbox_id}/restore`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| mailboxId | string (UUID) | yes | Mailbox ID (in deletion_scheduled status) |

**Output**: Mailbox object (status: restoring)

## Alias Tools

### scaleway_mailbox_create_alias
**Scaleway API**: `POST /mailbox/v1alpha1/aliases`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| mailboxId | string (UUID) | yes | Mailbox to associate |
| localPart | string | yes | Local part of the alias address |
| description | string | no | Optional description |

**Output**: Alias object

### scaleway_mailbox_list_aliases
**Scaleway API**: `GET /mailbox/v1alpha1/aliases`

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| page | number | no | 1 | Page number |
| pageSize | number | no | 50 | Items per page |
| mailboxId | string (UUID) | no | - | Filter by mailbox |
| projectId | string (UUID) | no | - | Filter by project |
| status | AliasStatus | no | - | Filter by status |
| orderBy | string | no | - | Order results (e.g., name_asc) |

**Output**: `{ items: Alias[], totalCount, page, pageSize }`

### scaleway_mailbox_get_alias
**Scaleway API**: `GET /mailbox/v1alpha1/aliases/{alias_id}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| aliasId | string (UUID) | yes | Alias ID |

**Output**: Alias object

### scaleway_mailbox_delete_alias
**Scaleway API**: `DELETE /mailbox/v1alpha1/aliases/{alias_id}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| aliasId | string (UUID) | yes | Alias ID |

**Output**: Alias object (status: deleting)
