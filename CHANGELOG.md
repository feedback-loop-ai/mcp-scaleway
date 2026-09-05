# Changelog

## Unreleased

### API correctness and migrations

This change requires a prerelease/minor release, not a compatibility patch. No release has been published from this branch.

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
