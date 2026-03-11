# Tool Contracts: Scaleway Serverless Containers MCP Tools

**Feature**: 008-containers | **Date**: 2026-03-11

## Namespace Tools

### scaleway_containers_list_namespaces

**Scaleway API**: `GET /containers/v1beta1/regions/{region}/namespaces`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | account default | Scaleway region (e.g., fr-par) |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| name | string | no | - | Filter by namespace name |
| projectId | string (UUID) | no | - | Filter by project ID |
| organizationId | string (UUID) | no | - | Filter by organization ID |

**Output**: `{ items: Namespace[], total_count: number, page: number, page_size: number }`

---

### scaleway_containers_get_namespace

**Scaleway API**: `GET /containers/v1beta1/regions/{region}/namespaces/{namespace_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region |
| namespaceId | string (UUID) | yes | Namespace ID |

**Output**: `{ id, name, description, organization_id, project_id, status, registry_namespace_id, registry_endpoint, environment_variables, ... }`

---

### scaleway_containers_create_namespace

**Scaleway API**: `POST /containers/v1beta1/regions/{region}/namespaces`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region |
| name | string | yes | Namespace name |
| projectId | string (UUID) | no | Project ID |
| description | string | no | Namespace description |
| environmentVariables | Record<string, string> | no | Environment variables for all containers |
| secretEnvironmentVariables | Array<{key, value}> | no | Secret environment variables (write-only) |

**Output**: `{ id, name, description, project_id, status, ... }`

---

### scaleway_containers_update_namespace

**Scaleway API**: `PATCH /containers/v1beta1/regions/{region}/namespaces/{namespace_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region |
| namespaceId | string (UUID) | yes | Namespace ID |
| description | string | no | Updated description |
| environmentVariables | Record<string, string> | no | Updated environment variables |
| secretEnvironmentVariables | Array<{key, value}> | no | Updated secret environment variables |

**Output**: `{ id, name, description, project_id, status, ... }`

---

### scaleway_containers_delete_namespace

**Scaleway API**: `DELETE /containers/v1beta1/regions/{region}/namespaces/{namespace_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region |
| namespaceId | string (UUID) | yes | Namespace ID to delete |

**Output**: `{}` (empty on success, or namespace object during async deletion)

---

## Container Tools

### scaleway_containers_list_containers

**Scaleway API**: `GET /containers/v1beta1/regions/{region}/containers`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | account default | Scaleway region |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| namespaceId | string (UUID) | yes | - | Namespace ID to list containers from |
| name | string | no | - | Filter by container name |

**Output**: `{ items: Container[], total_count: number, page: number, page_size: number }`

---

### scaleway_containers_get_container

**Scaleway API**: `GET /containers/v1beta1/regions/{region}/containers/{container_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region |
| containerId | string (UUID) | yes | Container ID |

**Output**: `{ id, name, namespace_id, status, registry_image, min_scale, max_scale, memory_limit, cpu_limit, timeout, privacy, protocol, port, domain_name, ... }`

---

### scaleway_containers_create_container

**Scaleway API**: `POST /containers/v1beta1/regions/{region}/containers`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region |
| namespaceId | string (UUID) | yes | Namespace ID |
| name | string | yes | Container name |
| registryImage | string | yes | Docker image URI |
| port | number (1-65535) | no | Container listening port (default: 8080) |
| minScale | number (>=0) | no | Minimum instances (default: 0) |
| maxScale | number (>=1) | no | Maximum instances (default: 20) |
| memoryLimit | number | no | Memory limit in MB (default: 256) |
| cpuLimit | number | no | CPU limit in millicores (default: 140) |
| timeout | string | no | Request timeout (e.g., "300s") |
| privacy | enum | no | "public" or "private" (default: public) |
| protocol | enum | no | "http1" or "h2c" (default: http1) |
| httpOption | enum | no | "enabled", "redirected", or "doNotForce" |
| description | string | no | Container description |
| environmentVariables | Record<string, string> | no | Environment variables |
| secretEnvironmentVariables | Array<{key, value}> | no | Secret environment variables |

**Output**: `{ id, name, namespace_id, status, registry_image, ... }`

---

### scaleway_containers_update_container

**Scaleway API**: `PATCH /containers/v1beta1/regions/{region}/containers/{container_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region |
| containerId | string (UUID) | yes | Container ID |
| registryImage | string | no | Updated Docker image URI |
| port | number (1-65535) | no | Updated container port |
| minScale | number (>=0) | no | Updated minimum scale |
| maxScale | number (>=1) | no | Updated maximum scale |
| memoryLimit | number | no | Updated memory limit in MB |
| cpuLimit | number | no | Updated CPU limit in millicores |
| timeout | string | no | Updated request timeout |
| privacy | enum | no | Updated privacy setting |
| protocol | enum | no | Updated protocol |
| httpOption | enum | no | Updated HTTP option |
| description | string | no | Updated description |
| environmentVariables | Record<string, string> | no | Updated environment variables |
| secretEnvironmentVariables | Array<{key, value}> | no | Updated secret environment variables |

**Output**: `{ id, name, namespace_id, status, registry_image, ... }`

---

### scaleway_containers_delete_container

**Scaleway API**: `DELETE /containers/v1beta1/regions/{region}/containers/{container_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region |
| containerId | string (UUID) | yes | Container ID to delete |

**Output**: `{}` (empty on success, or container object during async deletion)

---

### scaleway_containers_deploy_container

**Scaleway API**: `POST /containers/v1beta1/regions/{region}/containers/{container_id}/deploy`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region |
| containerId | string (UUID) | yes | Container ID to deploy |

**Output**: `{ id, name, namespace_id, status, ... }` (container object with updated status)

---

## Cron Tools

### scaleway_containers_list_crons

**Scaleway API**: `GET /containers/v1beta1/regions/{region}/crons`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | account default | Scaleway region |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| containerId | string (UUID) | yes | - | Container ID to list crons for |

**Output**: `{ items: Cron[], total_count: number, page: number, page_size: number }`

---

### scaleway_containers_create_cron

**Scaleway API**: `POST /containers/v1beta1/regions/{region}/crons`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region |
| containerId | string (UUID) | yes | Container ID |
| schedule | string | yes | Cron schedule expression (e.g., "0 * * * *") |
| args | Record<string, unknown> | no | JSON arguments passed to the container |
| name | string | no | Cron trigger name |

**Output**: `{ id, container_id, schedule, args, name, status }`

---

### scaleway_containers_update_cron

**Scaleway API**: `PATCH /containers/v1beta1/regions/{region}/crons/{cron_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region |
| cronId | string (UUID) | yes | Cron ID |
| containerId | string (UUID) | no | Updated container ID |
| schedule | string | no | Updated cron schedule expression |
| args | Record<string, unknown> | no | Updated JSON arguments |
| name | string | no | Updated cron name |

**Output**: `{ id, container_id, schedule, args, name, status }`

---

### scaleway_containers_delete_cron

**Scaleway API**: `DELETE /containers/v1beta1/regions/{region}/crons/{cron_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region |
| cronId | string (UUID) | yes | Cron ID to delete |

**Output**: `{}` (empty on success)

---

## Domain Tools

### scaleway_containers_list_domains

**Scaleway API**: `GET /containers/v1beta1/regions/{region}/domains`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | account default | Scaleway region |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| containerId | string (UUID) | yes | - | Container ID to list domains for |

**Output**: `{ items: Domain[], total_count: number, page: number, page_size: number }`

---

### scaleway_containers_create_domain

**Scaleway API**: `POST /containers/v1beta1/regions/{region}/domains`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region |
| containerId | string (UUID) | yes | Container ID |
| hostname | string | yes | Custom domain hostname (e.g., app.example.com) |

**Output**: `{ id, hostname, container_id, url, status }`

---

### scaleway_containers_delete_domain

**Scaleway API**: `DELETE /containers/v1beta1/regions/{region}/domains/{domain_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region |
| domainId | string (UUID) | yes | Domain ID to delete |

**Output**: `{}` (empty on success)

---

## Token Tools

### scaleway_containers_create_token

**Scaleway API**: `POST /containers/v1beta1/regions/{region}/tokens`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region |
| containerId | string (UUID) | no | Container ID (provide either containerId or namespaceId) |
| namespaceId | string (UUID) | no | Namespace ID (provide either containerId or namespaceId) |
| description | string | no | Token description |
| expiresAt | string (ISO 8601) | no | Expiration date |

**Output**: `{ id, token, container_id, namespace_id, description, expires_at, status }`

---

### scaleway_containers_delete_token

**Scaleway API**: `DELETE /containers/v1beta1/regions/{region}/tokens/{token_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region |
| tokenId | string (UUID) | yes | Token ID to delete |

**Output**: `{}` (empty on success)
