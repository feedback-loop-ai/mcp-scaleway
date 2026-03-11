# Quickstart: Scaleway IPAM MCP Tools

**Feature**: 021-ipam | **Date**: 2026-03-11

## Prerequisites

1. Set environment variables:
   ```bash
   export SCW_ACCESS_KEY="your-access-key"
   export SCW_SECRET_KEY="your-secret-key"
   export SCW_DEFAULT_PROJECT_ID="your-project-id"
   export SCW_DEFAULT_REGION="fr-par"
   ```

2. Start the MCP server:
   ```bash
   bun run start
   ```

## Usage Examples

### List IPs

```json
{
  "tool": "scaleway_ipam_list_ips",
  "arguments": {
    "region": "fr-par",
    "page": 1,
    "pageSize": 10
  }
}
```

### List IPs Filtered by Resource Type

```json
{
  "tool": "scaleway_ipam_list_ips",
  "arguments": {
    "region": "fr-par",
    "resource_type": "instance_server",
    "attached": true
  }
}
```

### Get IP Details

```json
{
  "tool": "scaleway_ipam_get_ip",
  "arguments": {
    "region": "fr-par",
    "ip_id": "ip-uuid"
  }
}
```

### Book (Reserve) an IP in a Private Network

```json
{
  "tool": "scaleway_ipam_book_ip",
  "arguments": {
    "region": "fr-par",
    "project_id": "project-uuid",
    "source": {
      "private_network_id": "pn-uuid"
    },
    "is_ipv6": false,
    "tags": ["env:production"]
  }
}
```

### Book a Specific IP Address

```json
{
  "tool": "scaleway_ipam_book_ip",
  "arguments": {
    "region": "fr-par",
    "project_id": "project-uuid",
    "source": {
      "private_network_id": "pn-uuid"
    },
    "address": "192.168.1.10/24"
  }
}
```

### Update IP Tags and Reverse DNS

```json
{
  "tool": "scaleway_ipam_update_ip",
  "arguments": {
    "region": "fr-par",
    "ip_id": "ip-uuid",
    "tags": ["env:staging", "team:platform"],
    "reverses": [
      {
        "hostname": "myhost.example.com"
      }
    ]
  }
}
```

### Release an IP

```json
{
  "tool": "scaleway_ipam_release_ip",
  "arguments": {
    "region": "fr-par",
    "ip_id": "ip-uuid"
  }
}
```
