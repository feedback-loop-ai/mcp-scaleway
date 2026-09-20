# Jev routing validation

Historical evidence for [PR #80](https://github.com/feedback-loop-ai/mcp-scaleway/pull/80)
(`844cb8e`), merged 2026-09-19. Added at SDD closeout on 2026-09-20: the measurements
below retain their original dates and development-set limitations.
[Feature 064](../064-remaining-remediation/closeout.md) records later availability
filtering and structured MCP output changes; it does not replace this live evaluation
with a held-out benchmark.

Verified on 2026-09-19 with Bun 1.3.14 and Node 22.23.2. Scaleway service updates
are a separate signed commit (`dbebf66`), recorded in
[062-scaleway-refresh](../062-scaleway-refresh/validation.md).

## Automated checks

- Full suite: **6,243 tests across 156 files passed**; configured lines, branches,
  statements and functions are all **100% covered**.
- Focused routing/configuration/evaluation checks: **80 tests passed**.
- Lint, strict TypeScript checking, bundled Node build, gateway parity and
  documentation parity passed.
- Default routing is off and exposes four gateway tools. Explicitly enabled
  routing adds `scaleway_route`; a missing key starts a local-only router.
- Native HTTP 401, 403, 429 and 503 responses, malformed decisions, provider
  rejection and deadline expiration produce local suggestions without failing
  the MCP call. Caller cancellation returns no suggestions and skips fallback.
- Local fallback preserves toolset, read-only and exclusion filters, never calls
  an operation callback, and never reports a match, model confidence or probability.
- The built Node stdio server is checked in disabled, missing-key and live-key
  configurations. Disabled mode exposes four tools; missing-key mode exposes five
  and returns local suggestions with zero provider calls; live mode routes through Jev.

## Final live evaluation

The final 38-case run completed at **2026-09-19T15:38:07.451Z** using native
`POST https://api.typesafe.ai/v1/systemone` and pinned model `jev-1.13.0`.
Both acceptance thresholds remained **0.8**, the total provider deadline **5,000 ms**,
and the candidate limit **3**. No selected Scaleway operation was executed.

Fixture SHA-256:
`0acc8f19f98bb3ef199aa65d48906459f53b6fd25cc59c2104277e655721d9e8`.

| Metric | Result |
| --- | --- |
| Cases / single-operation cases | 38 / 30 |
| Expected top candidate on single-operation cases | 29/30 (96.7%) |
| Recall among first three candidates | 29/30 (96.7%) |
| Exact outcome status | 32/38 (84.2%) |
| Correct accepted matches | 27/27 (100% in this development run) |
| Accepted coverage | 27/38 (71.1%) |
| Local fallbacks / unavailable / disallowed IDs | 0 / 0 / 0 |
| Latency median / p95 | 553 ms / 790 ms |
| Provider HTTP calls | 71, all HTTP 200 |
| Reported input / output tokens | 323,511 / 29,938 |

There were 27 matched, seven ambiguous, three unsupported and one needs-plan
results. The single-operation miss was an abstention without a candidate for
disabling a container's default public endpoint. Secret listing and key-rotation
listing had the right top candidate but remained below the confidence threshold.
Filtered writes, excluded secret-value access and multi-step cleanup also abstained
rather than producing the fixture's more specific unsupported/needs-plan label.

For comparison, direct keyword search achieved 10.0% top-1 and 13.3% recall@3;
the simple alias comparator achieved 43.3% top-1 and 70.0% recall@3. These baselines
feed natural language directly into retrieval; they do not measure an MCP client's
query rewriting or end-to-end task success. The production local fallback has
stricter suggestion semantics than the alias comparator and never accepts matches.

## Findings resolved during live testing

The initial smoke authenticated successfully and selected `instances_list_servers`.
Earlier benchmark runs exposed two issues:

1. A response contained hundredth-rounded probabilities totaling 0.99, causing
   strict validation to use local fallback. The native adapter now normalizes only
   hundredth-rounded totals within one percentage point of 1. Larger deviations,
   other precision, unknown IDs and inconsistent winners still fail validation.
2. A secret-metadata lookup was accepted for a secret-value request when the value
   access operation was excluded. Generic selection instructions now explicitly
   reject substituting related metadata or read operations for the requested action.
   The final run abstained on that case. This is observed improvement, not proof
   that a model can never make that mistake.

Zero-probability candidates are omitted. The evaluation records source, fallback
counts, effective settings, confidence, candidates, reasons and catalog/fixture
fingerprints; a live run exits nonzero if any local fallback hides a provider failure.

Before live scoring, the unrelated fixture changed from translation to sending a
Slack message: translation is a legitimate capability of the Generative APIs tool.
The same corrected 38 cases were used during development and repeated evaluation.
They are **not a held-out production benchmark**. Thresholds remain uncalibrated;
the observed 27/27 accepted precision does not establish universal correctness.
Token receipts describe usage, not a verified billing amount.

## Evidence and limits

Sanitized artifacts are retained locally under `.forge/reports/live-jev/`:
`evaluation-final.json`, `telemetry.json`, `stdio-smoke.json` and `final-tests.log`.
Earlier runs remain in `evaluation.json`, `evaluation-before-rounding-fix.json`
and their diagnostic artifacts. Credentials are in the ignored local MCP config,
not these reports or tracked files.

Reproduce with `bun run eval:routing --jev --output=/tmp/routing-jev.json` when
`TYPESAFE_API_KEY` is available to that process. The explicit live flag incurs
provider inference usage. Tests and fallback checks need no Jev credential.
No cloud mutations, provisioning or automatic execution were performed.
