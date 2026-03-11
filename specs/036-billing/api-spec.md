# Billing API Specification (036-billing)

## Overview
Scaleway Billing API v2beta1 - Global API for managing consumption data, invoices, and discounts.

Base URL: `https://api.scaleway.com/billing/v2beta1`

## Endpoints

### Consumptions

#### List Consumptions
- **Method:** GET
- **Path:** `/billing/v2beta1/consumptions`
- **Parameters:**
  - `order_by` (string, optional): `updated_at_desc` | `updated_at_asc` | `category_name_desc` | `category_name_asc`
  - `page` (int32, optional): Page number (default 1)
  - `page_size` (uint32, optional): Items per page (default 20, max 100)
  - `organization_id` (string, optional): Organization ID filter
  - `project_id` (string, optional): Project ID filter
  - `category_name` (string, optional): Filter by category
  - `billing_period` (string, optional): Billing period (YYYY-MM format)
- **Response:**
  - `consumptions[]`: Array of Consumption objects
  - `total_count` (uint64): Total number of consumptions
  - `total_discount_untaxed_value` (float): Total discount value (untaxed)
  - `updated_at` (string): Last update timestamp

### Invoices

#### List Invoices
- **Method:** GET
- **Path:** `/billing/v2beta1/invoices`
- **Parameters:**
  - `organization_id` (string, required): Organization ID
  - `billing_period_start_after` (string, optional): ISO 8601 date filter
  - `billing_period_start_before` (string, optional): ISO 8601 date filter
  - `invoice_type` (string, optional): `periodic` | `purchase`
  - `order_by` (string, optional): `invoice_number_desc` | `invoice_number_asc` | `start_date_desc` | `start_date_asc` | `issued_date_desc` | `issued_date_asc` | `due_date_desc` | `due_date_asc` | `total_untaxed_desc` | `total_untaxed_asc` | `total_taxed_desc` | `total_taxed_asc` | `invoice_type_desc` | `invoice_type_asc`
  - `page` (int32, optional): Page number
  - `page_size` (uint32, optional): Items per page
- **Response:**
  - `invoices[]`: Array of Invoice objects
  - `total_count` (uint64): Total number of invoices

#### Get Invoice
- **Method:** GET
- **Path:** `/billing/v2beta1/invoices/{invoice_id}`
- **Parameters:**
  - `invoice_id` (string, required): Invoice ID (path parameter)
- **Response:** Invoice object

#### Download Invoice
- **Method:** GET
- **Path:** `/billing/v2beta1/invoices/{invoice_id}/download`
- **Parameters:**
  - `invoice_id` (string, required): Invoice ID (path parameter)
  - `file_type` (string, optional): `pdf` (default)
- **Response:** File (binary)

### Discounts

#### List Discounts
- **Method:** GET
- **Path:** `/billing/v2beta1/discounts`
- **Parameters:**
  - `order_by` (string, optional): `creation_date_desc` | `creation_date_asc`
  - `page` (int32, optional): Page number
  - `page_size` (uint32, optional): Items per page
  - `organization_id` (string, required): Organization ID
- **Response:**
  - `discounts[]`: Array of Discount objects
  - `total_count` (uint64): Total number of discounts

## Entity Schemas

### Consumption
- `value` (Money): Monetary value of the consumption
- `product_name` (string): Product name
- `resource_name` (string): Resource name
- `sku` (string): SKU identifier
- `project_id` (string): Project ID
- `category_name` (string): Category name
- `unit` (string): Unit of measure
- `billed_quantity` (string): Quantity billed

### Invoice
- `id` (string): Invoice ID
- `organization_id` (string): Organization ID
- `billing_period` (string): Billing period start date
- `issued_date` (string): Date issued
- `due_date` (string): Due date
- `total_untaxed` (Money): Total before tax
- `total_taxed` (Money): Total after tax
- `invoice_type` (string): `periodic` | `purchase`
- `state` (string): `unknown_invoice_state` | `stopped` | `outstanding` | `paid` | `errored`
- `number` (int32): Invoice number
- `seller_name` (string): Seller name
- `start_date` (string): Start date

### Discount
- `id` (string): Discount ID
- `creation_date` (string): Creation date
- `organization_id` (string): Organization ID
- `description` (string): Description
- `value` (float): Discount value
- `value_used` (float): Amount used
- `value_remaining` (float): Amount remaining
- `mode` (string): `unknown_discount_mode` | `discount_mode_rate` | `discount_mode_value` | `discount_mode_splittable`
- `start_date` (string): Start date
- `stop_date` (string): Stop date
- `coupon` (DiscountCoupon, optional): Coupon details
- `filters[]` (DiscountFilter[]): Filters

### DiscountCoupon
- `description` (string): Coupon description

### DiscountFilter
- `type` (string): `unknown_filter_type` | `category_name` | `product_name`
- `value` (string): Filter value

### Money
- `currency_code` (string): ISO 4217 currency code
- `units` (int64): Whole units
- `nanos` (int32): Nano units (10^-9)

## Error Codes
- 400: Bad Request (invalid parameters)
- 401: Unauthorized (invalid/missing auth)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (invoice not found)
- 429: Too Many Requests (rate limited)
