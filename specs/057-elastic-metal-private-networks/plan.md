# Implementation Plan: Elastic Metal Private Networks

**Branch**: `057-elastic-metal-private-networks` | **Status**: Implemented
**Spec**: [spec.md](./spec.md)

## Summary

Add four MCP tools to the existing `elastic-metal` area for managing Elastic Metal server
attachments to VPC Private Networks (list / add / set / delete). Reuse the area's existing
transport and helpers; register through the existing `registerElasticMetalTools`.

## Technical Context

- **Language**: TypeScript 5.x (strict), Bun 1.x runtime
- **Deps**: `@modelcontextprotocol/sdk` ^1.25, `@scaleway/sdk-client`, `zod` ^3.25
- **API**: Scaleway Bare Metal `baremetal/v1`, zonal; `PrivateNetworkAPI`
- **Scope**: zonal (`fr-par-1`, `fr-par-2`, `nl-ams-1`, `nl-ams-2`, `pl-waw-2`, `pl-waw-3`)
- **Testing**: Vitest, 100% line+branch coverage (constitution), contract tests for parity
- **Storage**: N/A (stateless proxy)

## Constitution Check

- **Contract-first**: API reference documented in `specs/scaleway-api/elastic-metal/api-reference.md`
  (Private Networks section) before/with implementation. PASS.
- **100% coverage & parity**: unit tests cover every handler branch; contract tests cover every
  new tool and reference the API reference + parity matrix. PASS.
- **No tool without tests**: all four tools have contract coverage. PASS.

## Project Structure

```
src/tools/elastic-metal/
  types.ts      # + 4 input schemas
  handlers.ts   # + 4 handlers (handleListServerPrivateNetworks, handleAddServerPrivateNetwork,
                #   handleSetServerPrivateNetworks, handleDeleteServerPrivateNetwork)
  index.ts      # + 4 server.tool registrations in registerElasticMetalTools
tests/unit/tools/elastic-metal/handlers.test.ts   # + US5 describe block
tests/contract/tools/elastic-metal/contract.test.ts # + schema + registration count + zone matrix
specs/scaleway-api/elastic-metal/api-reference.md  # + Private Networks section
specs/057-elastic-metal-private-networks/          # this SDD bundle
```

## Phases

1. Research authoritative API (Go SDK) — see research.md.
2. Document API reference (Private Networks section).
3. Implement schemas, handlers, registrations.
4. Unit + contract tests to 100% coverage.
5. Parity fragment + verification (vitest, tsc, biome).

## Complexity Tracking

No deviations. Reuses existing area conventions; purely additive.
