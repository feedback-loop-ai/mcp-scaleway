# Delivery checkpoints

Original 2026-09-19 checkpoints, merged in
[PR #81](https://github.com/feedback-loop-ai/mcp-scaleway/pull/81) (`4f4027c`).

- [x] Verify Registrar/NATS paths and query parameters against fresh official schemas.
- [x] Fix query/path comparison and retain other route discrepancies.
- [x] Replace misleading Webhosting verdicts with bounded GET-only observations.
- [x] Add and document development source restart with MCP session limitations.
- [x] Verify an actual source-triggered restart and separate unit-suite timing.
- [x] Install the packed package and verify all three stdio modes with Bun 1.3.6.
- [x] Add the packed-install check to CI.
- [x] Pass combined lint, typecheck, coverage and build checks.
- [x] Prepare evidence supporting closure of issues #61, #64, #74 and #75.

Remaining epic #66 findings, response validation, contract depth, logging/health,
legacy examples and structured tool output remain separate open work.

## Retrospective task traceability — 2026-09-20

The preceding open-work statement describes PR #81's checkpoint.
[Feature 064](../064-remaining-remediation/closure-map.md) records its later
disposition. The atomic IDs below index existing evidence; they do not imply that
this breakdown was present before implementation or that old tests were rerun.

| ID | Completed deliverable | Verification |
| --- | --- | --- |
| T063-01 | Verify Registrar's exact published path and `tlds` query. | [Source/digest receipt](validation.md#registrar-74-and-nats-75). |
| T063-02 | Verify NATS's exact published path and account query. | [Source/digest receipt](validation.md#registrar-74-and-nats-75). |
| T063-03 | Compare exact method/path while retaining query text. | [Comparator contract](contracts/maintenance.md#exact-methodpath-comparison--requirement-1), [seven regressions](../../tests/unit/scripts/route-comparison.test.ts). |
| T063-04 | Replace misleading HTTP verdicts with independent observations. | [Diagnostic contract](contracts/maintenance.md#webhosting-diagnostic--requirement-2), [diagnostic regressions](../../tests/unit/scripts/probe-webhosting.test.ts). |
| T063-05 | Bound diagnostic GETs and skip restore mutation. | [Diagnostic regressions](../../tests/unit/scripts/probe-webhosting.test.ts), [recorded limits](validation.md#webhosting-71-remains-open). |
| T063-06 | Add source restart and document new MCP session requirements. | [Restart contract](contracts/maintenance.md#source-restart--requirement-3), [isolated restart receipt](validation.md#development-reload-61). |
| T063-07 | Measure the unit suite separately from coverage. | [Original 3.74-second measurement](validation.md#development-reload-61). |
| T063-08 | Install the real tarball and verify library import. | [Package contract](contracts/maintenance.md#installed-package-verification--requirement-4), [original package receipt](validation.md#mcp-sdk-upgrade-64). |
| T063-09 | Enumerate installed gateway, flat and both modes. | [Per-mode results](validation.md#mcp-sdk-upgrade-64), [packed smoke script](../../scripts/smoke-packed.ts). |
| T063-10 | Add installed-package verification to CI. | [CI build job](../../.github/workflows/ci.yml), [merged PR receipt](https://github.com/feedback-loop-ai/mcp-scaleway/pull/81). |
| T063-11 | Complete lint, typecheck, coverage and build gates. | [Original combined checks](validation.md#combined-checks). |
| T063-12 | Record bounded closure evidence for #61/#64/#74/#75. | [Validation](validation.md), [closure-scope contract](contracts/maintenance.md#closure-scope--requirement-5). |

The [spec](spec.md), [plan](plan.md), [data model](data-model.md) and
[maintenance contracts](contracts/maintenance.md) complete the linked SDD record.
Retrospective completion does not waive the [historical governance findings](../retrofit-compliance.md).
