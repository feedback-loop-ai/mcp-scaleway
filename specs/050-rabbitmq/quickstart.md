# Quickstart: Scaleway RabbitMQ (MessageQ) MCP Tools

**Feature**: 050-rabbitmq | **Date**: 2026-07-07

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

> Cloud Essentials for RabbitMQ is currently available in the `fr-par` region only.

## Usage Examples

### List versions and node types

```json
{ "tool": "scaleway_rabbitmq_list_versions", "arguments": { "region": "fr-par" } }
```

```json
{ "tool": "scaleway_rabbitmq_list_node_types", "arguments": { "region": "fr-par" } }
```

### Create a deployment (with an initial user and a public endpoint)

```json
{
  "tool": "scaleway_rabbitmq_create_deployment",
  "arguments": {
    "region": "fr-par",
    "name": "my-rabbit",
    "node_type": "rmq-node",
    "node_count": 1,
    "version": "3.13",
    "user_name": "admin",
    "password": "s3cret-password",
    "volume": { "type": "sbs_5k", "size_bytes": 10000000000 },
    "endpoints": [{ "is_public": true }]
  }
}
```

### List and get deployments

```json
{ "tool": "scaleway_rabbitmq_list_deployments", "arguments": { "region": "fr-par", "page": 1, "pageSize": 10 } }
```

```json
{ "tool": "scaleway_rabbitmq_get_deployment", "arguments": { "region": "fr-par", "deployment_id": "deployment-uuid" } }
```

### Update / upgrade a deployment

```json
{ "tool": "scaleway_rabbitmq_update_deployment", "arguments": { "region": "fr-par", "deployment_id": "deployment-uuid", "name": "renamed", "tags": ["prod"] } }
```

```json
{ "tool": "scaleway_rabbitmq_upgrade_deployment", "arguments": { "region": "fr-par", "deployment_id": "deployment-uuid", "node_count": 3 } }
```

### Download the certificate authority

```json
{ "tool": "scaleway_rabbitmq_get_deployment_certificate", "arguments": { "region": "fr-par", "deployment_id": "deployment-uuid" } }
```

### Manage users

```json
{ "tool": "scaleway_rabbitmq_list_users", "arguments": { "region": "fr-par", "deployment_id": "deployment-uuid" } }
```

```json
{ "tool": "scaleway_rabbitmq_create_user", "arguments": { "region": "fr-par", "deployment_id": "deployment-uuid", "username": "app", "password": "app-password" } }
```

```json
{ "tool": "scaleway_rabbitmq_update_user", "arguments": { "region": "fr-par", "deployment_id": "deployment-uuid", "username": "app", "password": "new-password" } }
```

```json
{ "tool": "scaleway_rabbitmq_delete_user", "arguments": { "region": "fr-par", "deployment_id": "deployment-uuid", "username": "app" } }
```

### Manage endpoints

```json
{ "tool": "scaleway_rabbitmq_create_endpoint", "arguments": { "region": "fr-par", "deployment_id": "deployment-uuid", "private_network_id": "pn-uuid" } }
```

```json
{ "tool": "scaleway_rabbitmq_delete_endpoint", "arguments": { "region": "fr-par", "endpoint_id": "endpoint-uuid" } }
```

### Delete a deployment

```json
{ "tool": "scaleway_rabbitmq_delete_deployment", "arguments": { "region": "fr-par", "deployment_id": "deployment-uuid" } }
```
