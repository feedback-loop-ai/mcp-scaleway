# Implementation plan and final design

- Extract exact route comparison from the drift reporter. Split only the query
  suffix; preserve namespaces, hosts, methods, case and parameter names. Keep query
  text visible, without claiming that path matching validates parameter contracts.
- Keep the Webhosting CLI explicit and credential-dependent, but send GETs only.
  Report restore POST as skipped, use deadlines and no redirect following, discard
  response bodies, and sanitize transport failures. Each observation stands alone.
- Use Bun `--watch` for development restart. Verify a real imported-source edit in
  an isolated copy, then initialize a fresh MCP session; document reconnect needs.
- Build, pack, install the real tarball in a temporary consumer, import its public
  library and enumerate gateway/flat/both tools through the installed Node executable.
  Keep cloud/model credentials out of child environments and remove the temporary
  installation afterward. Run this under CI's Bun 1.3.6 and Node 20.20.2.
- Test false-positive and genuine mismatch cases plus HTTP diagnostic uncertainty.
  Preserve full source coverage and measure the unit-only timing separately.

The route reporter and diagnostic remain review aids rather than proof of live
contract compatibility. Full endpoint schema validation is still tracked by #62/#63.

## Design links and constitution check — 2026-09-20

The preceding plan records the original PR #81 checkpoint; its open-issue statements
are historical. [Feature 064](../064-remaining-remediation/closure-map.md) records
the later response-validation work and remaining blockers.

For [requirements 1–5](spec.md#requirements), the retrospectively consolidated
[data model](data-model.md) defines comparator, diagnostic and package-check records,
while [maintenance contracts](contracts/maintenance.md) specify their behavior.
The [task evidence](tasks.md) and [original validation](validation.md) retain the
2026-09-19 results from [PR #81](https://github.com/feedback-loop-ai/mcp-scaleway/pull/81).

| Constitution concern | Design/evidence disposition |
| --- | --- |
| I/III: explicit boundaries | Diagnostic conclusions, exact route matching and installed-package behavior have [maintenance contracts](contracts/maintenance.md). No new MCP/cloud endpoint is introduced. |
| II: separate roles | Spec, plan, model, contracts and task/validation records separate WHAT/HOW/VALIDATION. Retrospective authorship remains explicit; see the [governance ledger](../retrofit-compliance.md). |
| IV/VII: safe failure handling | Bounded GET-only diagnostic, sanitized failures and credential-free package children; [diagnostic regressions](../../tests/unit/scripts/probe-webhosting.test.ts) verify the cases. |
| V/VI: reuse and feedback | Reuse Bun watch and MCP initialization; the [isolated restart and unit timing](validation.md#development-reload-61) establish their bounded behavior. |
| VIII: evidence before closure | [Validation](validation.md) distinguishes source/query proof, offline diagnostics, packaged discovery and coverage; later full endpoint depth belongs to [064](../064-remaining-remediation/closeout.md). |

The source-investigation receipts already live in [validation.md](validation.md);
the [README](../../README.md) maintains the restart/packed-check usage. This
stateless maintenance change needs no duplicate research or quickstart narrative.
