# Gateway tools contract

The tool names are scaleway_search, scaleway_describe, scaleway_read, scaleway_call.

- search: {query?: string, area?: string, limit?: integer 1..50 = 10, offset?: integer >=0 =0}. Empty query/area returns area counts. Otherwise returns {operations:[{op,description,readOnly,required,optional}],total,nextOffset?}. Ranking is deterministic and token-based over ID, area and description. Exact IDs rank first. Unknown areas are actionable errors, not silently ignored. Offset pagination must reach every matching operation, including an area exceeding the limit.
- describe: {ops: nonempty string[] maximum 10}. Returns operation IDs, endpoint metadata and input schemas. Unknown or disabled IDs return an error with allowed suggestions. Schema projection preserves all validation semantics except nonessential presentation metadata explicitly documented below.
- read/call: {op: nonempty string, params?: record<unknown>}. ID equals original scaleway_ tool name with that prefix removed. Lookup only in the filtered registry. Unknown IDs never call a handler. Read rejects any operation not classified readOnly before validation/execution. Call can execute allowed reads or writes. Zod safeParseAsync applies defaults and validations before the original callback, forwarding MCP extra context. Callback errors become isError text results. Validation errors include issues and the needed schema, not submitted secret values. Returned operation content is preserved.

All four tools have concise descriptions including examples. Search/describe/read receive readOnlyHint:true. Call is potentially destructive; annotations are hints, not authorization. Credentials remain governed by Scaleway IAM. Read can return sensitive data, so it must not be described as universally safe or automatically approved.

## Runtime metadata and filtering

Generate src/gateway/operations.json from tests/parity-matrix.json excluding its meta section. Values include original tool name, area, API operation and conservative readOnly classification from GET/HEAD. Composite PUT operations remain write-class. Unknown/missing/duplicate metadata fails construction. Runtime must not read tests/ or specs/ paths.

SCW_MCP_MODE = gateway default | flat | both. SCW_TOOLSETS = comma-separated area slugs or presets all/core and documented families; absent means all. SCW_TOOLS adds explicit supported tool names/operation IDs. SCW_EXCLUDE_TOOLS removes glob matches after inclusion. SCW_READ_ONLY = true/1 or false/0; invalid values fail startup. Exclusion and read-only always win. Empty/unknown selections must not silently expose all operations. Filters are immutable per server.

## Schema projection

Walk schema nodes, not arbitrary JSON keys: property names such as format, description, default, properties and additionalProperties are user fields and must survive. Preserve enums, required arrays, defaults, validation keywords, unions, references, and schema-valued additionalProperties. May remove $schema and redundant property descriptions for shared region/zone/page keys; keep substantive descriptions, units, warnings and examples. No mutation of original schemas. This conservative projection trades a smaller flat-mode gain for faithful callable contracts.

## Compatibility

Register normal calls with the public SDK API and replace tools/list only after registration via the public underlying Server.setRequestHandler. Construct projected listing from our recorded catalog rather than accessing SDK private maps. No dynamic enable/disable, execution engine, new transport or private SDK access is required.
