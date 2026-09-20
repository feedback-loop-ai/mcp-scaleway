# Boundary contracts

- Input examples are JSON objects accepted by the operation's actual Zod schema.
  They contain synthetic public values only and never execute during discovery.
- Upstream wire validation accepts exactly the documented success body variants and
  status/empty-body semantics. Unknown properties are retained. Validation errors
  expose the operation and a safe error category, never submitted or returned values.
- Structured MCP results retain the existing text blocks and error flag. Object
  payloads are carried in structured content; scalar/array payloads use an explicit
  documented envelope. Schema metadata must match the published structured shape.
- Dispatch logs contain only a stable operation identifier, an enumerated outcome and
  numeric duration. Both successful and failed dispatches log once, on stderr.
- Health self-check validates configuration, registry and schema initialization and
  exits successfully only when local startup succeeds. It does not invoke cloud APIs
  or models and must not claim authenticated connectivity.
- Route findings are closed using source-backed method/path and parameter evidence.
  Unknown cases stay explicit and cannot be labeled verified by an unauthenticated or
  missing-resource response.
