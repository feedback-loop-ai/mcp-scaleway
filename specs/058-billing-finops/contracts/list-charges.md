# Tool Contract: scaleway_billing_list_charges

**API**: `GET /billing/v2beta1/charges` (Scaleway Billing - FinOps, v2beta1, global)
**Auth**: `X-Auth-Token`
**API reference**: `specs/scaleway-api/billing/api-reference.md#billing---finops`
**Contract test**: `tests/contract/billing/billing.contract.test.ts`

## Description

List per-resource charges for a Scaleway organization with fine-grained time
granularity. Read-only.

## Input parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| organization_id | string | yes | Organization to list charges for |
| order_by | enum(`start_date_asc`,`start_date_desc`) | no | Sort order |
| page_size | integer 1-100 | no | Cursor page size |
| page_token | string | no | Cursor from previous `next_page_token` |
| start_date_after | string (RFC 3339) | no | Charges beginning after this instant |
| end_date_before | string (RFC 3339) | no | Charges ending before this instant |
| clamp_to_time_range | boolean | no | Clamp partial charges to the window |
| invoice_ids | string[] | no | Filter by invoice IDs |
| project_ids | string[] | no | Filter by project IDs |
| resource_ids | string[] | no | Filter by resource IDs |
| resource_names | string[] | no | Filter by resource names |
| skus | string[] | no | Filter by SKUs |

Array filters are serialised as repeated query parameters
(`resource_ids=a&resource_ids=b`).

## Output

`{ charges: Charge[], total_count: number, next_page_token?: string }` where each
`Charge` is `{ category_name, resource_name, resource_id, project_id, value:
Money, discount_value: Money, begin_date, end_date, unit, billed_quantity }`.

On error: `{ isError: true, content: [{ type: "text", text: <mapped error JSON> }] }`.

## Error modes

| HTTP | Mapped type |
|------|-------------|
| 401/403 | permission_denied |
| 404 | not_found |
| 400 | invalid_input |
| 429 | rate_limited |
| 5xx | server_error |
