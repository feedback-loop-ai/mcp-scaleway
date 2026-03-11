# Feature Specification: Scaleway Instances MCP Tools

**Feature Branch**: `002-instances`
**Created**: 2026-03-11
**Status**: Approved
**Input**: Implement MCP tools for the Scaleway Instances API (zoned compute)

## User Scenarios & Testing

### User Story 1 - Server CRUD & Actions (Priority: P1)

As an AI agent, I need to list, get, create, delete, and perform actions on Scaleway Instance servers so that I can manage compute infrastructure programmatically.

**Why this priority**: Servers are the core resource of the Instances API. Every other resource (volumes, IPs, security groups) exists to support servers.

**Independent Test**: Can be fully tested by creating a server, listing it, performing actions (start/stop/reboot), and deleting it.

**Acceptance Scenarios**:

1. **Given** valid credentials and zone, **When** I call `scaleway_instances_list_servers`, **Then** I receive a paginated list of servers with total_count
2. **Given** a valid server_id and zone, **When** I call `scaleway_instances_get_server`, **Then** I receive the full server object
3. **Given** valid parameters (name, commercial_type, image, zone), **When** I call `scaleway_instances_create_server`, **Then** a new server is created and returned
4. **Given** a valid server_id and zone, **When** I call `scaleway_instances_delete_server`, **Then** the server is deleted
5. **Given** a valid server_id, zone, and action (poweron/poweroff/reboot/terminate/stop_in_place/backup), **When** I call `scaleway_instances_server_action`, **Then** the action is performed and a task is returned

---

### User Story 2 - Volume Management (Priority: P2)

As an AI agent, I need to list, get, create, and delete volumes so that I can manage persistent storage for instances.

**Why this priority**: Volumes are required for server storage but can be managed independently.

**Independent Test**: Can be tested by creating a volume, listing it, getting it, and deleting it.

**Acceptance Scenarios**:

1. **Given** valid credentials and zone, **When** I call `scaleway_instances_list_volumes`, **Then** I receive a paginated list of volumes
2. **Given** a valid volume_id and zone, **When** I call `scaleway_instances_get_volume`, **Then** I receive the full volume object
3. **Given** valid parameters (name, size, volume_type, zone), **When** I call `scaleway_instances_create_volume`, **Then** a new volume is created
4. **Given** a valid volume_id and zone, **When** I call `scaleway_instances_delete_volume`, **Then** the volume is deleted

---

### User Story 3 - Security Group Management (Priority: P2)

As an AI agent, I need to list, get, create, and delete security groups so that I can manage firewall rules for instances.

**Why this priority**: Security groups control network access to servers, essential for production use.

**Independent Test**: Can be tested by creating a security group, listing it, getting it, and deleting it.

**Acceptance Scenarios**:

1. **Given** valid credentials and zone, **When** I call `scaleway_instances_list_security_groups`, **Then** I receive a paginated list of security groups
2. **Given** a valid security_group_id and zone, **When** I call `scaleway_instances_get_security_group`, **Then** I receive the full security group object
3. **Given** valid parameters (name, description, zone), **When** I call `scaleway_instances_create_security_group`, **Then** a new security group is created
4. **Given** a valid security_group_id and zone, **When** I call `scaleway_instances_delete_security_group`, **Then** the security group is deleted

---

### User Story 4 - IP and Snapshot Management (Priority: P3)

As an AI agent, I need to manage IPs and snapshots so that I can assign public addresses and create backups of volumes.

**Why this priority**: IPs and snapshots are supplementary resources that extend instance functionality.

**Independent Test**: Can be tested by creating/listing/deleting IPs and snapshots independently.

**Acceptance Scenarios**:

1. **Given** valid credentials and zone, **When** I call `scaleway_instances_list_ips`, **Then** I receive a paginated list of IPs
2. **Given** valid parameters (zone, project), **When** I call `scaleway_instances_create_ip`, **Then** a new IP is reserved
3. **Given** a valid ip_id and zone, **When** I call `scaleway_instances_delete_ip`, **Then** the IP is released
4. **Given** a valid ip_id, zone, and server_id, **When** I call `scaleway_instances_attach_ip`, **Then** the IP is attached to the server
5. **Given** valid credentials and zone, **When** I call `scaleway_instances_list_snapshots`, **Then** I receive a paginated list of snapshots
6. **Given** valid parameters (volume_id, name, zone), **When** I call `scaleway_instances_create_snapshot`, **Then** a snapshot is created
7. **Given** a valid snapshot_id and zone, **When** I call `scaleway_instances_delete_snapshot`, **Then** the snapshot is deleted

