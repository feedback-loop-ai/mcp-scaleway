# Requirements Checklist: 055-dedibox

- [X] API surface verified against official docs + generated SDK (no invented
  endpoints).
- [X] Uses `api.scaleway.com/dedibox/v1` with shared X-Auth-Token client (not
  legacy online.net).
- [X] Zone-scoped paths correct for every tool.
- [X] Numeric IDs modeled as numbers; UUIDs (zone/project) as strings.
- [X] Pagination via `buildPaginatedResponse` for all list tools.
- [X] Every handler wraps errors with `formatErrorResponse(mapScalewayError)`.
- [X] Tool names use `scaleway_dedibox_` prefix (snake_case verb_noun).
- [X] `registerDediboxTools` exported for orchestrator wiring.
- [X] 100% line + branch coverage on all src/tools/dedibox files.
- [X] Contract test covers every tool and references the API reference doc.
- [X] Out-of-scope items documented with rationale in spec.md.
- [X] biome + tsc clean for all owned files.
