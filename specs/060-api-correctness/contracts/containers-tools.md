# Tool Contracts: Serverless Containers (v1)

Feature 060 migrated or relocated these tools. This file supersedes the corresponding entries in earlier feature contracts (see Superseded contracts below). Input schemas are the Zod shapes in `src/tools/containers/types.ts`; the JSON projection is served by `scaleway_describe`.

Reference: `specs/scaleway-api/containers/api-reference.md`. Errors return `{ error: { type, message, statusCode } }` with `isError: true`; `unsupported_operation` (501) marks combinations with no faithful upstream equivalent.

### `scaleway_containers_create_container`

- **Endpoint**: `POST /containers/v1/regions/{region}/containers`
- **Read-only**: no
- **Description**: Create a new serverless container in a namespace. Example: {namespaceId: '11111111-1111-4111-8111-111111111111', name: 'web', registryImage: 'rg.fr-par.scw.cloud/ns/web:1.0', memoryLimit: 512}
- **Required**: `namespaceId`, `name`, `registryImage`
- **Optional**: `region`, `port`, `minScale`, `maxScale`, `memoryLimit`, `cpuLimit`, `timeout`, `privacy`, `protocol`, `httpOption`, `httpsConnectionsOnly`, `description`, `environmentVariables`, `secretEnvironmentVariables`

### `scaleway_containers_create_cron`

- **Endpoint**: `POST /containers/v1/regions/{region}/triggers`
- **Read-only**: no
- **Description**: Create a v1 cron trigger; JSON args are POSTed to / in UTC unless timezone is specified. Example: {containerId: '11111111-1111-4111-8111-111111111111', schedule: '0 * * * *', args: {job: 'sync'}}
- **Required**: `containerId`, `schedule`
- **Optional**: `region`, `timezone`, `args`, `name`

### `scaleway_containers_create_domain`

- **Endpoint**: `POST /containers/v1/regions/{region}/domains`
- **Read-only**: no
- **Description**: Create a custom domain mapping for a serverless container. Example: {containerId: '11111111-1111-4111-8111-111111111111', hostname: 'app.example.com'}
- **Required**: `containerId`, `hostname`
- **Optional**: `region`

### `scaleway_containers_create_namespace`

- **Endpoint**: `POST /containers/v1/regions/{region}/namespaces`
- **Read-only**: no
- **Description**: Create a new serverless container namespace. Example: {name: 'api', region: 'fr-par'}
- **Required**: `name`
- **Optional**: `region`, `projectId`, `description`, `environmentVariables`, `secretEnvironmentVariables`

### `scaleway_containers_delete_container`

- **Endpoint**: `DELETE /containers/v1/regions/{region}/containers/{container_id}`
- **Read-only**: no
- **Description**: Delete a serverless container. Example: {containerId: '11111111-1111-4111-8111-111111111111'}
- **Required**: `containerId`
- **Optional**: `region`

### `scaleway_containers_delete_cron`

- **Endpoint**: `DELETE /containers/v1/regions/{region}/triggers/{trigger_id}`
- **Read-only**: no
- **Description**: Delete a cron trigger for a serverless container. Example: {cronId: '11111111-1111-4111-8111-111111111111'}
- **Required**: `cronId`
- **Optional**: `region`

### `scaleway_containers_delete_domain`

- **Endpoint**: `DELETE /containers/v1/regions/{region}/domains/{domain_id}`
- **Read-only**: no
- **Description**: Delete a custom domain mapping for a serverless container. Example: {domainId: '11111111-1111-4111-8111-111111111111'}
- **Required**: `domainId`
- **Optional**: `region`

### `scaleway_containers_delete_namespace`

- **Endpoint**: `DELETE /containers/v1/regions/{region}/namespaces/{namespace_id}`
- **Read-only**: no
- **Description**: Delete a serverless container namespace. Example: {namespaceId: '11111111-1111-4111-8111-111111111111'}
- **Required**: `namespaceId`
- **Optional**: `region`

