# Requirements Checklist: 054-product-catalog

**Feature**: Scaleway Product Catalog | **Date**: 2026-07-07

## Contract-First

- [X] API reference documented at `specs/scaleway-api/product-catalog/api-reference.md`
- [X] Endpoint, method, path verified against official docs + Go SDK + live API
- [X] Request params, response shapes, pagination, and error codes documented
- [X] No invented endpoints (categories tool explicitly derived, not fabricated)

## Functional

- [X] FR-001 list products with pagination (`items/totalCount/page/pageSize`)
- [X] FR-002 filters: productTypes[], status[], region, zone, datacenter, global
- [X] FR-003 enum + region/zone validation before request
- [X] FR-004 categories aggregation with per-category counts and optional filter
- [X] FR-005 read-only, no auth required
- [X] FR-006 normalized error envelope on failure
- [X] FR-007 passthrough response schemas tolerate alpha field drift

## Testing (Constitution)

- [X] Unit tests cover every handler: success, error, all optional-param branches,
      pagination/scan branches
- [X] Contract test covers every tool and references the API reference + parity matrix
- [X] 100% line and branch coverage of `src/tools/product-catalog/**`
- [X] Parity fragment written for both tools

## Quality Gates

- [X] `bun x tsc --noEmit` clean for product-catalog files
- [X] `bun x biome check` clean for product-catalog files
- [X] All product-catalog tests pass
