# Quickstart: Scaleway Managed Redis MCP Tools

**Feature**: 014-redis | **Date**: 2026-03-11

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

### List Clusters

```json
{
  "tool": "scaleway_redis_list_clusters",
  "arguments": {
    "region": "fr-par",
    "page": 1,
    "pageSize": 10
  }
}
```

### Create a Cluster

```json
{
  "tool": "scaleway_redis_create_cluster",
  "arguments": {
    "region": "fr-par",
    "project_id": "your-project-uuid",
    "name": "my-redis-cluster",
    "version": "7.0.12",
    "node_type": "RED1-XS",
    "cluster_size": 1,
    "user_name": "admin",
    "password": "secureP@ssw0rd!",
    "tls_enabled": true
  }
}
```

### Get a Cluster

```json
{
  "tool": "scaleway_redis_get_cluster",
  "arguments": {
    "region": "fr-par",
    "cluster_id": "cluster-uuid"
  }
}
```

### Update a Cluster

```json
{
  "tool": "scaleway_redis_update_cluster",
  "arguments": {
    "region": "fr-par",
    "cluster_id": "cluster-uuid",
    "name": "renamed-cluster",
    "tags": ["production", "cache"]
  }
}
```

### Delete a Cluster

```json
{
  "tool": "scaleway_redis_delete_cluster",
  "arguments": {
    "region": "fr-par",
    "cluster_id": "cluster-uuid"
  }
}
```

### Get Cluster Metrics

```json
{
  "tool": "scaleway_redis_list_cluster_metrics",
  "arguments": {
    "region": "fr-par",
    "cluster_id": "cluster-uuid",
    "start_at": "2026-03-10T00:00:00Z",
    "end_at": "2026-03-11T00:00:00Z",
    "metric_name": "cpu_usage_percent"
  }
}
```

### Get Cluster Certificate

```json
{
  "tool": "scaleway_redis_get_cluster_certificate",
  "arguments": {
    "region": "fr-par",
    "cluster_id": "cluster-uuid"
  }
}
```

### Renew Cluster Certificate

```json
{
  "tool": "scaleway_redis_renew_cluster_certificate",
  "arguments": {
    "region": "fr-par",
    "cluster_id": "cluster-uuid"
  }
}
```

### Add ACL Rules

```json
{
  "tool": "scaleway_redis_add_acl_rules",
  "arguments": {
    "region": "fr-par",
    "cluster_id": "cluster-uuid",
    "acl_rules": [
      { "ip_cidr": "192.168.1.0/24", "description": "Office network" },
      { "ip_cidr": "10.0.0.0/8", "description": "VPN range" }
    ]
  }
}
```

### Set ACL Rules (Replace All)

```json
{
  "tool": "scaleway_redis_set_acl_rules",
  "arguments": {
    "region": "fr-par",
    "cluster_id": "cluster-uuid",
    "acl_rules": [
      { "ip_cidr": "0.0.0.0/0", "description": "Allow all (dev only)" }
    ]
  }
}
```

### Delete ACL Rules

```json
{
  "tool": "scaleway_redis_delete_acl_rules",
  "arguments": {
    "region": "fr-par",
    "cluster_id": "cluster-uuid",
    "acl_rule_ids": ["rule-uuid-1", "rule-uuid-2"]
  }
}
```

### Add Endpoints

```json
{
  "tool": "scaleway_redis_add_endpoints",
  "arguments": {
    "region": "fr-par",
    "cluster_id": "cluster-uuid",
    "endpoints": [
      { "public": {} },
      { "private_network": { "id": "pn-uuid", "service_ips": ["10.0.1.10"] } }
    ]
  }
}
```

### Delete an Endpoint

```json
{
  "tool": "scaleway_redis_delete_endpoints",
  "arguments": {
    "region": "fr-par",
    "cluster_id": "cluster-uuid",
    "endpoint_id": "endpoint-uuid"
  }
}
```

### Set Endpoints (Replace All)

```json
{
  "tool": "scaleway_redis_set_endpoints",
  "arguments": {
    "region": "fr-par",
    "cluster_id": "cluster-uuid",
    "endpoints": [
      { "public": {} }
    ]
  }
}
```

### List Node Types

```json
{
  "tool": "scaleway_redis_list_node_types",
  "arguments": {
    "region": "fr-par",
    "page": 1,
    "pageSize": 20
  }
}
```

### List Cluster Versions

```json
{
  "tool": "scaleway_redis_list_cluster_versions",
  "arguments": {
    "region": "fr-par",
    "include_beta": true,
    "include_deprecated": false
  }
}
```
