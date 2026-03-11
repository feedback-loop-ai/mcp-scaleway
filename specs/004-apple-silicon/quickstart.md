# Quickstart - Apple Silicon (004)

## Prerequisites

- Scaleway account with API keys (SCW_ACCESS_KEY, SCW_SECRET_KEY, SCW_DEFAULT_PROJECT_ID)
- Bun runtime installed

## Available Tools

### Browse Catalog
1. `scaleway_apple_silicon_list_server_types` - See available Mac mini configurations
2. `scaleway_apple_silicon_list_os` - Browse macOS versions

### Server Lifecycle
1. `scaleway_apple_silicon_create_server` - Provision a Mac mini (requires `type`)
2. `scaleway_apple_silicon_list_servers` - List all your servers
3. `scaleway_apple_silicon_get_server` - Check server status and details
4. `scaleway_apple_silicon_reboot_server` - Restart a server
5. `scaleway_apple_silicon_reinstall_server` - Wipe and reinstall OS
6. `scaleway_apple_silicon_delete_server` - Remove a server (24h minimum lease)

## Example Flow

```
# 1. Check available types
scaleway_apple_silicon_list_server_types

# 2. Check available OS
scaleway_apple_silicon_list_os { server_type: "M2-128" }

# 3. Create a server
scaleway_apple_silicon_create_server { type: "M2-128", name: "my-mac" }

# 4. Check status
scaleway_apple_silicon_get_server { server_id: "<uuid>" }

# 5. Reboot if needed
scaleway_apple_silicon_reboot_server { server_id: "<uuid>" }

# 6. Delete when done
scaleway_apple_silicon_delete_server { server_id: "<uuid>" }
```
