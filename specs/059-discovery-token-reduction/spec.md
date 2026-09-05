# Compact operation discovery

Status: implementation approved 2026-09-05. API correctness repairs precede the discovery release.

## Problem and acceptance

The original 733-tool catalog measured 219,400 input tokens on the audited Opus route. Schema-only compaction cannot remove the per-tool overhead. Serve four gateway tools by default while retaining every supported operation through a stable operation ID and the original validation/handler.

- Default tools/list contains only search, describe, read and call, independent of catalog size.
- All supported operations remain discoverable with bounded, paginated search. No silent truncation.
- Describe returns faithful input types, required fields, enum values, defaults, unions and record value schemas.
- Original Zod parsing and handler error semantics remain enforced on execution. No arbitrary HTTP, shell or code evaluation.
- Read refuses operations outside the reviewed GET/HEAD metadata set before calling a handler.
- Toolset, explicit tool, exclusion and read-only filters govern discovery AND execution in every mode.
- Flat mode retains supported legacy tool names. Both mode adds gateway tools to the selected flat catalog.
- Generated runtime metadata must match the parity matrix; each gateway tool must have a contract-test mapping.
- Network-free tests enforce full line/branch coverage and discovery size budgets. Report token counts separately from byte counts.

## Release

API removals/migrations and the gateway default are breaking changes for the 0.x package. Stage 0.4.0-beta.0 for review; do not tag, publish, merge, or change the user's running MCP config automatically. Keep SCW_MCP_MODE=flat as the migration path. Schema slimming is a separate implementation step, not a claim that the combined breaking branch is patch-compatible.
