# Research: Scaleway Product Catalog API

**Feature**: 054-product-catalog | **Date**: 2026-07-07

## Sources

- Official API reference:
  https://www.scaleway.com/en/developers/api/product-catalog/public-catalog
- Go SDK (authoritative struct/enum shapes):
  https://pkg.go.dev/github.com/scaleway/scaleway-sdk-go/api/product_catalog/v2alpha1
- Live verification against `https://api.scaleway.com/product-catalog/v2alpha1/public-catalog/products`
  (no auth) to confirm JSON field names, filters, pagination, and error shape.

## Decisions

### D1 — API slug & version
`product-catalog` / `v2alpha1`. The docs slug is `public-catalog`; the actual
path segment is `product-catalog/v2alpha1/public-catalog/products`.

### D2 — Scope: global, unauthenticated
No region/zone in the path. The endpoint returns 200 without any auth token.
Locality is a per-product attribute and an optional filter.

### D3 — Single endpoint only
The v2alpha1 SDK exposes exactly one method, `ListPublicCatalogProducts`. There
is **no** get-by-SKU and **no** categories endpoint. Verified against the Go SDK
package (only `PublicCatalogAPI.ListPublicCatalogProducts` is listed).

### D4 — Categories are attributes, not a resource
Each product carries `service_category` and `product_category`. To satisfy the
"categories" requirement without inventing an endpoint, the categories tool pages
through the products endpoint and aggregates distinct pairs client-side. This is
explicitly documented as a derived operation.

### D5 — Filters and query param names (live-verified)
`page`, `page_size`, repeated `product_types`, repeated `status`, and
`region` / `zone` / `datacenter` / `global` (mutually exclusive locality
filters). Confirmed that `product_types=instance`, `status=general_availability`,
`region=fr-par`, and `zone=fr-par-2` all filter as expected. `order_by` is **not**
part of the SDK request and appeared to be ignored by the live API, so it is not
exposed.

### D6 — Response envelope & pagination
`{ products: [...], total_count }`. Standard `page`/`page_size` pagination;
`total_count` observed at 5286. Wrapped via `buildPaginatedResponse` into
`{ items, totalCount, page, pageSize }` for consistency with other list tools.

### D7 — Money & value objects
`price.retail_price` is `scw.Money` = `{ currency_code, units, nanos }`.
`unit_of_measure` serializes as `{ unit, size }` (not the Go field name
`countable_unit`). `environmental_impact_estimation` =
`{ kg_co2_equivalent, m3_water_usage }`.

### D8 — Alpha field drift → passthrough schemas
The live API returns fields beyond the documented set (e.g. `cpu.shared`,
`ram.ecc_type`) and multiple product-specific `properties.*` keys. Nested
response schemas use Zod `.passthrough()` so new fields do not break parsing,
while required top-level fields (`sku`, `service_category`, …) are still enforced.

### D9 — Error shape
`400` on an invalid `product_types` value returns
`{ "message": "parsing list \"product_types\": \"bogus\" is not a valid value" }`.
Normalized via the shared `mapScalewayError`.

## Alternatives Considered

- **Expose no categories tool** — Rejected; the vertical brief lists categories as
  an expected resource and the derived aggregation is genuinely useful.
- **Expose `order_by`** — Rejected; not in the SDK request and ignored live.
- **Strict (non-passthrough) response schemas** — Rejected; the alpha API adds
  fields and would spuriously fail validation on real responses.
