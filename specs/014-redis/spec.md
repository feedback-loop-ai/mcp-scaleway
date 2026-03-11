# Feature Specification: Scaleway Managed Redis MCP Tools

**Feature Branch**: `014-redis`
**Created**: 2026-03-11
**Status**: Approved
**Input**: Implement MCP tools for the Scaleway Managed Redis API (regional managed database)

## User Scenarios & Testing

### User Story 1 - Cluster CRUD (Priority: P1)

As an AI agent, I need to list, get, create, update, and delete Scaleway Managed Redis clusters so that I can manage Redis infrastructure programmatically.

**Why this priority**: Clusters are the core resource of the Managed Redis API. Every other resource (ACL rules, endpoints, certificates) exists to support clusters.

**Independent Test**: Can be fully tested by creating a cluster, listing it, getting it, updating it, and deleting it.

**Acceptance Scenarios**:

1. **Given** valid credentials and region, **When** I call `scaleway_redis_list_clusters`, **Then** I receive a paginated list of clusters with total_count
2. **Given** a valid cluster_id and region, **When** I call `scaleway_redis_get_cluster`, **Then** I receive the full cluster object
3. **Given** valid parameters (name, version, node_type, cluster_size, user_name, password, project_id), **When** I call `scaleway_redis_create_cluster`, **Then** a new cluster is created and returned
4. **Given** a valid cluster_id and region with update fields, **When** I call `scaleway_redis_update_cluster`, **Then** the cluster is updated and returned
5. **Given** a valid cluster_id and region, **When** I call `scaleway_redis_delete_cluster`, **Then** the cluster is deleted

---

### User Story 2 - Cluster Metrics & Certificates (Priority: P2)

As an AI agent, I need to retrieve cluster metrics and manage TLS certificates so that I can monitor Redis health and maintain secure connections.

**Why this priority**: Observability and TLS certificate management are essential for production Redis clusters but depend on having a cluster first.

**Independent Test**: Can be tested by getting metrics and certificate for an existing cluster, and renewing the certificate.

**Acceptance Scenarios**:

1. **Given** a valid cluster_id and region, **When** I call `scaleway_redis_list_cluster_metrics`, **Then** I receive time-series metric data
2. **Given** a valid cluster_id and region with optional time range and metric_name, **When** I call `scaleway_redis_list_cluster_metrics`, **Then** I receive filtered metric data
3. **Given** a valid cluster_id and region, **When** I call `scaleway_redis_get_cluster_certificate`, **Then** I receive the TLS certificate
4. **Given** a valid cluster_id and region, **When** I call `scaleway_redis_renew_cluster_certificate`, **Then** the certificate is renewed

---

### User Story 3 - ACL Rule Management (Priority: P2)

As an AI agent, I need to add, delete, and set ACL rules on Redis clusters so that I can control network access to the cluster.

**Why this priority**: ACL rules are critical for security but require a cluster to exist first.

**Independent Test**: Can be tested by adding ACL rules, setting (replacing) rules, and deleting rules on an existing cluster.

**Acceptance Scenarios**:

1. **Given** a valid cluster_id, region, and ACL rule specs, **When** I call `scaleway_redis_add_acl_rules`, **Then** the rules are added to the cluster
2. **Given** a valid cluster_id, region, and ACL rule IDs, **When** I call `scaleway_redis_delete_acl_rules`, **Then** the specified rules are removed
3. **Given** a valid cluster_id, region, and ACL rule specs, **When** I call `scaleway_redis_set_acl_rules`, **Then** all existing rules are replaced with the new set

---

### User Story 4 - Endpoint Management (Priority: P2)

As an AI agent, I need to add, delete, and set endpoints on Redis clusters so that I can configure how clients connect to the cluster (public or private network).

**Why this priority**: Endpoints control cluster connectivity and are required for production use, but depend on having a cluster.

**Independent Test**: Can be tested by adding endpoints, setting (replacing) endpoints, and deleting an endpoint.

**Acceptance Scenarios**:

1. **Given** a valid cluster_id, region, and endpoint specs, **When** I call `scaleway_redis_add_endpoints`, **Then** the endpoints are added
2. **Given** a valid cluster_id, region, and endpoint_id, **When** I call `scaleway_redis_delete_endpoints`, **Then** the endpoint is removed
3. **Given** a valid cluster_id, region, and endpoint specs, **When** I call `scaleway_redis_set_endpoints`, **Then** all existing endpoints are replaced

---

### User Story 5 - Discovery (Priority: P3)

As an AI agent, I need to list available node types and Redis versions so that I can choose the right configuration when creating clusters.

**Why this priority**: Discovery tools are helpful but not required for core cluster management.

**Independent Test**: Can be tested by listing node types and versions without any other prerequisites.

