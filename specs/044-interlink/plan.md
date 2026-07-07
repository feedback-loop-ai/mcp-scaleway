# Implementation Plan: Scaleway InterLink MCP Tools

**Branch**: `044-interlink` | **Spec**: `specs/044-interlink/spec.md`
**Status**: Implemented

## Summary

Expose the Scaleway InterLink `v1beta1` region-scoped API (dedicated /
partner-hosted private connectivity) as 23 MCP tools under the
`scaleway_interlink_` prefix, following the established `src/tools/<area>/`
convention (types → handlers → index) with full unit and contract test
coverage.

## Technical Context

- **Language/Runtime**: TypeScript 5.x (strict) on Bun 1.x
- **Key deps**: `@modelcontextprotocol/sdk` ^1.25, `@scaleway/sdk-client`
  (`urlParams`, `client.fetch`), `zod` ^3.25
- **Auth**: `X-Auth-Token` via shared `loadAuthConfig` + `createScalewayClient`
- **State**: none (stateless proxy)
- **Testing**: Vitest — unit (mocked client) + contract (zod shape validation);
  100% line/branch coverage of new source files

## Architecture

- `src/tools/interlink/types.ts` — zod schemas: entity response shapes
  (Link, RoutingPolicy, Partner, Pop, DedicatedConnection, BgpConfig, Range,
  PartnerHost, SelfHost), enums, and per-tool `*Params` request schemas.
- `src/tools/interlink/handlers.ts` — one `handleXxx(params)` per tool; each
  uses the shared client, `urlParams(...)` for query, `JSON.stringify(body)` for
  request bodies (undefined fields dropped → branch-free), `buildPaginatedResponse`
  for lists, and `formatErrorResponse(mapScalewayError(e))` in a catch.
- `src/tools/interlink/index.ts` — `registerInterlinkTools(server)` registering
  all 23 tools; orchestrator wires it into `src/tools/index.ts`.

## Constitution Check

- **Contract-first**: `specs/scaleway-api/interlink/api-reference.md` documents
  every endpoint (method, path, request/response, pagination, auth, errors).
- **100% coverage**: handlers designed branch-free (JSON.stringify drops
  undefined; `urlParams` drops undefined) so success + error tests per handler
  achieve full coverage; verified at 100%.
- **API parity**: every tool has a contract test referencing the api-reference.

## Phasing

1. Research (Go SDK + developers reference) → `research.md`
2. Data model + contracts → `data-model.md`, `contracts/`
3. Implement types → handlers → index
4. Unit + contract tests; verify coverage, tsc, biome
5. Parity fragment for orchestrator merge

## Risks / Mitigations

- **Schema drift (v1beta1)**: mitigated by sourcing from the generated Go SDK
  and keeping nullable fields optional for tolerant parsing.
- **Dedicated-connections path ambiguity**: resolved to `/dedicated-connections`
  per the SDK.
