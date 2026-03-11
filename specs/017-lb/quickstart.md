# Quickstart: Scaleway Load Balancer MCP Tools

**Feature**: 017-lb | **Date**: 2026-03-11

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

### List Load Balancers

```json
{
  "tool": "scaleway_lb_list_lbs",
  "arguments": {
    "zone": "fr-par-1",
    "page": 1,
    "page_size": 10
  }
}
```

### Create a Load Balancer

```json
{
  "tool": "scaleway_lb_create_lb",
  "arguments": {
    "zone": "fr-par-1",
    "name": "my-lb",
    "type": "lb-s",
    "assign_flexible_ip": true,
    "tags": ["production"]
  }
}
```

### Create a Backend

```json
{
  "tool": "scaleway_lb_create_backend",
  "arguments": {
    "zone": "fr-par-1",
    "lb_id": "lb-uuid",
    "name": "web-backend",
    "forward_protocol": "http",
    "forward_port": 8080,
    "forward_port_algorithm": "roundrobin",
    "health_check": {
      "port": 8080,
      "check_delay": "3000ms",
      "check_timeout": "1000ms",
      "check_max_retries": 3,
      "http_config": {
        "uri": "/health",
        "method": "GET",
        "code": 200
      }
    }
  }
}
```

### Add Servers to Backend

```json
{
  "tool": "scaleway_lb_add_backend_servers",
  "arguments": {
    "zone": "fr-par-1",
    "backend_id": "backend-uuid",
    "server_ip": ["10.0.0.1", "10.0.0.2"]
  }
}
```

### Create a Frontend

```json
{
  "tool": "scaleway_lb_create_frontend",
  "arguments": {
    "zone": "fr-par-1",
    "lb_id": "lb-uuid",
    "name": "http-frontend",
    "inbound_port": 80,
    "backend_id": "backend-uuid"
  }
}
```

### Create a Let's Encrypt Certificate

```json
{
  "tool": "scaleway_lb_create_certificate",
  "arguments": {
    "zone": "fr-par-1",
    "lb_id": "lb-uuid",
    "name": "my-cert",
    "letsencrypt": {
      "common_name": "example.com",
      "subject_alternative_name": ["www.example.com"]
    }
  }
}
```

### Create a Route

```json
{
  "tool": "scaleway_lb_create_route",
  "arguments": {
    "zone": "fr-par-1",
    "frontend_id": "frontend-uuid",
    "backend_id": "backend-uuid",
    "match_host_header": "api.example.com"
  }
}
```

### Get LB Statistics

```json
{
  "tool": "scaleway_lb_get_lb_stats",
  "arguments": {
    "zone": "fr-par-1",
    "lb_id": "lb-uuid"
  }
}
```

### Migrate a Load Balancer

```json
{
  "tool": "scaleway_lb_migrate_lb",
  "arguments": {
    "zone": "fr-par-1",
    "lb_id": "lb-uuid",
    "type": "lb-gp-m"
  }
}
```

### List Available LB Types

```json
{
  "tool": "scaleway_lb_list_lb_types",
  "arguments": {
    "zone": "fr-par-1"
  }
}
```

### Delete a Load Balancer

```json
{
  "tool": "scaleway_lb_delete_lb",
  "arguments": {
    "zone": "fr-par-1",
    "lb_id": "lb-uuid",
    "release_ip": true
  }
}
```
