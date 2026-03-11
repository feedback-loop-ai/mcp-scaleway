# Quickstart: Scaleway Managed Inference MCP Tools

**Feature**: 029-inference | **Date**: 2026-03-11

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

### List Available Models

```json
{
  "tool": "scaleway_inference_list_models",
  "arguments": {
    "region": "fr-par",
    "page": 1,
    "pageSize": 10
  }
}
```

### List Node Types

```json
{
  "tool": "scaleway_inference_list_node_types",
  "arguments": {
    "region": "fr-par"
  }
}
```

### Get Model EULA

```json
{
  "tool": "scaleway_inference_get_eula",
  "arguments": {
    "region": "fr-par",
    "model_id": "model-uuid"
  }
}
```

### Accept Model EULA

```json
{
  "tool": "scaleway_inference_accept_eula",
  "arguments": {
    "region": "fr-par",
    "model_id": "model-uuid"
  }
}
```

### Create a Deployment

```json
{
  "tool": "scaleway_inference_create_deployment",
  "arguments": {
    "region": "fr-par",
    "name": "my-llm-deployment",
    "model_id": "model-uuid",
    "node_type": "L4",
    "min_size": 1,
    "max_size": 2,
    "endpoints": [
      { "is_public": true, "disable_auth": false }
    ]
  }
}
```

### List Deployments

```json
{
  "tool": "scaleway_inference_list_deployments",
  "arguments": {
    "region": "fr-par",
    "page": 1,
    "pageSize": 10
  }
}
```

### Get Deployment Details

```json
{
  "tool": "scaleway_inference_get_deployment",
  "arguments": {
    "region": "fr-par",
    "deployment_id": "deployment-uuid"
  }
}
```

### Update a Deployment

```json
{
  "tool": "scaleway_inference_update_deployment",
  "arguments": {
    "region": "fr-par",
    "deployment_id": "deployment-uuid",
    "name": "renamed-deployment",
    "max_size": 4
  }
}
```

### List Deployment Events

```json
{
  "tool": "scaleway_inference_list_deployment_events",
  "arguments": {
    "region": "fr-par",
    "deployment_id": "deployment-uuid"
  }
}
```

### Create an Endpoint

```json
{
  "tool": "scaleway_inference_create_endpoint",
  "arguments": {
    "region": "fr-par",
    "deployment_id": "deployment-uuid",
    "is_public": false,
    "private_network_id": "pn-uuid",
    "disable_auth": false
  }
}
```

### Update an Endpoint

```json
{
  "tool": "scaleway_inference_update_endpoint",
  "arguments": {
    "region": "fr-par",
    "endpoint_id": "endpoint-uuid",
    "disable_auth": true
  }
}
```

### Delete an Endpoint

```json
{
  "tool": "scaleway_inference_delete_endpoint",
  "arguments": {
    "region": "fr-par",
    "endpoint_id": "endpoint-uuid"
  }
}
```

### Delete a Deployment

```json
{
  "tool": "scaleway_inference_delete_deployment",
  "arguments": {
    "region": "fr-par",
    "deployment_id": "deployment-uuid"
  }
}
```
