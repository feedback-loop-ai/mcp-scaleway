# Delivery checkpoints

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
