# Implementation Plan: 046-opensearch

## Technical Context
- Language: TypeScript 5.x (strict), Bun 1.x runtime
- Deps: `@modelcontextprotocol/sdk` ^1.25.x, `@scaleway/sdk-client` ^1.0.0, `zod` ^3.25.x
- API: Scaleway Cloud Essentials for OpenSearch `searchdb/v1alpha1`, region-scoped (fr-par)
- Storage: N/A (stateless proxy to Scaleway API)
- Testing: Vitest, 100% line + branch coverage; contract tests validate zod shapes

## Structure
```
src/tools/opensearch/
  types.ts     # zod schemas: params, entities, list-response wrappers, enums
  handlers.ts  # one handleXxx per tool; client.fetch + error mapping
  index.ts     # registerOpensearchTools(server): server.tool(...) per tool
tests/unit/tools/opensearch.test.ts
tests/contract/opensearch/opensearch.contract.test.ts
specs/scaleway-api/opensearch/api-reference.md
```

## Approach
1. Model entities and enums from the SDK-verified shapes in `types.ts`.
2. Define per-tool `*Params` zod objects (region-scoped, camelCase inputs).
3. Implement handlers following the repo pattern: `getClient()` →
   `client.fetch<T>({ method, path, urlParams, body })` → `jsonResponse` /
   `buildPaginatedResponse`, wrapped in try/catch → `formatErrorResponse(mapScalewayError(e))`.
4. Map friendly inputs (endpoint public/private, volume camelCase) to API wire bodies.
5. Register all 15 tools in `index.ts` via `registerOpensearchTools`.
6. Unit-test every handler (success, error, optional-param and pagination branches).
7. Contract-test every tool's request/response zod shapes against the API reference.

## Constitution check
- 100% coverage: enforced; achieved for all three source files.
- Full API contract parity: every exposed endpoint has a contract test and a
  parity-matrix entry (fragment).
- Contract traceability: contract test header references
  `specs/scaleway-api/opensearch/api-reference.md` and `tests/parity-matrix.json`.
- No tool without tests: all 15 tools covered.

## Wiring (orchestrator)
`registerOpensearchTools` is exported from `src/tools/opensearch/index.js` and is
wired into `src/tools/index.ts` by the orchestrator (out of this agent's scope).
