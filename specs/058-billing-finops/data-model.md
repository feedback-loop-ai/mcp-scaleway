# Data Model: Billing - FinOps

All schemas live in `src/tools/billing/types.ts` (extended). `Money` is reused
from the existing billing schemas.

## Money (reused)

`{ currency_code: string, units: number, nanos: number }`

## Charge (response entity)

| Field | Type | Notes |
|-------|------|-------|
| category_name | string | e.g. Compute, Storage |
| resource_name | string | Human-readable resource name |
| resource_id | string | Resource the charge relates to |
| project_id | string | Project ID |
| value | Money | Untaxed monetary value |
| discount_value | Money | Discount applied |
| begin_date | string | RFC 3339 window start |
| end_date | string | RFC 3339 window end |
| unit | string | Unit of measure |
| billed_quantity | number | Quantity billed over the window |

## ChargeOrderBy (enum)

`start_date_asc | start_date_desc`

## ListChargesParams (tool input)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| organization_id | string | yes | |
| order_by | ChargeOrderBy | no | |
| page_size | number (1-100) | no | cursor page size |
| page_token | string | no | cursor from previous `next_page_token` |
| start_date_after | string | no | RFC 3339 |
| end_date_before | string | no | RFC 3339 |
| clamp_to_time_range | boolean | no | clamp partial charges to window |
| invoice_ids | string[] | no | repeated query param |
| project_ids | string[] | no | repeated query param |
| resource_ids | string[] | no | repeated query param |
| resource_names | string[] | no | repeated query param |
| skus | string[] | no | repeated query param |

## ListChargesResponse

`{ charges: Charge[], total_count: number, next_page_token?: string | null }`
