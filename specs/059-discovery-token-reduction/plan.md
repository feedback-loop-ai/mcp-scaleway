# Implementation Plan: Compact Operation Discovery

**Feature**: `059-discovery-token-reduction` | **Retrofit branch**: `docs/spec-retrofit-final` | **Date**: 2026-09-05 (retrofitted 2026-09-06) | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/059-discovery-token-reduction/spec.md`

**Note**: This plan was retrofitted after the feature shipped in 0.4.0. It describes the design as built and evaluates it against Constitution v1.2.0 honestly, including gaps.

## Summary

Replace the eager catalog (733 tools at audit time, measured at 219,400 input tokens per request; 724 tools after feature 060 removals), with four fixed tools (search, describe, read, call) over an in-process registry of every supported operation. The registry is built by replaying the existing per-area registration functions into a recorder, so original Zod validation and handlers stay authoritative. Operator filters (areas, presets, explicit inclusions, exclusions, read-only) are applied to one immutable registry that serves listing, discovery and execution alike. A route guard confines every dispatched request to its declared upstream endpoint. Legacy names remain available via a flat compatibility mode.

## Technical Context

**Language/Version**: TypeScript 5.x strict mode, Bun 1.3.x runtime (CI pins 1.3.6); published bin runs on Node ≥ 20.20.2
**Primary Dependencies**: `@modelcontextprotocol/sdk` ^1.25 (installed 1.27.1), `zod` ^3.25, `zod-to-json-schema` 3.25.1 (promoted to a direct dependency by this feature), `@scaleway/sdk-client` ^2.7
**Storage**: N/A (stateless proxy; one generated JSON metadata file bundled at build time)
**Testing**: Vitest 3 with v8 coverage, 100% line and branch thresholds enforced; protocol-level tests over `InMemoryTransport`
**Target Platform**: stdio MCP server launched by an MCP client (Claude Code, other MCP hosts); Linux/macOS
**Project Type**: single project, library + CLI bin
**Performance Goals**: tool listing ≥ 99% smaller than the full catalog and constant in size; discovery calls served from memory with zero upstream requests; registry build in single-digit milliseconds at startup
**Constraints**: no SDK private-field access; reuse existing handlers with documented routing/security changes; filters immutable per process; 100% coverage with no exclusions; unit-only suite target under 5 s; combined coverage measured separately
**Scale/Scope**: 724 operations across 50 product areas; 4 gateway tools; 3 surface modes; 11 named presets

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence / gap |
|---|---|---|
| I. AI-Native Development | OPEN: examples debt | Gateway descriptions and the 38 changed descriptions have examples. Other legacy descriptions still lack them. See ../retrofit-compliance.md#r-i; this is not an approved exception. |
| II. Spec-Driven Development | HISTORICAL BREACH | The full specifications were written after implementation. Retrofitting records the design but cannot establish past spec-first compliance. No exception grant was requested or given. See ../retrofit-compliance.md#r-ii. |
| III. Contract-First API Design | CURRENT CONTRACTS; historical ordering gap | Contracts and parity mappings are present. Gateway-authored domain errors now use the shared error object; SDK-native outer validation errors remain protocol errors. Contract/code/amendment commit ordering does not prove the required pre-implementation sequence. See ../retrofit-compliance.md#r-iii. |
| IV. Operational Excellence | OPEN: operational controls | Structured per-operation logging and an explicit operational health signal are not implemented, including on gateway dispatch. No exemption is granted. See ../retrofit-compliance.md#r-iv. |
| V. Simplicity & YAGNI | PASS with justified complexity | Registry and route guard are additions; each cites a measured requirement (219,400-token baseline; reviewer-proven traversal bypass). Rejected simpler alternatives recorded in research.md. |
| VI. Fast Feedback Loops | OPEN: hot reload; unit timing PASS | The unit-only suite must be measured separately against the under-five-second clause; combined coverage timing is not that measurement. A dedicated hot-reload development command remains absent. See ../retrofit-compliance.md#r-vi. |
| VII. Type Safety & Validation | OPEN: response validation | Strict TypeScript and input/config validation are enforced. Generic SDK return types and JSON parsing do not provide runtime validation of every upstream response. These inherited gaps remain relevant to gateway pass-through. See ../retrofit-compliance.md#r-vii. |
| VIII. 100% Coverage & API Parity | OPEN: endpoint contract depth; coverage PASS | src/main.ts is covered and no executable source exclusion remains. Parity and generated-metadata gates pass. Every operation has a mapped test, but existence of a file and a minimum-input transport smoke do not prove every endpoint response, pagination, authorization and error contract. See ../retrofit-compliance.md#r-viii. |

**Gate result**: BLOCKED for an unconditional constitution-compliance claim. The retrospective documents can be reviewed and committed with these findings visible. Zero unresolved specification choices is not zero implementation noncompliance. No owner waiver is inferred from authorization to work autonomously.

## Project Structure

### Documentation (this feature)

```text
specs/059-discovery-token-reduction/
├── analysis.md          # final findings and evidence
├── analysis-history.md  # initial independent analysis
├── traceability.md      # requirements to tasks
├── workflow-record.md   # retrospective execution record
├── spec.md              # retrofitted full specification with Clarifications
├── plan.md              # this file
├── research.md          # decisions, rationale, rejected alternatives
├── data-model.md        # entities, invariants, state
├── quickstart.md        # operator and assistant walkthrough
├── validation.md        # measured results and verification boundaries
├── contracts/
│   └── gateway-tools.md # normative contract for the four tools, filters, projection, confinement
├── checklists/
│   └── requirements.md  # spec quality checklist
└── tasks.md             # delivery checkpoints (retrofitted)
```

### Source Code (repository root)

```text
src/
├── server.ts                 # createServer({mode, filters}); builds registry, registers surfaces, installs listing
├── main.ts                   # stdio entry; reads env once via resolveServerOptions
├── gateway/
│   ├── index.ts              # registerGatewayTools, executeOperation, validation-error shaping
│   ├── discovery.ts          # search/describe input bounds, ranking, pagination, lookup errors
│   ├── registry.ts           # recorder over registerAllTools, immutable filtered registry, registerFlatTools
│   ├── metadata.ts           # deriveOperationMetadata, isReadOnly, READ_ONLY_OVERRIDES
│   └── operations.json       # generated runtime metadata (tool, area, api, readOnly)
├── shared/
│   ├── catalog.ts            # schema projection + installCatalogListing (public SDK handler)
│   ├── toolsets.ts           # presets, ToolsetConfig, resolveToolFilters, createToolFilter
│   ├── mode.ts               # ModeSchema, resolveServerOptions (env boundary)
│   ├── route-guard.ts        # endpoint confinement on raw paths (AsyncLocalStorage context)
│   └── client.ts             # SDK client singleton; wraps fetch with assertScwPathAllowed
└── tools/<area>/             # reused area implementation with documented routing/schema changes

