# Tool Contracts: Scaleway Product Catalog MCP Tools

**Feature**: 054-product-catalog | **Date**: 2026-07-07

Reference: `specs/scaleway-api/product-catalog/api-reference.md`

## scaleway_product_catalog_list_products

**Scaleway API**: `GET /product-catalog/v2alpha1/public-catalog/products`
(global scope, no auth)

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1–100) |
| productTypes | string[] enum | no | - | Filter by product type(s); repeated `product_types` |
| status | string[] enum | no | - | Filter by lifecycle status(es); repeated `status` |
| region | string | no | - | Region filter (`^[a-z]{2}-[a-z]{3}$`) |
| zone | string | no | - | Zone filter (`^[a-z]{2}-[a-z]{3}-[0-9]+$`) |
| datacenter | string | no | - | Datacenter filter |
| global | boolean | no | - | Global-only filter |

`productTypes` enum: unknown_product_type, instance, apple_silicon,
elastic_metal, dedibox, block_storage, object_storage, managed_inference,
generative_apis, load_balancer, secret_manager, key_manager,
managed_redis_database.

`status` enum: unknown_status, public_beta, preview, general_availability,
end_of_new_features, end_of_growth, end_of_deployment, end_of_support,
end_of_sale, end_of_life, retired.

**Output**: `{ items: PublicCatalogProduct[], totalCount: number, page: number, pageSize: number }`

Each `PublicCatalogProduct`: `{ sku, service_category, product_category,
product, variant, description, locality, price?, properties?,
environmental_impact_estimation?, unit_of_measure?, status, end_of_life_at?,
badges? }`.

---

## scaleway_product_catalog_list_categories

**Scaleway API**: derived from `GET /product-catalog/v2alpha1/public-catalog/products`
(no dedicated categories endpoint exists).

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| productTypes | string[] enum | no | Restrict the scan to these product types before aggregating |

**Output**: `{ categories: ProductCategory[], total_count: number, products_scanned: number }`

`ProductCategory`: `{ service_category, product_category, product_count }`,
sorted by service then product category.

---

## Error Contract (both tools)

On failure: `{ "error": { "type", "message", "statusCode" } }` with
`isError: true`. `type` ∈ { not_found, permission_denied, invalid_input,
rate_limited, server_error }. Input validation errors (unknown enum value, bad
region format, pageSize > 100) are rejected before any request.
