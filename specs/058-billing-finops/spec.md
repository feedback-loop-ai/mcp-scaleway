# Feature Specification: Billing - FinOps (Charges)

**Feature Branch**: `058-billing-finops`
**Created**: 2026-07-07
**Status**: Implemented
**Input**: Extend the existing Billing MCP area with Scaleway **Billing - FinOps**
support (per-resource, fine-grained-time cost analysis).

## Overview

The Scaleway **Billing - FinOps** API (catalogue slug `billing_finops`, Beta) is a
distinct entry from the standard Billing API but shares the `billing/v2beta1`
namespace, authentication and IAM permissions. It exposes cost data at
**per-resource granularity** over **arbitrary time windows** via a single
endpoint: `GET /billing/v2beta1/charges`.

This feature adds one read-only MCP tool, `scaleway_billing_list_charges`, to the
existing `billing` area (which already exposes consumptions, invoices, get/download
invoice, and discounts). The existing five tools are untouched.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Analyse spend per resource over a time window (Priority: P1)

A FinOps engineer or cloud-cost owner wants to understand exactly which resources
drove spend over a chosen period, rather than a monthly per-product aggregate.

**Why this priority**: This is the entire value of the FinOps API and the only
endpoint it publicly exposes. Without it there is no feature.

**Independent Test**: Call `scaleway_billing_list_charges` with an
`organization_id` and a `start_date_after`/`end_date_before` window; receive
itemised charges each carrying `resource_id`, `resource_name`, `category_name`,
`value`, `discount_value`, and the billed quantity/unit.

**Acceptance Scenarios**:

1. **Given** a valid organization ID, **When** the assistant lists charges,
   **Then** it returns an array of charges plus a `total_count` and, when more
   results exist, a `next_page_token`.
2. **Given** a time window, **When** `clamp_to_time_range` is true, **Then**
   charges that only partially overlap the window are clamped to the overlap.
3. **Given** `resource_ids`/`project_ids`/`skus` filters, **When** listing,
   **Then** only matching charges are returned.

### User Story 2 - Paginate through a large charge set (Priority: P2)

**Why this priority**: FinOps queries over long windows can be large; cursor
pagination must work for the tool to be usable at scale.

**Independent Test**: Provide a `page_size`, then feed the returned
`next_page_token` back as `page_token` to fetch the next page.

**Acceptance Scenarios**:

1. **Given** a `page_size` of N, **When** listing, **Then** at most N charges are
   returned along with a `next_page_token` when a further page exists.

## Requirements *(mandatory)*

- **FR-001**: The system MUST expose a tool `scaleway_billing_list_charges` that
  calls `GET /billing/v2beta1/charges`.
- **FR-002**: The tool MUST require `organization_id`.
- **FR-003**: The tool MUST support the documented filters: `order_by`
  (`start_date_asc`/`start_date_desc`), `start_date_after`, `end_date_before`,
  `clamp_to_time_range`, and the array filters `invoice_ids`, `project_ids`,
  `resource_ids`, `resource_names`, `skus`.
- **FR-004**: The tool MUST support cursor pagination via `page_size` (1-100) and
  `page_token`, returning the API's `next_page_token` unchanged.
- **FR-005**: The tool MUST authenticate via `X-Auth-Token` (handled by the shared
  Scaleway client) and map API errors through the shared error formatter.
- **FR-006**: The tool MUST be read-only.
- **FR-007**: The existing five billing tools MUST continue to register and behave
  unchanged; `registerBillingTools` MUST register six tools total.

## Out of Scope

- **Budgets / Budget alerts / Budget-alert notifications**: present in the
  Scaleway CLI (`scw billing budget …`) and console but NOT in the public
  `billing_finops`/`billing` HTTP API reference (no endpoint paths or response
  schemas published). Excluded rather than invented (Constitution: contract-first,
  no invented endpoints). Revisit if/when Scaleway publishes the API reference.
- **RedeemCoupon** (write) — the billing area is read-only.
- Client-side aggregation/rollups of charges — the tool proxies the raw API
  response; aggregation is left to the assistant/consumer.

## Success Criteria

- **SC-001**: A user can retrieve per-resource charges for an organization and
  time window in a single tool call.
- **SC-002**: 100% line and branch coverage across `src/tools/billing/**`.
- **SC-003**: Every billing tool (existing + new) has a contract test referencing
  `specs/scaleway-api/billing/api-reference.md`.
