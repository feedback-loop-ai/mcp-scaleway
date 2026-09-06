# Changelog

## Unreleased

Specification retrofit (features 059 and 060) records the shipped 0.4.x behavior and adds
targeted conformance fixes. Full constitutional compliance remains blocked by the explicit
findings in specs/retrofit-compliance.md. Runtime changes in this pass:

- Gateway surface now returns a single consistent error envelope `{error:{type,message,statusCode},...}`
  (shared with the legacy `ApiError` types) instead of an ad-hoc string, for validation failures,
  unknown/disabled operations, read refusals and unexpected errors. Flat/combined modes keep the
  MCP SDK's native validation-error format for legacy compatibility.
- `unsupported_operation` (HTTP 501) added to the shared error-type enum, formalizing the containers
  "no faithful v1 equivalent" responses.
- IAM create/update/delete rule endpoints are declared as their real `GET + PUT` composite in the
  parity matrix; the route guard derives all legs from that declaration with no per-operation override.
- Lookup suggestions for unknown identifiers now rank by identifier-token overlap first, so a mistyped
  operation surfaces the intended one (e.g. `iam_create_rules` → `iam_create_rule`).
- 38 operation descriptions authored in 0.4.0 (autoscaling, containers, deprecated cockpit) now include
  a usage example, satisfying the Constitution I requirement for new/changed tools.
- `src/main.ts` coverage exclusion removed and the entry point covered; coverage is 100% line and branch
  with no exclusions.
- New CI gates: whole-catalog real-transport smoke, migrated-area transport proofs, supported-version
  inventory check, and README/matrix/metadata documentation parity.

## 0.4.1

No runtime changes. Releases are now published to npm through Trusted Publishing (GitHub OIDC) with provenance instead of a long-lived token.

## 0.4.0

Breaking release: the default tool surface, several Scaleway API contracts and the Node minimum change. Set `SCW_MCP_MODE=flat` to keep the legacy tool names.

### Compact discovery

- Four default tools: search, describe, read and call, covering every supported operation.
- Stable operation IDs, bounded search pagination, faithful schemas and original asynchronous validation.
- SCW_MCP_MODE=flat preserves supported legacy names; both mode combines surfaces.
- Immutable toolset/additive-name/exclusion/read-only filters govern discovery and execution.
- Endpoint confinement: every dispatched request is checked on its raw path against the operation's declared endpoint before HTTP, so identifier fields cannot traverse to excluded, cross-area or mutating endpoints (found in review; also constrains IAM identifiers and secret revisions at the schema level).
- Generated runtime metadata and gateway contract-test parity gates prevent drift.
- Enabled CI for slash-named branches and stacked pull requests, which the previous branch filters skipped.
- Fixed package imports to resolve to a bundled server module, without starting stdio on import.
- No SDK private-field dependency and no requirement for client-side deferred loading.
- Measured listing: 2,162 bytes plus 1,233 instruction bytes, versus 554,857 listing bytes in current flat mode. Exact post-change token recount was unavailable because the configured provider pool returned 503; these bytes are not claimed as token counts.
- Conservative schema projection retains validation semantics. The earlier aggressive flat-mode estimate is not an implemented guarantee.



### API correctness and migrations

This change was released as part of 0.4.0 (breaking minor).

- Fixed malformed SDK URLs caused by missing leading slashes across product areas.
- Fixed RDB and Elastic Metal request construction, Containers authentication, SQS response parsing, SDK error status mapping and SDK-backed pagination.
- Added JSON Content-Type headers and corrected InterLink routing-policy HTTP 204 responses.
- Moved Elastic Metal flexible IP operations to `/flexible-ip/v1alpha1/.../fips` while retaining their existing tool names and singular server filter input.
- Migrated Autoscaling groups to v1alpha2 and templates to Instance v2alpha1. Standalone policy operations are removed: configure the embedded group policy. Group listing uses token pagination. New operations expose group servers, alerts and template cloud-init.
- Migrated Containers to v1. Existing memory input remains MiB and converts to bytes; CPU uses the documented v1 millicore field. Cron operations use triggers. Responses use the upstream v1 field names. Unsupported HTTP mode and trigger-retargeting combinations return explicit errors rather than silently changing semantics.
- Removed Public Gateway v1 DHCP tools. Configure networking through supported v2/IPAM surfaces.
- Removed legacy Containers deploy/create-token/delete-token tools. v1 applies create/update configuration automatically and does not expose the old token endpoints. A force-redeploy action is not a semantic replacement for staged deployment.
- Marked deprecated Cockpit operations and made Apple Silicon credentials lazy, so tool discovery does not require cloud credentials.
- Aligned sdk-client with the installed product SDK peer requirements and raised the Node minimum to 20.20.2.
- Fixed the MCP server version announcement to match package metadata.

### Verification scope

Real SDK HTTP-boundary tests use dummy credentials and injected transports. They verify URLs, headers, query/body serialization, parsed responses and error handling without provisioning cloud resources. Unit/contract coverage is not a claim of live end-to-end Scaleway validation.
