# Scaleway Billing API Reference

Official docs: https://www.scaleway.com/en/developers/api/billing/

Base URL: `https://api.scaleway.com/billing/v2beta1`

## Authentication

- Header: `X-Auth-Token: <secret_key>` (Scaleway API secret key)
- Requires IAM permission set `BillingReadOnly` or `BillingManager`.

## Pagination

Offset-based via `page` (1-indexed) and `page_size`. List responses return
`total_count`.

## Entities

### Money

| Field | Type | Description |
|-------|------|-------------|
| currency_code | string | ISO 4217 currency code (e.g. `EUR`) |
| units | number | Whole units of the amount |
| nanos | number | Nano units (10^-9) of the amount (0-999,999,999) |

### Consumption

| Field | Type | Description |
|-------|------|-------------|
| value | Money | Monetary value of the consumption |
| product_name | string | Product name |
| resource_name | string | Resource name |
| sku | string | SKU identifier |
| project_id | string | Project ID |
| category_name | string | Category name |
| unit | string | Unit of measure |
| billed_quantity | string | Quantity billed |

### Invoice

| Field | Type | Description |
|-------|------|-------------|
| id | string | Invoice ID |
| organization_id | string | Organization ID |
| billing_period | string | Billing period start date |
| issued_date | string | Date issued |
| due_date | string | Due date |
| total_untaxed | Money | Total before tax |
| total_taxed | Money | Total after tax |
| invoice_type | enum | `periodic`, `purchase` |
| state | enum | `unknown_invoice_state`, `stopped`, `outstanding`, `paid`, `errored` |
| number | number | Invoice number |
| seller_name | string | Seller name |
| start_date | string | Start date |

### Discount

| Field | Type | Description |
|-------|------|-------------|
| id | string | Discount ID |
| creation_date | string | Creation date |
| organization_id | string | Organization ID |
| description | string | Description |
| value | number | Discount value |
| value_used | number | Amount used |
| value_remaining | number | Amount remaining |
| mode | enum | `unknown_discount_mode`, `discount_mode_rate`, `discount_mode_value`, `discount_mode_splittable` |
| start_date | string | Start date |
| stop_date | string | Stop date |
| coupon | { description } \| null | Coupon details (optional) |
| filters | DiscountFilter[] | Discount filters |

`DiscountFilter`: `{ type: (unknown_filter_type | category_name | product_name), value: string }`

## Endpoints

### List Consumptions
- **Method/Path**: `GET /billing/v2beta1/consumptions`
- **Query**: `page`, `page_size`, `order_by`, `organization_id`, `project_id`, `category_name`, `billing_period` (YYYY-MM)
- **order_by**: `updated_at_desc`, `updated_at_asc`, `category_name_desc`, `category_name_asc`
- **Response**: `{ consumptions: Consumption[], total_count: number, total_discount_untaxed_value: number, updated_at: string }`
- **Tool**: `scaleway_billing_list_consumptions`

### List Invoices
- **Method/Path**: `GET /billing/v2beta1/invoices`
- **Query**: `page`, `page_size`, `organization_id` (required), `billing_period_start_after`, `billing_period_start_before`, `invoice_type`, `order_by`
- **order_by**: `invoice_number_{asc,desc}`, `start_date_{asc,desc}`, `issued_date_{asc,desc}`, `due_date_{asc,desc}`, `total_untaxed_{asc,desc}`, `total_taxed_{asc,desc}`, `invoice_type_{asc,desc}`
- **Response**: `{ invoices: Invoice[], total_count: number }`
- **Tool**: `scaleway_billing_list_invoices`

### Get Invoice
- **Method/Path**: `GET /billing/v2beta1/invoices/{invoice_id}`
- **Response**: `Invoice`
- **Tool**: `scaleway_billing_get_invoice`

### Download Invoice
- **Method/Path**: `GET /billing/v2beta1/invoices/{invoice_id}/download`
- **Query**: `file_type` (`pdf`, default `pdf`)
- **Response**: file content / download reference
- **Tool**: `scaleway_billing_download_invoice`

### List Discounts
- **Method/Path**: `GET /billing/v2beta1/discounts`
- **Query**: `page`, `page_size`, `organization_id` (required), `order_by`
- **order_by**: `creation_date_desc`, `creation_date_asc`
- **Response**: `{ discounts: Discount[], total_count: number }`
- **Tool**: `scaleway_billing_list_discounts`

