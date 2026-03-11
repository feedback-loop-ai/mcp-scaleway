# Feature Specification: Scaleway Transactional Email (TEM) MCP Tools

**Feature Branch**: `032-tem`
**Created**: 2026-03-11
**Status**: Approved
**Input**: Implement MCP tools for the Scaleway Transactional Email API (regional email sending)

## User Scenarios & Testing

### User Story 1 - Domain Management (Priority: P1)

As an AI agent, I need to list, get, create, revoke, check, and verify transactional email domains so that I can manage email sending infrastructure programmatically.

**Why this priority**: Domains are the foundational resource of the TEM API. Emails cannot be sent without a verified domain.

**Independent Test**: Can be fully tested by creating a domain, listing it, checking DNS, getting verification status, and revoking it.

**Acceptance Scenarios**:

1. **Given** valid credentials and region, **When** I call `scaleway_tem_list_domains`, **Then** I receive a paginated list of domains with total_count
2. **Given** a valid domain_id and region, **When** I call `scaleway_tem_get_domain`, **Then** I receive the full domain object with status and DNS config
3. **Given** valid parameters (project_id, domain_name, accept_tos), **When** I call `scaleway_tem_create_domain`, **Then** a new domain is registered for TEM
4. **Given** a valid domain_id, **When** I call `scaleway_tem_revoke_domain`, **Then** the domain is revoked and email sending stops
5. **Given** a valid domain_id, **When** I call `scaleway_tem_check_domain`, **Then** a DNS check is triggered for DKIM/SPF verification
6. **Given** a valid domain_id, **When** I call `scaleway_tem_get_domain_last_status`, **Then** I receive the latest SPF/DKIM/DMARC verification status

---

### User Story 2 - Email Sending & Management (Priority: P1)

As an AI agent, I need to send, list, get, and cancel transactional emails so that I can manage email delivery programmatically.

**Why this priority**: Email sending is the core functionality of the TEM service.

**Independent Test**: Can be tested by sending an email, listing emails, getting details, and canceling a queued email.

**Acceptance Scenarios**:

1. **Given** valid credentials and region, **When** I call `scaleway_tem_list_emails`, **Then** I receive a paginated list of emails with filtering support
2. **Given** a valid email_id and region, **When** I call `scaleway_tem_get_email`, **Then** I receive the full email object with status and delivery attempts
3. **Given** valid parameters (from, to, subject, body), **When** I call `scaleway_tem_create_email`, **Then** a new email is queued for sending
4. **Given** a valid email_id of a queued email, **When** I call `scaleway_tem_cancel_email`, **Then** the email is canceled before delivery

---

### User Story 3 - Statistics (Priority: P2)

As an AI agent, I need to retrieve email sending statistics so that I can monitor delivery performance.

**Why this priority**: Statistics provide insight into email delivery health but are not required for basic email operations.

**Independent Test**: Can be tested by requesting statistics with various filters.

**Acceptance Scenarios**:

1. **Given** valid credentials and optional filters, **When** I call `scaleway_tem_get_statistics`, **Then** I receive aggregated email counts by status

---

### User Story 4 - Webhook Management (Priority: P2)

As an AI agent, I need to list, create, update, and delete webhooks so that I can receive email event notifications.

**Why this priority**: Webhooks enable event-driven architectures but are not required for basic email operations.

**Independent Test**: Can be tested by creating a webhook, listing it, updating it, and deleting it.

**Acceptance Scenarios**:

1. **Given** valid credentials and a domain_id, **When** I call `scaleway_tem_list_webhooks`, **Then** I receive a paginated list of webhooks
2. **Given** valid parameters (domain_id, name, event_types, sns_arn), **When** I call `scaleway_tem_create_webhook`, **Then** a new webhook is created
3. **Given** a valid webhook_id and update fields, **When** I call `scaleway_tem_update_webhook`, **Then** the webhook is updated
4. **Given** a valid webhook_id, **When** I call `scaleway_tem_delete_webhook`, **Then** the webhook is deleted

---

### Edge Cases

