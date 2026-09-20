# Scaleway refresh contracts

Retrospective contract consolidation, 2026-09-20. This records the bounded work
delivered in [PR #80](https://github.com/feedback-loop-ai/mcp-scaleway/pull/80)
(`844cb8e`), without claiming contract-first sequencing. Read with the
[specification](../spec.md), [data model](../data-model.md) and dated
[validation record](../validation.md).

## Service boundaries

The table identifies changed contracts, not a certification of every operation in
these areas. Full request/response reference material remains in the linked service
records. Operations retain their public IDs and the shared structured error format.

| Operation or input | Contract established by the refresh | Reference and regression |
| --- | --- | --- |
| `rdb_create_snapshot` | `POST /rdb/v1/regions/{region}/instances/{instance_id}/snapshots`; `instance_id` is a path value, while name/expiry are body fields. | [RDB](../../scaleway-api/rdb/api-reference.md), [snapshot tool contract](../../013-rdb/contracts/tool-contract.md#snapshot-tools), [transport tests](../../../tests/contract/transport/current-capabilities.transport.test.ts). |
| `rdb_restore_snapshot` | `POST /rdb/v1/regions/{region}/snapshots/{snapshot_id}/create-instance`; body describes the restored instance, including explicit high-availability selection when supplied. | [RDB](../../scaleway-api/rdb/api-reference.md), [transport tests](../../../tests/contract/transport/current-capabilities.transport.test.ts). |
| Containers create/update | Optional `enableDefaultPublicEndpoint` serializes as `enable_default_public_endpoint`; both true and false remain explicit. | [Containers contract](../../060-api-correctness/contracts/containers-tools.md), [transport tests](../../../tests/contract/transport/current-capabilities.transport.test.ts). |
| `k8s_get_cluster_kubeconfig` | Existing kubeconfig GET adds optional query `endpoint=public` or `endpoint=vpc`; omitted selector sends neither. Other values fail input validation. | [Kubernetes](../../scaleway-api/k8s/api-reference.md), [transport tests](../../../tests/contract/transport/current-capabilities.transport.test.ts). |
| `key_manager_list_key_rotations` | `GET /key-manager/v1alpha1/regions/{region}/keys/{key_id}/rotations`; preserve page/page size, ordering and repeated status filters. Return the existing normalized list envelope. | [Key Manager](../../scaleway-api/key-manager/api-reference.md), [transport tests](../../../tests/contract/transport/current-capabilities.transport.test.ts). |
| `key_manager_delete_key_material` | `POST /key-manager/v1alpha1/regions/{region}/keys/{key_id}/delete-key-material`; optional uint32 `key_rotation_index`, including zero, is preserved. HTTP 204 becomes an acknowledgement. | [Key Manager](../../scaleway-api/key-manager/api-reference.md), [transport tests](../../../tests/contract/transport/current-capabilities.transport.test.ts). |
| `audit_trail_test_custom_alert_rule` | `POST /audit-trail/v1alpha1/regions/{region}/test-custom-alert-rule`; serialize organization, query, occurrence count and optional seconds duration. An error must not become a false evaluation result. | [Audit Trail](../../scaleway-api/audit-trail/api-reference.md), [transport tests](../../../tests/contract/transport/current-capabilities.transport.test.ts). |
| `generative_apis_chat_completion` inputs | Forward function definitions, choice, assistant calls and tool-result messages; prefer `max_completion_tokens` over legacy `max_tokens`. Preserve response details and leave function execution to the caller. | [Generative APIs](../../scaleway-api/generative-apis/api-reference.md), [conversation tests](../../../tests/contract/tools/generative-apis/tool-calling.contract.test.ts). |

The recorded Generative API compatibility limits include upstream ignoring function
`strict` and `parallel_tool_calls: false`; forwarding them does not enforce them.
The refresh's chat field work did not establish the correctness of every Generative
API URL. Later host/project-path reconciliation and conditional assistant-content
compatibility are explicitly recorded in [feature 064](../../064-remaining-remediation/endpoints.md)
and its [compatibility contract](../../064-remaining-remediation/contracts/generative-chat-compatibility.md).

## Public schema maintenance

`bun run fetch:schemas [--output <directory>]` reads accepted source provenance and
semantic baselines, fetches only validated public schema URLs, and emits review
results using the [maintenance data model](../data-model.md#maintenance-records).
Requests have a 30-second deadline, reject redirects, and use at most four workers.

- Unchanged and changed schemas exit successfully; changed bytes remain an alarm
  for review, even when no semantic difference is found.
- HTTP, parsing or checker failures are failed checks and make the command fail.
- Reports contain both accepted and fetched digests. The command never rewrites
  accepted provenance, baseline snapshots or local API evidence.
- Semantic projections preserve request/response constraints and literal values.
  Removing prose must not remove a property named `description` or literal content.
- The [weekly/manual workflow](../../../.github/workflows/schema-freshness.yml)
  uses read-only repository permissions, needs no cloud credentials, and retains
  its JSON/Markdown report artifacts for review.

Implementation: [checker](../../../scripts/fetch-schemas.ts),
[projection/diff](../../../scripts/schema-diff.ts),
[baseline policy](../../../scripts/schema-baselines/README.md).
Verification: [freshness regressions](../../../tests/unit/scripts/schema-freshness.test.ts)
and the original [48-source disposition](../upstream-review.md).

## Delivery and evidence limits

Four gateway tools remain the default; the catalog grew to 727 operations across
50 areas. Optional Jev routing has its own [contract](../../061-intent-routing/contracts/route.md)
and is not required for cloud dispatch or schema monitoring. The frozen install,
strict typecheck, coverage, parity, Node build and package dry-run results are
recorded in [validation.md](../validation.md), not inferred from this document.

The six recorded live checks were authenticated empty-list reads. Neither those
reads nor intercepted mutation tests prove behavior against existing resources.
Actual tarball-install verification followed in [feature 063](../../063-remediation-closeout/validation.md);
runtime response validation and deeper whole-catalog evidence followed in
[feature 064](../../064-remaining-remediation/closeout.md).
