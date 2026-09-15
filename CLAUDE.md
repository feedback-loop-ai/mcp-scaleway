# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MCP (Model Context Protocol) server for Scaleway - a European cloud provider offering compute, storage, networking, AI, and managed services.

## Build & Development Commands

```bash
# Start MCP server
bun run start

# Lint (Biome)
bun run lint
bun run lint:fix  # Auto-fix issues

# Type check
bun x tsc --noEmit

# Run integration tests (requires Scaleway - see .env.test.local.example)
bun run test
bun run test:watch

# Run unit tests only (CI-safe, no external dependencies)
bun x vitest run --config tests/vitest.config.ts --dir tests/unit

# Run contract tests (API shape validation)
bun x vitest run --config tests/vitest.config.ts --dir tests/contract

# Run tests with coverage (must be 100% - CI enforced)
bun run test -- --coverage.enabled

# Validate API parity matrix
bun run test:parity  # checks tests/parity-matrix.json completeness

# Drift alarm (non-blocking, local): reads the matrix's api strings against the
# fetched OpenAPI documents under .forge/scratch/ and re-hashes their provenance.
# It reports and exits 0 whatever it finds; it is not a gate. See .forge/reports/DECISIONS.md.
bun run test:drift

# Webhosting live 404 probe (LOCAL ONLY — requires credentials, like tests/api/):
# existence checks at the true verb of the four webhosting routes the fetched
# schema does not publish. Read-only by design; creates nothing.
bun run probe:webhosting

# Re-fetch every cited schema.yml and report which digests moved (no state
# written; the record is only due a date bump — see DECISIONS.md).
bun run fetch:schemas
```

## CI/CD

GitHub Actions CI runs on every push and PR:
- **Lint**: `bun run lint` (Biome)
- **Type Check**: `bun x tsc --noEmit`
- **Test**: Unit + contract tests (100% line and branch coverage enforced)
- **API Parity**: All Scaleway API operations in parity-matrix.json MUST have contract tests

Test organization:
- `tests/unit/` - Unit tests (run in CI)
- `tests/contract/` - API contract tests validating Scaleway API shapes (run in CI)
- `tests/api/` - Integration tests (require Scaleway, run locally only)
- `tests/parity-matrix.json` - Machine-readable map of Scaleway API operations to contract tests

## Testing Requirements (Constitution v1.2.0)

- **100% code coverage**: Line and branch. No exceptions, no exclusions
- **Full API contract parity**: Every Scaleway API endpoint exposed by this server MUST have a contract test validating request shape, response shape, pagination, auth, and error codes
- **Contract traceability**: Every contract test MUST reference its Scaleway API endpoint and the corresponding entry in `specs/scaleway-api/`
- **No tool without tests**: MCP tools cannot merge without 100% contract test coverage

## Declared Namespaces (Decision 2, approved 2026-09-15)

Declared constants may use the product's short wire name: a constant head such
as `datalab` or `mnq` is a declaration, not a published namespace, and is not a
defect while the assembled request route matches a published route. The
parity-matrix `api` field records the published form. Every legitimate alias is
a row in the checked table below (alias-table markers bound to
`.forge/reports/governance/declared-namespace-aliases.json`, which stays the
single source of truth — it lives under the ignored `.forge/` evidence tree, so
the table is inlined at this section; regenerate it from the JSON if the two
drift). (the 11 mismatched heads are listed today:
`datalab`, `datawarehouse`, `domain` (dns and domain-registrar), `flexible-ip`,
`file`, `functions`, `kafka`, `mnq` (nats and sqs), `searchdb`, `product-catalog`,
`messageq`, plus the `rdb`/`mongodb` short heads). The scan reads the table: an
alias that resolves is recorded as the approved class; a head that differs with
no alias row is a plain mismatch listed (one exists today: `serverless-sqldb`,
held behind its Tier-C document); and a route outside the published set entirely
— the webhosting class, the subject of `bun run probe:webhosting` — is no alias's
to explain and stays visible as itself.


