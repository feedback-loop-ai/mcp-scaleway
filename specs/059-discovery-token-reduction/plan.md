# Implementation Plan: Compact Operation Discovery

**Branch**: `059-discovery-token-reduction` | **Date**: 2026-09-05 (retrofitted 2026-09-06) | **Spec**: [spec.md](spec.md)
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
**Constraints**: no SDK private-field access; no change to per-area handler files; filters immutable per process; 100% coverage with no exclusions; test suite under 5 s
**Scale/Scope**: 724 operations across 50 product areas; 4 gateway tools; 3 surface modes; 11 named presets

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence / gap |
|---|---|---|
| I. AI-Native Development | PARTIAL (exception documented) | The four gateway tools carry usage examples and structured errors. 679 of 724 legacy descriptions served through describe lack usage examples (Constitution I MUST). Exception granted by the repo owner via the 2026-09-06 autonomous-retrofit directive; remediation tracked in issue for T058 with an incremental target: each area gains examples when next touched, enforced by tests/unit/tools/description-examples.test.ts as it grows. |
| II. Spec-Driven Development | EXCEPTION (documented, owner directive 2026-09-05) | Implementation preceded the full spec; the owner directed shipping under time pressure and later directed the autonomous retrofit (2026-09-06). All artifacts now exist and were clarified and analyzed. The chronological violation cannot be cured; it is recorded per Governance §Compliance. |
| III. Contract-First API Design | PASS with ordering caveat | Gateway meta-tools specified in `contracts/gateway-tools.md`; 1:1 identifiers; filters apply to discovery and execution; original validation enforced (v1.2.0 clauses). Caveat: contract, code and the v1.2.0 amendment landed in one commit (f46a252); the contract draft predates the code in the timestamped audit artifacts (project memory dir `audit-2026-09-05-discovery-tokens/`). Process rule adopted: future constitution amendments land in their own PR before dependent code. |
| IV. Operational Excellence | PARTIAL (exception documented) | Error mapping and graceful degradation hold; no sensitive data in errors (validated by tests). Structured JSON logging and a health signal are absent repo-wide AND on the new gateway dispatch path. Exception granted by the owner via the 2026-09-06 directive; tracked in issue for T056 with target 0.5.0. A stdio server has no HTTP surface; the follow-up defines a suitable liveness signal. |
| V. Simplicity & YAGNI | PASS with justified complexity | Registry and route guard are additions; each cites a measured requirement (219,400-token baseline; reviewer-proven traversal bypass). Rejected simpler alternatives recorded in research.md. |
| VI. Fast Feedback Loops | PASS | Bun start; full suite 4.46 s measured (under the 5 s clause, with ~0.5 s headroom); single toolchain. |
| VII. Type Safety & Validation | PASS for this feature; PARTIAL repo-wide (exception documented) | No `any` in gateway or shared code (verified); all tool inputs Zod-validated; configuration validated at startup and fails closed. Repo-wide gap: upstream responses typed via generics but not runtime-validated in 49 of 50 areas; FR-009 returns handler results unchanged so read/call inherit this. Exception granted by the owner via the 2026-09-06 directive; tracked in issue for T057 with first milestone = the 20 SC-004 operations. |
| VIII. 100% Coverage & API Parity | PASS | 100% lines and branches with NO exclusions (the pre-existing `src/main.ts` coverage exclusion was removed and main.ts is now covered by tests/unit/main.test.ts); parity matrix `meta` section maps each gateway tool to `tests/contract/gateway.test.ts`; CI asserts the default surface equals that record and generated metadata equals a fresh derivation. |

**Gate result**: proceed. One documented chronological EXCEPTION (II), one PASS-with-caveat (III), and three PARTIAL/EXCEPTION rows (I, IV, VII) each carry an owner-granted exception record (owner directive 2026-09-06), a tracked issue and a target. None is closed silently.

## Project Structure

### Documentation (this feature)

```text
specs/059-discovery-token-reduction/
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
└── tools/<area>/             # unchanged per-area types/handlers/index (50 areas)

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

**Structure Decision**: single project. New code is confined to `src/gateway/` and four files in `src/shared/`; the 50 per-area directories are untouched, which is what keeps handler behavior identical between flat and gateway modes.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| In-process operation registry (new abstraction over per-area registrars) | Measured 219,400-token discovery cost; per-tool API overhead (~42 tokens/tool) means only registering fewer tools removes it | Schema slimming alone reached only −28.5% in the audit; area-level filtering cannot reach a large cut because cost is flat across areas |
| Route guard at the transport boundary | Independent review reproduced read-only and exclusion bypasses via path traversal in identifier fields across 11 areas | Per-field regex patches are unbounded (284 raw interpolation sites) and were shown insufficient; confinement at one choke point covers all areas uniformly |
| Replacing the SDK's tools/list handler with a projected listing | Needed to strip SDK-injected boilerplate and serve one immutable definition set in flat/both modes | Reading SDK private `_registeredTools` was rejected; the public `setRequestHandler` path is used instead |
| Implementation preceded the full spec (Principle II) | Owner requested shipping under an explicit "no matter the effort" directive; adversarial review workflows served as the interim gate | Retrofit performed 2026-09-06: full spec, clarifications, plan, research, data model, quickstart, tasks, and analyze pass |

## Follow-ups (not blocking this feature)

- Principle IV: add structured logging and a liveness signal appropriate to a stdio server (e.g. a `--health` self-check flag). Repo-wide, pre-existing.
- Principle VII: runtime-validate upstream response shapes in handlers, starting with the most-used read operations. Repo-wide, pre-existing.
- Principle I: add usage examples to legacy operation descriptions, or surface examples through `describe`. Repo-wide, pre-existing.
- Measure post-change token counts on an Anthropic-served route when one is available; validation.md records bytes only.
