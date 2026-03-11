# Scaleway Kubernetes API Reference

Base URL: `https://api.scaleway.com/k8s/v1/regions/{region}`

## Endpoints

### Clusters

#### List Clusters
- **GET** `/clusters`
- Query: `page`, `page_size`, `order_by`, `name`, `status`, `type`, `project_id`, `organization_id`
- Response: `{ clusters: Cluster[], total_count: number }`

#### Get Cluster
- **GET** `/clusters/{cluster_id}`
- Response: `Cluster`

#### Create Cluster
- **POST** `/clusters`
- Body: `{ name, version, cni, description?, tags?, type?, project_id?, autoscaler_config? }`
- Response: `Cluster`

#### Delete Cluster
- **DELETE** `/clusters/{cluster_id}`
- Query: `with_additional_resources`
- Response: `Cluster`

#### Upgrade Cluster
- **POST** `/clusters/{cluster_id}/upgrade`
- Body: `{ version, upgrade_pools? }`
- Response: `Cluster`

#### List Cluster Available Versions
- **GET** `/clusters/{cluster_id}/available-versions`
- Response: `{ versions: Version[] }`

#### Get Cluster Kubeconfig
- **GET** `/clusters/{cluster_id}/kubeconfig`
- Response: `{ content: string }` (base64 encoded kubeconfig)

### Node Pools

#### List Pools
- **GET** `/clusters/{cluster_id}/pools`
- Query: `page`, `page_size`, `order_by`, `name`, `status`
- Response: `{ nodes: Pool[], total_count: number }`

#### Get Pool
- **GET** `/pools/{pool_id}`
- Response: `Pool`

#### Create Pool
- **POST** `/clusters/{cluster_id}/pools`
- Body: `{ name, node_type, size, min_size?, max_size?, autoscaling?, autohealing?, tags? }`
- Response: `Pool`

#### Update Pool
- **PATCH** `/pools/{pool_id}`
- Body: `{ size?, min_size?, max_size?, autoscaling?, autohealing?, tags? }`
- Response: `Pool`

#### Delete Pool
- **DELETE** `/pools/{pool_id}`
- Response: `Pool`

#### Upgrade Pool
- **POST** `/pools/{pool_id}/upgrade`
- Body: `{ version }`
- Response: `Pool`

## Error Codes
- 400: Invalid request parameters
- 401: Authentication required
- 403: Insufficient permissions
- 404: Resource not found
- 429: Rate limited

## Pagination
All list endpoints support `page` (1-indexed) and `page_size` (default 20, max 100).
Response includes `total_count`.
