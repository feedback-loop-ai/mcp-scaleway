# scaleway_route contract

Optional MCP meta-tool. Enabled only by explicit router configuration. No Scaleway
API endpoint mapping: its optional external dependency is TypeSafe evaluation, and
its output is a recommendation over the existing filtered operation catalog.
Default gateway discovery has four tools; enabled routing adds the fifth. Missing
TypeSafe credentials do not prevent startup and select local matching instead.

Input: `{ intent: string, context?: string, limit?: number }`.

- Intent: nonempty, at most 2048 characters.
- Context: at most 2048 characters; supplied by the caller, never automatically
  populated with cloud credentials or resource payloads.
- Limit: integer from 1 through 5.

Output: structured JSON text containing `status`, `source`, `candidates`,
`catalogVersion`, `calibration: "uncalibrated"`, `probabilityScope`, `providerCalls`,
and optional `confidence`, stable diagnostic `reason`, model and usage receipts.
Each candidate includes `op`, `area`, `description`, `readOnly` and `required`.
Provider candidates also include `probability`, with `source: "provider"` and
`probabilityScope: "selected_areas"`; these probabilities are conditional on the
selected areas and are uncalibrated.
Provider candidates with zero probability are omitted. Selection instructions
reject related metadata lookups for requested contents and reads for requested changes.

Missing credentials, errors, malformed provider decisions, timeouts and capacity
limits yield filtered local suggestions: `source: "local"`,
`probabilityScope: "not_applicable"`, and no confidence or candidate probabilities.
Reason is `provider_not_configured`, `provider_unavailable` or `catalog_capacity`.
Candidates are always `ambiguous`; an empty local result is `unavailable`. Local
matching uses deterministic English-oriented words/aliases, requires caller review
and does not establish semantic equivalence. Explicit caller cancellation returns
`unavailable` with `reason: "cancelled"`, no candidates and no local fallback.
Routing never executes an operation on any path.

Outcomes:

| Status | Caller action |
| --- | --- |
| matched | Describe the selected operation and gather/validate parameters. |
| ambiguous | Inspect candidates or provide more precise context. |
| unsupported | Use local discovery or another capability. |
| needs_plan | Decompose the task before routing individual steps. |
| unavailable | Inspect the reason, use search/describe or retry if appropriate. |

Example input: `{ "intent": "Show my Kubernetes clusters" }`.
Example candidate ID: `k8s_list_clusters`. Routing does not retrieve those clusters.

TypeSafe wire contract: `POST https://api.typesafe.ai/v1/systemone`, bearer auth,
body `{ model, state, questions: { route: { type: "choice", instructions,
criteria } } }`; response `answers.route` contains `choice`, `probabilities`
and `confidence`. See https://docs.typesafe.ai/api and
https://docs.typesafe.ai/primitives/choice. The concrete question ID is adapter-owned.
Native probabilities rounded to hundredths may total 0.99 or 1.01. The adapter
normalizes only if every value is exactly rounded to hundredths and the total
differs from one by at most 0.010000001, before applying shared strict validation.
Larger or non-rounded sum errors and unknown IDs still trigger local fallback.

Contract tests must cover default/opt-in discovery, input bounds, filtering, valid
decisions, unknown IDs, abstention, missing credentials, local fallback, provider
failures, cancellation and sanitized errors. Live evaluation retains source/fallback
diagnostics and exits nonzero on any fallback, unavailable result or disallowed candidate.
