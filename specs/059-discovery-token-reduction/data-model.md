# Data Model: Compact Operation Discovery

All state is built once per server process and is immutable thereafter. Nothing is persisted.

## Entities

> Naming map to spec Key Entities: OperationMetadata + Operation = the spec's **Operation**; OperationRegistry = **Operation Registry**; ToolsetConfig = **Filter Configuration**; ServerMode = **Surface Mode**; DiscoveryPage = **Discovery Page**; RouteContext/RouteMatcher = **Endpoint Declaration**. Preset and ValidationErrorResult are implementation detail of Filter Configuration and FR-017 respectively.

### OperationMetadata (generated, bundled)

| Field | Type | Rules |
|---|---|---|
| tool | string | Legacy tool name; matches `^scaleway_[a-z][a-z0-9_]+$`; unique across the catalog |
| area | string | Product area slug; matches `^[a-z][a-z0-9-]*$` |
| api | string | Declared upstream endpoint(s): `METHOD /path` or `METHOD https://host/path`; composites joined by ` + `; parenthesised notes allowed |
| readOnly | boolean | Derived: every leg GET/HEAD and not in the deny list; recomputed and asserted at registry build |

Source: `tests/parity-matrix.json` (excluding its `meta` key) via a pure derivation; committed as `src/gateway/operations.json`; CI asserts committed == fresh derivation.

### Operation (runtime)

Extends OperationMetadata with:

| Field | Type | Rules |
|---|---|---|
| op | string | Stable identifier = `tool` without the `scaleway_` prefix |
| description | string | From registration; first line, max 180 chars, shown in search |
| shape | raw Zod shape | Frozen snapshot of the original input shape |
| schema | Zod object | `z.object(shape)`; the validation authority for read/call |
| inputSchema | JSON Schema | Projected from `schema`; served by describe and by flat listing |
| callback | function | The original registered handler; invoked with parsed input and MCP extra |

Invariants: `op` unique; every metadata record has exactly one recorded operation and vice versa (build fails otherwise).

### OperationRegistry

| Field | Type | Rules |
|---|---|---|
| operations | readonly Operation[] | Filtered, sorted by `op`; frozen |
| get(id) | Operation \| undefined | Accepts `id` with or without the legacy prefix; returns only enabled operations |

### ToolsetConfig (operator input)

| Field | Type | Rules |
|---|---|---|
| toolsets | string[] (non-empty) \| undefined | `all`, a preset name, or area slugs; unknown → startup error; undefined → all |
| tools | string[] \| undefined | Additive exact legacy names or identifiers; unknown → startup error |
| excludeTools | string[] \| undefined | Exact names or `*` globs; a pattern matching nothing → startup error |
| readOnly | boolean \| undefined | true retains only readOnly operations |

Resolution: allowed = (areas ∪ explicit) − excluded, then ∩ readOnly if set; empty result → startup error. Exclusion and read-only always win.

### ServerMode

Enum: `gateway` (default) | `flat` | `both`. Any other value → startup error.

### Preset

Fixed, documented membership (see spec FR-015). `core` is a curated getting-started set; family presets partition by domain.

### RouteContext (per dispatched call)

| Field | Type | Rules |
|---|---|---|
| label | string | Legacy tool name, used only in error text |
| matchers | RouteMatcher[] | One per declared leg: method, host regex, path regex with one capture per placeholder, declared query, S3 flag |

Enforcement: raw path must contain no dot segments, backslashes, controls or whitespace; each placeholder capture must decode to a single safe segment (object keys may contain `/`); declared query keys must appear exactly once with the declared value; S3 routes reject undeclared subresource keys. Absent context (outside dispatch) → no constraint.

### DiscoveryPage

| Field | Type | Rules |
|---|---|---|
| operations \| areas | array | At most `limit` items (1..50, default 10) |
| total | integer | Distinct matches or distinct areas |
| totalOperations | integer | Present on area listings only |
| nextOffset | integer \| absent | Present iff `offset + limit < total` |

### ValidationErrorResult

| Field | Type | Rules |
|---|---|---|
| error | object | `{ type: ApiErrorType, message: string, statusCode: number }` — the shared error envelope (see contracts/gateway-tools.md "Error envelope"); `invalid_input` (400) for validation failures |
| op | string | The identifier attempted |
| issues | {code, field}[] | ≤ 10 issues; `field` is a declared top-level property name or `params`; never values |
| inputSchema \| schemaOmitted | JSON Schema \| true | Schema included iff ≤ 12,000 bytes |

## State transitions

Startup: env → ServerOptions → ToolsetConfig validated → metadata validated → registrars replayed → registry filtered and frozen → surfaces registered → projected listing installed. Any failure aborts startup. No transitions after startup; reconfiguration requires a restart.

Per call: input parsed by the SDK against the gateway tool's own shape → identifier resolved in the registry (unknown/disabled → lookup error) → read-only check (read only) → original schema `safeParseAsync` (invalid → ValidationErrorResult) → callback invoked inside RouteContext → each outgoing request checked → original result returned unchanged (thrown errors → sanitized error result).

Outer gateway-argument validation and legacy tool validation are SDK-native protocol error results; the structured inner-operation error envelope is not claimed for those paths.
