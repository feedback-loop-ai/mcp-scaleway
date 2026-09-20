# Maintenance and package-check contracts

Retrospective consolidation, 2026-09-20, for the 2026-09-19 maintenance delivery in
[PR #81](https://github.com/feedback-loop-ai/mcp-scaleway/pull/81) (`4f4027c`).
This records implemented boundaries and verification links; it does not establish
that these contracts preceded the edits. Scope and record shapes are defined in
[spec.md](../spec.md) and [data-model.md](../data-model.md).

## Exact method/path comparison — requirement 1

`comparePublishedRoute(api, published)` splits only at the first `?`, returning the
unchanged method/path prefix, optional query suffix and exact membership result.
Hosts, namespaces, versions, case, template parameter names and trailing slashes
remain significant. A matching path does not validate query names, values or types.

The scoped query contracts are Registrar `GET /domain/v2beta1/tlds` with `tlds`
as an array of strings, and NATS
`GET /mnq/v1beta1/regions/{region}/nats-credentials` with string `nats_account_id`.
Their independently fetched source digests remain in
[validation.md](../validation.md#registrar-74-and-nats-75).

Implementation: [comparator](../../../scripts/route-comparison.ts) and
[reporter](../../../scripts/drift-report.ts).
Verification: [positive and negative route regressions](../../../tests/unit/scripts/route-comparison.test.ts).

## Webhosting diagnostic — requirement 2

`probeWebhosting` requires a nonempty secret key and a valid regional identifier;
region defaults to `fr-par`. It sends four bounded GET requests to a fixed Scaleway
origin, uses a ten-second deadline per request, does not follow redirects, discards
response bodies, and reports the legacy restore POST as skipped without sending it.
The investigated candidate URLs are historical diagnostic subjects, not advertised
or verified operation contracts.

- 2xx records a successful HTTP observation, without asserting response conformance.
- 404/410 cannot distinguish unknown routes, missing resources or access limits.
- Authentication refusals, rate limits, redirects, server errors, transport errors
  and deadlines remain inconclusive; exception contents are omitted.
- Each observation stands alone, including the published control read.
- CLI exit 0 means the diagnostic completed, regardless of observations. Missing
  or invalid configuration exits 1 with a fixed configuration message.
- Output includes no response body, header values, credentials or exception text.

Implementation and output types: [diagnostic](../../../scripts/probe-webhosting-404.ts).
Verification: [33 diagnostic regressions](../../../tests/unit/scripts/probe-webhosting.test.ts)
and [original evidence limits](../validation.md#webhosting-71-remains-open).
The subsequent actual Webhosting operation corrections belong to
[feature 064](../../064-remaining-remediation/endpoints.md).

## Source restart — requirement 3

`bun run dev` executes `bun --watch run src/main.ts`. Editing imported source
restarts the runtime, including its in-memory state. Existing MCP sessions are not
preserved: clients must reconnect, initialize and refresh tool listings. Startup
and discovery keep stdout reserved for JSON-RPC. This adds no automatic client-side
reconnection guarantee.

Configuration: [package scripts](../../../package.json).
Verification: the isolated imported-source edit, changed server version, new MCP
initialization and 191.97 ms observation are recorded in
[validation.md](../validation.md#development-reload-61). No cloud call established
that observation; the unit-only timing is a separate measurement.

## Installed-package verification — requirement 4

After building, `bun run scripts/smoke-packed.ts` creates a real npm tarball, checks
its six intended package entries, installs it into a temporary consumer with install
scripts disabled, imports the public library, and executes the installed Node binary.
It verifies gateway, flat and both modes against the full matrix-derived inventory,
following all discovery cursors and rejecting repeated cursors. The package version
must match; protocol errors and discovery stderr must be absent.

Child environment is restricted to PATH/HOME plus explicit mode and routing-off
configuration; cloud/model credentials are excluded. The consumer is removed in
a `finally` block. Package installation is not publication and may access the
package registry; it makes no cloud operation or model inference request.

Implementation: [packed smoke](../../../scripts/smoke-packed.ts).
Automation: [CI build job](../../../.github/workflows/ci.yml).
Recorded Bun/Node/SDK versions and listing sizes remain in the
[original package evidence](../validation.md#mcp-sdk-upgrade-64). The local Node
version differs from CI's pinned minimum; these are identified separately.

## Closure scope — requirement 5

The original checkpoints support issues #61, #64, #74 and #75. They did not close
Webhosting #71, all of epic #66, or the response/schema/logging/example findings.
[Feature 064's closure map](../../064-remaining-remediation/closure-map.md) records
the later resolved items and the six remaining provider-verification blockers.
This later cross-reference does not rewrite historical validation results or waive
the recorded SDD sequencing breaches.
