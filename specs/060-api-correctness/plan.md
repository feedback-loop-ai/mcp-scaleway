# Implementation Plan: Scaleway API Correctness Repairs

**Branch**: `060-api-correctness` | **Date**: 2026-09-05 (retrofitted 2026-09-06) | **Spec**: [spec.md](spec.md)
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
**Performance Goals**: no behavioural latency change; suite stays under 5 s
**Constraints**: preserve tool names and input contracts wherever a faithful mapping exists; no invented endpoints; no live network in tests; keep 100% coverage
**Scale/Scope**: 33 areas touched; 733 → 724 operations (−5 DHCP, −3 container legacy, −1 net autoscaling); 2 API-version migrations; 1 API relocation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence / gap |
|---|---|---|
| I. AI-Native Development | PASS | Structured, actionable errors now carry real upstream statuses; unsupported combinations return explicit errors instead of silent reinterpretation. Pre-existing gap: legacy descriptions lack usage examples (tracked in 059 follow-ups). |
| II. Spec-Driven Development | PASS (retrofitted) | Full spec/plan/tasks/research/data-model/quickstart now exist; implementation preceded them under the owner's explicit directive (Complexity Tracking). |
| III. Contract-First API Design | PASS | Per-area API references updated before or with each migration (autoscaling, containers, elastic-metal, public-gateway, cockpit, product-catalog, iam, secret-manager); every operation maps to a documented endpoint; breaking changes versioned in 0.4.0 with CHANGELOG. |
| IV. Operational Excellence | PARTIAL (pre-existing) | Error mapping fixed repo-wide; graceful failures preserved. Structured logging and a health signal remain absent repo-wide; not introduced here. Tracked in 059 follow-ups. |
| V. Simplicity & YAGNI | PASS | Repairs are in-place corrections; removed operations deleted rather than stubbed (dead code is negative value); no new abstractions. |
| VI. Fast Feedback Loops | PASS | Suite 4.46 s measured after all changes. |
| VII. Type Safety & Validation | PASS for this feature; PARTIAL repo-wide | Inputs Zod-validated; new schema constraints for IAM identifiers, secret revisions and autoscaling inputs; startup fails fast on misconfiguration. Upstream responses still not runtime-validated in most areas (pre-existing, tracked). |
| VIII. 100% Coverage & API Parity | PASS | 100% lines/branches; parity matrix updated for every removal and migration; new contract tests referenced from the matrix; real-transport tests added for the whole catalog (`tests/contract/transport/path-auth.contract.test.ts`) and per migrated area. |

**Gate result**: proceed. PARTIAL rows are repo-wide and predate this feature; they are tracked, not diluted.

## Project Structure

### Documentation (this feature)

```text
specs/060-api-correctness/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/requirements.md
└── tasks.md
```

Per-area authoritative references updated under `specs/scaleway-api/<area>/api-reference.md` for autoscaling, containers, elastic-metal, public-gateway, cockpit, product-catalog, iam and secret-manager.

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
├── contract/transport/path-auth.contract.test.ts          # real SDK, whole-catalog GET paths + auth + error statuses
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
| Implementation preceded the full spec (Principle II) | Owner directive to fix correctness before token work, shipped under time pressure; adversarial review workflows served as the interim gate | Retrofit performed 2026-09-06 with clarify and analyze passes |

## Follow-ups (not blocking)

- Adopt official `@scaleway/sdk-<product>` packages for the 45 hand-rolled areas; this would also retire the leading-slash class of bug structurally.
- Runtime-validate upstream response shapes (Principle VII, repo-wide).
- Live smoke test against a sandbox project with real credentials, run manually and outside CI.