### `scaleway_containers_get_container`

- **Endpoint**: `GET /containers/v1/regions/{region}/containers/{container_id}`
- **Read-only**: yes
- **Description**: Get details of a serverless container (raw v1 fields: image, memory_limit_bytes, mvcpu_limit, public_endpoint). Example: {containerId: '11111111-1111-4111-8111-111111111111'}
- **Required**: `containerId`
- **Optional**: `region`

### `scaleway_containers_get_namespace`

- **Endpoint**: `GET /containers/v1/regions/{region}/namespaces/{namespace_id}`
- **Read-only**: yes
- **Description**: Get details of a serverless container namespace. Example: {namespaceId: '11111111-1111-4111-8111-111111111111'}
- **Required**: `namespaceId`
- **Optional**: `region`

### `scaleway_containers_list_containers`

- **Endpoint**: `GET /containers/v1/regions/{region}/containers`
- **Read-only**: yes
- **Description**: List serverless containers in a namespace with pagination. Example: {namespaceId: '11111111-1111-4111-8111-111111111111'}
- **Required**: `namespaceId`
- **Optional**: `page`, `pageSize`, `region`, `name`

### `scaleway_containers_list_crons`

- **Endpoint**: `GET /containers/v1/regions/{region}/triggers`
- **Read-only**: yes
- **Description**: List cron triggers for a serverless container. Example: {containerId: '11111111-1111-4111-8111-111111111111'}
- **Required**: `containerId`
- **Optional**: `page`, `pageSize`, `region`

### `scaleway_containers_list_domains`

- **Endpoint**: `GET /containers/v1/regions/{region}/domains`
- **Read-only**: yes
- **Description**: List custom domains for a serverless container. Example: {containerId: '11111111-1111-4111-8111-111111111111'}
- **Required**: `containerId`
- **Optional**: `page`, `pageSize`, `region`

### `scaleway_containers_list_namespaces`

- **Endpoint**: `GET /containers/v1/regions/{region}/namespaces`
- **Read-only**: yes
- **Description**: List serverless container namespaces in a region with pagination. Example: {region: 'fr-par'}
- **Required**: none
- **Optional**: `page`, `pageSize`, `region`, `name`, `projectId`, `organizationId`

### `scaleway_containers_update_container`

- **Endpoint**: `PATCH /containers/v1/regions/{region}/containers/{container_id}`
- **Read-only**: no
- **Description**: Update a serverless container configuration. Example: {containerId: '11111111-1111-4111-8111-111111111111', minScale: 1, maxScale: 3}
- **Required**: `containerId`
- **Optional**: `region`, `registryImage`, `port`, `minScale`, `maxScale`, `memoryLimit`, `cpuLimit`, `timeout`, `privacy`, `protocol`, `httpOption`, `httpsConnectionsOnly`, `description`, `environmentVariables`, `secretEnvironmentVariables`

### `scaleway_containers_update_cron`

- **Endpoint**: `PATCH /containers/v1/regions/{region}/triggers/{trigger_id}`
- **Read-only**: no
- **Description**: Update a v1 cron trigger by trigger ID; retargeting containerId is unsupported. Example: {cronId: '11111111-1111-4111-8111-111111111111', schedule: '*/15 * * * *'}
- **Required**: `cronId`
- **Optional**: `region`, `containerId`, `schedule`, `timezone`, `args`, `name`

### `scaleway_containers_update_namespace`

- **Endpoint**: `PATCH /containers/v1/regions/{region}/namespaces/{namespace_id}`
- **Read-only**: no
- **Description**: Update a serverless container namespace. Example: {namespaceId: '11111111-1111-4111-8111-111111111111', description: 'prod'}
- **Required**: `namespaceId`
- **Optional**: `region`, `description`, `environmentVariables`, `secretEnvironmentVariables`

## Superseded contracts

- `specs/008-containers/contracts/tool-contract.md` (v1beta1, deploy/token tools)