## Billing - FinOps

Official docs: https://www.scaleway.com/en/developers/api/billing_finops/

The **Billing - FinOps** API is a distinct entry in the Scaleway API catalogue
(slug `billing_finops`), currently in **Beta**. It shares the `billing/v2beta1`
namespace and the same base URL, authentication (`X-Auth-Token`) and IAM
permission sets (`BillingReadOnly` / `BillingManager`) as the Billing API above.
It is **global** (not region/zone scoped).

Its purpose is per-resource, fine-grained-time cost analysis: where
`ListConsumptions` aggregates spend per product/SKU for a monthly billing period,
the FinOps `charges` endpoint returns individual charges attributable to a single
resource over an arbitrary time window.

### Pagination (FinOps)

Cursor-based: request a `page_size` (1-100) and pass the `next_page_token`
returned by the previous response back as `page_token`. This differs from the
offset (`page`/`page_size`) pagination used by the other Billing endpoints.

### Entities (FinOps)

#### Charge

| Field | Type | Description |
|-------|------|-------------|
| category_name | string | Category name (e.g. Compute, Storage) |
| resource_name | string | Human-readable resource name |
| resource_id | string | ID of the resource the charge relates to |
| project_id | string | Project ID |
| value | Money | Monetary value of the charge (untaxed) |
| discount_value | Money | Discount applied to the charge |
| begin_date | string | Start of the charge time window (RFC 3339) |
| end_date | string | End of the charge time window (RFC 3339) |
| unit | string | Unit of measure |
| billed_quantity | number | Quantity billed over the window |

### Endpoints (FinOps)

#### FinOps: List Charges
- **Method/Path**: `GET /billing/v2beta1/charges`
- **Query**:
  - `organization_id` (required)
  - `order_by` (`start_date_asc`, `start_date_desc`)
  - `page_size` (1-100), `page_token` (cursor)
  - `start_date_after`, `end_date_before` (RFC 3339 timestamps)
  - `clamp_to_time_range` (boolean — when true, a charge that only partially
    overlaps the requested window is clamped to the overlapping portion)
  - `invoice_ids`, `project_ids`, `resource_ids`, `resource_names`, `skus`
    (repeated array query parameters)
- **Response**: `{ charges: Charge[], total_count: number, next_page_token: string }`
- **Tool**: `scaleway_billing_list_charges`

### Out of scope / not implemented (FinOps)

The Scaleway CLI groups Budget management (`budget list/get/create/update/delete`),
Budget alerts and Budget-alert notifications under `scw billing`. These do **not**
appear in the public `billing_finops` (or `billing`) HTTP API reference — no
endpoint paths or response schemas are published for them — so they are
deliberately excluded rather than invented. Only the documented, verifiable
`charges` read endpoint is exposed. `RedeemCoupon` (a write operation present in
the Go SDK) is likewise excluded as this area is read-only.

## Implementation Notes / Verification

- API version `v2beta1` and all 5 endpoint paths verified against the official
  Billing API reference.
- The server calls the raw REST API through `client.fetch` (no dedicated
  `@scaleway/sdk` billing package); responses are proxied through unchanged.
- Enum string values for `state`, `mode`, and `DiscountFilter.type` are taken
  from the Scaleway API definition. The public HTML reference page renders
  example payloads but does not enumerate every enum literal inline; the values
  encoded in `src/tools/billing/types.ts` match the Scaleway SDK definitions.
- **FinOps `charges`**: the endpoint path, `organization_id` requirement, cursor
  pagination (`page_token`/`next_page_token`) and `Money`-valued fields are
  verified against the `billing_finops` API reference. The exact request filter
  set (`order_by` = `start_date_{asc,desc}`, `start_date_after`,
  `end_date_before`, `clamp_to_time_range`, and the plural `*_ids`/`*_names`/
  `skus` array filters) is verified against the auto-generated Scaleway CLI
  (`scw billing charge list`). The precise `Charge` object field list and the
  `billed_quantity` numeric type are taken from the FinOps reference's rendered
  schema; the public HTML page does not exhaustively enumerate every field type,
  so responses are proxied through unchanged and the zod `Charge` schema is a
  best-effort contract.