---

### Edge Cases

- Invalid zone format (e.g., "invalid-zone") returns a structured validation error
- Server not found (404) returns a `not_found` error type
- Quota exceeded returns a structured error with actionable message
- Missing required fields (e.g., no commercial_type on create) returns `invalid_input` error
- Invalid server action (e.g., poweron on already-running server) returns appropriate error
- Pagination with page > total pages returns empty items array
- Empty tag arrays and filter combinations handled correctly

## Requirements

### Functional Requirements

- **FR-001**: System MUST list servers with pagination (page, page_size) and filtering (name, tags, state, project)
- **FR-002**: System MUST get a single server by ID and zone
- **FR-003**: System MUST create a server with name, commercial_type, image, volumes, project, and tags
- **FR-004**: System MUST delete a server by ID and zone
- **FR-005**: System MUST perform server actions (poweron, poweroff, reboot, terminate, stop_in_place, backup)
- **FR-006**: System MUST list, get, create, and delete volumes
- **FR-007**: System MUST list, get, create, and delete security groups
- **FR-008**: System MUST list, create, delete, and attach/detach IPs
- **FR-009**: System MUST list, create, and delete snapshots
- **FR-010**: All tools MUST validate inputs using Zod schemas
- **FR-011**: All Scaleway API errors MUST be mapped to structured MCP error responses
- **FR-012**: All list operations MUST support standard pagination (page, page_size, total_count)
- **FR-013**: All tools MUST accept a zone parameter (zoned API locality)

### Key Entities

- **Server**: Virtual machine with id, name, state, commercial_type, zone, project, public_ip, private_ip, volumes, tags, image, creation_date, modification_date, placement_group, security_group
- **Volume**: Persistent storage with id, name, size, volume_type (l_ssd, b_ssd), zone, state, server, creation_date
- **Image**: Machine image with id, name, arch, creation_date, public, from_server, organization, project
- **Snapshot**: Volume backup with id, name, size, state, volume_id, volume_type, creation_date, base_volume
- **SecurityGroup**: Firewall rule set with id, name, description, inbound_default_policy, outbound_default_policy, enable_default_security, servers, creation_date
- **IP**: Public address with id, address, server, zone, type (routed_ipv4, routed_ipv6), project, organization

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 20 MCP tools are registered and callable via the MCP protocol
- **SC-002**: 100% line and branch code coverage across all instance tool files
- **SC-003**: All tools map to documented Scaleway API endpoints
- **SC-004**: Contract tests validate request/response shapes for every tool
- **SC-005**: Parity matrix includes all Instances API operations

## Clarifications

**Resolved decisions from self-clarification:**

- **Locality**: Zoned API. Supported zones: fr-par-1, fr-par-2, fr-par-3, nl-ams-1, nl-ams-2, pl-waw-1, pl-waw-2, pl-waw-3
- **Pagination**: Standard Scaleway page/page_size with total_count in responses
- **Auth**: SCW_ACCESS_KEY + SCW_SECRET_KEY + SCW_DEFAULT_PROJECT_ID (via shared auth module)
- **Tool naming**: `scaleway_instances_{action}_{resource}` pattern (e.g., `scaleway_instances_list_servers`)
- **Error handling**: Use shared `mapScalewayError` + `formatErrorResponse` from `src/shared/errors.ts`
- **Client**: Use shared `createScalewayClient` from `src/shared/client.ts` with `loadAuthConfig` from `src/shared/auth.ts`
- **SDK**: Use `@scaleway/sdk-client` with the Instance API module. The Scaleway SDK uses a functional API pattern
- **Volume types**: l_ssd (local SSD) and b_ssd (block SSD) are the primary types
- **Server actions**: poweron, poweroff, reboot, terminate, stop_in_place, backup are the supported actions
- **IP types**: routed_ipv4 and routed_ipv6
