# MCP discovery, result, trace and health contracts

Recorded before implementation on 2026-09-19 for issues #59, #60 and #65.

## Examples

Every supported operation has a deterministic synthetic example, stored in a generated
catalog and validated with its registered strict Zod input schema. Generation fails on
unsupported schemas or invalid values; it never invokes an operation or reads credentials.
`scaleway_describe` exposes `examples: [{params: {...}, synthetic: true}]`; flat/both tool
descriptions append the same example as JSON with a synthetic-value notice. Examples are
input-shape demonstrations; IDs and values do not identify existing cloud resources.
The CI catalog test rejects missing, extra and schema-invalid examples.

## Structured output

All registered gateway, flat and optional routing callbacks add an MCP `structuredContent`
envelope `{format, data}` while retaining existing `content`, `_meta` and `isError`.
`format: "json"` means a single text block parsed as JSON; `"text"` means that text was
not JSON; `"content"` means the original result contained zero, multiple or non-text
blocks and `data` is the content array. The published shared `outputSchema` validates
this envelope, not a Scaleway resource. Operation descriptions expose that output schema.
The independent upstream wire validators define resource response correctness; this
MCP envelope does not claim to validate upstream resources. Handler errors also receive
structured output; native SDK request/input-validation errors retain SDK behavior.

## Dispatch traces

Each dispatched gateway, flat or routing callback emits exactly one JSON line on stderr:
`{event:"operation", op, outcome:"success"|"error", durationMs}`. A known operation ID
is used for execution; discovery/routing use their registered tool name. Unknown or
malformed operation IDs are never copied into logs. Outcomes follow `isError` and thrown
failures. Parameters, returned content, exception text, credentials and user-controlled
identifiers are excluded. MCP SDK validation failures that prevent callback dispatch
retain native SDK behavior and do not fabricate an operation trace. Logging failures
must not change a tool result or obscure its original failure.

## Local health

`--health` constructs the configured registry and MCP tool registrations, closes the
unconnected server and exits. It emits one JSON status on stdout and exit 0 on success;
invalid configuration emits a sanitized failure status and exit 1. It constructs no
stdio transport, reads no cloud credential file, performs no network/cloud/provider
request and makes no claim about Scaleway availability. Jev remains optional and its
missing key uses the existing local fallback. Normal startup failures emit sanitized
JSON on stderr with no raw exception; no new MCP health tool changes the default four.

## Discovery byte accounting

The representative search-to-describe benchmark now counts serialized MCP tool results,
including both legacy text and structured output; JSON-RPC framing is excluded. Previous
measurements counted only the first text block. On 2026-09-20 the flow is 739 + 3335 =
4074 bytes; its explicit budget is 6144 bytes. The default four-tool listing is 3516
bytes. These are byte measurements, not model token counts or execution savings.

## Temporarily unavailable operations

The committed unverified-operation manifest supplies optional `availability` metadata
in search/describe and a flat-description notice. Such IDs remain discoverable and
callable for a local 501 response, but both provider choices and local routing exclude
them. A selection containing only unavailable IDs returns a local unavailable routing
result with `reason: "no_available_operations"` and zero provider calls. This restriction
is an explicit contract-verification blocker; it does not assert API retirement.
