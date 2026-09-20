# Remediation SDD artifact index

Audit and documentation correction: **2026-09-20**, after implementation PRs
[#80](https://github.com/feedback-loop-ai/mcp-scaleway/pull/80),
[#81](https://github.com/feedback-loop-ai/mcp-scaleway/pull/81) and
[#82](https://github.com/feedback-loop-ai/mcp-scaleway/pull/82) merged.

The user requested that all fixes have proper SDD artifacts. This index separates
the delivered behavior and evidence from the dates when documentation was written.
The follow-up scope was recorded in [feature 064's specification](064-remaining-remediation/spec.md#sdd-closeout-correction--2026-09-20)
before the documentation corrections. It changes no runtime behavior.

## Artifact inventory

| Delivery | WHAT | HOW and data model | Contracts | Tasks and validation |
| --- | --- | --- | --- | --- |
| 061: optional Jev routing, PR #80 | [Spec](061-intent-routing/spec.md) | [Plan](061-intent-routing/plan.md), [model](061-intent-routing/data-model.md) | [Routing contract](061-intent-routing/contracts/route.md) | [Tasks](061-intent-routing/tasks.md), [validation](061-intent-routing/validation.md) |
| 062: Scaleway refresh, PR #80 | [Spec](062-scaleway-refresh/spec.md) | [Plan](062-scaleway-refresh/plan.md), [model](062-scaleway-refresh/data-model.md) | [Refresh contracts](062-scaleway-refresh/contracts/refresh.md) | [Tasks](062-scaleway-refresh/tasks.md), [validation](062-scaleway-refresh/validation.md), [source review](062-scaleway-refresh/upstream-review.md) |
| 063: route audit, reload and packaging, PR #81 | [Spec](063-remediation-closeout/spec.md) | [Plan](063-remediation-closeout/plan.md), [model](063-remediation-closeout/data-model.md) | [Maintenance contracts](063-remediation-closeout/contracts/maintenance.md) | [Tasks](063-remediation-closeout/tasks.md), [validation](063-remediation-closeout/validation.md) |
| 064: endpoint and MCP remediation, PR #82 | [Spec](064-remaining-remediation/spec.md) | [Plan](064-remaining-remediation/plan.md), [model](064-remaining-remediation/data-model.md) | [Contract index](064-remaining-remediation/contracts/README.md) | [Tasks](064-remaining-remediation/tasks.md), [closeout](064-remaining-remediation/closeout.md), [issue/evidence map](064-remaining-remediation/closure-map.md) |

These artifacts cover the constitution's WHAT, HOW and VALIDATION roles. Models
describe the stateless proxy's actual input, output and evidence structures; they
do not invent persistence. Contracts link reused service references and executable
schemas. The feature plans contain design decisions; source investigations record
research, and README/validation records supply operation and reproduction commands.

## Corrections made by this audit

- Added missing maintenance data models/contracts in 062/063 and consolidated 064's
  data model and task-level traceability as explicitly retrospective additions.
- Recorded priorities and constitutional checks without fabricating past sign-off.
- Linked all twelve issues closed by PR #82 to requirements, contracts and tests.
- Reconciled the [current compliance ledger](retrofit-compliance.md), original
  [059 tasks](059-discovery-token-reduction/tasks.md) and
  [060 tasks](060-api-correctness/tasks.md). Older analysis/plan findings retain their
  original dates and point to the current disposition.
- Added explicit API Reference/endpoint citations to the new contract suites. The
  whole-catalog mapping covers 727 operation references across 50 product records.
  The amendments to test files are comments only.

## Evidence and remaining limits

PR #82 closed #59, #60, #62, #63, #65, #68, #69, #70, #71, #72, #73 and #76.
Its [PR CI](https://github.com/feedback-loop-ai/mcp-scaleway/actions/runs/35501757988)
and [merged-main CI](https://github.com/feedback-loop-ai/mcp-scaleway/actions/runs/35501832089)
passed; the [closeout](064-remaining-remediation/closeout.md) records 12,441 tests,
100% coverage, separate unit timing and nine bounded live reads. Those results
belong to the implementation delivery, not a newly claimed rerun of this audit.

[#66](https://github.com/feedback-loop-ai/mcp-scaleway/issues/66) and
[#67](https://github.com/feedback-loop-ai/mcp-scaleway/issues/67) remain open for six
unverified provider contracts; their operations return local 501 before HTTP.
Three unverified legacy filters are rejected explicitly. Original 059 T055's
provider-token measurement remains blocked; 060 T056's optional live investigation
is not marked complete. Offline tests and nine reads do not establish production
write behavior or universal service availability. Jev evaluation limitations remain
in its own validation record.

R-II/R-III historical sequencing breaches are preserved. A later artifact or a
squashed commit cannot prove that design approval preceded implementation. This
documentation correction neither backdates records nor grants a governance waiver,
changes the constitution, publishes an npm package, or certifies universal compliance.

## Documentation validation

The closeout check inspected 49 Markdown documents and resolved all 545 local links
and heading anchors. The five amended TypeScript test files have identical
non-comment token streams to the merged implementation. Biome and whitespace checks
pass. Independent reviews checked artifact completeness, issue/requirement/test
traceability and preservation of historical findings and evidence limits.

The documentation PR attached to this revision records its signed commit, CI and
merge outcome separately from the implementation receipts above.
