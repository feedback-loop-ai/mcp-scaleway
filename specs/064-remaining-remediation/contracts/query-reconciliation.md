# Query serialization reconciliation

Recorded before implementation, 2026-09-19 UTC. The authoritative wire harness
exposed missing required query values and an incorrect Instance pagination key.

- Instance v1 list endpoints serialize the existing MCP `page_size` as `per_page`.
- DNS required empty string filters (`name`, `domain`, deprecated `dns_zone`) are
  sent explicitly when unset; their source schema permits empty strings.
- Required boolean query switches are serialized explicitly: destructive switches
  (`with_additional_resources`, `release_ip`, `force`) default false. Discovery
  include-disabled/beta/deprecated switches default false. Domain availability
  uses strict search and includes the exact match, matching its single-domain input.
- Required organization/project scoping uses the configured defaults when the MCP
  override is omitted. Marketplace required zone uses configured default zone.
- Query parameters absent from a schema require further source investigation;
  they are not silently removed on that evidence alone.

Source methods/paths/parameter schemas and receipts reside in
`src/shared/response-contracts.json`. These changes preserve input overrides and
are tested through the actual HTTP transport plus focused handler regressions.

## Optional field evidence

Official published JS SDKs confirm one-of query fields omitted from OpenAPI for
Autoscaling, Billing, Dedibox, IAM, IPAM, Marketplace and Product Catalog. Supplemental
contracts retain those filters; source URLs, versions and digests are committed.
TEM's single `status` input maps to the `statuses` wire array query; VPN `isIpv6`
maps to query `ipv6`. DNS record sorting supports name_asc/name_desc; Registrar
domain sorting supports domain_asc/domain_desc.

NATS account `name` filtering and Webhosting offer `without_options`/`only_options`
filtering appear in neither the current service schemas nor the current official
published JS SDK request types/serializers. Their compatibility field names remain
visible but accept no supplied value (`z.never().optional()`), with an explicit
unsupported description. A caller receives invalid_input before HTTP rather than
silently losing the requested filter. This is an explicit 0.5.0 support restriction,
not proof of provider retirement. NATS still offers project scoping and name sorting;
Webhosting retains documented hosting/control-panel filters.
