# Remediation data model

Retrospective consolidation, 2026-09-20, after PR #82. This records the implemented
data shapes for the [SDD documentation correction](spec.md#sdd-closeout-correction--2026-09-20).
It is not a claim that this standalone artifact existed before implementation.

## Operation identity and source evidence

| Record | Fields and relationships | Authority |
| --- | --- | --- |
| Operation metadata | `tool` is the stable `scaleway_*` ID; `area`, `api` and `readOnly` record its product, underlying route expression and access classification. Runtime `op` removes the prefix; the registry also holds its description, actual input Zod shape/schema, JSON input schema and callback. | [Metadata schema](../../src/gateway/metadata.ts), [registry](../../src/gateway/registry.ts), generated [operations](../../src/gateway/operations.json). |
| Wire catalog | Version 1 with `sources`, `documents` and `routes`. `documents` holds recorded OpenAPI-compatible request/response schemas. `routes[tool]` contains each HTTP leg for that stable ID. | [Catalog](../../src/shared/response-contracts.json), [generator](../../scripts/gen-response-contracts.ts). |
| Source receipt | Keyed source ID with `url`, `sha256`, `fetchedAt`, `kind`; reviewed overlays can add `baseSource` and `baseSha256`. Digests attest the cited raw source, not a claim that a projection was itself published verbatim by Scaleway. | [Supplemental source records](../../scripts/contract-overrides/), [response contract](contracts/response-validation.md). |
| HTTP leg | `method`, `path`, `host`, optional `query`, `area` (source document ID), and `sourcePath`. The public operation path and source-template parameter names may differ; the recorded mapping selects the source schema. Fixed and templated query selectors retain distinct semantics. | [Response route type](../../src/shared/response-validation.ts), [wire evidence](contracts/wire-evidence.md). |
| Operation evidence | Keyed by stable tool ID; `status` is `supported` or `unavailable`, `sources` identifies document/method/path, `dimensions` names request/response/pagination/auth/errors, and `test` identifies the real transport suite. Non-paginated operations have no applicable pagination mutation; unavailable operations have no claimed supported dimensions. | [Evidence index](../../tests/contract-evidence.json), [parity gate](../../tests/unit/parity.test.ts). |

The current catalog has 727 IDs, with 721 supported operations and 726 HTTP legs.
The [parity matrix](../../tests/parity-matrix.json) maps each operation to its legacy
area contract test; the evidence index adds the shared source-driven wire suite.
Gateway meta-tools retain their separate contract entries and are not assigned
invented cloud endpoints.

## Availability and examples

The [unavailable manifest](../../src/shared/unavailable-operations.json) is keyed by
six stable IDs. Each value contains `reason`, `migration` and `sources: string[]`.
Discovery adds `status: "unavailable"` to a cloned record. IDs remain discoverable,
but execution returns a local 501 before HTTP and both Jev/local routing exclude
them. Re-enabling requires the [explicit evidence decision](contracts/unverified-operations.md);
no environment flag can bypass it. This is not provider-retirement metadata.

The generated [examples catalog](../../src/gateway/examples.json) maps each stable
ID to a synthetic input object. Discovery returns `[{params, synthetic:true}]` and
flat descriptions label the same values as examples. Returned values are cloned;
they are not account/resource state and contain no credentials. Actual registered
input schemas validate the catalog during generation and tests.

## MCP outputs and local projections

| Boundary | Shape and invariant | Contract/implementation |
| --- | --- | --- |
| Structured MCP result | `structuredContent: {format: "json" | "text" | "content", data}`. JSON data preserves parsed scalar/object/array/null values; text preserves non-JSON text; content preserves the original block array. Existing `content`, `_meta` and `isError` remain. | [MCP contract](mcp-contracts.md#structured-output), [Zod output schema](../../src/shared/output.ts). |
| Normalized pagination | `{items, totalCount, page, pageSize}`. `items` must be an array and `totalCount` a finite nonnegative integer. Validation does not coerce a string count or replace missing values with empty/zero; original item objects remain. | [Consumption contract](contracts/pagination-consumption.md), [pagination](../../src/shared/pagination.ts). |
| Upstream failure | A safe response error has HTTP status 502 and a fixed reason such as `invalid_schema`; non-success provider statuses retain sanitized categories. No upstream body or submitted parameter is part of the validation message. | [Response contract](contracts/response-validation.md), [error mapping](../../src/shared/errors.ts). |
| IAM policy replacement | The consumed rules array and explicit total count must represent the complete policy. Each retained rule requires representable permission, condition and scope fields. Missing/partial/unrepresentable reads stop before PUT. This is a consumption precondition, not a changed provider response schema. | [Policy contract](contracts/pagination-consumption.md), [IAM handlers](../../src/tools/iam/handlers.ts). |

JSON validation retains valid additional fields without coercion/default insertion.
Official SDK unmarshallers still determine their own output projections. S3 XML,
headers and configuration errors use the [documented adapters](contracts/response-validation.md#object-storage-projections).

## Observability and lifetime

Dispatch emits `{event:"operation", op, outcome:"success"|"error", durationMs}` on
stderr. `op` comes from the registry, not an unvalidated user value. The record
contains no input, output, credential or exception text. Local health returns
`{status:"ok", check:"local", version}`; CLI failure emits a sanitized error status
and a nonzero exit. Neither record claims authenticated Scaleway connectivity.
See [the contracts](mcp-contracts.md) and [dispatch implementation](../../src/shared/observability.ts).

Registry records, compiled validators and request-local route context are process
objects. The server remains a stateless cloud proxy: no tenant/resource database,
background cloud mutation or persistent routing memory is introduced.
