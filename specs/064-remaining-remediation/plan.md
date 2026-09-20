# Implementation plan

Parallel work streams:

- Reconcile disputed endpoints and their official source records, then repair area
  handlers, input schemas, metadata and transport contracts where justified.
- Build response validation from independently recorded wire contracts and integrate
  it at transport boundaries before SDK transformations. Apply explicit adapters for
  documented SDK/local output envelopes and S3 XML. Preserve additional valid fields.
- Add examples, structured output, dispatch traces and health at the existing MCP
  registration/dispatch boundary, keeping the four default gateway tools.
- Build a complete operation evidence inventory and contract harness across request,
  response, pagination, authorization and error/rate-limit dimensions. Missing evidence
  must fail the relevant gate rather than disappear from counts.

The streams use separate modules and coordinate shared registry/transport interfaces.
The final validator mechanism and any unavailable-source exceptions must be documented
before integrating them. Existing unmerged worktrees are reference material only;
their changes require review against current main before adoption.

Validation combines focused negative/positive tests, whole-catalog checks and explicit
read-only live probes where useful. Unit timing is measured separately from coverage.
No benchmark or simulated transport is reported as production liveness proof.

## Retrospective design consolidation — 2026-09-20

The preceding work-stream plan accompanied the implementation. This section records
the resulting design after PR #82 merged; it is not a pre-implementation approval
record. It implements the documentation follow-up in [the specification](spec.md#sdd-closeout-correction--2026-09-20).
R1–R7 below refer to the seven numbered implementation requirements in that spec.
The current entities and invariants are consolidated in [data-model.md](data-model.md).

| Requirement | Design decision and reason | Implementation and contract |
| --- | --- | --- |
| R1: authoritative endpoint reconciliation | Preserve independent secondary-schema/SDK evidence and retain six unverified IDs with a local guard. A missing schema or ambiguous 404 cannot establish retirement. | [Endpoint decisions](endpoints.md), [availability manifest](../../src/shared/unavailable-operations.json), [support restriction](contracts/unverified-operations.md). |
| R2: runtime response validation | Select a recorded contract using operation, host, method, path and fixed query selectors before SDK unmarshalling. Zod wraps Ajv so recorded references/unions/constraints can be enforced without coercion or stripping. S3 uses explicit XML/header adapters. | [Response contract](contracts/response-validation.md), [validator](../../src/shared/response-validation.ts), [S3 adapter](../../src/shared/s3-response.ts). |
| R2: safe response consumption | Validate only the additional fields actually consumed by a local projection. A complete normalized list or IAM policy replacement cannot be constructed from absent/partial data. Do not change official SDK defaults or the upstream schema's optionality. | [Consumption contract](contracts/pagination-consumption.md), [pagination](../../src/shared/pagination.ts), [IAM handlers](../../src/tools/iam/handlers.ts). |
| R3: independent operation evidence | Derive fixtures from recorded source contracts and dispatch the real registry through replaced HTTP. Include optional fields and every composite leg; comparing handler metadata with itself is insufficient. | [Wire methodology](contracts/wire-evidence.md), [evidence index](../../tests/contract-evidence.json), [transport suite](../../tests/contract/transport/catalog-evidence.contract.test.ts). |
| R4: valid examples | Generate synthetic input objects from actual Zod schemas, with explicit source-valid locality examples. Keep examples separate from live resources and credentials. | [MCP contract](mcp-contracts.md#examples), [example generator](../../scripts/gen-examples.ts), [example catalog](../../src/gateway/examples.json). |
| R5: safe traces and health | Emit registry-owned operation ID, outcome and duration at dispatch; exclude submitted/returned data. Construct and close the server for a local health check without claiming cloud connectivity. | [Trace/health contract](mcp-contracts.md), [dispatch](../../src/shared/observability.ts), [server health](../../src/server.ts). |
| R6: MCP structured results | Wrap results in a shared `{format,data}` envelope while preserving text, metadata and error flags. This envelope and upstream resource validation are separate contracts. | [Output contract](mcp-contracts.md#structured-output), [output schema](../../src/shared/output.ts). |
| R7: reproducible delivery | Commit generated catalogs, verify regeneration produces no diff, enforce source coverage and run package smoke checks. Keep unresolved provider verification explicit when closing issue groups. | [CI](../../.github/workflows/ci.yml), [closeout](closeout.md), [issue closure map](closure-map.md). |

The additional validator and protocol adapters are justified by R2's nested JSON,
non-JSON and empty-body requirements. They use one shared transport boundary rather
than one handwritten resource model per operation. Compilation caches are process-local;
they do not store tenant/resource state or add cloud side effects. The generated
source receipts and compatibility overlays make this complexity reviewable.

## Constitution review record

This is a retrospective mapping to the [constitution](../../.specify/memory/constitution.md),
not a claim that this table existed before implementation or a waiver of historical
R-II/R-III findings in [the compliance ledger](../retrofit-compliance.md).

| Principle | Current evidence and limit |
| --- | --- |
| I: AI-first interface | R4/R6; validated synthetic examples, output schema and structured error envelope. |
| II: separate WHAT/HOW/VALIDATION | [Spec](spec.md), this plan, [data model](data-model.md), [contracts index](contracts/README.md), [task evidence](tasks.md) and [closeout](closeout.md) separate the roles. This consolidation cannot retroactively prove sequencing. |
| III: contract-first and traceability | [Contract index](contracts/README.md), versioned input migrations and [API reference](../scaleway-api/README.md); six unattested operations remain guarded. Historical sequence breaches are retained. |
| IV: operations | R5; safe stderr traces, sanitized failures and local health with no cloud-availability claim. |
| V: justified complexity | Each architecture decision above names R1–R7 and its specific need. The retrospective table does not establish when its justification was first recorded. |
| VI: feedback | [Closeout measurements](closeout.md#delivery-checks) distinguish the unit-only five-second check, coverage run, discovery bytes and package size. |
| VII: runtime typing | R2; upstream schema validation plus explicit consumed-field validation, retaining original values and SDK projections. |
| VIII: coverage and parity | R3/R7; [evidence index](../../tests/contract-evidence.json), [parity matrix](../../tests/parity-matrix.json), source coverage and the [successful delivery CI receipts](closure-map.md#delivery-receipt). |

Research is recorded in the [source investigation](endpoints.md) and
[contract decisions](contracts/README.md). Usage and validation are recorded in
[the package README](../../README.md) and [delivery checks](closeout.md#delivery-checks).
These links reuse the existing records without duplicating or backdating them.
