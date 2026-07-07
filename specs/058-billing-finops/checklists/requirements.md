# Requirements Checklist: Billing - FinOps

- [X] CHK-001 `scaleway_billing_list_charges` calls `GET /billing/v2beta1/charges` (FR-001)
- [X] CHK-002 `organization_id` is required (FR-002)
- [X] CHK-003 All documented filters supported: order_by, start_date_after, end_date_before, clamp_to_time_range, invoice_ids, project_ids, resource_ids, resource_names, skus (FR-003)
- [X] CHK-004 Cursor pagination: page_size (1-100) + page_token; response next_page_token proxied (FR-004)
- [X] CHK-005 Auth via X-Auth-Token; errors mapped via shared error formatter (FR-005)
- [X] CHK-006 Tool is read-only (FR-006)
- [X] CHK-007 Existing five billing tools unchanged; registerBillingTools registers six (FR-007)
- [X] CHK-008 API reference updated with a Billing - FinOps section
- [X] CHK-009 Contract test covers the charges tool and references the API reference
- [X] CHK-010 100% line + branch coverage of src/tools/billing/**
- [X] CHK-011 Budgets/alerts excluded and rationale documented (Out of Scope)
- [X] CHK-012 biome clean, tsc clean for billing files
