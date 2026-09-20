# Implementation and delivery plan

Keep the existing tool schemas, handlers and gateway dispatch architecture.
Correct API paths and serialization at their existing boundaries, and update the
parity matrix before regenerating operation metadata. Exercise emitted HTTP
requests with the real Scaleway SDK and production route guard.

Represent chat function definitions and conversation messages with Zod schemas.
Forward supported fields to Scaleway's chat endpoint, preserve returned tool calls,
and leave function execution to the caller. Prefer `max_completion_tokens` when
provided and retain the existing legacy default otherwise.

Use reviewed schema projections for structural comparisons, retaining request and
response constraints, literal values and server origins while removing prose.
Keep accepted digests separate from current fetched documents. The scheduled
workflow has read-only repository permissions and needs no cloud credentials.

Review service contracts, Generative APIs and maintenance tooling in parallel.
Build an isolated Git snapshot containing only this non-Jev change and validate it
independently. Preserve the optional routing work in the original working tree.
Record the exact checks and live-read limits before creating the local commit.

## Design links and constitution check — 2026-09-20

This is a retrospective completion of the HOW record for
[spec requirements 1–7](spec.md#requirements), delivered in
[PR #80](https://github.com/feedback-loop-ai/mcp-scaleway/pull/80). The
[data model](data-model.md) reuses service types and defines maintenance records;
[refresh contracts](contracts/refresh.md) map the changed boundaries to references
and tests. [Tasks](tasks.md) distinguish original delivery from documentation
consolidation; [validation](validation.md) preserves its original measurements.

| Constitution concern | Design/evidence disposition |
| --- | --- |
| I/III: explicit contracts and traceability | Reuse service inputs and stable IDs; [refresh contracts](contracts/refresh.md) link the service references, parity metadata and transport regressions. |
| II: separate WHAT/HOW/VALIDATION | Spec, plan, data model, contracts and task/validation records are now linked. Original retrospective sequencing remains a [recorded governance limitation](../retrofit-compliance.md), not a retroactive pass. |
| IV/VII: failures and typed boundaries | Existing input/error boundaries are retained; complete runtime response validation was outside this original delivery and is addressed by [feature 064](../064-remaining-remediation/closure-map.md). |
| V/VI: proportionate design and feedback | Keep the stateless proxy architecture and reuse CLI tooling; [feature 063](../063-remediation-closeout/validation.md) records the subsequent source-restart and unit-timing checks. |
| VIII: regression and parity gates | Original frozen install, full configured coverage, parity and bounded live reads are recorded in [validation](validation.md); deeper catalog evidence is separately attributed to [064](../064-remaining-remediation/closeout.md). |

Research is reused from the [public-source disposition](upstream-review.md) and
[reviewed baseline policy](../../scripts/schema-baselines/README.md); usage is
maintained in the [repository README](../../README.md). No new storage model or
separate setup workflow requires duplicate research or quickstart documents.
