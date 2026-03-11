# Quickstart: Scaleway Domains and DNS MCP Tools

**Feature**: 019-dns | **Date**: 2026-03-11

## Prerequisites

1. Set environment variables:
   ```bash
   export SCW_ACCESS_KEY="your-access-key"
   export SCW_SECRET_KEY="your-secret-key"
   export SCW_DEFAULT_PROJECT_ID="your-project-id"
   ```

2. Start the MCP server:
   ```bash
   bun run start
   ```

## Usage Examples

### List DNS Zones

```json
{
  "tool": "scaleway_dns_list_zones",
  "arguments": {
    "page": 1,
    "pageSize": 10,
    "domain": "example.com"
  }
}
```

### Create a DNS Zone

```json
{
  "tool": "scaleway_dns_create_zone",
  "arguments": {
    "domain": "example.com",
    "subdomain": "staging",
    "project_id": "your-project-uuid"
  }
}
```

### Add DNS Records

```json
{
  "tool": "scaleway_dns_update_records",
  "arguments": {
    "dns_zone": "staging.example.com",
    "changes": [
      {
        "add": {
          "records": [
            {
              "name": "www",
              "type": "A",
              "data": "203.0.113.10",
              "ttl": 300
            },
            {
              "name": "@",
              "type": "MX",
              "data": "mail.example.com.",
              "ttl": 3600,
              "priority": 10
            }
          ]
        }
      }
    ]
  }
}
```

### List DNS Records

```json
{
  "tool": "scaleway_dns_list_records",
  "arguments": {
    "dns_zone": "example.com",
    "type": "A",
    "page": 1,
    "pageSize": 50
  }
}
```

### Clone a DNS Zone

```json
{
  "tool": "scaleway_dns_clone_zone",
  "arguments": {
    "dns_zone": "staging.example.com",
    "dest_dns_zone": "production.example.com",
    "overwrite": false
  }
}
```

### Export Raw Zone File

```json
{
  "tool": "scaleway_dns_export_raw_zone",
  "arguments": {
    "dns_zone": "example.com",
    "format": "bind"
  }
}
```

### Import Raw Zone File

```json
{
  "tool": "scaleway_dns_import_raw_zone",
  "arguments": {
    "dns_zone": "example.com",
    "content": "$ORIGIN example.com.\n@ 300 IN A 203.0.113.10\nwww 300 IN CNAME @"
  }
}
```

### Update Nameservers

```json
{
  "tool": "scaleway_dns_update_nameservers",
  "arguments": {
    "dns_zone": "example.com",
    "ns": [
      { "name": "ns1.example.com", "ip": ["203.0.113.1"] },
      { "name": "ns2.example.com", "ip": ["203.0.113.2"] }
    ]
  }
}
```

### Create an SSL Certificate

```json
{
  "tool": "scaleway_dns_create_ssl_certificate",
  "arguments": {
    "dns_zone": "example.com",
    "alternative_dns_zones": ["www.example.com", "api.example.com"]
  }
}
```

### Delete a DNS Zone

```json
{
  "tool": "scaleway_dns_delete_zone",
  "arguments": {
    "dns_zone": "staging.example.com",
    "project_id": "your-project-uuid"
  }
}
```
