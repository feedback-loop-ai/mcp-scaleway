# Implementation Plan: Apple silicon Private Networks

## Summary

Add 5 MCP tools for Apple silicon VPC Private Network attachments by extending the
existing `src/tools/apple-silicon/` vertical (types/handlers/index) without altering the
8 pre-existing tools. Zonal `v1alpha1` API, proxied statelessly through
`@scaleway/sdk-client`.

## Technical Context

- **Language/runtime**: TypeScript 5.x (strict) on Bun 1.x
- **Key deps**: `@modelcontextprotocol/sdk` ^1.25.x, `@scaleway/sdk-client` ^1.0.0, `zod` ^3.25.x
- **API**: Scaleway Apple silicon `v1alpha1`, zonal (`fr-par-1`, `fr-par-3`)
- **Storage**: N/A (stateless proxy)
- **Testing**: Vitest, 100% line+branch coverage of touched files; contract tests for every tool

## Constitution Check

- [x] Contract-first: `specs/scaleway-api/apple-silicon/api-reference.md` extended with a
      Private Networks section documenting method+path, request/response, pagination, auth, errors.
- [x] 100% coverage (line + branch) for `src/tools/apple-silicon/{types,handlers,index}.ts`.
- [x] Full API parity: every new tool has a contract test; parity fragment authored.
- [x] No tool without tests: unit + contract for all 5 tools.
- [x] No breaking change to the existing 8 tools (their tests still pass).

## Project Structure

### Documentation (this feature)
- `specs/056-apple-silicon-private-networks/` — spec, plan, research, data-model, quickstart, tasks, contracts/, checklists/
- `specs/scaleway-api/apple-silicon/api-reference.md` — Private Networks section appended

### Source Code
- `src/tools/apple-silicon/types.ts` — 5 new zod param schemas + order-by enum (appended)
- `src/tools/apple-silicon/handlers.ts` — 5 new handlers on the existing factory (appended)
- `src/tools/apple-silicon/index.ts` — 5 new `server.tool(...)` registrations (appended)

### Tests
- `tests/unit/tools/apple-silicon/handlers.test.ts` — handler unit tests (appended)
- `tests/unit/tools/apple-silicon.test.ts` — registration + callback coverage (appended)
- `tests/contract/tools/apple-silicon/contract.test.ts` — schema/request/response/error contracts (appended)

## Complexity Tracking

No new complexity: reuses the existing area's `buildUrl`, `jsonResponse`,
`paginationToQuery`, and shared error/pagination helpers. The only non-trivial branch is
repeated `ipam_ip_ids` list-filter encoding, covered by tests.
