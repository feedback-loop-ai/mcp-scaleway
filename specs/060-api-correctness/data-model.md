# Data Model: Scaleway API Correctness Repairs

No persisted state. The entities below describe the request/response contract the repairs enforce.

## Entities

### Shared Transport Request

| Field | Rules |
|---|---|
| method | GET, POST, PUT, PATCH or DELETE |
| path | Relative, begins with exactly one `/`; joined verbatim to the API base host |
| urlParams | Optional URLSearchParams; appended as the query string |
| body | Optional JSON string; when present, `headers` must include the JSON content type |
| headers | Optional; authentication is added by the transport, never by handlers |

### Shared Transport Response

| Case | Handler contract |
|---|---|
| 2xx with JSON | Already-parsed object returned to the handler |
| 204 / empty | `undefined`; preserve per-operation acknowledgements: normalized `{}` for RDB/Elastic Metal/Containers and `{message: "Routing policy deleted successfully"}` for InterLink routing-policy deletion |
| non-2xx | Thrown error exposing numeric `status`; mapped to the MCP error envelope with that status |

### Error Envelope

| Field | Rules |
|---|---|
| type | invalid_input (400), permission_denied (401/403), not_found (404), rate_limited (429), unsupported_operation (501, input combination with no faithful upstream equivalent), server_error (other) |
| statusCode | Upstream status when present on the thrown error as `statusCode` or `status`; 500 otherwise |
| message | Upstream message; never credentials |

### Operation Lifecycle States (upstream version)

`current` → `deprecated` (live, description carries notice) → `removed` (operation deleted, migration note published). Transitions are driven by upstream references; the parity record must reflect the current state.

### Migration Mapping (release notes)

| Field | Rules |
|---|---|
| removed operation | Legacy tool name |
| replacement | Operation name or "none upstream" with explanation |
| unit or field change | Documented conversion (e.g. MiB input → bytes upstream) |

## Invariants

- Every registered operation has one parity entry with a real `METHOD /path`.
- Every parity entry's contract test file exists.
- No handler constructs a browser-style Request or reads `.ok/.json()` on a transport result.
- Tests inject HTTP via the advanced client factory; global fetch is fail-closed in transport tests.
