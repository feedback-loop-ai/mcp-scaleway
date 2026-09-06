# Implementation Plan: Scaleway API Correctness Repairs

**Feature**: `060-api-correctness` | **Retrofit branch**: `docs/spec-retrofit-final` | **Date**: 2026-09-05 (retrofitted 2026-09-06) | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/060-api-correctness/spec.md`

**Note**: Retrofitted after shipping in 0.4.0 (commit `ce01175`, PR #54). Describes the design as built and evaluates it against Constitution v1.2.0.

## Summary

Repair request construction across 33 product areas so operations reach Scaleway as documented: correct leading-slash paths, use the SDK's request/response contract instead of browser-style objects, send JSON content types and shared-transport authentication, preserve upstream error statuses, and pass page sizes in the generated clients' expected parameter. Migrate autoscaling (v1alpha1, dead) to v1alpha2, containers (v1beta1, deprecated) to v1, and flexible IPs to their own API; remove retired DHCP and container deploy/token operations with migration notes; mark deprecated cockpit operations; make apple-silicon credentials lazy; report the real package version. Prove each repair with tests that drive the real SDK transport through injected HTTP.

## Technical Context

**Language/Version**: TypeScript 5.x strict, Bun 1.3.x; Node ≥ 20.20.2 for the published bin
**Primary Dependencies**: `@scaleway/sdk-client` ^2.7 (bumped from ^1.0 to satisfy installed product-SDK peers), `@scaleway/sdk-{account,edge-services,key-manager,mnq,secret}` 2.x, `@modelcontextprotocol/sdk` ^1.25, `zod` ^3.25
**Storage**: N/A
**Testing**: Vitest 3 + v8 coverage at 100% line/branch; new real-transport contract tests via `createAdvancedClient(withProfile, withHTTPClient(fake))` with a fail-closed global fetch
**Target Platform**: stdio MCP server; requests to `api.scaleway.com`, `s3.<region>.scw.cloud`, `api.scaleway.ai`
**Project Type**: single project
**Performance Goals**: preserve request semantics; unit-only suite under 5 s on the reference machine; combined coverage suite measured separately
**Constraints**: preserve tool names and input contracts wherever a faithful mapping exists; no invented endpoints; no live network in tests; keep 100% coverage
**Scale/Scope**: 33 areas touched; 733 → 724 operations (−5 DHCP, −3 container legacy, −1 net autoscaling); 2 API-version migrations; 1 API relocation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence / gap |
|---|---|---|
| I. AI-Native Development | OPEN: examples debt | Gateway descriptions and the 38 changed descriptions have examples. Other legacy descriptions still lack them. See ../retrofit-compliance.md#r-i; this is not an approved exception. |
| II. Spec-Driven Development | HISTORICAL BREACH | The full specifications were written after implementation. Retrofitting records the design but cannot establish past spec-first compliance. No exception grant was requested or given. See ../retrofit-compliance.md#r-ii. |
| III. Contract-First API Design | CURRENT CONTRACTS; historical ordering gap | Contracts and parity mappings are present. Gateway-authored domain errors now use the shared error object; SDK-native outer validation errors remain protocol errors. Contract/code/amendment commit ordering does not prove the required pre-implementation sequence. See ../retrofit-compliance.md#r-iii. |
| IV. Operational Excellence | OPEN: operational controls | Structured per-operation logging and an explicit operational health signal are not implemented, including on gateway dispatch. No exemption is granted. See ../retrofit-compliance.md#r-iv. |
| V. Simplicity & YAGNI | PASS | Repairs are in-place corrections; removed operations deleted rather than stubbed (dead code is negative value); no new abstractions. |
| VI. Fast Feedback Loops | OPEN: hot reload; unit timing PASS | The unit-only suite must be measured separately against the under-five-second clause; combined coverage timing is not that measurement. A dedicated hot-reload development command remains absent. See ../retrofit-compliance.md#r-vi. |
| VII. Type Safety & Validation | OPEN: response validation | Strict TypeScript and input/config validation are enforced. Generic SDK return types and JSON parsing do not provide runtime validation of every upstream response. These inherited gaps remain relevant to gateway pass-through. See ../retrofit-compliance.md#r-vii. |
| VIII. 100% Coverage & API Parity | OPEN: endpoint contract depth; coverage PASS | src/main.ts is covered and no executable source exclusion remains. Parity and generated-metadata gates pass. Every operation has a mapped test, but existence of a file and a minimum-input transport smoke do not prove every endpoint response, pagination, authorization and error contract. See ../retrofit-compliance.md#r-viii. |

**Gate result**: BLOCKED for an unconditional constitution-compliance claim. The retrospective documents can be reviewed and committed with these findings visible. Zero unresolved specification choices is not zero implementation noncompliance. No owner waiver is inferred from authorization to work autonomously.

## Project Structure

### Documentation (this feature)

```text
specs/060-api-correctness/
├── analysis.md          # final findings and evidence
├── analysis-history.md  # initial independent analysis
├── traceability.md      # requirements to tasks
├── workflow-record.md   # retrospective execution record
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── autoscaling-tools.md
│   ├── containers-tools.md
│   └── elastic-metal-tools.md
├── checklists/requirements.md
└── tasks.md
```

Per-area authoritative references updated under `specs/scaleway-api/<area>/api-reference.md` for autoscaling, containers, elastic-metal, public-gateway and cockpit. Tool contracts for migrated surfaces: `contracts/`. Offline supported-version inventory: `specs/scaleway-api/supported-versions.json`.

### Source Code (repository root)

```text
src/
├── shared/
│   ├── errors.ts                 # maps both .statusCode and SDK .status
│   └── client.ts                 # SDK singleton (unchanged contract; guard added by 059)
├── server.ts                     # version from package.json
├── tools/apple-silicon/index.ts  # lazy credential loading
├── tools/{audit-trail,data-lab,data-warehouse,dedibox,file-storage,interlink,kafka,mailbox,nats,opensearch,rabbitmq,tem,vpn,product-catalog}/handlers.ts   # leading-slash prefixes
├── tools/{rdb,elastic-metal,containers,sqs}/handlers.ts   # transport rewrites to ScwRequest
├── tools/{key-manager,secret-manager,edge-services,sns}/handlers.ts   # pageSize to generated clients
├── tools/{dns,functions,iam,instances,k8s,serverless-sqldb,tem,webhosting}/handlers.ts   # JSON content type
├── tools/interlink/handlers.ts   # 204 acknowledgement for routing-policy delete
├── tools/autoscaling/{types,handlers,index}.ts   # v1alpha2 + instance v2alpha1 templates
├── tools/containers/{types,handlers,index}.ts    # v1 migration; legacy deploy/token removed
├── tools/elastic-metal/handlers.ts               # flexible-ip v1alpha1
├── tools/public-gateway/{types,handlers,index}.ts # DHCP removed
└── tools/cockpit/index.ts                        # deprecation notices

