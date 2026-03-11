# Feature Specification: Scaleway Domain Registrar MCP Tools

**Feature Branch**: `020-domain-registrar`
**Created**: 2026-03-11
**Status**: Approved
**Input**: Implement MCP tools for the Scaleway Domain Registrar API (domain registration, contacts, TLDs)

## User Scenarios & Testing

### User Story 1 - Domain Management (Priority: P1)

As an AI agent, I need to list, get, register, renew, transfer, and update domains so that I can manage domain name registrations programmatically.

**Why this priority**: Domains are the core resource of the Domain Registrar API. Contacts and TLDs exist to support domain operations.

**Independent Test**: Can be fully tested by listing domains, checking availability, registering a domain, enabling/disabling auto-renew, renewing, and updating contacts.

**Acceptance Scenarios**:

1. **Given** valid credentials, **When** I call `scaleway_domain_registrar_list_domains`, **Then** I receive a paginated list of domains with total_count
2. **Given** a valid domain name, **When** I call `scaleway_domain_registrar_get_domain`, **Then** I receive the full domain object with status, auto-renew, DNSSEC, and contact details
3. **Given** a valid domain name, project, and owner contact, **When** I call `scaleway_domain_registrar_register_domain`, **Then** the domain is registered
4. **Given** a valid domain name, **When** I call `scaleway_domain_registrar_renew_domain`, **Then** the domain registration is renewed
5. **Given** a valid domain name and auth code, **When** I call `scaleway_domain_registrar_transfer_domain`, **Then** the domain transfer is initiated
6. **Given** a valid domain name and contact IDs, **When** I call `scaleway_domain_registrar_update_domain`, **Then** the domain contacts are updated
7. **Given** a valid domain name, **When** I call `scaleway_domain_registrar_enable_auto_renew`, **Then** auto-renewal is enabled
8. **Given** a valid domain name, **When** I call `scaleway_domain_registrar_disable_auto_renew`, **Then** auto-renewal is disabled
9. **Given** a domain name, **When** I call `scaleway_domain_registrar_check_domain_availability`, **Then** I receive availability status

---

### User Story 2 - Contact Management (Priority: P2)

As an AI agent, I need to list, get, create, and update domain registration contacts so that I can manage WHOIS contact information for domains.

**Why this priority**: Contacts are required for domain registration but can be managed independently.

**Independent Test**: Can be tested by creating a contact, listing contacts, getting a contact, and updating it.

**Acceptance Scenarios**:

1. **Given** valid credentials, **When** I call `scaleway_domain_registrar_list_contacts`, **Then** I receive a paginated list of contacts with total_count
2. **Given** a valid contact_id, **When** I call `scaleway_domain_registrar_get_contact`, **Then** I receive the full contact object
3. **Given** valid contact details (name, email, phone, address), **When** I call `scaleway_domain_registrar_create_contact`, **Then** a new contact is created
4. **Given** a valid contact_id and updated fields, **When** I call `scaleway_domain_registrar_update_contact`, **Then** the contact is updated

---

### User Story 3 - TLD Information (Priority: P3)

As an AI agent, I need to list and get TLD information so that I can discover available top-level domains and their pricing.

**Why this priority**: TLD lookups are informational and support domain registration decisions.

**Independent Test**: Can be tested by listing TLDs and getting a specific TLD.

**Acceptance Scenarios**:

1. **Given** valid credentials, **When** I call `scaleway_domain_registrar_list_tlds`, **Then** I receive a paginated list of TLDs with pricing information
2. **Given** a valid TLD name, **When** I call `scaleway_domain_registrar_get_tld`, **Then** I receive TLD details including DNSSEC support and pricing offers

---

### Edge Cases

- Domain not found (404) returns a `not_found` error type
- Domain already registered returns a structured error
- Invalid domain name format returns `invalid_input` error
- Missing required contact fields returns validation error
- Invalid auth code for transfer returns appropriate error
- Pagination with page > total pages returns empty items array
- Invalid TLD name returns `not_found` error

## Requirements

### Functional Requirements

- **FR-001**: System MUST list domains with pagination (page, page_size) and filtering (project_id, organization_id, order_by)
- **FR-002**: System MUST get a single domain by fully qualified domain name
- **FR-003**: System MUST register a domain with domain name, duration, project_id, and contact IDs
- **FR-004**: System MUST renew a domain with configurable duration (1-10 years)
- **FR-005**: System MUST transfer a domain using an authorization/EPP code
- **FR-006**: System MUST update domain contacts (owner, admin, tech)
- **FR-007**: System MUST enable and disable auto-renewal for a domain
- **FR-008**: System MUST check domain name availability
- **FR-009**: System MUST list, get, create, and update contacts with full WHOIS fields
- **FR-010**: System MUST list and get TLD information with pricing
- **FR-011**: All tools MUST validate inputs using Zod schemas
- **FR-012**: All Scaleway API errors MUST be mapped to structured MCP error responses
- **FR-013**: All list operations MUST support standard pagination (page, page_size, total_count)

### Key Entities

- **Domain**: Registered domain with domain name, status, auto_renew_status, dnssec_status, registrar_lock_status, epp_code, expiration date, project_id, organization_id
- **Contact**: Registration contact with id, name, email, phone, address, company, country (ISO 3166-1 alpha-2)
- **DomainAvailability**: Availability check result with domain name, available flag, TLD
- **Tld**: Top-level domain with name, DNSSEC support, pricing offers (register, renew, transfer)

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 15 MCP tools are registered and callable via the MCP protocol
- **SC-002**: 100% line and branch code coverage across all domain registrar tool files
- **SC-003**: All tools map to documented Scaleway API endpoints
- **SC-004**: Contract tests validate request/response shapes for every tool
- **SC-005**: Parity matrix includes all Domain Registrar API operations

## Clarifications

**Resolved decisions from self-clarification:**

- **Locality**: Global API (no zone parameter). Base URL: `https://api.scaleway.com/domain/v2beta1/`
- **Pagination**: Standard Scaleway page/page_size with total_count in responses
- **Auth**: SCW_ACCESS_KEY + SCW_SECRET_KEY + SCW_DEFAULT_PROJECT_ID (via shared auth module)
- **Tool naming**: `scaleway_domain_registrar_{action}` pattern (e.g., `scaleway_domain_registrar_list_domains`)
- **Error handling**: Use shared `mapScalewayError` + `formatErrorResponse` from `src/shared/errors.ts`
- **Client**: Use shared `createScalewayClient` from `src/shared/client.ts` with `loadAuthConfig` from `src/shared/auth.ts`
- **API version**: v2beta1 (beta API)
- **Domain identifier**: Domains are identified by their fully qualified domain name (not UUID)
- **Contact identifier**: Contacts are identified by UUID
- **TLD identifier**: TLDs are identified by name (e.g., "com", "fr", "io")
