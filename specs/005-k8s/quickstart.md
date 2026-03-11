# Quickstart: Scaleway Kubernetes (Kapsule & Kosmos) MCP Tools

**Feature**: 005-k8s | **Date**: 2026-03-11

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
  "tool": "scaleway_k8s_list_clusters",
  "arguments": {
    "region": "fr-par",
    "page": 1,
    "pageSize": 10
  }
}
```

### Create a Kubernetes Cluster

```json
{
  "tool": "scaleway_k8s_create_cluster",
  "arguments": {
    "region": "fr-par",
    "name": "my-kapsule-cluster",
    "version": "1.30.2",
    "cni": "cilium",
    "description": "Production cluster"
  }
}
```

### Get Cluster Details

```json
{
  "tool": "scaleway_k8s_get_cluster",
  "arguments": {
    "region": "fr-par",
    "cluster_id": "cluster-uuid"
  }
}
```

### Create a Node Pool

```json
{
  "tool": "scaleway_k8s_create_pool",
  "arguments": {
    "region": "fr-par",
    "cluster_id": "cluster-uuid",
    "name": "worker-pool",
    "node_type": "DEV1-M",
    "size": 3,
    "min_size": 1,
    "max_size": 5,
    "autoscaling": true,
    "autohealing": true
  }
}
```

### Update a Node Pool (Scale Up)

```json
{
  "tool": "scaleway_k8s_update_pool",
  "arguments": {
    "region": "fr-par",
    "pool_id": "pool-uuid",
    "size": 5,
    "max_size": 10
  }
}
```

### Get Kubeconfig

```json
{
  "tool": "scaleway_k8s_get_cluster_kubeconfig",
  "arguments": {
    "region": "fr-par",
    "cluster_id": "cluster-uuid"
  }
}
```

### List Available Upgrade Versions

```json
{
  "tool": "scaleway_k8s_list_cluster_available_versions",
  "arguments": {
    "region": "fr-par",
    "cluster_id": "cluster-uuid"
  }
}
```

### Upgrade a Cluster

```json
{
  "tool": "scaleway_k8s_upgrade_cluster",
  "arguments": {
    "region": "fr-par",
    "cluster_id": "cluster-uuid",
    "version": "1.31.0",
    "upgrade_pools": true
  }
}
```

### Upgrade a Node Pool

```json
{
  "tool": "scaleway_k8s_upgrade_pool",
  "arguments": {
    "region": "fr-par",
    "pool_id": "pool-uuid",
    "version": "1.31.0"
  }
}
```

### Delete a Node Pool

```json
{
  "tool": "scaleway_k8s_delete_pool",
  "arguments": {
    "region": "fr-par",
    "pool_id": "pool-uuid"
  }
}
```

### Delete a Cluster (with Resource Cleanup)

```json
{
  "tool": "scaleway_k8s_delete_cluster",
  "arguments": {
    "region": "fr-par",
    "cluster_id": "cluster-uuid",
    "with_additional_resources": true
  }
}
```
