# Implementation Plan: 055-dedibox

## Technical Context

- **Language/runtime**: TypeScript 5.x (strict) on Bun 1.x
- **Deps**: `@modelcontextprotocol/sdk` ^1.25.x, `@scaleway/sdk-client` ^1.0.0,
  `zod` ^3.25.x
- **API**: `https://api.scaleway.com/dedibox/v1`, zone-scoped, X-Auth-Token
- **State**: none (stateless proxy)
- **Testing**: Vitest, 100% line+branch coverage; contract tests for every tool

## Architecture

Follows the standard per-area layout used across this repo:

- `src/tools/dedibox/types.ts` — zod param schemas (camelCase inputs), response
  schemas, and enums mirrored from the Dedibox v1 SDK.
- `src/tools/dedibox/handlers.ts` — one `handle*` function per tool. Uses the
  shared `getClient()` + `client.fetch`, `urlParams` for query strings,
  `buildPaginatedResponse` for lists, and `formatErrorResponse(mapScalewayError)`
  in every catch.
- `src/tools/dedibox/index.ts` — `registerDediboxTools(server)` registering all
  17 tools with `scaleway_dedibox_` names.

The orchestrator wires `registerDediboxTools` into `src/tools/index.ts`.

## Design choices

- Path prefix constant `dedibox/v1/zones`.
- Numeric IDs interpolated directly into the path.
- Body-bearing actions (`update`, `install`, `start_bmc_access`) send JSON;
  power actions send `"{}"`; deletes send no body.
- camelCase MCP params are mapped to snake_case API fields inside handlers.

## Phases

1. Research the API (done — see research.md).
2. Author SDD artifacts + `specs/scaleway-api/dedibox/api-reference.md`.
3. Implement types → handlers → index.
4. Unit tests (mock client) + contract tests.
5. Verify: vitest green, 100% coverage, biome clean, tsc clean.
6. Emit parity fragment.

## Constitution check

- 100% coverage: enforced by unit tests (every handler success/error + branch).
- Contract parity: `tests/contract/dedibox/dedibox.contract.test.ts` covers all
  17 tools and references the API reference doc + parity matrix.