- Invalid region format returns a structured validation error
- Domain not found (404) returns a `not_found` error type
- Sending email from unverified domain returns appropriate error
- Missing required fields (e.g., no accept_tos on domain create) returns `invalid_input` error
- Canceling an already-sent email returns appropriate error
- Pagination with page > total pages returns empty items array
- Empty filter combinations handled correctly
- Webhook with invalid SNS ARN returns validation error

## Requirements

### Functional Requirements

- **FR-001**: System MUST list domains with pagination (page, page_size) and filtering (status, name, project_id, organization_id)
- **FR-002**: System MUST get a single domain by ID and region
- **FR-003**: System MUST create a domain with project_id, domain_name, accept_tos, and optional autoconfig
- **FR-004**: System MUST revoke a domain by ID and region
- **FR-005**: System MUST trigger DNS check on a domain by ID and region
- **FR-006**: System MUST get the last DNS verification status for a domain
- **FR-007**: System MUST list emails with pagination and filtering (status, sender, recipient, domain, date range, subject, search, message_id)
- **FR-008**: System MUST get a single email by ID and region
- **FR-009**: System MUST create/send an email with from, to, subject, text/html body, project_id, and optional attachments
- **FR-010**: System MUST cancel a queued email by ID and region
- **FR-011**: System MUST get email statistics with optional filters (project, domain, date range, sender)
- **FR-012**: System MUST list webhooks with pagination and filtering (domain_id, organization_id)
- **FR-013**: System MUST create a webhook with domain_id, name, event_types, and sns_arn
- **FR-014**: System MUST update a webhook's name, event_types, or sns_arn
- **FR-015**: System MUST delete a webhook by ID and region
- **FR-016**: All tools MUST validate inputs using Zod schemas
- **FR-017**: All Scaleway API errors MUST be mapped to structured MCP error responses
- **FR-018**: All list operations MUST support standard pagination (page, page_size, total_count)
- **FR-019**: All tools MUST accept a region parameter (regional API locality)

### Key Entities

- **Domain**: Email sending domain with id, name, region, project_id, status, dkim_config, spf_config, statistics, autoconfig, created_at, revoked_at
- **Email**: Transactional email with id, message_id, project_id, status, mail_from, rcpt_to, subject, try_count, last_tries, created_at, updated_at
- **Statistics**: Aggregated counts with total_count, new_count, sending_count, sent_count, failed_count, canceled_count
- **Webhook**: Event notification endpoint with id, domain_id, name, event_types, sns_arn, created_at, updated_at
- **DomainLastStatus**: DNS verification status with domain_id, spf_record, dkim_record, dmarc_record

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 15 MCP tools are registered and callable via the MCP protocol
- **SC-002**: 100% line and branch code coverage across all TEM tool files
- **SC-003**: All tools map to documented Scaleway TEM API endpoints
- **SC-004**: Contract tests validate request/response shapes for every tool
- **SC-005**: Parity matrix includes all TEM API operations

## Clarifications

**Resolved decisions from self-clarification:**

- **Locality**: Regional API. Supported regions: fr-par, nl-ams
- **API prefix**: `transactional-email/v1alpha1`
- **Pagination**: Standard Scaleway page/page_size with total_count in responses
- **Auth**: SCW_ACCESS_KEY + SCW_SECRET_KEY + SCW_DEFAULT_PROJECT_ID (via shared auth module)
- **Tool naming**: `scaleway_tem_{action}_{resource}` pattern (e.g., `scaleway_tem_list_domains`)
- **Error handling**: Use shared `mapScalewayError` + `formatErrorResponse` from `src/shared/errors.ts`
- **Client**: Use shared `createScalewayClient` from `src/shared/client.ts` with `loadAuthConfig` from `src/shared/auth.ts`
- **Domain statuses**: unknown, checked, unchecked, invalid, locked, revoked, pending
- **Email statuses**: unknown, new, sending, sent, failed, canceled
- **Webhook event types**: unknown_type, email_queued, email_dropped, email_deferred, email_delivered, email_spam, email_mailbox_not_found
