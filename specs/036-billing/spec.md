# Feature Specification: Scaleway Billing MCP Tools

**Feature Branch**: `036-billing`
**Created**: 2026-03-11
**Status**: Approved
**Input**: Implement MCP tools for the Scaleway Billing API v2beta1 (global billing, consumption, invoices, discounts)

## User Scenarios & Testing

### User Story 1 - Consumption Tracking (Priority: P1)

As an AI agent, I need to list consumption data for a Scaleway organization or project so that I can track resource usage and costs.

**Why this priority**: Consumption data is the most frequently queried billing information, enabling cost monitoring and optimization.

**Independent Test**: Can be fully tested by listing consumptions with various filters (category, project, billing period).

**Acceptance Scenarios**:

1. **Given** valid credentials, **When** I call `scaleway_billing_list_consumptions`, **Then** I receive a paginated list of consumptions with total_count, total_discount_untaxed_value, and updated_at
2. **Given** a project_id filter, **When** I call `scaleway_billing_list_consumptions` with project_id, **Then** only consumptions for that project are returned
3. **Given** a billing_period filter (YYYY-MM), **When** I call `scaleway_billing_list_consumptions` with billing_period, **Then** only consumptions for that period are returned

---

### User Story 2 - Invoice Management (Priority: P1)

As an AI agent, I need to list, get, and download invoices so that I can access billing documents programmatically.

**Why this priority**: Invoices are critical financial documents; listing and retrieving them is a core billing use case.

**Independent Test**: Can be tested by listing invoices, getting a specific invoice by ID, and downloading it.

**Acceptance Scenarios**:

1. **Given** valid credentials and organization_id, **When** I call `scaleway_billing_list_invoices`, **Then** I receive a paginated list of invoices with total_count
2. **Given** a valid invoice_id, **When** I call `scaleway_billing_get_invoice`, **Then** I receive the full invoice object with billing period, amounts, and state
3. **Given** a valid invoice_id, **When** I call `scaleway_billing_download_invoice`, **Then** I receive the download URL or file content for the invoice PDF
4. **Given** date range filters, **When** I call `scaleway_billing_list_invoices` with billing_period_start_after/before, **Then** only invoices within that range are returned

---

### User Story 3 - Discount Management (Priority: P2)

As an AI agent, I need to list active discounts for an organization so that I can track available credits and promotions.

**Why this priority**: Discounts are supplementary to core billing but important for cost management.

**Independent Test**: Can be tested by listing discounts for an organization.

**Acceptance Scenarios**:

1. **Given** valid credentials and organization_id, **When** I call `scaleway_billing_list_discounts`, **Then** I receive a paginated list of discounts with total_count
2. **Given** discounts exist, **When** I list them, **Then** each discount includes value, value_used, value_remaining, mode, date range, and filters

---

### Edge Cases

- Invalid organization_id returns a structured validation error
- Invoice not found (404) returns a `not_found` error type
- Missing required organization_id on list invoices/discounts returns `invalid_input` error
- Pagination with page > total pages returns empty items array
- Invalid billing_period format returns a validation error
- Rate limiting (429) returns a structured error with retry guidance

## Requirements

### Functional Requirements

- **FR-001**: System MUST list consumptions with pagination (page, page_size) and filtering (organization_id, project_id, category_name, billing_period, order_by)
- **FR-002**: System MUST list invoices with pagination and filtering (organization_id, billing_period_start_after, billing_period_start_before, invoice_type, order_by)
- **FR-003**: System MUST get a single invoice by ID
- **FR-004**: System MUST download an invoice as PDF by ID
- **FR-005**: System MUST list discounts with pagination and filtering (organization_id, order_by)
- **FR-006**: All tools MUST validate inputs using Zod schemas
- **FR-007**: All Scaleway API errors MUST be mapped to structured MCP error responses
- **FR-008**: All list operations MUST support standard pagination (page, page_size, total_count)

### Key Entities

- **Consumption**: Usage record with value (Money), product_name, resource_name, sku, project_id, category_name, unit, billed_quantity
- **Invoice**: Billing document with id, organization_id, billing_period, issued_date, due_date, total_untaxed (Money), total_taxed (Money), invoice_type, state, number, seller_name, start_date
- **Discount**: Credit/promotion with id, organization_id, description, value, value_used, value_remaining, mode, start_date, stop_date, coupon, filters
- **Money**: Monetary amount with currency_code, units, nanos

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 5 MCP tools are registered and callable via the MCP protocol
- **SC-002**: 100% line and branch code coverage across all billing tool files
- **SC-003**: All tools map to documented Scaleway Billing API v2beta1 endpoints
- **SC-004**: Contract tests validate request/response shapes for every tool
- **SC-005**: Parity matrix includes all Billing API operations

## Clarifications

**Resolved decisions from self-clarification:**

- **Locality**: Global API. No zone or region parameter needed (unlike Instances)
- **Pagination**: Standard Scaleway page/page_size with total_count in responses
- **Auth**: SCW_ACCESS_KEY + SCW_SECRET_KEY (via shared auth module)
- **Tool naming**: `scaleway_billing_{action}` pattern (e.g., `scaleway_billing_list_consumptions`)
- **Error handling**: Use shared `mapScalewayError` + `formatErrorResponse` from `src/shared/errors.ts`
- **Client**: Use shared `createScalewayClient` from `src/shared/client.ts` with `loadAuthConfig` from `src/shared/auth.ts`
- **API version**: v2beta1 (beta API, shapes may evolve)
- **Invoice types**: periodic (recurring monthly) and purchase (one-time)
- **Discount modes**: discount_mode_rate, discount_mode_value, discount_mode_splittable
- **Money type**: Composed of currency_code (ISO 4217), units (whole), nanos (10^-9)
