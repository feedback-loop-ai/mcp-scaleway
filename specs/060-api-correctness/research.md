# Research: Scaleway API Correctness Repairs

**Date**: 2026-09-05 (audit and probes) / 2026-09-06 (retrofit)

## Decision 1: Fix in place; do not adopt product SDKs in this change

- **Decision**: Correct request construction inside existing handlers.
- **Rationale**: 45 of 50 areas hand-roll REST; migrating them to official packages is a multi-week rewrite. The correctness bugs were blocking everything else and were mechanical to fix once the SDK contract was established empirically.
- **Alternatives considered**: Full SDK adoption (deferred as follow-up); leaving handlers as-is behind a compatibility shim (rejected: the shim would have to reproduce the SDK's URL join anyway).

## Decision 2: The SDK client contract, established by probe

- **Finding**: `client.fetch({method, path, body?, headers?, urlParams?})` builds `new Request(`${apiURL}${path}`)` verbatim, so a path without a leading slash yields `https://api.scaleway.comaudit-trail/...`. Responses resolve to parsed bodies (204 → undefined); non-2xx throws `ScalewayError` with numeric `.status`. The SDK does not add Content-Type. `createClient({httpClient})` silently ignores the option; only `createAdvancedClient(withHTTPClient(...))` injects transport.
- **Consequence**: 15 areas with unslashed prefixes (~220 tools), 4 areas treating results as `Response`, 1 area bypassing auth via global fetch, and the error mapper reading only `.statusCode` were all broken live while passing mocked tests.

## Decision 3: Real-transport tests as the proof standard

- **Decision**: New contract tests build the real client with `createAdvancedClient(withProfile(dummy), withHTTPClient(recorder))`, stub global fetch to throw, and assert the recorded request.
- **Rationale**: Every previous test mocked `client.fetch` itself, which is the layer that was wrong; mocks encoded the bug. A whole-catalog harness confirmed 724/724 operations construct authenticated, well-formed requests.
- **Alternatives considered**: Live tests against a sandbox (kept manual; CI must not need credentials); schema-only contract tests (insufficient for transport bugs).

## Decision 4: Remove retired operations rather than stub them

- **Decision**: Delete DHCP (v1 removed 2025-11-03) and container deploy/create-token/delete-token (no v1 equivalent); document replacements.
- **Rationale**: Constitution III forbids invented abstractions; the parity gate requires a real endpoint per operation; stubs mislead discovery (Clarification Q1).
- **Alternatives considered**: `api: null, supported: false` matrix entries with unsupported-result handlers (prototyped, rejected).

## Decision 5: Autoscaling v1alpha2 with preserved tool names

- **Decision**: Keep `scaleway_autoscaling_*_instance_group*` names for groups (upstream renamed the resource), drop the five standalone policy operations (policy is now embedded), add servers/alerts/cloud-init operations that moved.
- **Rationale**: v1alpha1 returned 404 for every call; names preserved where an equivalent exists, per the compatibility principle.
- **Source of truth**: `@scaleway/sdk-autoscaling@2.11.1` generated API and the published OpenAPI schema.

## Decision 6: Containers v1 with unit-preserving conversion

- **Decision**: Keep MiB memory inputs and convert to bytes; use millicore CPU field; map crons to triggers; explicit errors for HTTP-option and trigger-retarget combinations with no v1 equivalent.
- **Rationale**: Silent unit reinterpretation would break existing callers (Clarification Q2); force-redeploy is not staged deploy (FR-010).
- **Source of truth**: `@scaleway/sdk-container@2.13.1` and the v1 OpenAPI schema.

## Decision 7: Flexible IPs relocated to their API

- **Finding**: `/baremetal/v1/zones/{zone}/ips` does not exist upstream (404); flexible IPs live at `/flexible-ip/v1alpha1/zones/{zone}/fips` with `server_ids` array filter and `flexible_ips` response key.
- **Decision**: Retarget the three operations, keep names and singular `server_id` input (mapped to a one-element array).

## Decision 8: sdk-client 2.x and Node 20.20.2

- **Finding**: Installed product SDKs declared peer `@scaleway/sdk-client ^2.2.1` and `node >=20.19.6`; the repo pinned client 1.x and Node 18.
- **Decision**: Bump client to ^2.7 and raise the engines floor; frozen lockfile verified under CI's pinned Bun.

## Open items

- Manual live smoke against a sandbox project (not automated by design).
- Product-SDK adoption as the structural fix for hand-rolled transport.
