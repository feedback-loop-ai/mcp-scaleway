# Delivery checkpoints

The original eight checkpoints below summarize the implementation delivered by PR
#82. The task IDs and evidence links added afterward are a retrospective decomposition
dated 2026-09-20, not a claim that this atomic task list existed before implementation.

- [x] Record scope and boundary contracts before implementation.
- [x] Reconcile eight route findings and explicitly retain provider-verification blockers.
- [x] Validate every supported upstream response; reject unverified operations before HTTP.
- [x] Establish per-operation evidence across all five contract dimensions.
- [x] Provide valid examples for every operation.
- [x] Add safe dispatch logging and local health self-check.
- [x] Publish structured MCP output and matching output schemas.
- [x] Run local checks and independent review; record evidence in closeout.md.

## Implementation task evidence

R1–R7 identify the seven numbered requirements in [spec.md](spec.md). Every completed
task below shares [delivery receipt D82](closure-map.md#delivery-receipt): signed source
commit `c24a652`, PR #82 merged as `7b1fad2`, successful PR/main CI and
[recorded local checks](closeout.md#delivery-checks).

- [x] **T064-01 — R1:** attest disputed secondary-schema/SDK routes. [Endpoint decisions](endpoints.md), [source catalog](../../src/shared/response-contracts.json), [wire suite](../../tests/contract/transport/catalog-evidence.contract.test.ts). Covers Autoscaling, Elastic Metal, Apple Silicon, Billing and Secret Manager.

- [x] **T064-02 — R1/R2:** reject six unverified IDs before HTTP. [Manifest](../../src/shared/unavailable-operations.json), [support contract](contracts/unverified-operations.md), [availability tests](../../tests/unit/shared/availability.test.ts), [wire rejection cases](../../tests/contract/transport/catalog-evidence.contract.test.ts).

- [x] **T064-03 — R1:** correct Generative project/global routing. [Handlers](../../src/tools/generative-apis/handlers.ts), [route contracts](../../tests/contract/tools/generative-apis/generative-apis.contract.test.ts), [tool-call contracts](../../tests/contract/tools/generative-apis/tool-calling.contract.test.ts).

- [x] **T064-04 — R1:** correct Webhosting DNS and restore inputs/routes. [Handlers](../../src/tools/webhosting/handlers.ts), [versioned API reference](../scaleway-api/webhosting/api-reference.md), [contract suite](../../tests/contract/webhosting/webhosting.contract.test.ts).

- [x] **T064-05 — R1:** fix Cockpit contact-point requests and record deprecation. [Handlers](../../src/tools/cockpit/handlers.ts), [source decisions](endpoints.md#cockpit-67), [unit](../../tests/unit/tools/cockpit.test.ts) and [contract](../../tests/contract/cockpit/cockpit.contract.test.ts) checks.

- [x] **T064-06 — R1/R3:** reconcile required/optional requests. [Body](contracts/request-reconciliation.md), [query](contracts/query-reconciliation.md) and [empty-body](contracts/request-empty-body.md) contracts; [request regressions](../../tests/unit/shared/request-reconciliation.test.ts) and [optional-input wire cases](../../tests/contract/transport/catalog-evidence.contract.test.ts).

- [x] **T064-07 — R2:** validate actual upstream response boundaries. [Validator](../../src/shared/response-validation.ts), [validation unit tests](../../tests/unit/shared/response-validation.test.ts), [real response-boundary suite](../../tests/contract/response-boundary.contract.test.ts).

- [x] **T064-08 — R2:** attest SQL and validate S3 protocols. [SQL SDK projection](../../scripts/contract-overrides/serverless-sqldb.json), [S3 adapter](../../src/shared/s3-response.ts), [S3 tests](../../tests/unit/shared/s3-response.test.ts), [wire suite](../../tests/contract/transport/catalog-evidence.contract.test.ts).

- [x] **T064-09 — R2:** reject incomplete consumed lists/policies. [Consumption contract](contracts/pagination-consumption.md), [pagination/RDB dispatch tests](../../tests/contract/pagination-boundary.contract.test.ts), [IAM complete-policy/no-PUT tests](../../tests/contract/iam-policy-consumption.contract.test.ts).

- [x] **T064-10 — R3:** exercise every HTTP leg and optional input. [Wire methodology](contracts/wire-evidence.md), [evidence index](../../tests/contract-evidence.json), [transport suite](../../tests/contract/transport/catalog-evidence.contract.test.ts) with separate unavailable-ID accounting.

- [x] **T064-11 — R4:** generate and publish synthetic examples. [Generator](../../scripts/gen-examples.ts), [projection](../../src/shared/examples.ts), [example](../../tests/unit/shared/examples.test.ts) and [description](../../tests/unit/tools/description-examples.test.ts) tests.

- [x] **T064-12 — R5:** implement safe traces and local health. [Dispatch](../../src/shared/observability.ts), [server health](../../src/server.ts), [trace tests](../../tests/unit/shared/observability.test.ts), [CLI tests](../../tests/unit/main.test.ts), [MCP dispatch tests](../../tests/contract/mcp-output.test.ts).

- [x] **T064-13 — R6:** publish compatible structured output. [Output schema/projection](../../src/shared/output.ts), [unit](../../tests/unit/shared/output.test.ts) and [MCP surface](../../tests/contract/mcp-output.test.ts) contracts.

- [x] **T064-14 — R3/R7:** enforce regenerated artifact/parity gates. [CI](../../.github/workflows/ci.yml), [parity invariants](../../tests/unit/parity.test.ts), [deterministic generation evidence](closeout.md#independent-evidence).

- [x] **T064-15 — R7:** complete coverage, performance and package checks. [Closeout measurements and independent reviews](closeout.md#delivery-checks), [successful CI receipts](closure-map.md#delivery-receipt).

- [x] **T064-16 — R7:** deliver and close accepted issues. [PR/commit/CI receipt and twelve issue dispositions](closure-map.md); #66/#67 remain open for six unverified contracts.

## Documentation follow-up

These tasks implement the new [SDD closeout requirements](spec.md#sdd-closeout-correction--2026-09-20).
Their documentation delivery is separate from D82.

- [x] **T064-D01:** Consolidate the implemented [data model](data-model.md) and
  [requirement/constitution mapping](plan.md#constitution-review-record), labeled retrospective.
- [x] **T064-D02:** Link all twelve closed issues to contracts, implementation, tests,
  PR #82 and CI in [closure-map.md](closure-map.md); preserve remaining blockers.
- [x] **T064-D03:** Verify local links and reconcile legacy compliance/task records
  against the closure evidence without erasing historical findings.
- [x] **T064-D04:** Prepare the documentation correction for signed PR delivery:
  independent review, link checks, unchanged test-token verification and lint pass.
  The [SDD index](../remediation-sdd-index.md) is the review entry point.

**Documentation delivery gate:** require a signed commit, successful CI and a
reviewed PR merge. The GitHub PR associated with this revision records those
delivery outcomes; the completed local documentation checks above do not pre-mark
a future merge as complete.

The six contracts tracked by #66/#67 have not become validated endpoints. The
provider-token measurement at [feature 059 T055](../059-discovery-token-reduction/tasks.md)
also remains blocked. These are not completed tasks or implied by D82's passing tests.