**Acceptance Scenarios**:

1. **Given** valid credentials and region, **When** I call `scaleway_redis_list_node_types`, **Then** I receive a paginated list of node types
2. **Given** valid credentials and region, **When** I call `scaleway_redis_list_cluster_versions`, **Then** I receive a paginated list of available Redis versions

---

### Edge Cases

- Invalid region format returns a structured validation error
- Cluster not found (404) returns a `not_found` error type
- Missing required fields (e.g., no node_type on create) returns `invalid_input` error
- Pagination with page > total pages returns empty items array
- Empty tags arrays handled correctly
- Invalid cluster_id format returns validation error
- ACL rule with invalid CIDR returns structured error
- Deleting a non-existent ACL rule ID returns appropriate error

## Requirements

### Functional Requirements

- **FR-001**: System MUST list clusters with pagination (page, page_size) and filtering (name, tags, project_id, organization_id, order_by)
- **FR-002**: System MUST get a single cluster by ID and region
- **FR-003**: System MUST create a cluster with name, version, node_type, cluster_size, user_name, password, project_id, and optional tags, tls_enabled, cluster_settings, acl_rules, endpoints
- **FR-004**: System MUST update a cluster (name, tags, user_name, password)
- **FR-005**: System MUST delete a cluster by ID and region
- **FR-006**: System MUST get cluster metrics with optional time range and metric name filters
- **FR-007**: System MUST get a cluster's TLS certificate
- **FR-008**: System MUST renew a cluster's TLS certificate
- **FR-009**: System MUST add ACL rules to a cluster
- **FR-010**: System MUST delete ACL rules from a cluster by rule IDs
- **FR-011**: System MUST set (replace all) ACL rules on a cluster
- **FR-012**: System MUST add endpoints to a cluster
- **FR-013**: System MUST delete an endpoint from a cluster by endpoint ID
- **FR-014**: System MUST set (replace all) endpoints on a cluster
- **FR-015**: System MUST list available node types with pagination and optional include_disabled_types filter
- **FR-016**: System MUST list available cluster versions with pagination and optional filters (include_disabled, include_beta, include_deprecated, version)
- **FR-017**: All tools MUST validate inputs using Zod schemas
- **FR-018**: All Scaleway API errors MUST be mapped to structured MCP error responses
- **FR-019**: All list operations MUST support standard pagination (page, page_size, total_count)
- **FR-020**: All tools MUST accept a region parameter (regional API locality)

### Key Entities

- **Cluster**: Managed Redis cluster with id, name, version, status, region, project_id, node_type, cluster_size, endpoints, acl_rules, tags, tls_enabled, cluster_settings, created_at, updated_at, user_name
- **ACLRule**: Access control rule with id, ip_cidr, description
- **ACLRuleSpec**: ACL rule creation input with ip_cidr, description
- **Endpoint**: Connection endpoint with id, ips, port
- **EndpointSpec**: Endpoint creation input with optional private_network or public configuration
- **NodeType**: Available node type with name, description, memory, available_cluster_sizes, disabled, beta
- **Version**: Available Redis version with version string, available_settings, end_of_life_at
- **ClusterMetrics**: Time-series metrics with timeseries array containing name and data points
- **ClusterSetting**: Key-value setting with name and value

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 16 MCP tools are registered and callable via the MCP protocol
- **SC-002**: 100% line and branch code coverage across all Redis tool files
- **SC-003**: All tools map to documented Scaleway Redis API endpoints
- **SC-004**: Contract tests validate request/response shapes for every tool
- **SC-005**: Parity matrix includes all Redis API operations

## Clarifications

**Resolved decisions from self-clarification:**

- **Locality**: Regional API. Supported regions: fr-par, nl-ams, pl-waw
- **Pagination**: Standard Scaleway page/page_size with total_count in responses
- **Auth**: SCW_ACCESS_KEY + SCW_SECRET_KEY + SCW_DEFAULT_PROJECT_ID (via shared auth module)
- **Tool naming**: `scaleway_redis_{action}` pattern (e.g., `scaleway_redis_list_clusters`)
- **Error handling**: Use shared `mapScalewayError` + `formatErrorResponse` from `src/shared/errors.ts`
- **Client**: Use shared `createScalewayClient` from `src/shared/client.ts` with `loadAuthConfig` from `src/shared/auth.ts`
- **API prefix**: `redis/v1` with region-scoped endpoints (`/redis/v1/regions/{region}/...`)
- **Node types**: RED1-XS, RED1-S, RED1-M, RED1-L, etc.
- **Cluster settings**: Key-value pairs for Redis configuration (e.g., maxmemory-policy)
- **Endpoints**: Support public and private network endpoint types
- **ACL rules**: CIDR-based IP allowlisting with descriptions
