# Feature Specification: Scaleway Web Hosting MCP Tools

**Feature Branch**: `034-webhosting`
**Created**: 2026-03-11
**Status**: Approved
**Input**: Implement MCP tools for the Scaleway Web Hosting API (regional managed hosting)

## User Scenarios & Testing

### User Story 1 - Hosting CRUD & Lifecycle (Priority: P1)

As an AI agent, I need to list, get, create, update, delete, and restore Scaleway web hostings so that I can manage shared hosting infrastructure programmatically.

**Why this priority**: Hostings are the core resource of the Web Hosting API. Every other resource (offers, DNS records, control panels) exists to support hostings.

**Independent Test**: Can be fully tested by creating a hosting, listing it, getting it, updating it, and deleting/restoring it.

**Acceptance Scenarios**:

1. **Given** valid credentials and region, **When** I call `scaleway_webhosting_list_hostings`, **Then** I receive a paginated list of hostings with total_count
2. **Given** a valid hosting_id and region, **When** I call `scaleway_webhosting_get_hosting`, **Then** I receive the full hosting object including status, domain, DNS status, and cPanel URLs
3. **Given** valid parameters (offer_id, domain, region), **When** I call `scaleway_webhosting_create_hosting`, **Then** a new hosting is created and returned
4. **Given** a valid hosting_id, region, and update fields, **When** I call `scaleway_webhosting_update_hosting`, **Then** the hosting is updated
5. **Given** a valid hosting_id and region, **When** I call `scaleway_webhosting_delete_hosting`, **Then** the hosting is deleted
6. **Given** a previously deleted hosting_id and region, **When** I call `scaleway_webhosting_restore_hosting`, **Then** the hosting is restored

---

### User Story 2 - DNS Records (Priority: P2)

As an AI agent, I need to retrieve DNS records for a web hosting so that I can verify or configure domain DNS settings.

**Why this priority**: DNS records are essential for validating hosting setup but are read-only and tied to an existing hosting.

**Independent Test**: Can be tested by getting DNS records for an existing hosting.

**Acceptance Scenarios**:

1. **Given** a valid hosting_id and region, **When** I call `scaleway_webhosting_get_dns_records`, **Then** I receive the expected DNS records for the hosting

---

### User Story 3 - Offers & Control Panels (Priority: P3)

As an AI agent, I need to list available hosting offers and control panels so that I can select the appropriate plan when creating a hosting.

**Why this priority**: Offers and control panels are reference data needed before creating a hosting.

**Independent Test**: Can be tested by listing offers and control panels independently.

**Acceptance Scenarios**:

1. **Given** valid credentials and region, **When** I call `scaleway_webhosting_list_offers`, **Then** I receive a list of offers with pricing and availability
2. **Given** valid credentials and region, **When** I call `scaleway_webhosting_list_control_panels`, **Then** I receive a list of available control panels

---

### Edge Cases

- Invalid region format returns a structured validation error
- Hosting not found (404) returns a `not_found` error type
- Missing required fields (e.g., no offer_id on create) returns `invalid_input` error
- Restoring a hosting that is not deleted returns an appropriate error
- Pagination with page > total pages returns empty items array
- Empty tag arrays and filter combinations handled correctly

## Requirements

### Functional Requirements

- **FR-001**: System MUST list hostings with pagination (page, page_size) and filtering (domain, tags, statuses, project_id, organization_id, control_panels, order_by)
- **FR-002**: System MUST get a single hosting by ID and region
- **FR-003**: System MUST create a hosting with offer_id, domain, and optional project_id, tags, option_ids, language, domain_configuration, skip_welcome_email
- **FR-004**: System MUST update a hosting by ID (email, tags, option_ids, offer_id, protected)
- **FR-005**: System MUST delete a hosting by ID and region
- **FR-006**: System MUST restore a previously deleted hosting by ID and region
- **FR-007**: System MUST get DNS records for a hosting by ID and region
- **FR-008**: System MUST list available offers with optional filtering (order_by, hosting_id, control_panels, without_options, only_options)
- **FR-009**: System MUST list available control panels by region
- **FR-010**: All tools MUST validate inputs using Zod schemas
- **FR-011**: All Scaleway API errors MUST be mapped to structured MCP error responses
- **FR-012**: All list operations MUST support standard pagination (page, page_size, total_count)
- **FR-013**: All tools MUST accept an optional region parameter (regional API locality)

### Key Entities

- **Hosting**: Managed web hosting with id, region, project_id, status, platform_hostname, offer_id, offer_name, domain, tags, dns_status, cpanel_urls, username, contact_email, ipv4, ipv6, protected, created_at, updated_at
- **Offer**: Hosting plan with id, billing_operation_path, product, price, available, quota_warnings, end_of_life, control_panel_name
- **ControlPanel**: Hosting management panel with name, available, logo_url
- **DnsRecord**: DNS entry with name, type, ttl, value, priority, status
- **NameServer**: DNS name server with hostname, is_default, status

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 9 MCP tools are registered and callable via the MCP protocol
- **SC-002**: 100% line and branch code coverage across all web hosting tool files
- **SC-003**: All tools map to documented Scaleway API endpoints
- **SC-004**: Contract tests validate request/response shapes for every tool
- **SC-005**: Parity matrix includes all Web Hosting API operations

## Clarifications

**Resolved decisions from self-clarification:**

- **Locality**: Regional API. Supported regions: fr-par, nl-ams
- **Pagination**: Standard Scaleway page/page_size with total_count in responses (list hostings only; offers and control panels are non-paginated)
- **Auth**: SCW_ACCESS_KEY + SCW_SECRET_KEY + SCW_DEFAULT_PROJECT_ID (via shared auth module)
- **Tool naming**: `scaleway_webhosting_{action}_{resource}` pattern (e.g., `scaleway_webhosting_list_hostings`)
- **Error handling**: Use shared `mapScalewayError` + `formatErrorResponse` from `src/shared/errors.ts`
- **Client**: Use shared `createScalewayClient` from `src/shared/client.ts` with `loadAuthConfig` from `src/shared/auth.ts`
- **SDK**: Uses `@scaleway/sdk-client` with direct HTTP calls to the Web Hosting v1 API
- **API prefix**: `/webhosting/v1` with region-scoped endpoints (`/regions/{region}/...`)
- **Hosting statuses**: unknown_status, delivering, ready, deleting, error, locked, migrating
- **DNS statuses**: unknown_dns_status, valid, invalid, pending
