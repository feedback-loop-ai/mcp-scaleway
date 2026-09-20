# Delivery checklist

Original 2026-09-19 delivery checkpoints, merged in
[PR #80](https://github.com/feedback-loop-ai/mcp-scaleway/pull/80) (`844cb8e`).

- [x] Correct RDB snapshot request paths and bodies.
- [x] Add current Containers, Kubernetes, Key Manager and Audit Trail capabilities.
- [x] Extend Generative APIs chat function calling and structured-output inputs.
- [x] Update SDKs, pin tooling and type-check maintenance scripts.
- [x] Repair public schema checking and schedule weekly reports.
- [x] Update operation metadata, parity mapping and service reference docs.
- [x] Complete independent reviews and resolve their findings.
- [x] Verify the isolated non-Jev snapshot and final working tree.
- [x] Record current public-schema and authenticated read evidence.
- [x] Package the non-Jev work in a standalone local commit.

## Retrospective task traceability — 2026-09-20

The IDs below make the original completed work individually traceable; they do not
claim that this task breakdown preceded implementation or that tests were rerun
for the documentation consolidation.

| ID | Completed deliverable | Contract and verification |
| --- | --- | --- |
| T062-01 | Correct snapshot creation URL/body. | [Refresh contract](contracts/refresh.md#service-boundaries), [RDB transport regression](../../tests/contract/transport/current-capabilities.transport.test.ts). |
| T062-02 | Correct snapshot restoration URL/body. | [Refresh contract](contracts/refresh.md#service-boundaries), [RDB transport regression](../../tests/contract/transport/current-capabilities.transport.test.ts). |
| T062-03 | Preserve Containers public-endpoint true/false overrides. | [Containers contract](../060-api-correctness/contracts/containers-tools.md), [transport regressions](../../tests/contract/transport/current-capabilities.transport.test.ts). |
| T062-04 | Serialize Kubernetes endpoint selection. | [Refresh contract](contracts/refresh.md#service-boundaries), [valid/invalid selector regressions](../../tests/contract/transport/current-capabilities.transport.test.ts). |
| T062-05 | Add Key Manager rotation listing. | [Refresh contract](contracts/refresh.md#service-boundaries), [pagination/filter regression](../../tests/contract/transport/current-capabilities.transport.test.ts). |
| T062-06 | Add imported-material deletion. | [Refresh contract](contracts/refresh.md#service-boundaries), [uint32/204/error regressions](../../tests/contract/transport/current-capabilities.transport.test.ts). |
| T062-07 | Add custom alert evaluation. | [Refresh contract](contracts/refresh.md#service-boundaries), [request/validation/error regressions](../../tests/contract/transport/current-capabilities.transport.test.ts). |
| T062-08 | Add caller-managed function-call conversation inputs. | [Generative contract](contracts/refresh.md#service-boundaries), [conversation regressions](../../tests/contract/tools/generative-apis/tool-calling.contract.test.ts). |
| T062-09 | Add token precedence and response-format controls. | [Generative contract](contracts/refresh.md#service-boundaries), [area evidence](validation.md#acceptance-evidence). |
| T062-10 | Update dependencies and compiler/script checking. | [Original frozen install/typecheck results](validation.md#standalone-validation). |
| T062-11 | Preserve semantic baselines and freshness failure behavior. | [Maintenance contract](contracts/refresh.md#public-schema-maintenance), [checker regressions](../../tests/unit/scripts/schema-freshness.test.ts). |
| T062-12 | Schedule public-source monitoring without cloud credentials. | [Workflow](../../.github/workflows/schema-freshness.yml), [recorded workflow review](validation.md#acceptance-evidence). |
| T062-13 | Reconcile metadata, parity and isolated delivery gates. | [Original checks](validation.md#standalone-validation), [merged PR receipt](https://github.com/feedback-loop-ai/mcp-scaleway/pull/80). |
| T062-14 | Record bounded live reads and 17-source disposition. | [Read evidence](validation.md#authenticated-live-reads), [upstream review](upstream-review.md). |

The [specification](spec.md), [plan](plan.md), [data model](data-model.md) and
[contract document](contracts/refresh.md) now connect each role's artifacts.
Package installation followed in [063](../063-remediation-closeout/validation.md);
the current status of broader findings belongs to
[064](../064-remaining-remediation/closure-map.md). This does not retroactively
close the [historical sequencing findings](../retrofit-compliance.md).
