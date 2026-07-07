# Data Model: 054-product-catalog

**Feature**: Scaleway Product Catalog | **Date**: 2026-07-07

All types are defined in `src/tools/product-catalog/types.ts`.

## Enums

| Enum | Values |
|------|--------|
| `ProductCatalogProductType` | unknown_product_type, instance, apple_silicon, elastic_metal, dedibox, block_storage, object_storage, managed_inference, generative_apis, load_balancer, secret_manager, key_manager, managed_redis_database |
| `ProductCatalogProductStatus` | unknown_status, public_beta, preview, general_availability, end_of_new_features, end_of_growth, end_of_deployment, end_of_support, end_of_sale, end_of_life, retired |
| `ProductCatalogCpuArch` | unknown_arch, x64, arm64, riscv, apple_silicon |
| `ProductCatalogProductBadge` | unknown_product_badge, new_product, best_seller, best_value, popular |

## Value Objects

### Money
| Field | Type | Notes |
|-------|------|-------|
| currency_code | string | e.g. `EUR` |
| units | int | whole units |
| nanos | int | 1e-9 fraction |

### ProductLocality (passthrough; exactly one set)
| Field | Type |
|-------|------|
| global | bool? |
| region | string? |
| zone | string? |
| datacenter | string? |

### ProductPrice
| Field | Type |
|-------|------|
| retail_price | Money |

### ProductHardware (passthrough)
| Field | Type |
|-------|------|
| cpu | { description?, arch?, type?, threads?, virtual{count}?, physical? } |
| ram | { description?, size?, type? } |
| storage | { description?, total? } |
| network | { description?, internal_bandwidth?, public_bandwidth?, max_public_bandwidth? } |
| gpu | { description?, count?, type? } |

### ProductProperties (passthrough)
`hardware?` plus at most one product-specific key (instance, apple_silicon,
object_storage, managed_inference, generative_apis, …) preserved via passthrough.

### EnvironmentalImpactEstimation (passthrough)
| Field | Type |
|-------|------|
| kg_co2_equivalent | number? |
| m3_water_usage | number? |

### UnitOfMeasure (passthrough)
| Field | Type |
|-------|------|
| unit | string |
| size | int |

## Aggregate: PublicCatalogProduct (passthrough)

| Field | Type | Required |
|-------|------|----------|
| sku | string | yes |
| service_category | string | yes |
| product_category | string | yes |
| product | string | yes |
| variant | string | yes |
| description | string | yes |
| locality | ProductLocality | yes |
| price | ProductPrice | no |
| properties | ProductProperties | no |
| environmental_impact_estimation | EnvironmentalImpactEstimation | no |
| unit_of_measure | UnitOfMeasure | no |
| status | string | yes |
| end_of_life_at | string \| null | no |
| badges | string[] | no |

## Responses

### ListPublicCatalogProductsResponse
| Field | Type |
|-------|------|
| products | PublicCatalogProduct[] |
| total_count | int ≥ 0 |

### Derived: ProductCategory
| Field | Type |
|-------|------|
| service_category | string |
| product_category | string |
| product_count | int ≥ 0 |

## Tool Params

### ListProductsParams (extends PaginationParams)
| Field | Type | Required | Default |
|-------|------|----------|---------|
| page | int ≥ 1 | no | 1 |
| pageSize | int 1..100 | no | 50 |
| productTypes | ProductCatalogProductType[] | no | - |
| status | ProductCatalogProductStatus[] | no | - |
| region | string (`^[a-z]{2}-[a-z]{3}$`) | no | - |
| zone | string (`^[a-z]{2}-[a-z]{3}-[0-9]+$`) | no | - |
| datacenter | string | no | - |
| global | bool | no | - |

### ListCategoriesParams
| Field | Type | Required |
|-------|------|----------|
| productTypes | ProductCatalogProductType[] | no |
