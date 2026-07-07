# Tool Contracts: 046-opensearch

All tools are region-scoped; every request requires `region` (format `xx-xxx`).
Errors are returned as `{ content: [...], isError: true }` with an `error`
object `{ type, message, statusCode }`, never thrown. Success returns
`{ content: [{ type: "text", text: <JSON> }] }`. List tools return the paginated
envelope `{ items, totalCount, page, pageSize }`.

## Deployments

### scaleway_opensearch_list_deployments
- Input: `region`, `page?`, `pageSize?`, `organizationId?`, `projectId?`, `name?`, `tags?`, `orderBy?`
- API: `GET /searchdb/v1alpha1/regions/{region}/deployments`
- Output: paginated Deployment list

### scaleway_opensearch_get_deployment
- Input: `region`, `deploymentId`
- API: `GET .../deployments/{deployment_id}`
- Output: Deployment

### scaleway_opensearch_create_deployment
- Input: `region`, `name`, `nodeType`, `version`, `projectId?`, `tags?`, `nodeCount?`, `userName?`, `password?`, `volume?{type,sizeBytes}`, `endpoints?[{public?,privateNetworkId?}]`
- API: `POST .../deployments`
- Output: Deployment (status creating)

### scaleway_opensearch_update_deployment
- Input: `region`, `deploymentId`, `name?`, `tags?`
- API: `PATCH .../deployments/{deployment_id}`
- Output: Deployment

### scaleway_opensearch_upgrade_deployment
- Input: `region`, `deploymentId`, `nodeCount?` XOR `volumeSizeBytes?` (exactly one)
- API: `POST .../deployments/{deployment_id}/upgrade`
- Output: Deployment (status upgrading)

### scaleway_opensearch_delete_deployment
- Input: `region`, `deploymentId`
- API: `DELETE .../deployments/{deployment_id}`
- Output: Deployment (status deleting)

### scaleway_opensearch_get_certificate_authority
- Input: `region`, `deploymentId`
- API: `GET .../deployments/{deployment_id}/certificate-authority`
- Output: CA file payload

## Node types & versions

### scaleway_opensearch_list_node_types
- Input: `region`, `page?`, `pageSize?`, `orderBy?`
- API: `GET .../node-types`
- Output: paginated NodeType list

### scaleway_opensearch_list_versions
- Input: `region`, `page?`, `pageSize?`, `version?`, `orderBy?`
- API: `GET .../versions`
- Output: paginated Version list

## Users

### scaleway_opensearch_list_users
- Input: `region`, `deploymentId`, `page?`, `pageSize?`, `name?`, `orderBy?`
- API: `GET .../deployments/{deployment_id}/users`
- Output: paginated User list

### scaleway_opensearch_create_user
- Input: `region`, `deploymentId`, `username`, `password`
- API: `POST .../deployments/{deployment_id}/users`
- Output: User

### scaleway_opensearch_update_user
- Input: `region`, `deploymentId`, `username`, `password?`
- API: `PATCH .../deployments/{deployment_id}/users/{username}`
- Output: User

### scaleway_opensearch_delete_user
- Input: `region`, `deploymentId`, `username`
- API: `DELETE .../deployments/{deployment_id}/users/{username}`
- Output: `{ deleted: true, username }`

## Endpoints

### scaleway_opensearch_create_endpoint
- Input: `region`, `deploymentId`, `public?` or `privateNetworkId?`
- API: `POST .../endpoints` — body `{ deployment_id, endpoint_spec }`
- Output: Endpoint

### scaleway_opensearch_delete_endpoint
- Input: `region`, `endpointId`
- API: `DELETE .../endpoints/{endpoint_id}`
- Output: `{ deleted: true, id }`
