# Quickstart: Scaleway Instances MCP Tools

**Feature**: 002-instances | **Date**: 2026-03-11

## Prerequisites

1. Set environment variables:
   ```bash
   export SCW_ACCESS_KEY="your-access-key"
   export SCW_SECRET_KEY="your-secret-key"
   export SCW_DEFAULT_PROJECT_ID="your-project-id"
   export SCW_DEFAULT_ZONE="fr-par-1"
   ```

2. Start the MCP server:
   ```bash
   bun run start
   ```

## Usage Examples

### List Servers

```json
{
  "tool": "scaleway_instances_list_servers",
  "arguments": {
    "zone": "fr-par-1",
    "page": 1,
    "page_size": 10
  }
}
```

### Create a Server

```json
{
  "tool": "scaleway_instances_create_server",
  "arguments": {
    "zone": "fr-par-1",
    "name": "my-server",
    "commercial_type": "DEV1-S",
    "image": "ubuntu-image-uuid"
  }
}
```

### Start a Server

```json
{
  "tool": "scaleway_instances_server_action",
  "arguments": {
    "zone": "fr-par-1",
    "server_id": "server-uuid",
    "action": "poweron"
  }
}
```

### Create a Volume

```json
{
  "tool": "scaleway_instances_create_volume",
  "arguments": {
    "zone": "fr-par-1",
    "name": "my-volume",
    "size": 20000000000,
    "volume_type": "b_ssd"
  }
}
```

### Create a Security Group

```json
{
  "tool": "scaleway_instances_create_security_group",
  "arguments": {
    "zone": "fr-par-1",
    "name": "web-sg",
    "description": "Allow HTTP/HTTPS traffic",
    "inbound_default_policy": "drop",
    "outbound_default_policy": "accept"
  }
}
```

### Reserve an IP

```json
{
  "tool": "scaleway_instances_create_ip",
  "arguments": {
    "zone": "fr-par-1",
    "type": "routed_ipv4"
  }
}
```

### Create a Snapshot

```json
{
  "tool": "scaleway_instances_create_snapshot",
  "arguments": {
    "zone": "fr-par-1",
    "name": "my-snapshot",
    "volume_id": "volume-uuid"
  }
}
```
