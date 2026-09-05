# Quickstart: Compact Operation Discovery

## For operators

Default (compact discovery, all operations):

```json
{"mcpServers":{"scaleway":{"command":"npx","args":["-y","mcp-scaleway@0.4.0"],"env":{"SCW_ACCESS_KEY":"...","SCW_SECRET_KEY":"...","SCW_DEFAULT_PROJECT_ID":"..."}}}}
```

Restrict to databases and networking, reads only:

```json
{"env":{"SCW_TOOLSETS":"data,networking","SCW_READ_ONLY":"true"}}
```

Keep legacy tool names during migration:

```json
{"env":{"SCW_MCP_MODE":"flat"}}
```

Rules to remember: filters apply to execution as well as discovery; invalid values fail startup; changing variables requires restarting the server process; a connected client keeps its loaded catalog until it reconnects.

## For an assistant

1. Orient: call `scaleway_search` with no arguments to see enabled areas and counts.
2. Find: `scaleway_search` with `{"query":"rdb list databases"}` or `{"area":"rdb","limit":50}`; follow `nextOffset` until absent.
3. Learn the contract: `scaleway_describe` with `{"ops":["rdb_list_databases"]}`.
4. Execute: `scaleway_read` for reads, `scaleway_call` for anything else, e.g. `{"op":"rdb_list_databases","params":{"region":"fr-par","instance_id":"<uuid>"}}`.
5. On a validation error, fix the named fields using the returned schema and retry once. On an unknown identifier, pick from the suggestions.

Identifiers are the legacy tool names without the `scaleway_` prefix; both forms are accepted.

## Verifying locally

```bash
bun run measure:discovery   # listing bytes per mode; bytes, not tokens
bun run test:parity         # operation + gateway traceability gates
bun run test -- --coverage.enabled
```
