# Implementation remediation closeout

The 0.5.0 source delivery reconciles current Scaleway contracts with the registered
MCP operations. It completes examples, structured output, dispatch observability and
local health; runtime response validation now applies before HTTP result processing
for every supported operation. API-side failures retain sanitized categories.

## Supported catalog and deliberate restrictions

There are 727 stable operation IDs. Of these, 721 have independently recorded wire
contracts spanning 726 HTTP legs. The six legacy Cockpit/Inference IDs whose complete
current contracts could not be verified return local 501 before any request. Search,
describe and flat output explain this restriction; both Jev and local routing exclude
them. This does not assert their provider retirement. Issue #67 and the reconciliation
epic remain open for provider verification, including the three Inference findings.

Three legacy filters (NATS account name and Webhosting offer option selectors) accept
no supplied value until support can be verified; they produce local invalid_input
instead of silently dropping a requested filter. Corrected required inputs are staged
in unreleased 0.5.0 and documented in the request and endpoint migration records.

## Independent evidence

- The wire catalog records source URLs, fetch dates and raw SHA-256 digests. Official
  SDK projections preserve parameters missing from OpenAPI rather than deleting them.
  Schema-dependent overlays require a matching base digest before regeneration.
- All three generators produce identical bytes on repeated offline runs. Removing a
  supplemental source removes its contract; missing/mismatched base receipts fail
  generation before writes. CI repeats generation and checks committed output.
- The real transport harness has 5,235 passing cases, including 1,599 optional-input
  variants, every composite request leg, and faults injected into later request legs.
  It checks authentication, input/request/response shapes, pagination and 401/403/404/429
  handling. Malformed JSON and wrong-typed JSON/XML are separate failure cases.
- A separate consumed-pagination boundary rejects missing arrays/counts instead of
  returning incomplete or fabricated empty lists. It also exposed and corrected
  mismatched response field names in Kubernetes pools and both VPN gateway lists.
  RDB endpoint lists likewise require the actual endpoint array. IAM rule mutations
  require a complete policy read and representable existing scopes before any PUT;
  partial, truncated or unrepresentable policies fail with actionable errors.
- [Nine live read-only dispatches](live-dispatch.json) succeeded using the configured
  account through the actual runtime response validator. Their receipts contain no
  keys, resource identifiers or payloads. Earlier [route observations](live-read-only.json)
  record the unsuccessful legacy Cockpit read as inconclusive.

Validation preserves wire fields without coercion or stripping. Existing SDK unmarshallers
still determine final field projections. The Generative tool-call nullable-content
overlay is explicitly a bounded compatibility inference from published documentation,
not a claimed live observation. Offline tests and nine successful reads do not prove
all regions, tenant permissions, populated resource variants, or production write behavior.

## Delivery checks

- Full suite: 12,441 passing tests across 172 files; 100% lines, branches, functions
  and statements. This includes 40 real transport IAM policy-consumption cases.
- Unit suite: 4,206 tests across 106 files; 4.45 seconds reported by Vitest and
  4.686 seconds measured subprocess wall time, within the five-second requirement.
- Type checking, Biome and whitespace checks pass. Independent review of the
  transport and consumed-response boundaries completed with the identified defects fixed.
- Built and installed the tarball in isolation: library import and all three stdio
  modes pass on Node 22.23.2 with MCP SDK 1.30.0. CI repeats on minimum Node 20.20.2.
  The CLI bundle is 4,824,548 bytes, below the five-MiB release limit.
- Gateway discovery is 4,074 bytes for the measured search/describe flow, within its
  6,144-byte budget. Default tool listing remains four tools.

The delivery PR records CI, merge and issue-closure outcomes. No tag or npm
publication is part of this source delivery.

## Recorded delivery and SDD handoff — 2026-09-20

[PR #82](https://github.com/feedback-loop-ai/mcp-scaleway/pull/82) merged as
`7b1fad29a319cbe34c927db7e074c38c46efb5fc`, closing #59, #60, #62, #63, #65,
#68, #69, #70, #71, #72, #73 and #76. Both
[PR CI](https://github.com/feedback-loop-ai/mcp-scaleway/actions/runs/35501757988)
and [merged-main CI](https://github.com/feedback-loop-ai/mcp-scaleway/actions/runs/35501832089)
passed all five jobs. #66/#67 remain open for the six unverified contracts.

A subsequent SDD audit found that older compliance/task records had not been
reconciled and that maintenance data-model/task traceability needed consolidation.
The [closure map](closure-map.md), [data model](data-model.md), updated [tasks](tasks.md)
and [remediation SDD index](../remediation-sdd-index.md) document that correction.
These are dated additions after the implementation merge. They do not establish
historical pre-code approval or erase the R-II/R-III findings in the
[compliance record](../retrofit-compliance.md).
