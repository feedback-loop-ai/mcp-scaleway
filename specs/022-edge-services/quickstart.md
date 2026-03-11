# Quickstart: Scaleway Edge Services MCP Tools

**Feature**: 022-edge-services | **Date**: 2026-03-11

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

### List Pipelines

```json
{
  "tool": "scaleway_edge_services_list_pipelines",
  "arguments": {
    "page": 1,
    "pageSize": 10
  }
}
```

### Create a Pipeline

```json
{
  "tool": "scaleway_edge_services_create_pipeline",
  "arguments": {
    "name": "my-cdn-pipeline",
    "description": "CDN pipeline for my website"
  }
}
```

### Create a DNS Stage

```json
{
  "tool": "scaleway_edge_services_create_dns_stage",
  "arguments": {
    "pipelineId": "pipeline-uuid",
    "fqdns": ["cdn.example.com", "assets.example.com"],
    "tlsStageId": "tls-stage-uuid"
  }
}
```

### Create a TLS Stage with Managed Certificate

```json
{
  "tool": "scaleway_edge_services_create_tls_stage",
  "arguments": {
    "pipelineId": "pipeline-uuid",
    "managedCertificate": true,
    "cacheStageId": "cache-stage-uuid"
  }
}
```

### Create a Cache Stage

```json
{
  "tool": "scaleway_edge_services_create_cache_stage",
  "arguments": {
    "pipelineId": "pipeline-uuid",
    "fallbackTtl": "3600",
    "includeCookies": false,
    "backendStageId": "backend-stage-uuid"
  }
}
```

### Create a Backend Stage with S3 Origin

```json
{
  "tool": "scaleway_edge_services_create_backend_stage",
  "arguments": {
    "pipelineId": "pipeline-uuid",
    "scalewayS3": {
      "bucketName": "my-website-bucket",
      "bucketRegion": "fr-par",
      "isWebsite": true
    }
  }
}
```

### Create a Backend Stage with Load Balancer Origin

```json
{
  "tool": "scaleway_edge_services_create_backend_stage",
  "arguments": {
    "pipelineId": "pipeline-uuid",
    "scalewayLb": {
      "lbs": [{
        "id": "lb-uuid",
        "zone": "fr-par-1",
        "frontendId": "frontend-uuid",
        "isSsl": true,
        "domainName": "origin.example.com"
      }]
    }
  }
}
```

### Purge Specific Assets

```json
{
  "tool": "scaleway_edge_services_purge_cache",
  "arguments": {
    "pipelineId": "pipeline-uuid",
    "assets": ["https://cdn.example.com/style.css", "https://cdn.example.com/app.js"]
  }
}
```

### Purge All Cached Content

```json
{
  "tool": "scaleway_edge_services_purge_cache",
  "arguments": {
    "pipelineId": "pipeline-uuid",
    "all": true
  }
}
```

### Check Purge Request Status

```json
{
  "tool": "scaleway_edge_services_get_purge_request",
  "arguments": {
    "purgeRequestId": "purge-request-uuid"
  }
}
```
