# Feature Specification: Scaleway Load Balancer MCP Tools

**Feature Branch**: `017-lb`
**Created**: 2026-03-11
**Status**: Approved
**Input**: Implement MCP tools for the Scaleway Load Balancer API (zoned networking)

## User Scenarios & Testing

### User Story 1 - Load Balancer CRUD & Migration (Priority: P1)

As an AI agent, I need to list, get, create, update, delete, and migrate Scaleway Load Balancers so that I can manage L4/L7 traffic distribution programmatically.

**Why this priority**: Load balancers are the core resource. Frontends, backends, routes, and certificates all depend on an existing LB.

**Independent Test**: Can be fully tested by creating an LB, listing it, updating it, migrating it, and deleting it.

**Acceptance Scenarios**:

1. **Given** valid credentials and zone, **When** I call `scaleway_lb_list_lbs`, **Then** I receive a paginated list of load balancers with total_count
2. **Given** a valid lb_id and zone, **When** I call `scaleway_lb_get_lb`, **Then** I receive the full LB object
3. **Given** valid parameters (name, type, zone), **When** I call `scaleway_lb_create_lb`, **Then** a new load balancer is created and returned
4. **Given** a valid lb_id, name, and description, **When** I call `scaleway_lb_update_lb`, **Then** the LB is updated and returned
5. **Given** a valid lb_id and zone, **When** I call `scaleway_lb_delete_lb`, **Then** the LB is deleted
6. **Given** a valid lb_id and target type, **When** I call `scaleway_lb_migrate_lb`, **Then** the LB is migrated to the new type

---

### User Story 2 - Frontend Management (Priority: P1)

As an AI agent, I need to list, get, create, update, and delete frontends so that I can configure how traffic enters load balancers.

**Why this priority**: Frontends define the inbound ports and protocol listeners; they are essential for a functioning LB.

**Independent Test**: Can be tested by creating a frontend on an existing LB, listing it, getting it, updating it, and deleting it.

**Acceptance Scenarios**:

1. **Given** a valid lb_id and zone, **When** I call `scaleway_lb_list_frontends`, **Then** I receive a paginated list of frontends
2. **Given** a valid frontend_id and zone, **When** I call `scaleway_lb_get_frontend`, **Then** I receive the full frontend object
3. **Given** valid parameters (lb_id, name, inbound_port, backend_id), **When** I call `scaleway_lb_create_frontend`, **Then** a new frontend is created
4. **Given** a valid frontend_id and updated fields, **When** I call `scaleway_lb_update_frontend`, **Then** the frontend is updated
5. **Given** a valid frontend_id and zone, **When** I call `scaleway_lb_delete_frontend`, **Then** the frontend is deleted

---

### User Story 3 - Backend Management (Priority: P1)

As an AI agent, I need to list, get, create, update, and delete backends, and manage their server pools, so that I can configure where traffic is forwarded.

**Why this priority**: Backends define the server pools and health checks; they are essential for a functioning LB.

**Independent Test**: Can be tested by creating a backend, managing its server IPs, and deleting it.

**Acceptance Scenarios**:

1. **Given** a valid lb_id and zone, **When** I call `scaleway_lb_list_backends`, **Then** I receive a paginated list of backends
2. **Given** a valid backend_id and zone, **When** I call `scaleway_lb_get_backend`, **Then** I receive the full backend object
3. **Given** valid parameters (lb_id, name, forward_protocol, forward_port), **When** I call `scaleway_lb_create_backend`, **Then** a new backend is created
4. **Given** a valid backend_id and updated fields, **When** I call `scaleway_lb_update_backend`, **Then** the backend is updated
5. **Given** a valid backend_id and zone, **When** I call `scaleway_lb_delete_backend`, **Then** the backend is deleted
6. **Given** a valid backend_id and server IPs, **When** I call `scaleway_lb_add_backend_servers`, **Then** servers are added to the pool
7. **Given** a valid backend_id and server IPs, **When** I call `scaleway_lb_remove_backend_servers`, **Then** servers are removed from the pool
8. **Given** a valid backend_id and server IPs, **When** I call `scaleway_lb_set_backend_servers`, **Then** the server pool is replaced entirely

---

### User Story 4 - Route Management (Priority: P2)

As an AI agent, I need to list, get, create, update, and delete routes so that I can configure SNI/host-based routing rules.

**Why this priority**: Routes enable advanced traffic steering but are not required for basic LB operation.

**Independent Test**: Can be tested by creating a route, listing it, and deleting it.

**Acceptance Scenarios**:

1. **Given** valid credentials and zone, **When** I call `scaleway_lb_list_routes`, **Then** I receive a paginated list of routes
2. **Given** a valid route_id and zone, **When** I call `scaleway_lb_get_route`, **Then** I receive the full route object
3. **Given** valid parameters (frontend_id, backend_id), **When** I call `scaleway_lb_create_route`, **Then** a new route is created
4. **Given** a valid route_id and updated fields, **When** I call `scaleway_lb_update_route`, **Then** the route is updated
5. **Given** a valid route_id and zone, **When** I call `scaleway_lb_delete_route`, **Then** the route is deleted

---

### User Story 5 - Certificate Management (Priority: P2)

As an AI agent, I need to list, get, create, update, and delete certificates so that I can manage TLS termination on load balancers.

**Why this priority**: Certificates are needed for HTTPS but not required for basic TCP/HTTP load balancing.

**Independent Test**: Can be tested by creating a certificate, listing it, and deleting it.

**Acceptance Scenarios**:

