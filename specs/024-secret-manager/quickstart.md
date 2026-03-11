# Quickstart: Scaleway Secret Manager MCP Tools

**Feature**: 024-secret-manager | **Date**: 2026-03-11

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

### List Secrets

```json
{
  "tool": "scaleway_secret_manager_list_secrets",
  "arguments": {
    "region": "fr-par",
    "page": 1,
    "pageSize": 10
  }
}
```

### Create a Secret

```json
{
  "tool": "scaleway_secret_manager_create_secret",
  "arguments": {
    "region": "fr-par",
    "name": "my-api-key",
    "type": "opaque",
    "description": "API key for external service",
    "tags": ["production", "api"]
  }
}
```

### Create a Secret Version

```json
{
  "tool": "scaleway_secret_manager_create_secret_version",
  "arguments": {
    "region": "fr-par",
    "secretId": "secret-uuid",
    "data": "c2VjcmV0LXZhbHVl",
    "description": "Initial version"
  }
}
```

### Access a Secret Version

```json
{
  "tool": "scaleway_secret_manager_access_secret_version",
  "arguments": {
    "region": "fr-par",
    "secretId": "secret-uuid",
    "revision": "latest"
  }
}
```

### Update a Secret

```json
{
  "tool": "scaleway_secret_manager_update_secret",
  "arguments": {
    "region": "fr-par",
    "secretId": "secret-uuid",
    "name": "renamed-api-key",
    "tags": ["production", "api", "v2"]
  }
}
```

### Protect a Secret

```json
{
  "tool": "scaleway_secret_manager_protect_secret",
  "arguments": {
    "region": "fr-par",
    "secretId": "secret-uuid"
  }
}
```

### Disable a Secret Version

```json
{
  "tool": "scaleway_secret_manager_disable_secret_version",
  "arguments": {
    "region": "fr-par",
    "secretId": "secret-uuid",
    "revision": "1"
  }
}
```

### Destroy a Secret Version

```json
{
  "tool": "scaleway_secret_manager_destroy_secret_version",
  "arguments": {
    "region": "fr-par",
    "secretId": "secret-uuid",
    "revision": "1"
  }
}
```

### List Tags

```json
{
  "tool": "scaleway_secret_manager_list_tags",
  "arguments": {
    "region": "fr-par",
    "page": 1,
    "pageSize": 50
  }
}
```

### Add a Secret Owner

```json
{
  "tool": "scaleway_secret_manager_add_secret_owner",
  "arguments": {
    "region": "fr-par",
    "secretId": "secret-uuid",
    "product": "edge_services"
  }
}
```

### Delete a Secret

```json
{
  "tool": "scaleway_secret_manager_delete_secret",
  "arguments": {
    "region": "fr-par",
    "secretId": "secret-uuid"
  }
}
```
