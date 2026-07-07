# 054-product-catalog: Scaleway Product Catalog API

## Overview

MCP tools for the Scaleway **Product Catalog** API (`product-catalog` v2alpha1).
A **global, unauthenticated, read-only** public catalog of every Scaleway product
(SKU) with retail pricing, hardware/product properties, locality, environmental
impact, and commercial lifecycle status.

**Status**: Implemented.

## User Stories

### P1 - Browse products with pricing and properties
- As a user, I can list catalog products (SKUs) with pagination.
- As a user, I can filter products by product type (instance, object_storage, …).
- As a user, I can filter products by commercial status (general_availability, …).
- As a user, I can filter products by locality (region, zone, datacenter, or global).
- For each product I see the SKU, retail price (currency/units/nanos), unit of
  measure, hardware/product properties, locality, status, badges, and
  environmental impact.

### P2 - Discover categories
- As a user, I can list the distinct service and product categories in the
  catalog with a count of products per category, optionally scoped to one or more
  product types.

## Acceptance Scenarios

1. **List products (default)** — Calling `scaleway_product_catalog_list_products`
   with no arguments returns page 1 (50 items) plus `totalCount`.
2. **Filter by type + status** — `productTypes: ["instance"]` and
   `status: ["general_availability"]` are sent as repeated `product_types` /
   `status` query params.
3. **Filter by locality** — `region: "fr-par"` restricts results to that region;
   `region` format is validated (`^[a-z]{2}-[a-z]{3}$`).
4. **Invalid filter** — An unknown product type is rejected by input validation
   before any request is made.
5. **List categories** — `scaleway_product_catalog_list_categories` returns the
   distinct `(service_category, product_category)` pairs with `product_count`,
   sorted by service then product category.
6. **Error handling** — Upstream failures return a normalized
   `{ error: { type, message, statusCode } }` envelope with `isError: true`.

## Functional Requirements

- **FR-001**: Expose a tool listing public catalog products with `page`/`pageSize`
  pagination returning `{ items, totalCount, page, pageSize }`.
- **FR-002**: Support optional filters `productTypes[]`, `status[]`, `region`,
  `zone`, `datacenter`, `global`, serialized to the documented query params.
- **FR-003**: Validate enum filters and region/zone formats via Zod before the
  request; reject unknown values.
- **FR-004**: Expose a tool deriving distinct categories (service + product) with
  per-category product counts, honoring an optional `productTypes[]` filter.
- **FR-005**: All tools are read-only. No auth token is required by the endpoint.
- **FR-006**: All handlers wrap failures via `mapScalewayError` /
  `formatErrorResponse`.
- **FR-007**: Response schemas tolerate additional alpha-only fields (passthrough).

## Entities

### PublicCatalogProduct
- sku: string
- service_category: string
- product_category: string
- product: string
- variant: string
- description: string
- locality: { global?: bool, region?: string, zone?: string, datacenter?: string }
- price: { retail_price: Money } (optional)
- properties: { hardware?, plus one product-specific key } (optional)
- environmental_impact_estimation: { kg_co2_equivalent?, m3_water_usage? } (optional)
- unit_of_measure: { unit: string, size: int } (optional)
- status: string (lifecycle enum)
- end_of_life_at: string | null (optional)
- badges: string[] (optional)

### Money
- currency_code: string
- units: int
- nanos: int

### ProductCategory (derived)
- service_category: string
- product_category: string
- product_count: int

## Out of Scope

- **Single-product / single-SKU GET**: The API has no get-by-SKU endpoint.
- **Dedicated categories endpoint**: None exists; categories are product
  attributes. The categories tool derives them client-side from the products
  endpoint (documented, not an invented endpoint).
- **Write operations**: The catalog is read-only.
- **Authenticated per-account pricing / discounts**: Handled by the Billing area,
  not the public catalog.

## Non-Functional Notes

- Global scope: no region/zone in the path; locality is filter-only.
- No authentication required by the endpoint.
- The catalog is large (~5k+ SKUs); the categories tool caps its scan at 50 pages
  of 1000 products as a safety bound.
