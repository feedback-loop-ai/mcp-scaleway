# Refresh data model

Retrospective HOW artifact consolidated on 2026-09-20 for the 2026-09-19 delivery
in [PR #80](https://github.com/feedback-loop-ai/mcp-scaleway/pull/80)
(`844cb8e`). This does not establish that these records preceded implementation.
The [specification](spec.md) defines scope; [contracts/refresh.md](contracts/refresh.md)
defines the boundaries; [validation.md](validation.md) retains the original evidence.

## Reused service models

This refresh adds no database, persistent resource store or workflow executor.
Existing Zod operation inputs and provider responses remain owned by their service
areas. Changes reuse the following models rather than introduce parallel entities:

| Model | Refresh change and invariant | Detailed reference |
| --- | --- | --- |
| RDB snapshot create/restore input | Resource identity belongs in the documented URL; only snapshot/create-instance fields belong in the request body. Stable tool names are retained. | [Snapshot contracts](../013-rdb/contracts/tool-contract.md#snapshot-tools), [RDB reference](../scaleway-api/rdb/api-reference.md). |
| Containers public-endpoint option | Optional `enableDefaultPublicEndpoint` maps to `enable_default_public_endpoint`; explicit false survives serialization. | [Containers contract](../060-api-correctness/contracts/containers-tools.md), [reference](../scaleway-api/containers/api-reference.md). |
| Kubeconfig selector | Optional `endpoint` selects public or VPC connectivity; omission preserves the upstream default. | [Kubernetes reference](../scaleway-api/k8s/api-reference.md). |
| Key rotation/material request | Existing key identity and regional scope; rotation listings preserve pagination/filter values, while imported-material deletion accepts an optional uint32 rotation index. | [Key Manager reference](../scaleway-api/key-manager/api-reference.md). |
| Custom alert evaluation | Organization, query, occurrence count and optional duration describe an evaluation; a successful boolean result does not create a rule. | [Audit Trail reference](../scaleway-api/audit-trail/api-reference.md). |
| Chat conversation and function definition | Messages distinguish text, assistant function calls and tool results. Calls retain IDs, function names and JSON argument strings; function definitions carry parameter schemas and optional compatibility fields. Execution remains with the caller. | [Generative APIs reference](../scaleway-api/generative-apis/api-reference.md), [Zod models](../../src/tools/generative-apis/types.ts). |

Jev's provider, decision and evaluation models belong to
[feature 061](../061-intent-routing/data-model.md), which merged in the same PR.

## Maintenance records

| Record | Fields and meaning |
| --- | --- |
| Schema source | Area-keyed `{url, sha256}`. URL must identify an official public Scaleway schema; digest identifies accepted raw bytes. |
| Reviewed baseline | `{sha256, schema}`. `schema` is a semantic OpenAPI projection retaining paths, refs, constraints and server origins. Its digest must match the area's accepted provenance for a structural comparison. |
| Semantic difference | `addedEndpoints`, `removedEndpoints`, and `changedFields[{path,before?,after?}]`. Paths are JSON pointers; additions/removals alone do not classify compatibility. |
| Schema check | `area`, `url`, `recordedSha256`, optional `currentSha256`, `status`, optional `diff`, `note`, `error`. Status is unchanged, changed or failed. Missing matching baselines permit a byte comparison with an explicit note. |
| Freshness report | `checkedAt`, `checks`, and summary counts for unchanged/changed/failed. Reports are review artifacts, not new accepted baselines. |
| Operation metadata | Existing stable tool ID, area, method/path and read-only classification. The parity matrix and generated catalog retain one entry per operation. |

The [baseline policy](../../scripts/schema-baselines/README.md),
[checker types](../../scripts/fetch-schemas.ts) and
[semantic projection](../../scripts/schema-diff.ts) define these maintenance records.
Public schemas and synthetic tests do not contain cloud credentials or resource data.

## Subsequent changes

[Feature 064](../064-remaining-remediation/data-model.md) adds runtime wire-schema
validation, explicit availability, normalized-response checks and MCP structured
envelopes. Its models govern those later changes; this artifact does not attribute
that work or its validation results to PR #80.
