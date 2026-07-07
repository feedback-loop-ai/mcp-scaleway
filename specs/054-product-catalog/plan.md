# Implementation Plan: 054-product-catalog

**Feature**: Scaleway Product Catalog MCP tools | **Date**: 2026-07-07

## Technical Context

- **Language/Runtime**: TypeScript 5.x (strict) on Bun 1.x
- **Key deps**: `@modelcontextprotocol/sdk` ^1.25.x, `@scaleway/sdk-client` ^1.0.0,
  `zod` ^3.25.x
- **API**: `product-catalog` v2alpha1, global scope, no auth
- **Testing**: Vitest (unit + contract), 100% line & branch coverage
- **State**: None (stateless proxy)

## Constitution Check

- **Contract-first**: `specs/scaleway-api/product-catalog/api-reference.md`
  documents the endpoint before implementation. ✅
- **100% coverage & parity**: Unit + contract tests cover every handler/branch;
  every tool has a contract test and a parity-matrix fragment. ✅
- **Read-only correctness**: No write tools; catalog is read-only. ✅

## Architecture

Standard per-area layout under `src/tools/product-catalog/`:

- `types.ts` — Zod schemas: enums (`ProductCatalogProductType`,
  `ProductCatalogProductStatus`, `ProductCatalogCpuArch`,
  `ProductCatalogProductBadge`), value objects (`Money`, `ProductLocality`,
  hardware/properties, `UnitOfMeasure`, `EnvironmentalImpactEstimation`),
  `PublicCatalogProduct`, `ListPublicCatalogProductsResponse`, tool params
  (`ListProductsParams`, `ListCategoriesParams`), and derived `ProductCategory`.
- `handlers.ts` — `handleListProducts` (single endpoint call + pagination wrap)
  and `handleListCategories` (paged scan + client-side aggregation). Uses
  `getClient()` from shared auth/client, `urlParams` from the SDK, and the shared
  error/pagination helpers.
- `index.ts` — `registerProductCatalogTools(server)` registering the two tools.

## Tools

| Tool | API |
|------|-----|
| `scaleway_product_catalog_list_products` | `GET /product-catalog/v2alpha1/public-catalog/products` |
| `scaleway_product_catalog_list_categories` | derived from the same endpoint |

## Wiring

The orchestrator adds `registerProductCatalogTools` to `src/tools/index.ts`
(that file is owned by the orchestrator and not edited here).

## Testing Strategy

- **Unit** (`tests/unit/tools/product-catalog.test.ts`): mock the client; cover
  registration, list success, all-filters branch, categories single-page,
  multi-page, empty-page break, scan-cap, and error paths — 100% line+branch.
- **Contract** (`tests/contract/product-catalog/product-catalog.contract.test.ts`):
  validate request param schemas (defaults, filters, rejections) and response
  schemas against real fixtures, plus enum completeness.

## Risks / Mitigations

- **Alpha field drift** → passthrough nested schemas.
- **Large catalog scan for categories** → 50-page × 1000-item safety cap.
