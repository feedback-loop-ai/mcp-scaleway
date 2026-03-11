# Quickstart: Scaleway Serverless Functions MCP Tools

**Feature**: 007-functions | **Date**: 2026-03-11

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

### List Namespaces

```json
{
  "tool": "scaleway_functions_list_namespaces",
  "arguments": {
    "region": "fr-par",
    "page": 1,
    "page_size": 10
  }
}
```

### Create a Namespace

```json
{
  "tool": "scaleway_functions_create_namespace",
  "arguments": {
    "region": "fr-par",
    "name": "my-functions-ns",
    "description": "Production functions",
    "environment_variables": {
      "NODE_ENV": "production"
    }
  }
}
```

### Create a Function

```json
{
  "tool": "scaleway_functions_create_function",
  "arguments": {
    "region": "fr-par",
    "namespace_id": "namespace-uuid",
    "name": "my-handler",
    "runtime": "node22",
    "handler": "handler.handle",
    "privacy": "public",
    "memory_limit": 256,
    "min_scale": 0,
    "max_scale": 5
  }
}
```

### Deploy a Function

```json
{
  "tool": "scaleway_functions_deploy_function",
  "arguments": {
    "region": "fr-par",
    "function_id": "function-uuid"
  }
}
```

### Update a Function

```json
{
  "tool": "scaleway_functions_update_function",
  "arguments": {
    "region": "fr-par",
    "function_id": "function-uuid",
    "memory_limit": 512,
    "timeout": "60s",
    "environment_variables": {
      "LOG_LEVEL": "debug"
    }
  }
}
```

### Create a Cron Trigger

```json
{
  "tool": "scaleway_functions_create_cron",
  "arguments": {
    "region": "fr-par",
    "function_id": "function-uuid",
    "schedule": "0 */6 * * *",
    "name": "periodic-cleanup",
    "args": { "action": "cleanup" }
  }
}
```

### Attach a Custom Domain

```json
{
  "tool": "scaleway_functions_create_domain",
  "arguments": {
    "region": "fr-par",
    "function_id": "function-uuid",
    "hostname": "api.example.com"
  }
}
```

### Create an Access Token

```json
{
  "tool": "scaleway_functions_create_token",
  "arguments": {
    "region": "fr-par",
    "function_id": "function-uuid",
    "description": "CI/CD deploy token",
    "expires_at": "2026-12-31T23:59:59Z"
  }
}
```
