# Research: Compact Operation Discovery

**Date**: 2026-09-05 (audit) / 2026-09-06 (retrofit)
**Source**: 18-agent audit (measurement, architecture, conventions, CI gates, SDK currency, MCP mechanisms, peer servers), three independent designs judged by three judges, three adversarial reviewers; artifacts under the project memory directory `audit-2026-09-05-discovery-tokens/`.

## Decision 1: Four-tool gateway as the default surface

- **Decision**: Expose `search`, `describe`, `read`, `call` by default; keep every operation reachable through them.
- **Rationale**: Measured baseline was 219,400 tokens per request (claude-opus-5 count_tokens, Claude Code tool shape) for 733 tools. Ablation showed input schemas were 72% of cost and a fixed ~42 tokens/tool API overhead (~31k total) that only fewer registered tools can remove. Three of three judges selected this design.
- **Alternatives considered**:
  - Schema/description slimming only: −28.5% measured; leaves ~157k per request. Rejected as default, kept as a projection step.
  - Per-area toolset filtering only: cost is flat across areas (top 10 areas = 36% of tools and 36% of tokens); `core` preset still ~48k. Kept as a filter, not the answer.
  - 50 per-area router tools with operation enums: measured 13,846 tokens, 9× the gateway; routers cannot carry per-operation read-only hints.
  - Client-side deferred tool loading: disabled by the host when the API base URL is a non-first-party gateway (the owner's setup); even when active, the floor is the names list (~18k). Not relied upon.
  - Dynamic enable/disable via list-changed notifications: withdrawn upstream by a peer project after clients failed to re-fetch.
  - tools/list pagination: clients aggregate all pages eagerly; zero model-token effect.

## Decision 2: Registry built by replaying existing registrars into a recorder

- **Decision**: Call the unchanged `registerAllTools` with a four-argument recorder to capture name, description, raw Zod shape and callback for every operation.
- **Rationale**: Keeps the 50 per-area files untouched; original validation and handlers remain the execution authority, so flat and gateway modes cannot diverge in behavior. 733 records captured in ~3 ms.
- **Alternatives considered**: Re-declaring operations in a separate manifest (drift risk, duplicate source of truth); reading the SDK's private registered-tools map (private API, brittle across SDK versions).

## Decision 3: Conservative schema projection

- **Decision**: Walk only schema positions; drop `$schema` and a fixed list of redundant boilerplate descriptions on pagination/region/zone fields; preserve enums, required, defaults, bounds, patterns, formats, unions, `$ref`s and record value schemas.
- **Rationale**: The audit's aggressive projection corrupted 21 record-valued schemas and dropped enum members; a reviewer showed user fields literally named `description` or `format` would be destroyed by key-based walking. Faithful contracts matter more than the marginal bytes in a four-tool default.
- **Alternatives considered**: Aggressive keyword stripping (rejected: broke validation semantics); no projection (rejected: SDK-injected boilerplate is pure noise).

## Decision 4: Endpoint confinement at the transport boundary

- **Decision**: Wrap the SDK client's fetch and the three raw-fetch handlers with a guard that checks the raw request path, method and host against the running operation's declared endpoint template(s) before any request; run every callback inside an async-local route context.
- **Rationale**: Independent reviewers reproduced, with intercepted transport, that an allowed read (`rdb_get_instance`) with `instance_id: "../../secret-manager/.../versions/1/access"` reached the excluded secret-access endpoint under read-only mode. 284 raw interpolation sites exist; the generated SDKs' `validatePathParam` rejects only empty strings. Per-field patches are unbounded; one choke point is not.
- **Alternatives considered**: Schema regex per identifier field (applied additionally for IAM and secret revisions, but insufficient alone); `encodeURIComponent` at each site (284 edits, still misses generated SDK code).
- **Verification**: Protocol tests replay every reviewer payload in gateway, flat and both modes with a fail-closed fetch; honest identifiers still reach exactly their declared endpoints.

## Decision 5: Read-only classification

- **Decision**: An operation is read-only iff every declared upstream leg is GET/HEAD and it is not on an explicit deny list. Deny list contains secret-version access (can consume/disable/delete ephemeral secrets).
- **Rationale**: "Cannot change cloud state" is the property operators mean by read-only; data sensitivity is orthogonal and handled by exclusions and upstream IAM (Clarification Q1).
- **Alternatives considered**: Verb-name heuristics (misclassified four GET operations with non-list/get verbs); withholding all credential-returning reads (would make read-only mode unusable for kubeconfig and similar routine reads).

## Decision 6: Filters are one immutable predicate

- **Decision**: Areas/presets/explicit/exclusions/read-only resolve at startup to a single allowed-set applied to listing, search, describe, read, call and flat registration; invalid or empty selections fail startup.
- **Rationale**: Any surface that consulted a different set would be a bypass. Fail-closed startup prevents a typo from exposing everything.
- **Alternatives considered**: Per-surface filtering (rejected: divergence risk); permissive defaults on unknown values (rejected: silent exposure).

## Decision 7: Public SDK listing override

- **Decision**: After all registrations, replace the tools/list handler via the public `setRequestHandler` with our own projected definitions; leave tools/call to the SDK.
- **Rationale**: The SDK's list handler injects boilerplate on every tool; overriding via public API avoids private fields (v1.25 through v1.30 verified identical).

## Decision 8: Release as 0.4.0 breaking, flat mode retained for 0.x

- **Decision**: Default flip in a minor bump with CHANGELOG migration notes; `SCW_MCP_MODE=flat` retained for the whole 0.x series (Clarification Q3). Owner chose GA over a beta stage.
- **Rationale**: Published package with external users; a one-line escape hatch turns a forced rewrite into a scheduled one.

## Open items carried forward

- Exact post-change token count on an Anthropic-served route (all attempts returned 503 from the provider pool). Bytes are the measured guarantee.
- Whether the host forwards tool annotations to the model is undocumented; treated as host UX only.
