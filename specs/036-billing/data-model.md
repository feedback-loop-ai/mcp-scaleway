# Data Model: Scaleway Billing MCP Tools

**Feature**: 036-billing | **Date**: 2026-03-11

## Entities

### Money

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| currency_code | string | yes | ISO 4217 currency code (e.g., EUR) |
| units | number | yes | Whole units of the amount |
| nanos | number | yes | Nano units (10^-9) of the amount |

### Consumption

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| value | Money | yes | Monetary value of the consumption |
| product_name | string | yes | Product name (e.g., "Instances", "Object Storage") |
| resource_name | string | yes | Resource name |
| sku | string | yes | SKU identifier |
| project_id | string (UUID) | yes | Project ID |
| category_name | string | yes | Category name (e.g., "compute", "storage") |
| unit | string | yes | Unit of measure (e.g., "hours", "GB") |
| billed_quantity | string | yes | Quantity billed |

### Invoice

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique invoice identifier |
| organization_id | string (UUID) | yes | Organization ID |
| billing_period | string (ISO 8601) | yes | Billing period start date |
| issued_date | string (ISO 8601) | yes | Date the invoice was issued |
| due_date | string (ISO 8601) | yes | Payment due date |
| total_untaxed | Money | yes | Total amount before tax |
| total_taxed | Money | yes | Total amount after tax |
| invoice_type | enum | yes | periodic, purchase |
| state | enum | yes | unknown_invoice_state, stopped, outstanding, paid, errored |
| number | number | yes | Invoice number |
| seller_name | string | yes | Seller name |
| start_date | string (ISO 8601) | yes | Start date |

### Discount

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique discount identifier |
| creation_date | string (ISO 8601) | yes | Creation timestamp |
| organization_id | string (UUID) | yes | Organization ID |
| description | string | yes | Discount description |
| value | number | yes | Discount value |
| value_used | number | yes | Amount of discount used |
| value_remaining | number | yes | Amount of discount remaining |
| mode | enum | yes | unknown_discount_mode, discount_mode_rate, discount_mode_value, discount_mode_splittable |
| start_date | string (ISO 8601) | yes | Discount start date |
| stop_date | string (ISO 8601) | yes | Discount end date |
| coupon | DiscountCoupon/null | no | Associated coupon details |
| filters | DiscountFilter[] | yes | Filters restricting discount applicability |

### DiscountCoupon

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| description | string | yes | Coupon description |

### DiscountFilter

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | enum | yes | unknown_filter_type, category_name, product_name |
| value | string | yes | Filter value |

## Response Envelopes

### ListConsumptionsResponse

| Field | Type | Description |
|-------|------|-------------|
| consumptions | Consumption[] | Array of consumption records |
| total_count | number | Total number of consumptions |
| total_discount_untaxed_value | number | Total discount value (untaxed) |
| updated_at | string (ISO 8601) | Last update timestamp |

### ListInvoicesResponse

| Field | Type | Description |
|-------|------|-------------|
| invoices | Invoice[] | Array of invoices |
| total_count | number | Total number of invoices |

### ListDiscountsResponse

| Field | Type | Description |
|-------|------|-------------|
| discounts | Discount[] | Array of discounts |
| total_count | number | Total number of discounts |
