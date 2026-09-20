# Delivery checkpoints

Original delivery checkpoints for [PR #80](https://github.com/feedback-loop-ai/mcp-scaleway/pull/80)
(`844cb8e`), 2026-09-19. The [spec](spec.md), [plan](plan.md),
[data model](data-model.md), [contract](contracts/route.md) and
[validation](validation.md) form the feature's SDD record. This handoff link was
added on 2026-09-20; subsequent catalog availability and output-envelope work is
recorded in [feature 064](../064-remaining-remediation/closure-map.md).

- [x] Define product scope, architecture and routing contract.
- [x] Implement provider-neutral router and opt-in Jev adapter.
- [x] Start enabled routing without credentials using local suggestions.
- [x] Add filtered local fallback for provider failures, malformed decisions, timeouts and capacity limits.
- [x] Preserve explicit cancellation without fallback and omit model scores on local suggestions.
- [x] Add routing evaluation fixtures and offline/live runner.
- [x] Preserve evaluation diagnostics and effective settings; fail live runs on local fallback.
- [x] Update user-facing routing configuration and contract documentation.
- [x] Pass lint, typecheck, tests, coverage, parity and build.
- [x] Record evaluation scope and live verification limitations.

Validation evidence and remaining limitations are recorded in [validation.md](validation.md).
The separate Scaleway API, SDK, schema-monitoring and operation-reference delivery
is tracked in [062-scaleway-refresh](../062-scaleway-refresh/tasks.md).
