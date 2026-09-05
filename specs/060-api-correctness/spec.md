# Scaleway API correctness repairs

Approved scope: resolve verified transport errors and migrate dead/deprecated Autoscaling, Containers and Public Gateway endpoints before discovery optimization. Source API reference updates are maintained per area under specs/scaleway-api/.

## Required behavior

- Relative SDK paths begin with one slash and produce the correct Scaleway host.
- SDK requests use ScwRequest, not fetch-compatible Request or Response assumptions.
- JSON bodies carry Content-Type and authentication comes from the SDK transport.
- SDK status errors retain their status in the MCP error envelope.
- Empty upstream responses produce protocol-valid MCP text.
- Generated SDK pagination receives camelCase pageSize and sends page_size on the wire.
- No registered operation advertises a fabricated or retired endpoint. Removed operations receive migration notes, not silent remapping.
- All regression requests run against an injected HTTP client with dummy credentials. Passing tests are not proof of live provisioning success.

## Breaking changes

Removed Public Gateway v1 DHCP operations, migrated Autoscaling v1alpha2 group/template/policy contracts and Containers v1 contracts must be released on a prerelease/minor path, not as a compatibility patch. The separate correctness PR does not authorize publishing or cloud provisioning.