tests/
├── contract/transport/path-auth.contract.test.ts          # real SDK, representative GET paths + auth + error statuses
├── contract/transport/catalog-smoke.contract.test.ts      # real SDK, every operation: host, path, auth (per area)
├── contract/transport/migrated-areas.transport.test.ts    # autoscaling v1alpha2, generated-client page_size, SigV4/bearer
├── unit/main.test.ts                                      # entry point (coverage exclusion removed)
├── unit/docs-parity.test.ts                               # matrix ⇔ metadata ⇔ README ⇔ counts
├── unit/supported-versions.test.ts                             # every endpoint on a documented supported product/version pair
├── unit/tools/description-examples.test.ts                # Constitution I usage examples for areas authored here
├── contract/tools/elastic-metal/flexible-ip.transport.test.ts
├── contract/containers/containers.contract.test.ts        # real-transport v1 contracts
├── contract/autoscaling/autoscaling.contract.test.ts
├── unit/parity.test.ts
└── unit/tools/**                                          # updated per area
```

**Structure Decision**: single project; changes confined to per-area handler/type/index files plus two shared files. No new modules.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Breaking removal of 8 operations (DHCP ×5, container deploy/tokens ×3) | Upstream endpoints removed; stubs would violate "no invented abstractions" and the 1:1 parity invariant | Keeping stubs that return "unsupported" was prototyped and rejected: it fails the parity gate honestly (api: null) and still misleads discovery |
| sdk-client major bump (1.x → 2.x) and Node floor 18 → 20.20.2 | Installed product SDKs declared a 2.x peer and Node ≥ 20.19; the 1.x client was silently unsupported | Pinning product SDKs back to 1.x-compatible versions would have lost the upstream fixes the migrations depend on |
| Full specification/contract ordering was not completed before implementation | Historical process breach; autonomous execution did not authorize skipping required gates | Record the actual sequence and require spec/clarify/plan/tasks/analyze before future implementation. This is not a retroactive waiver. |

## Remaining compliance work

- Adopt official `@scaleway/sdk-<product>` packages for the 45 hand-rolled areas (out of scope per spec; separate feature).
- Runtime-validate upstream response shapes (Principle VII, repo-wide; 059 T057).
- Re-verify `specs/scaleway-api/supported-versions.json` against upstream on a schedule; a manual live smoke against a sandbox project is the verification step (060 T056).

Final reference run (2026-09-06): unit-only 3,245 tests in 2.98 s; full coverage 6,106 tests in 5.44 s. Coverage includes every executable src/**/*.ts file. This satisfies the measured unit-time and coverage clauses, not the OPEN hot-reload or endpoint-contract-depth clauses.
