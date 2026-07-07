# Implementation Plan: 048-data-warehouse

## Technical Context
- Language/runtime: TypeScript 5.x (strict) on Bun 1.x.
- Deps: `@modelcontextprotocol/sdk` ^1.25.x, `@scaleway/sdk-client` ^1.0.0, `zod` ^3.25.x.
- Storage: N/A (stateless proxy to the Scaleway Data Warehouse API).
- Testing: Vitest (unit + contract), 100% line & branch coverage enforced.

## Structure
- `src/tools/data-warehouse/types.ts` — zod schemas: enums, response objects, per-tool params.
- `src/tools/data-warehouse/handlers.ts` — one `handleXxx` per tool; shared `getClient`, `jsonResponse`, `endpointSpec` helpers; try/catch → `formatErrorResponse(mapScalewayError(...))`.
- `src/tools/data-warehouse/index.ts` — `registerDataWarehouseTools(server)` registering all 19 tools.
- `tests/unit/tools/data-warehouse.test.ts` — mocked-client unit tests.
- `tests/contract/data-warehouse/data-warehouse.contract.test.ts` — schema contract tests.
- `specs/scaleway-api/data-warehouse/api-reference.md` — endpoint reference.

## Constants
- `DW_API_PREFIX = "datawarehouse/v1beta1/regions"`.

## Approach
1. Encode every path/shape from the OpenAPI schema into zod (types.ts).
2. Implement handlers using `client.fetch<T>` + `urlParams(...)`; list handlers via `buildPaginatedResponse`.
3. Register tools with names prefixed `scaleway_data_warehouse_`.
4. Unit-test each handler (success, error, optional-param & pagination branches).
5. Contract-test every tool's request params and response shape against the reference.

## Wiring
- The orchestrator adds `registerDataWarehouseTools` to `src/tools/index.ts` and the
  entry to `tests/parity-matrix.json` (both out of scope for this vertical).

## Constitution check
- 100% coverage: achieved (verified via vitest v8 coverage).
- Contract parity: every tool has a contract test referencing the API reference and parity matrix.
