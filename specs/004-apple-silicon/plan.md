# Plan - Apple Silicon (004)

## Architecture

The Apple Silicon module follows the established pattern:
- `src/tools/apple-silicon/types.ts` - Zod schemas for input validation
- `src/tools/apple-silicon/handlers.ts` - HTTP request handlers using `@scaleway/sdk-client`
- `src/tools/apple-silicon/index.ts` - MCP tool registration (replaces stub)

## API Integration

All endpoints use the base path `/apple-silicon/v1alpha1/zones/{zone}/`.

| Tool | HTTP | Path Suffix |
|------|------|-------------|
| list_servers | GET | `servers` |
| get_server | GET | `servers/{server_id}` |
| create_server | POST | `servers` |
| delete_server | DELETE | `servers/{server_id}` |
| reboot_server | POST | `servers/{server_id}/reboot` |
| reinstall_server | POST | `servers/{server_id}/reinstall` |
| list_server_types | GET | `server-types` |
| list_os | GET | `os` |

## Dependencies

- `@scaleway/sdk-client` (Client for HTTP calls)
- `zod` (input validation schemas)
- `@modelcontextprotocol/sdk` (MCP server registration)
- `src/shared/*` (auth, client, errors, pagination, types)

## Testing Strategy

- **Unit tests**: Mock the Scaleway client, verify handler logic, error mapping, pagination
- **Contract tests**: Validate request/response shapes against Scaleway API spec
- **Coverage target**: 100% line and branch coverage