<!-- alias-table:start (regenerated from the JSON source of truth) -->
| area | declared head | published | kind |
|---|---|---|---|
| `apple-silicon` | apple-silicon | `apple-silicon/v1alpha1` | resolves-to-published |
| `audit-trail` | audit-trail | `audit-trail/v1alpha1` | resolves-to-published |
| `autoscaling` | autoscaling / instance | `autoscaling/v1alpha2 or autoscaling/v2alpha1` | short-name-of-published; note: v2alpha1 is itself a published head (the published doc serves v1alpha2 and v2alpha1) |
| `billing` | billing | `billing/v2beta1` | resolves-to-published |
| `block-storage` | block | `block-storage/v1` | short-name-of-published |
| `data-lab` | datalab | `data-lab/v1beta1` | short-name-of-published |
| `data-warehouse` | datawarehouse | `data-warehouse/v1beta1` | short-name-of-published |
| `dns` | domain | `domains-and-dns/v2beta1` | short-name-of-published |
| `domain-registrar` | domain | `domains-and-dns/registrar/v2beta1` | short-name-of-published |
| `elastic-metal` | flexiple-ip | `elastic-metal/v1` | short-name-of-published |
| `environmental-footprint` | environmental-footprint | `environmental-footprint/v1alpha1` | resolves-to-published |
| `file-storage` | file | `file-storage/v1alpha1` | short-name-of-published |
| `functions` | functions | `serverless-functions/v1beta1` | short-name-of-published |
| `iam` | iam | `iam/v1alpha1` | resolves-to-published |
| `interlink` | interlink | `interlink/v1beta1` | resolves-to-published |
| `kafka` | kafka | `clusters-for-kafka/v1alpha1` | short-name-of-published |
| `mailbox` | mailbox | `mailbox/v1alpha1` | resolves-to-published |
| `mongodb` | mongodb | `managed-database-mongodb/v1` | short-name-of-published |
| `nats` | mnq | `messaging-and-queuing/nats/v1beta1` | shared-prefix-of-two; mnq fronts both nats and sqs published heads — resolves only once the target product is known |
| `opensearch` | searchdb | `cloud-essentials-for-opensearch/v1alpha1` | short-name-of-published |
| `product-catalog` | product-catalog | `product-catalog/public-catalog/v2alpha1` | short-name-of-published |
| `rabbitmq` | messageq | `message-queue-for-rabbitmq/v1alpha1` | short-name-of-published |
| `rdb` | rdb | `managed-database-postgre-mysql/v1` | short-name-of-published |
| `sqs` | mnq | `messaging-and-queuing/sqs/v1beta1` | shared-prefix-of-two; see nats |
| `tem` | transactional-email | `transactional-email/v1alpha1` | resolves-to-published |
| `vpn` | s2s-vpn | `site-to-site-vpn/v1alpha1` | short-name-of-published |
<!-- alias-table:end -->

## Envelope Boundary (Decision 1, approved 2026-09-15)

Upstream Scaleway JSON is snake_case and is passed through by this server without
renaming: any `total_count` (or other `*count*`) field in a response body is the
upstream field, verbatim. The MCP list envelope is this server's own camelCase
boundary and is defined once in `src/shared/pagination.ts` (`buildPaginatedResponse`):
`{ items, totalCount, page, pageSize }`. In the reference specs, `total_count` names
the upstream wire field and `totalCount` names the MCP envelope field. `total_pages`
is an upstream field nowhere; it belongs to the MCP envelope only where this server
computes it. Each mixed-spelling doc under `specs/scaleway-api/` carries this
statement inline; the canonical wording lives here.

## Architecture

Stateless MCP server exposing four gateway tools over 724 supported operations across 50 Scaleway product areas. SCW_MCP_MODE=flat exposes the supported legacy tool names; both mode combines them.

- `src/main.ts` - Entry point (stdio transport); `src/server.ts` - creates the MCP server, immutable filtered operation registry and gateway/flat/both surface.
- `src/tools/<area>/` - one directory per product area, each with three files:
  - `types.ts` - Zod input schemas for the area's tools
  - `handlers.ts` - Scaleway API call logic + response formatting
  - `index.ts` - `register<Area>Tools(server)` registering each tool via `server.tool(name, description, schema.shape, handler)`
