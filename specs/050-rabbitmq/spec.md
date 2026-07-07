# 050-rabbitmq: Cloud Essentials for RabbitMQ (MessageQ) API

## Overview

MCP tools for Scaleway's **Cloud Essentials for RabbitMQ** product. The underlying
control-plane API is **MessageQ** (API slug `messageq`, version `v1alpha1`), a
region-scoped API (currently `fr-par` only) that manages RabbitMQ deployments,
their users, network endpoints, and exposes node-type and version catalogs.

- Official reference: https://www.scaleway.com/en/developers/api/messageq/
- Product docs: https://www.scaleway.com/en/docs/rabbitmq/
- Verified against the generated Go SDK: `scaleway/scaleway-sdk-go` `api/messageq/v1alpha1`

## User Stories

### P1 - Deployment lifecycle
- As a user, I can list, get, create, update, upgrade, and delete RabbitMQ deployments.
- As a user, I can download a deployment's certificate authority for TLS connections.

### P1 - User management
- As a user, I can list users of a deployment, and create, update (password), and delete them.

### P2 - Endpoint management
- As a user, I can create a public or Private Network endpoint on a deployment and delete endpoints.

### P2 - Catalog discovery
- As a user, I can list available node types and RabbitMQ versions in a region.

## Entities

### Deployment
- id, name, organization_id, project_id
- status: enum (unknown_status, ready, creating, initializing, upgrading, deleting, error, locked, locking, unlocking)
- tags: string[]
- node_count: number
- node_type: string
- volume: Volume | null
- endpoints: Endpoint[]
- version: string
- region: string
- created_at, updated_at: ISO datetime

### Endpoint
- id: string (UUID)
- dns_record: string | null (deprecated — use services[].url)
- services: { name, port, url }[]
- public: {} (present for public endpoints)
- private_network: { private_network_id } (present for Private Network endpoints)

### Volume
- type: enum (unknown_type, sbs_5k, sbs_15k)
- size_bytes: number

### User
- username: string (users are identified by username; there is no user UUID)

### NodeType
- name, description, instance_range
- stock_status: enum (unknown_stock, low_stock, out_of_stock, available)
- vcpus: number
- memory_bytes: number
- disabled, beta: boolean
- available_volume_types: { type, description, min_size_bytes, max_size_bytes, chunk_size_bytes }[]

### Version
- version: string
- end_of_life: string | null
- disabled, beta: boolean

## Tools

| Tool | HTTP | Priority |
|------|------|----------|
| scaleway_rabbitmq_list_deployments | GET /messageq/v1alpha1/regions/{region}/deployments | P1 |
| scaleway_rabbitmq_get_deployment | GET /messageq/v1alpha1/regions/{region}/deployments/{deployment_id} | P1 |
| scaleway_rabbitmq_create_deployment | POST /messageq/v1alpha1/regions/{region}/deployments | P1 |
| scaleway_rabbitmq_update_deployment | PATCH /messageq/v1alpha1/regions/{region}/deployments/{deployment_id} | P1 |
| scaleway_rabbitmq_upgrade_deployment | POST /messageq/v1alpha1/regions/{region}/deployments/{deployment_id}/upgrade | P1 |
| scaleway_rabbitmq_delete_deployment | DELETE /messageq/v1alpha1/regions/{region}/deployments/{deployment_id} | P1 |
| scaleway_rabbitmq_get_deployment_certificate | GET /messageq/v1alpha1/regions/{region}/deployments/{deployment_id}/certificate-authority | P1 |
| scaleway_rabbitmq_list_users | GET /messageq/v1alpha1/regions/{region}/deployments/{deployment_id}/users | P1 |
| scaleway_rabbitmq_create_user | POST /messageq/v1alpha1/regions/{region}/deployments/{deployment_id}/users | P1 |
| scaleway_rabbitmq_update_user | PATCH /messageq/v1alpha1/regions/{region}/deployments/{deployment_id}/users/{username} | P1 |
| scaleway_rabbitmq_delete_user | DELETE /messageq/v1alpha1/regions/{region}/deployments/{deployment_id}/users/{username} | P1 |
| scaleway_rabbitmq_create_endpoint | POST /messageq/v1alpha1/regions/{region}/endpoints | P2 |
| scaleway_rabbitmq_delete_endpoint | DELETE /messageq/v1alpha1/regions/{region}/endpoints/{endpoint_id} | P2 |
| scaleway_rabbitmq_list_node_types | GET /messageq/v1alpha1/regions/{region}/node-types | P2 |
| scaleway_rabbitmq_list_versions | GET /messageq/v1alpha1/regions/{region}/versions | P2 |

## Functional Requirements

- FR-001: List deployments with pagination and filtering (organization_id, project_id, name, tags, order_by).
- FR-002: Get a deployment by ID and region.
- FR-003: Create a deployment (name, node_type, node_count, version, optional project_id, tags, user_name, password, volume, endpoints).
- FR-004: Update a deployment (name, tags).
- FR-005: Upgrade a deployment by scaling node_count or volume_size_bytes (exactly one).
- FR-006: Delete a deployment by ID and region.
- FR-007: Download a deployment's certificate authority.
- FR-008: List users of a deployment with pagination and filtering (name, order_by).
- FR-009: Create a user (username, password) on a deployment.
- FR-010: Update a user's password.
- FR-011: Delete a user by username.
- FR-012: Create a public or Private Network endpoint for a deployment.
- FR-013: Delete an endpoint by ID.
- FR-014: List node types with pagination and ordering.
- FR-015: List versions with pagination, ordering, and version filter.
- FR-016: All tools validate inputs with Zod schemas.
- FR-017: All errors mapped to structured MCP error responses.
- FR-018: All list operations support standard pagination (page, pageSize, total_count).
- FR-019: All tools accept a region parameter (regional API locality).

## Out of Scope

- **RabbitMQ vhosts, queues, exchanges, bindings, and per-user permissions**: These
  are not managed by the `messageq` control-plane API. They are configured at runtime
  through the RabbitMQ Management REST API / AMQP against a running deployment, which
  is outside the scope of the Scaleway API this MCP server proxies. (The assignment
  brief listed "vhosts" as an expected resource; the authoritative API and SDK expose
  no vhost endpoint, so vhost management is intentionally excluded.)
- **Get single user**: The API exposes list/create/update/delete for users but no
  get-single-user endpoint; therefore no get-user tool is provided.
- **List endpoints**: The API provides create/delete for endpoints but no list-endpoints
  endpoint (endpoints are read via the parent deployment's `endpoints` field).
- **WaitForDeployment polling**: Client-side polling helper from the SDK is not exposed
  as an MCP tool (stateless proxy; callers can poll via get_deployment).
