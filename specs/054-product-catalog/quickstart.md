# Quickstart: 054-product-catalog

The Product Catalog tools are read-only and require **no** Scaleway credentials
(the public catalog endpoint is unauthenticated).

## Tools

### scaleway_product_catalog_list_products

List catalog products (SKUs) with pricing and properties.

```json
{ "productTypes": ["instance"], "status": ["general_availability"], "region": "fr-par", "pageSize": 20 }
```

Returns:

```json
{
  "items": [
    {
      "sku": "/instance/server/vc1l/fr-par-1",
      "service_category": "Compute",
      "product_category": "Instance",
      "product": "VC1-L",
      "price": { "retail_price": { "currency_code": "EUR", "units": 0, "nanos": 11000000 } },
      "unit_of_measure": { "unit": "hour", "size": 1 },
      "locality": { "zone": "fr-par-1" },
      "status": "general_availability"
    }
  ],
  "totalCount": 136,
  "page": 1,
  "pageSize": 20
}
```

Price = `units + nanos / 1e9` per `unit_of_measure` (here 0.011 EUR/hour).

Filters: `productTypes[]`, `status[]`, and one of `region` / `zone` /
`datacenter` / `global`.

### scaleway_product_catalog_list_categories

List distinct service/product categories with product counts.

```json
{ "productTypes": ["instance"] }
```

Returns:

```json
{
  "categories": [
    { "service_category": "Compute", "product_category": "Instance", "product_count": 136 }
  ],
  "total_count": 1,
  "products_scanned": 136
}
```

## Verify locally

```bash
# Live sanity check (no auth needed):
curl -s "https://api.scaleway.com/product-catalog/v2alpha1/public-catalog/products?page=1&page_size=2"

# Tests:
bun x vitest run --config tests/vitest.config.ts \
  tests/unit/tools/product-catalog.test.ts \
  tests/contract/product-catalog/product-catalog.contract.test.ts
```
