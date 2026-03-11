# Quickstart: Scaleway Billing MCP Tools

**Feature**: 036-billing | **Date**: 2026-03-11

## Prerequisites

1. Set environment variables:
   ```bash
   export SCW_ACCESS_KEY="your-access-key"
   export SCW_SECRET_KEY="your-secret-key"
   export SCW_DEFAULT_PROJECT_ID="your-project-id"
   ```

2. Start the MCP server:
   ```bash
   bun run start
   ```

## Usage Examples

### List Consumptions

```json
{
  "tool": "scaleway_billing_list_consumptions",
  "arguments": {
    "page": 1,
    "pageSize": 20
  }
}
```

### List Consumptions by Project and Billing Period

```json
{
  "tool": "scaleway_billing_list_consumptions",
  "arguments": {
    "project_id": "project-uuid",
    "billing_period": "2026-02",
    "order_by": "category_name_asc"
  }
}
```

### List Invoices

```json
{
  "tool": "scaleway_billing_list_invoices",
  "arguments": {
    "organization_id": "org-uuid",
    "page": 1,
    "pageSize": 10
  }
}
```

### List Invoices by Date Range

```json
{
  "tool": "scaleway_billing_list_invoices",
  "arguments": {
    "organization_id": "org-uuid",
    "billing_period_start_after": "2026-01-01T00:00:00Z",
    "billing_period_start_before": "2026-03-01T00:00:00Z",
    "order_by": "issued_date_desc"
  }
}
```

### Get a Specific Invoice

```json
{
  "tool": "scaleway_billing_get_invoice",
  "arguments": {
    "invoice_id": "invoice-uuid"
  }
}
```

### Download an Invoice as PDF

```json
{
  "tool": "scaleway_billing_download_invoice",
  "arguments": {
    "invoice_id": "invoice-uuid",
    "file_type": "pdf"
  }
}
```

### List Discounts

```json
{
  "tool": "scaleway_billing_list_discounts",
  "arguments": {
    "organization_id": "org-uuid",
    "order_by": "creation_date_desc"
  }
}
```
