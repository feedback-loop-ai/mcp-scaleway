# Quickstart: Scaleway Elastic Metal MCP Tools

**Branch**: `003-elastic-metal` | **Date**: 2026-03-11

## Prerequisites

1. Scaleway account with Elastic Metal access
2. Environment variables set:
   ```bash
   export SCW_ACCESS_KEY="your-access-key"
   export SCW_SECRET_KEY="your-secret-key"
   export SCW_DEFAULT_PROJECT_ID="your-project-id"
   export SCW_DEFAULT_ZONE="fr-par-1"
   ```

## Start the Server

```bash
bun run start
```

## Tool Examples

### List available offers
```json
{
  "tool": "scaleway_elastic_metal_list_offers",
  "arguments": {
    "zone": "fr-par-1"
  }
}
```

### Create a server
```json
{
  "tool": "scaleway_elastic_metal_create_server",
  "arguments": {
    "zone": "fr-par-1",
    "offer_id": "offer-uuid",
    "name": "my-server"
  }
}
```

### Install an OS
```json
{
  "tool": "scaleway_elastic_metal_install_server",
  "arguments": {
    "zone": "fr-par-1",
    "server_id": "server-uuid",
    "os_id": "os-uuid",
    "hostname": "my-server",
    "ssh_key_ids": ["ssh-key-uuid"]
  }
}
```

### List servers
```json
{
  "tool": "scaleway_elastic_metal_list_servers",
  "arguments": {
    "zone": "fr-par-1",
    "page": 1,
    "pageSize": 20
  }
}
```

### Reboot a server
```json
{
  "tool": "scaleway_elastic_metal_reboot_server",
  "arguments": {
    "zone": "fr-par-1",
    "server_id": "server-uuid"
  }
}
```

## Running Tests

```bash
# Unit tests
bun x vitest run --config tests/vitest.config.ts --dir tests/unit

# Contract tests
bun x vitest run --config tests/vitest.config.ts --dir tests/contract

# All tests with coverage
bun run test -- --coverage.enabled
```
