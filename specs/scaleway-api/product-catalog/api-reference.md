# Scaleway Product Catalog API Reference

Product area: **Product Catalog** (public catalog of products, SKUs, and pricing)

- **API slug**: `product-catalog`
- **Version**: `v2alpha1`
- **Base URL**: `https://api.scaleway.com`
- **Scope**: Global (no region/zone path segment). Locality is expressed on each
  product and can be filtered via optional query parameters.
- **Authentication**: **None required.** The public catalog is served without the
  `X-Auth-Token` header. This MCP server still constructs a standard Scaleway
  client (which may attach credentials if configured); the endpoint ignores auth.
- **Official reference**:
  https://www.scaleway.com/en/developers/api/product-catalog/public-catalog
- **Go SDK (authoritative shapes)**:
  https://pkg.go.dev/github.com/scaleway/scaleway-sdk-go/api/product_catalog/v2alpha1

The API exposes a **single** operation. There is **no** dedicated endpoint for
categories or for fetching a single product/SKU — categories are attributes on
each product (`service_category`, `product_category`).

---

## GET /product-catalog/v2alpha1/public-catalog/products

`ListPublicCatalogProducts` — list all products (SKUs) in the public catalog.

### Request

Query parameters (all optional):

| Param           | Type            | Notes |
|-----------------|-----------------|-------|
| `page`          | int32 (≥1)      | Page number. |
| `page_size`     | uint32 (≥1)     | Items per page. |
| `product_types` | repeated enum   | Filter by product type. Repeat the param for multiple values. |
| `status`        | repeated enum   | Filter by commercial lifecycle status. Repeat for multiple values. |
| `region`        | string          | Only products available in this region. Mutually exclusive with `zone`/`datacenter`/`global`. |
| `zone`          | string          | Only products available in this zone. Mutually exclusive with `region`/`datacenter`/`global`. |
| `datacenter`    | string          | Only products available in this datacenter. Mutually exclusive with the others. |
| `global`        | bool            | Only globally-available products. Mutually exclusive with the others. |

`product_types` enum values:
`unknown_product_type`, `instance`, `apple_silicon`, `elastic_metal`, `dedibox`,
`block_storage`, `object_storage`, `managed_inference`, `generative_apis`,
`load_balancer`, `secret_manager`, `key_manager`, `managed_redis_database`.

`status` enum values:
`unknown_status`, `public_beta`, `preview`, `general_availability`,
`end_of_new_features`, `end_of_growth`, `end_of_deployment`, `end_of_support`,
`end_of_sale`, `end_of_life`, `retired`.

### Response — `ListPublicCatalogProductsResponse`

```json
{
  "products": [ PublicCatalogProduct, ... ],
  "total_count": 5286
}
```

#### PublicCatalogProduct

| Field                             | Type    | Notes |
|-----------------------------------|---------|-------|
| `sku`                             | string  | Unique product identifier, e.g. `/instance/server/vc1l/fr-par-1`. |
| `service_category`                | string  | High-level category, e.g. `Compute`, `Storage`, `AI`. |
| `product_category`                | string  | Product family, e.g. `Instance`, `Object Storage`. |
| `product`                         | string  | Product name, e.g. `VC1-L`. |
| `variant`                         | string  | Variant / locality-specific name. |
| `description`                     | string  | Human-readable description including price hint. |
| `locality`                        | object  | Exactly one of `global` (bool), `region`, `zone`, `datacenter` (strings). |
| `price`                           | object  | `{ "retail_price": Money }` (may be absent for some products). |
| `properties`                      | object  | `hardware` plus at most one product-specific key (see below). |
| `environmental_impact_estimation` | object  | `{ "kg_co2_equivalent": float, "m3_water_usage": float }` (optional). |
| `unit_of_measure`                 | object  | `{ "unit": string, "size": int }` — billing unit. |
| `status`                          | string  | Lifecycle status (see `status` enum). |
| `end_of_life_at`                  | string  | RFC 3339 timestamp, nullable/optional. |
| `badges`                          | [string]| e.g. `new_product`, `best_seller`, `best_value`, `popular`. |

`Money` (`scw.Money`): `{ "currency_code": string, "units": int, "nanos": int }`.
The effective price is `units + nanos / 1e9` of `currency_code`.

`unit_of_measure.unit` values (countable unit) include, among others:
`chunk`, `core`, `currency`, `device`, `domain`, `email`, `gb_s`, `gigabyte`,
`hour`, `iops_gigabyte`, `ip`, `month`, `node`, `plan`, `query`, `request`,
`session`, `vcpu_s`, `version`, `year`, `key`, `token`, `minute`, `setup`, `day`,
`second`, `sample_day`, `gigabyte_day`, `mvcpu`.

#### properties.hardware

```
hardware: {
  cpu:     { description, arch, type, threads, virtual{count} | physical{...} },
  ram:     { description, size (bytes), type },
  storage: { description, total (bytes) },
  network: { description, internal_bandwidth, public_bandwidth, max_public_bandwidth },
  gpu:     { description, count, type }   // optional
}
```

`cpu.arch` enum: `unknown_arch`, `x64`, `arm64`, `riscv`, `apple_silicon`.

#### properties (product-specific, at most one)

`dedibox`, `elastic_metal`, `apple_silicon`, `instance`, `block_storage`,
`object_storage`, `managed_inference`, `generative_apis`, `load_balancer`,
`secret_manager`, `managed_redis_database`, `key_manager`. Examples:

- `instance`: `{ range, offer_id, recommended_replacement_offer_ids[] }`
- `apple_silicon`: `{ range, server_type }`
- `managed_inference`: `{ instance_gpu_name }`
- `object_storage`: one of `class`, `restore`, `internet_traffic`, `region_traffic`
- `generative_apis`: `{ reasoning, supported_apis[], consumption_mode }`

> The alpha API returns additional fields (e.g. `cpu.shared`, `ram.ecc_type`) and
> may add new product-specific property keys. Schemas in this server use
> passthrough on nested objects so new fields do not break parsing.

### Pagination

Standard Scaleway pagination via `page` / `page_size`; the response carries
`total_count`. This server wraps the list into
`{ items, totalCount, page, pageSize }` via `buildPaginatedResponse`.

### Error codes

Standard Scaleway error envelope. Because no auth is required, `401/403` are not
expected in normal use. Observed:

| Status | Meaning |
|--------|---------|
| 400    | Invalid query parameter (e.g. unknown `product_types` value). Body: `{ "message": "parsing list \"product_types\": \"bogus\" is not a valid value" }` |
| 404    | Unknown path. |
| 429    | Rate limited. |
| 5xx    | Server error. |

Errors are normalized by `mapScalewayError` into `{ type, message, statusCode }`.

---

## Derived operation: categories

There is no categories endpoint. The `scaleway_product_catalog_list_categories`
MCP tool derives the distinct `(service_category, product_category)` pairs by
paging through `GET /public-catalog/products` and counting client-side. It
accepts an optional `product_types` filter and returns:

```json
{
  "categories": [
    { "service_category": "Compute", "product_category": "Instance", "product_count": 136 },
    ...
  ],
  "total_count": <number of distinct pairs>,
  "products_scanned": <number of products read>
}
```
