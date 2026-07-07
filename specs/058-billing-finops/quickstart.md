# Quickstart: Billing - FinOps

## Prerequisites

- Scaleway API secret key with IAM `BillingReadOnly` (or `BillingManager`).
- Your `organization_id`.

## Tool: `scaleway_billing_list_charges`

List per-resource charges for an organization over a time window.

### Minimal call

```json
{ "organization_id": "11111111-2222-3333-4444-555555555555" }
```

### Filtered + windowed call

```json
{
  "organization_id": "11111111-2222-3333-4444-555555555555",
  "start_date_after": "2025-06-01T00:00:00Z",
  "end_date_before": "2025-07-01T00:00:00Z",
  "clamp_to_time_range": true,
  "project_ids": ["a1b2c3d4-e5f6-7890-abcd-ef1234567890"],
  "order_by": "start_date_desc",
  "page_size": 100
}
```

### Response (shape)

```json
{
  "charges": [
    {
      "category_name": "Compute",
      "resource_name": "my-instance",
      "resource_id": "res-...",
      "project_id": "a1b2c3d4-...",
      "value": { "currency_code": "EUR", "units": 3, "nanos": 250000000 },
      "discount_value": { "currency_code": "EUR", "units": 0, "nanos": 0 },
      "begin_date": "2025-06-01T00:00:00Z",
      "end_date": "2025-06-30T23:59:59Z",
      "unit": "hour",
      "billed_quantity": 720
    }
  ],
  "total_count": 1,
  "next_page_token": "..."
}
```

### Pagination

Pass the returned `next_page_token` back as `page_token` to fetch the next page.

## Verify locally

```bash
bun x vitest run --config tests/vitest.config.ts \
  tests/unit/tools/billing.test.ts tests/contract/billing/billing.contract.test.ts
```