scripts/
├── gen-operations.ts         # regenerates src/gateway/operations.json from tests/parity-matrix.json
└── measure-discovery.ts      # reproducible listing-size measurement for all three modes

tests/
├── unit/gateway/             # discovery, execution, registry, metadata, search-quality, fixtures
├── unit/shared/              # catalog, toolsets, mode, route-guard
├── unit/server.test.ts       # modes, instructions, env independence
├── unit/parity.test.ts       # operation parity + gateway traceability gates
├── contract/gateway.test.ts  # protocol-level contracts for the four tools (referenced by parity meta)
├── contract/route-confinement.test.ts
└── contract/iam-path-confinement.test.ts
```

**Structure Decision**: reuse the existing area registrars and callbacks. Gateway/shared modules add discovery and routing confinement; IAM/secret input schemas and the three raw-fetch handlers also changed for security. Flat mode preserves supported names, not byte-identical historical schemas.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| In-process operation registry (new abstraction over per-area registrars) | Measured 219,400-token discovery cost; per-tool API overhead (~42 tokens/tool) means only registering fewer tools removes it | Schema slimming alone reached only −28.5% in the audit; area-level filtering cannot reach a large cut because cost is flat across areas |
| Route guard at the transport boundary | Independent review reproduced read-only and exclusion bypasses via path traversal in identifier fields across 11 areas | Per-field regex patches are unbounded (284 raw interpolation sites) and were shown insufficient; confinement at one choke point covers all areas uniformly |
| Replacing the SDK's tools/list handler with a projected listing | Needed to strip SDK-injected boilerplate and serve one immutable definition set in flat/both modes | Reading SDK private `_registeredTools` was rejected; the public `setRequestHandler` path is used instead |
| Full specification/contract ordering was not completed before implementation | Historical process breach; autonomous execution did not authorize skipping required gates | Record the actual sequence and require spec/clarify/plan/tasks/analyze before future implementation. This is not a retroactive waiver. |

## Remaining compliance work

- Principle IV: add structured logging and a liveness signal appropriate to a stdio server (e.g. a `--health` self-check flag). Repo-wide, pre-existing.
- Principle VII: runtime-validate upstream response shapes in handlers, starting with the most-used read operations. Repo-wide, pre-existing.
- Principle I: add usage examples to legacy operation descriptions, or surface examples through `describe`. Repo-wide, pre-existing.
- Measure post-change token counts on an Anthropic-served route when one is available; validation.md records bytes only.

Final reference run (2026-09-06): unit-only 3,245 tests in 2.98 s; full coverage 6,106 tests in 5.44 s. Coverage includes every executable src/**/*.ts file. This satisfies the measured unit-time and coverage clauses, not the OPEN hot-reload or endpoint-contract-depth clauses.
