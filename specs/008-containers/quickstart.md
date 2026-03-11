# Quickstart: Scaleway Serverless Containers MCP Tools

**Feature**: 008-containers | **Date**: 2026-03-11

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
  "tool": "scaleway_containers_list_namespaces",
  "arguments": {
    "region": "fr-par",
    "page": 1,
    "pageSize": 10
  }
}
```

### Create a Namespace

```json
{
  "tool": "scaleway_containers_create_namespace",
  "arguments": {
    "region": "fr-par",
    "name": "my-app-namespace",
    "description": "Namespace for my application containers"
  }
}
```

### Create a Container

```json
{
  "tool": "scaleway_containers_create_container",
  "arguments": {
    "region": "fr-par",
    "namespaceId": "namespace-uuid",
    "name": "my-api",
    "registryImage": "rg.fr-par.scw.cloud/my-ns/my-api:latest",
    "port": 8080,
    "minScale": 1,
    "maxScale": 5,
    "memoryLimit": 512,
    "cpuLimit": 280,
    "privacy": "public",
    "environmentVariables": {
      "NODE_ENV": "production"
    }
  }
}
```

### Deploy a Container

```json
{
  "tool": "scaleway_containers_deploy_container",
  "arguments": {
    "region": "fr-par",
    "containerId": "container-uuid"
  }
}
```

### Update Container Configuration

```json
{
  "tool": "scaleway_containers_update_container",
  "arguments": {
    "region": "fr-par",
    "containerId": "container-uuid",
    "minScale": 2,
    "maxScale": 10,
    "memoryLimit": 1024
  }
}
```

### Create a Cron Trigger

```json
{
  "tool": "scaleway_containers_create_cron",
  "arguments": {
    "region": "fr-par",
    "containerId": "container-uuid",
    "schedule": "0 */6 * * *",
    "name": "periodic-cleanup",
    "args": {
      "action": "cleanup",
      "retention_days": 30
    }
  }
}
```

### Map a Custom Domain

```json
{
  "tool": "scaleway_containers_create_domain",
  "arguments": {
    "region": "fr-par",
    "containerId": "container-uuid",
    "hostname": "api.example.com"
  }
}
```

### Create an Authentication Token

```json
{
  "tool": "scaleway_containers_create_token",
  "arguments": {
    "region": "fr-par",
    "containerId": "container-uuid",
    "description": "CI/CD deployment token",
    "expiresAt": "2026-12-31T23:59:59Z"
  }
}
```

### Delete a Container

```json
{
  "tool": "scaleway_containers_delete_container",
  "arguments": {
    "region": "fr-par",
    "containerId": "container-uuid"
  }
}
```