1. **Given** a valid lb_id and zone, **When** I call `scaleway_lb_list_certificates`, **Then** I receive a paginated list of certificates
2. **Given** a valid certificate_id and zone, **When** I call `scaleway_lb_get_certificate`, **Then** I receive the full certificate object
3. **Given** valid parameters (lb_id, name, letsencrypt or custom_certificate), **When** I call `scaleway_lb_create_certificate`, **Then** a new certificate is created
4. **Given** a valid certificate_id and new name, **When** I call `scaleway_lb_update_certificate`, **Then** the certificate is updated
5. **Given** a valid certificate_id and zone, **When** I call `scaleway_lb_delete_certificate`, **Then** the certificate is deleted

---

### User Story 6 - Stats & Types (Priority: P3)

As an AI agent, I need to query LB statistics and list available LB types so that I can monitor performance and plan capacity.

**Why this priority**: Observability and type discovery are supplementary to core LB management.

**Independent Test**: Can be tested by querying stats on an existing LB and listing types.

**Acceptance Scenarios**:

1. **Given** a valid lb_id and zone, **When** I call `scaleway_lb_get_lb_stats`, **Then** I receive backend statistics
2. **Given** a valid zone, **When** I call `scaleway_lb_list_lb_types`, **Then** I receive a paginated list of available LB types

---

### Edge Cases

- Invalid zone format (e.g., "invalid-zone") returns a structured validation error
- LB not found (404) returns a `not_found` error type
- Missing required fields (e.g., no name on create) returns `invalid_input` error
- Pagination with page > total pages returns empty items array
- Deleting an LB with `release_ip: true` also releases the associated flexible IP
- Creating a backend with invalid forward_protocol returns a validation error
- Creating a frontend with port outside 1-65535 returns a validation error
- Health check configuration with conflicting tcp_config/http_config/https_config is handled

## Requirements

### Functional Requirements

- **FR-001**: System MUST list LBs with pagination (page, page_size) and filtering (name, tags, project_id, order_by)
- **FR-002**: System MUST get a single LB by ID and zone
- **FR-003**: System MUST create an LB with name, type, project_id, IP options, tags, and SSL compatibility level
- **FR-004**: System MUST update an LB's name, description, tags, and SSL compatibility level
- **FR-005**: System MUST delete an LB by ID with optional IP release
- **FR-006**: System MUST migrate an LB to a different type
- **FR-007**: System MUST list, get, create, update, and delete frontends
- **FR-008**: System MUST list, get, create, update, and delete backends
- **FR-009**: System MUST add, remove, and set backend server IPs
- **FR-010**: System MUST list, get, create, update, and delete routes
- **FR-011**: System MUST list, get, create, update, and delete certificates (Let's Encrypt and custom)
- **FR-012**: System MUST retrieve LB statistics with optional backend filter
- **FR-013**: System MUST list available LB types in a zone
- **FR-014**: All tools MUST validate inputs using Zod schemas
- **FR-015**: All Scaleway API errors MUST be mapped to structured MCP error responses
- **FR-016**: All list operations MUST support standard pagination (page, page_size, total_count)
- **FR-017**: All tools MUST accept a zone parameter (zoned API locality)

### Key Entities

- **LoadBalancer**: L4/L7 load balancer with id, name, description, status, type, zone, project_id, ip, tags, ssl_compatibility_level, creation_date
- **Frontend**: Inbound listener with id, name, inbound_port, backend_id, lb_id, timeout_client, certificate_id, certificate_ids, enable_http3, creation_date
- **Backend**: Server pool with id, name, forward_protocol, forward_port, forward_port_algorithm, sticky_sessions, health_check, server_ip, timeouts, proxy_protocol, creation_date
- **Route**: Traffic routing rule with id, frontend_id, backend_id, match_sni, match_host_header, creation_date
- **Certificate**: TLS certificate with id, name, type (letsencrypt/custom), status, common_name, subject_alternative_name, lb_id, creation_date
- **LbType**: Available LB type with name, description, stock_status, zone

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 28 MCP tools are registered and callable via the MCP protocol
- **SC-002**: 100% line and branch code coverage across all LB tool files
- **SC-003**: All tools map to documented Scaleway LB API endpoints
- **SC-004**: Contract tests validate request/response shapes for every tool
- **SC-005**: Parity matrix includes all LB API operations

## Clarifications

**Resolved decisions from self-clarification:**

- **Locality**: Zoned API. Supported zones: fr-par-1, fr-par-2, fr-par-3, nl-ams-1, nl-ams-2, pl-waw-1, pl-waw-2, pl-waw-3
- **Pagination**: Standard Scaleway page/page_size with total_count in responses
- **Auth**: SCW_ACCESS_KEY + SCW_SECRET_KEY + SCW_DEFAULT_PROJECT_ID (via shared auth module)
- **Tool naming**: `scaleway_lb_{action}_{resource}` pattern (e.g., `scaleway_lb_list_lbs`)
- **Error handling**: Use shared `mapScalewayError` + `formatErrorResponse` from `src/shared/errors.ts`
- **Client**: Use shared `createScalewayClient` from `src/shared/client.ts` with `loadAuthConfig` from `src/shared/auth.ts`
- **SDK**: Use `@scaleway/sdk-client` with direct HTTP calls to the LB API endpoints
- **API version**: v1 (`/lb/v1/zones/{zone}/...`)
- **LB types**: lb-s, lb-gp-m, lb-gp-l, etc.
- **Forward protocols**: tcp, http
- **Sticky sessions**: none, cookie, table
- **SSL compatibility levels**: ssl_compatibility_level_unknown, ssl_compatibility_level_intermediate, ssl_compatibility_level_modern, ssl_compatibility_level_old_backward
- **Certificate types**: letsencrypt, custom
- **Health checks**: TCP, HTTP, or HTTPS with configurable port, delay, timeout, and retries
