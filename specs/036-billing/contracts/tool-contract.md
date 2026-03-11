# Tool Contracts: Scaleway Billing MCP Tools

**Feature**: 036-billing | **Date**: 2026-03-11

## Consumption Tools

### scaleway_billing_list_consumptions

**Scaleway API**: `GET /billing/v2beta1/consumptions`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 20 | Items per page (1-100) |
| order_by | enum | no | - | updated_at_desc, updated_at_asc, category_name_desc, category_name_asc |
| organization_id | string | no | - | Filter by organization ID |
| project_id | string | no | - | Filter by project ID |
| category_name | string | no | - | Filter by category name |
| billing_period | string | no | - | Billing period in YYYY-MM format |

**Output**: `{ consumptions: Consumption[], total_count: number, total_discount_untaxed_value: number, updated_at: string }`

---

## Invoice Tools

### scaleway_billing_list_invoices

**Scaleway API**: `GET /billing/v2beta1/invoices`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 20 | Items per page (1-100) |
| organization_id | string | yes | - | Organization ID |
| billing_period_start_after | string | no | - | Filter invoices after this date (ISO 8601) |
| billing_period_start_before | string | no | - | Filter invoices before this date (ISO 8601) |
| invoice_type | enum | no | - | periodic, purchase |
| order_by | enum | no | - | invoice_number_desc, invoice_number_asc, start_date_desc, start_date_asc, issued_date_desc, issued_date_asc, due_date_desc, due_date_asc, total_untaxed_desc, total_untaxed_asc, total_taxed_desc, total_taxed_asc, invoice_type_desc, invoice_type_asc |

**Output**: `{ invoices: Invoice[], total_count: number }`

---

### scaleway_billing_get_invoice

**Scaleway API**: `GET /billing/v2beta1/invoices/{invoice_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| invoice_id | string | yes | Invoice UUID |

**Output**: `{ Invoice }` (full invoice object)

---

### scaleway_billing_download_invoice

**Scaleway API**: `GET /billing/v2beta1/invoices/{invoice_id}/download`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| invoice_id | string | yes | - | Invoice UUID |
| file_type | enum | no | pdf | File type (pdf) |

**Output**: Download URL or file content for the invoice

---

## Discount Tools

### scaleway_billing_list_discounts

**Scaleway API**: `GET /billing/v2beta1/discounts`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 20 | Items per page (1-100) |
| organization_id | string | yes | - | Organization ID |
| order_by | enum | no | - | creation_date_desc, creation_date_asc |

**Output**: `{ discounts: Discount[], total_count: number }`
