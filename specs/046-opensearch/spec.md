# 046-opensearch: Cloud Essentials for OpenSearch API

## Overview
MCP tools for Scaleway Cloud Essentials for OpenSearch (`searchdb/v1alpha1`), a
region-scoped managed OpenSearch service (Public Beta, `fr-par`). The tools manage
deployments and their lifecycle, users, network endpoints, and expose read access
to catalog resources (node types, versions) and the deployment Certificate Authority.

## User Stories

### P1 - Deployment lifecycle
- As a user, I can list, get, create, update, and delete OpenSearch deployments.
- As a user, I can upgrade a deployment by scaling node count or growing the volume.

### P1 - Manage users
- As a user, I can list, create, update (password), and delete deployment users.

### P1 - Manage network endpoints
- As a user, I can create a public or Private Network endpoint on a deployment.
- As a user, I can delete an endpoint.

### P2 - Catalog & connectivity
- As a user, I can list available node types with specs and stock status.
- As a user, I can list available OpenSearch versions.
- As a user, I can download the deployment's Certificate Authority for TLS connections.

## Entities

### Deployment
- id: string (UUID)
- name: string
- organization_id / project_id: string (UUID)
- status: enum (unknown_status, ready, creating, initializing, upgrading, deleting, error, locked, locking, unlocking)
- tags: string[]
- node_amount: number (deprecated, use node_count)
- node_count: number
- node_type: string (e.g. SEARCHDB-SHARED-2C-8G)
- volume: { type, size_bytes } | null
- endpoints: Endpoint[]
- version: string
- region: string
- created_at / updated_at: string (ISO datetime)

### Endpoint
- id: string (UUID)
- dns_record: string | null (deprecated — use services[].url)
- services: { name, port, url }[]
- public: {} (present for public endpoints)
- private_network: { private_network_id } (present for Private Network endpoints)

### Volume / VolumeType
- type: enum (unknown_type, sbs_5k, sbs_15k)
- size_bytes: number

### NodeType
- name: string
- stock_status: enum (unknown_stock, low_stock, out_of_stock, available)
- description: string
- vcpus: number
- memory_bytes: number
- disabled / beta: boolean
- instance_range: string
- available_volume_types: { type, description, min_size_bytes, max_size_bytes, chunk_size_bytes }[]

### User
- username: string

### Version
- version: string
- end_of_life: string (ISO datetime) | null
- disabled / beta: boolean

## Tools

| Tool | HTTP | Priority |
|------|------|----------|
| scaleway_opensearch_list_deployments | GET /searchdb/v1alpha1/regions/{region}/deployments | P1 |
| scaleway_opensearch_get_deployment | GET /searchdb/v1alpha1/regions/{region}/deployments/{deployment_id} | P1 |
| scaleway_opensearch_create_deployment | POST /searchdb/v1alpha1/regions/{region}/deployments | P1 |
| scaleway_opensearch_update_deployment | PATCH /searchdb/v1alpha1/regions/{region}/deployments/{deployment_id} | P1 |
| scaleway_opensearch_upgrade_deployment | POST /searchdb/v1alpha1/regions/{region}/deployments/{deployment_id}/upgrade | P1 |
| scaleway_opensearch_delete_deployment | DELETE /searchdb/v1alpha1/regions/{region}/deployments/{deployment_id} | P1 |
| scaleway_opensearch_get_certificate_authority | GET /searchdb/v1alpha1/regions/{region}/deployments/{deployment_id}/certificate-authority | P2 |
| scaleway_opensearch_list_node_types | GET /searchdb/v1alpha1/regions/{region}/node-types | P2 |
| scaleway_opensearch_list_versions | GET /searchdb/v1alpha1/regions/{region}/versions | P2 |
| scaleway_opensearch_list_users | GET /searchdb/v1alpha1/regions/{region}/deployments/{deployment_id}/users | P1 |
| scaleway_opensearch_create_user | POST /searchdb/v1alpha1/regions/{region}/deployments/{deployment_id}/users | P1 |
| scaleway_opensearch_update_user | PATCH /searchdb/v1alpha1/regions/{region}/deployments/{deployment_id}/users/{username} | P1 |
| scaleway_opensearch_delete_user | DELETE /searchdb/v1alpha1/regions/{region}/deployments/{deployment_id}/users/{username} | P1 |
| scaleway_opensearch_create_endpoint | POST /searchdb/v1alpha1/regions/{region}/endpoints | P1 |
| scaleway_opensearch_delete_endpoint | DELETE /searchdb/v1alpha1/regions/{region}/endpoints/{endpoint_id} | P1 |

## Out of Scope

- **Snapshots / backups** and **ACLs / allowed IPs**: mentioned in the product
  concepts documentation, but the `searchdb/v1alpha1` API surface (verified against
  the developer reference and the Scaleway Go SDK) exposes **no** endpoints for
  them. Excluded until the API adds these paths.
- **OpenSearch data-plane REST API** (indexing, search, `_cluster/health`): served
  directly by the deployment endpoint, not by the Scaleway management API. Users
  connect with the CA and credentials produced by these tools.
- **Get/List single endpoint**: the API has no `GET /endpoints/{id}` — endpoints are
  read via the parent Deployment's `endpoints` array.

## Acceptance Scenarios

1. Given valid credentials, when listing deployments in `fr-par`, then a paginated
   `{ items, totalCount, page, pageSize }` structure is returned.
2. Given a node type and version, when creating a deployment, then a Deployment with
   status `creating` is returned.
3. Given an existing deployment, when upgrading with `nodeCount`, then a Deployment
   with status `upgrading` is returned.
4. Given a deployment, when creating a public endpoint, then an Endpoint is returned.
5. Given an unknown deployment id, when getting it, then a `not_found` error result
   is returned (not an exception).
