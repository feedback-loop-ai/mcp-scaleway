# Optional intent routing

Date: 2026-09-19. Status: implemented; validation recorded in validation.md.

## User value

An MCP client can submit a natural-language infrastructure request and receive the
most relevant allowed operation IDs, without loading every operation schema.
Jev is an external TypeSafe decision provider. It is not a Scaleway-hosted model.
Existing clients retain the four default gateway tools and offline discovery.

## Requirements

1. Add an explicitly enabled `scaleway_route` meta-tool. It selects operations and
   never invokes their callbacks or supplies execution authorization.
2. Use the already filtered operation registry as the sole candidate authority.
   Read-only and exclusion filters constrain all model choices and returned IDs.
3. Abstract the decision provider so integrations and offline tests can replace Jev.
   The Jev adapter uses its native `/v1/systemone` protocol and separate credentials.
4. Select areas first, retain several plausible areas, then select an operation.
   Each question has at most 255 options, including explicit abstention/workflow options.
5. Bound input lengths and duration. Validate provider answers. Model errors,
   malformed replies and timeouts use local suggestions; caller cancellation stops
   routing without fallback. None of these paths can result in execution.
6. Expose ambiguity, unsupported requests and multi-step work as distinct outcomes.
   Report thresholds as uncalibrated until evaluated on representative held-out data.
7. Send only the supplied intent/context and public catalog descriptions to Jev.
   Never read cloud credentials or resource contents to populate routing state.
8. Return a catalog fingerprint; the caller retrieves authoritative schemas through
   describe and supplies arguments through existing read/call tools.
9. Provide repeatable offline baseline evaluation and an explicit live Jev mode.
   Measure selection accuracy, recall, abstention, latency and model usage when available.
10. Missing credentials and provider choice-capacity limits also use local suggestions.
    Return their source and reason; local matches are always ambiguous, without model
    confidence or probabilities. Return unavailable when local matching finds nothing.
    Local matching is deterministic and English-oriented, and requires caller review.
11. Preserve per-case diagnostics, inputs, catalog/fixture versions and effective policy
    in saved evaluation reports. Any local fallback fails an explicit live Jev evaluation.

## Related currency work

The independently completed API corrections, new Scaleway capabilities, Generative
APIs function calling, schema monitoring and dependency updates are tracked in
[062-scaleway-refresh](../062-scaleway-refresh/spec.md). They are not prerequisites
for configuring Jev credentials and are not delivered as part of this routing feature.

## Acceptance

- Default discovery performs no model requests and still exposes exactly four tools.
- An injected provider can select a valid operation through the optional tool.
- Disallowed and unknown IDs cannot escape the filtered registry.
- Enabling routing without a key starts successfully and returns local suggestions.
- Provider failure and capacity fallback remain filtered and never claim a match or
  calibrated probability; caller cancellation returns no candidates and no fallback.
- Parameter gathering, planning and execution remain caller responsibilities.
- Unit/contract tests, full configured coverage, lint, typecheck, build and parity pass.
- Live model/cloud verification is reported separately from mocked contract coverage.

## Scope

No autonomous workflow executor, provider-generated URLs, automatic cloud mutations,
vector database or multi-tenant credential system is introduced. Optional routing
can make documented external inference requests when explicitly invoked with a
provider configured.

## SDD closeout clarification — 2026-09-20

All eleven listed requirements are required acceptance scope with equal priority
within this feature; routing remains optional for operators. This is a dated
clarification, not evidence of prior product approval.

Delivered together with the separate Scaleway refresh in
[PR #80](https://github.com/feedback-loop-ai/mcp-scaleway/pull/80) (`844cb8e`).
The [plan](plan.md), [data model](data-model.md), [routing contract](contracts/route.md),
[checkpoints](tasks.md) and [validation](validation.md) retain the WHAT/HOW/VALIDATION
record. [Feature 064](../064-remaining-remediation/closeout.md) subsequently adds
availability filtering and structured MCP envelopes. The original Jev development
evaluation remains historical and does not become a held-out accuracy benchmark.
