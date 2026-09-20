# Maintenance closeout data model

Retrospective HOW artifact consolidated on 2026-09-20 for
[PR #81](https://github.com/feedback-loop-ai/mcp-scaleway/pull/81) (`4f4027c`),
delivered 2026-09-19. This feature adds no persistent data store or new cloud
resource model. See the [specification](spec.md),
[maintenance contracts](contracts/maintenance.md) and [original validation](validation.md).

| Record | Fields and invariant | Implementation |
| --- | --- | --- |
| Published-route comparison | `{endpoint, query?, published}`. `endpoint` retains the exact method/path prefix before the first question mark; query metadata is separate. `published` is exact membership in the supplied published method/path set. | [Comparator](../../scripts/route-comparison.ts). |
| HTTP observation | `{method,path,note,status?,outcome,explanation}`. Outcome is success, inconclusive or skipped. An HTTP result is an observation, not proof of endpoint existence or a valid response contract. | [Webhosting diagnostic](../../scripts/probe-webhosting-404.ts). |
| Probe report | `{checkedAt, observations}`. Rows are independent; a failed control request does not reinterpret another row. Bodies, headers, credentials and exception text are absent. | [Report renderer](../../scripts/probe-webhosting-404.ts). |
| Packed-package receipt | `{bun,node,sdk,libraryImport,modes}`; each mode records `{mode,tools,listingBytes}` after complete tool enumeration. SDK/runtime versions identify the actual installed execution environment. | [Packed smoke](../../scripts/smoke-packed.ts). |
| Restart observation | Original and edited source version, elapsed restart time, fresh MCP initialization and complete tool count. The local receipt is evidence, not server state; old protocol sessions are not preserved. | [Recorded restart evidence](validation.md#development-reload-61). |

The comparator consumes the existing parity metadata and public source path set;
it does not add request-parameter validation. The two scoped Registrar/NATS query
parameters were verified separately and recorded with source digests.

Packed smoke tests reuse the gateway names from matrix metadata and operation IDs
from the same operation inventory, then compare them with the installed package's
actual MCP listing. Temporary consumer files are removed after the check. Cloud
and model credentials are not passed to the child environment.

The source restart workflow clears in-memory runtime state. A client reconnects,
initializes a new MCP session and refreshes tool discovery. No session-migration
entity or automatic reconnection protocol was introduced.

[Feature 064](../064-remaining-remediation/data-model.md) owns the later runtime
contract catalog, availability manifest and structured result models. The original
metrics in this feature's validation remain historical measurements.