- `src/tools/index.ts` - `registerAllTools(server)` invokes every area's register function.
- `src/gateway/` - recorder-based operation registry, search/describe/read/call, generated runtime operations metadata. Run `bun run gen:operations` after changing the parity matrix.
- `src/shared/mode.ts` and `toolsets.ts` - startup environment boundary and filters. `SCW_TOOLSETS`, `SCW_TOOLS`, `SCW_EXCLUDE_TOOLS`, `SCW_READ_ONLY` apply to discovery and execution.
- `src/shared/` - cross-cutting helpers: `auth.ts` (env-var credential loading), `client.ts` (Scaleway SDK client singleton), `errors.ts` (HTTP error mapping), `pagination.ts` (pagination helpers), `s3-signer.ts` (AWS SigV4 signing for Object Storage/S3 requests), `types.ts` (shared Zod schemas).
- `tests/` - `unit/` and `contract/` run in CI; `api/` are local-only integration tests. `tests/parity-matrix.json` maps every Scaleway API operation to its tool + contract test; `tests/unit/parity.test.ts` (run via `bun run test:parity`) gates that every matrix entry is covered.
- `specs/scaleway-api/<area>/api-reference.md` - authoritative Scaleway API Reference Spec (request/response shapes, error codes, pagination patterns) per product area.
- `specs/NNN-*/` - spec-kit feature directories (spec.md, plan.md, tasks.md) per feature.

## Active Technologies
- TypeScript 5.x (strict mode) with Bun 1.x + @modelcontextprotocol/sdk ^1.25.x, @scaleway/sdk, zod ^3.25.x
- Vitest for testing (@vitest/coverage-v8 for 100% coverage enforcement), Biome for linting/formatting
- N/A (stateless proxy to Scaleway APIs)
- TypeScript 5.x (strict mode) with Bun 1.x runtime + `@modelcontextprotocol/sdk` ^1.25.x, `@scaleway/sdk-client` + per-product `@scaleway/sdk-{product}` packages, `zod` ^3.25.x (001-scaleway-api-specs)
- GitHub-flavored Markdown (documentation feature, no runtime code) + N/A (documentation only) (038-comprehensive-readme)
- TypeScript 5.x (strict mode) with Bun 1.x runtime + GitHub Actions (`oven-sh/setup-bun@v2`, `actions/checkout@v4`, `actions/upload-artifact@v4`), Biome (lint), Vitest + @vitest/coverage-v8 (test/coverage) (039-ci-build-pipeline)
- N/A (CI configuration only — YAML files + minor script changes) (039-ci-build-pipeline)
- TypeScript 5.x (strict mode) with Bun 1.x runtime + @modelcontextprotocol/sdk ^1.25.x, @scaleway/sdk-client + per-product packages, zod ^3.25.x (040-release-pipeline)
- N/A (stateless proxy — no state involved in release pipeline) (040-release-pipeline)
- TypeScript 5.x (strict mode) with Bun 1.x + `@modelcontextprotocol/sdk` ^1.25.x, `@scaleway/sdk-client` ^1.0.0, `zod` ^3.25.x (041-quota-query-tool)
- N/A (stateless proxy) (041-quota-query-tool)
- TypeScript 5.x (strict mode) with Bun 1.x + `@modelcontextprotocol/sdk` ^1.25.x, `zod` ^3.25.x, `zod-to-json-schema` 3.25.1 (059-discovery-token-reduction)
- TypeScript 5.x strict mode, Bun 1.3.x runtime (CI pins 1.3.6); published bin runs on Node ≥ 20.20.2 + `@modelcontextprotocol/sdk` ^1.25 (installed 1.27.1), `zod` ^3.25, `zod-to-json-schema` 3.25.1 (promoted to a direct dependency by this feature), `@scaleway/sdk-client` ^2.7 (059-discovery-token-reduction)
- N/A (stateless proxy; one generated JSON metadata file bundled at build time) (059-discovery-token-reduction)
- TypeScript 5.x strict, Bun 1.3.x; Node ≥ 20.20.2 for the published bin + `@scaleway/sdk-client` ^2.7 (bumped from ^1.0 to satisfy installed product-SDK peers), `@scaleway/sdk-{account,edge-services,key-manager,mnq,secret}` 2.x, `@modelcontextprotocol/sdk` ^1.25, `zod` ^3.25 (060-api-correctness)

## Recent Changes
- Constitution v1.2.0 permits explicitly contract-tested gateway meta-tools while retaining underlying endpoint parity and full coverage.
- Constitution v1.1.0: Added Principle VIII (100% Test Coverage & API Parity), expanded Contract-First API Design with Scaleway API Reference Spec requirement
