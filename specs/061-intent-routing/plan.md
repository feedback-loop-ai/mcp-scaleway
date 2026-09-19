# Engineering plan

## Composition

`createServer` composes the existing immutable registry with an optional router.
`src/routing/` owns provider contracts, Jev HTTP translation, intent selection and
MCP registration. `src/shared/mode.ts` parses explicit environment configuration.
Default server construction has no provider and adds no routing tool.
Explicit routing configuration may omit a provider; the routing tool then uses
local suggestions without external requests.

## Decision process

Build area descriptions from the enabled catalog. Ask the decision provider to
choose an area, retaining a small beam of plausible areas rather than greedily
committing to one. The next question selects among those areas' operation IDs and
explicit unsupported/workflow outcomes. Validate the distribution and its keys
against the supplied choices. Confidence and selected probability govern whether
a candidate is marked matched or ambiguous. They do not establish permission.
The operation question explicitly rejects substituting related metadata lookups
for requested contents, or reads for requested changes. Omit zero-probability
operations from provider candidates.

If credentials are absent or a provider request fails, is malformed, times out or
exceeds the choice limit, use deterministic local word/alias matching over the same
filtered registry. This English-oriented fallback returns suggestions requiring
review; it does not establish semantic equivalence. Candidates remain ambiguous and have no probabilities
or confidence. Return unavailable if no local candidate is found. Mark source,
reason and probability scope explicitly. Caller cancellation returns unavailable
with reason cancelled and skips fallback.

## External boundary

The TypeSafe adapter posts `model`, `state`, and `questions` to
`https://api.typesafe.ai/v1/systemone` using a separate API key. Pin the initial
model version, use a bounded abortable request and sanitize error output. Keep the
adapter outside Scaleway's operation fetch context; it has a fixed distinct origin.
The native API can round choice probabilities to hundredths, yielding totals such
as 0.99 or 1.01. Normalize only when every probability is exactly rounded to
hundredths and the total differs from one by at most 0.010000001, then run strict
shared decision validation. Larger or non-rounded errors and unknown IDs remain
invalid and trigger local fallback.

## Evaluation

Maintain checked-in labeled examples for paraphrases, context, cross-service ambiguity,
workflows, unsupported requests and filtered catalogs. Compare keyword search with a
simple alias baseline offline. An explicit live flag evaluates Jev without executing
any selected operation. Report inputs/metrics and avoid treating vendor confidence as
observed correctness. Save candidate details, confidence, source, reasons, catalog
and fixture fingerprints, calibration/scope and effective policy/model settings.
Count local fallbacks separately and fail live evaluation when any occurs. No
automatic threshold tuning on the evaluation cases.

## Validation

Use injected providers and fetch implementations for protocol and failure tests.
Exercise missing credentials, filtered local suggestions, provider failure, malformed
decisions, timeout, choice-capacity limits and cancellation. Separate live provider
observations from mocked coverage in [validation.md](validation.md). Scaleway API
and schema-monitoring validation belongs to
[062-scaleway-refresh](../062-scaleway-refresh/validation.md).
