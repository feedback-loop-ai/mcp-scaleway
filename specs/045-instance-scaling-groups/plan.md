# Implementation Plan: Instance Scaling Groups (Autoscaling)

## Technical Context
- **Language**: TypeScript 5.x (strict) on Bun 1.x
- **Dependencies**: `@modelcontextprotocol/sdk` ^1.25.x, `@scaleway/sdk-client` ^1.0.0, `zod` ^3.25.x
- **API**: Scaleway Autoscaling v1alpha1, zoned, base `autoscaling/v1alpha1/zones/{zone}`
- **State**: N/A (stateless proxy)
- **Testing**: Vitest, 100% line+branch coverage; contract tests validate zod shapes.

## Structure
```
src/tools/autoscaling/
  types.ts      # zod schemas: entities, enums, per-tool params, list responses
  handlers.ts   # 16 handlers wrapping the shared client, error mapping, pagination
  index.ts      # registerAutoscalingTools(server) — 16 server.tool registrations
tests/unit/tools/autoscaling.test.ts
tests/contract/autoscaling/autoscaling.contract.test.ts
specs/scaleway-api/autoscaling/api-reference.md
```

## Approach
1. Model the three resource groups plus nested value objects (Capacity, Loadbalancer,
   Metric, VolumeInstanceTemplate) as reusable zod schemas.
2. Implement handlers following the `nats` exemplar: `getClient()`, `client.fetch<T>()`,
   `urlParams(...)` for queries, `buildPaginatedResponse()` for lists, and
   `formatErrorResponse(mapScalewayError(error))` in a single try/catch.
3. Build request bodies as plain objects; rely on `JSON.stringify` dropping `undefined` to
   avoid conditional branches (aids 100% branch coverage).
4. Register 16 tools with `scaleway_autoscaling_` prefix.
5. Write unit tests (success + error + optional-param/pagination branches) and contract tests
   (every tool's request + response shape, enums, pagination, zone validation).

## Constitution check
- 100% coverage: achieved (v8 report: 100% stmts/branch/funcs/lines for `src/tools/autoscaling`).
- Contract parity: every tool has a contract test referencing the API reference and parity matrix.
- Contract-first: `specs/scaleway-api/autoscaling/api-reference.md` documents every endpoint.

## Orchestrator wiring (out of this agent's scope)
- Add `registerAutoscalingTools` to `src/tools/index.ts`.
- Merge the parity fragment into `tests/parity-matrix.json`.
