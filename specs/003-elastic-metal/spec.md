# Feature Specification: Scaleway Elastic Metal MCP Tools

**Feature Branch**: `003-elastic-metal`
**Created**: 2026-03-11
**Status**: Draft
**Input**: Scaleway Elastic Metal (Bare Metal) API — zoned dedicated server management

## Clarifications

- **Zones**: fr-par-1, fr-par-2, nl-ams-1, nl-ams-2, pl-waw-1
- **Tool naming**: `scaleway_elastic_metal_{action}_{resource}` (e.g., `scaleway_elastic_metal_list_servers`)
- **Pagination**: page/page_size/total_count pattern (standard Scaleway)
- **Auth**: Standard Scaleway credentials (SCW_ACCESS_KEY, SCW_SECRET_KEY, SCW_DEFAULT_PROJECT_ID)
- **SDK package**: `@scaleway/sdk-baremetal` (mapped from master index spec 003)
- **Locality**: All endpoints are **zoned** (require a zone parameter)

## User Scenarios & Testing

### User Story 1 - Server Lifecycle Management (Priority: P1)

Users need to list, get, create, and delete Elastic Metal servers. This is the core CRUD functionality that enables infrastructure management through the MCP interface.

**Why this priority**: Servers are the primary resource — without server management, no other Elastic Metal functionality is useful.

**Independent Test**: Can be fully tested by creating a server, listing it, getting its details, and deleting it. Delivers complete server lifecycle management.

**Acceptance Scenarios**:

1. **Given** valid credentials and a zone, **When** listing servers, **Then** return paginated list of servers with id, name, status, offer_id, zone
2. **Given** a valid server ID and zone, **When** getting a server, **Then** return full server details including IPs, tags, and install status
3. **Given** a valid offer_id and project_id, **When** creating a server, **Then** provision a new Elastic Metal server and return its details
4. **Given** a valid server ID, **When** deleting a server, **Then** remove the server and confirm deletion

---

### User Story 2 - Server Actions: Install, Reboot, Start, Stop (Priority: P1)

Users need to perform operational actions on their servers: install an OS, reboot, start, and stop servers. These are essential day-to-day operations.

**Why this priority**: Server actions are required for any meaningful server usage — a provisioned server needs an OS install and power management.

**Independent Test**: Can be tested by installing an OS on an existing server, then performing start/stop/reboot cycles.

**Acceptance Scenarios**:

1. **Given** a server ID, OS ID, and SSH key IDs, **When** installing a server, **Then** begin OS installation and return updated server status
2. **Given** a running server ID, **When** rebooting, **Then** initiate server reboot and return confirmation
3. **Given** a stopped server ID, **When** starting, **Then** start the server and return confirmation
4. **Given** a running server ID, **When** stopping, **Then** stop the server and return confirmation

---

### User Story 3 - Server Options & BMC Access (Priority: P2)

Users need to manage server options (additional features/add-ons) and access the BMC (Baseboard Management Controller) for out-of-band management.

**Why this priority**: Options and BMC are secondary management features used after initial server setup.

**Independent Test**: Can be tested by retrieving BMC access credentials for an existing server and listing available offers/options.

**Acceptance Scenarios**:

1. **Given** a zone, **When** listing offers, **Then** return available Elastic Metal offers with specs and pricing
2. **Given** a zone, **When** listing available OSes, **Then** return installable operating systems with compatibility info
3. **Given** a server ID, **When** requesting BMC access, **Then** return BMC URL and credentials (time-limited)

---

### User Story 4 - Flexible IP Management (Priority: P3)

Users need to manage flexible IPs that can be attached to Elastic Metal servers for network flexibility.

**Why this priority**: Flexible IPs are an advanced networking feature, not required for basic server usage.

**Independent Test**: Can be tested by creating a flexible IP, listing IPs, and deleting it.

**Acceptance Scenarios**:

1. **Given** a zone and project_id, **When** listing flexible IPs, **Then** return paginated list of IPs with server associations
2. **Given** a zone and project_id, **When** creating a flexible IP, **Then** allocate a new IP and return its details
3. **Given** a flexible IP ID, **When** deleting, **Then** release the IP and confirm deletion

---

### Edge Cases

- What happens when a zone is invalid or unavailable? Return clear error with valid zone list.
- What happens when creating a server with an invalid offer? Return 404 with available offers hint.
- What happens when installing an OS incompatible with the server offer? Return clear validation error.
- What happens when BMC access is requested for a server without BMC support? Return appropriate error.
- What happens with concurrent operations on the same server (e.g., reboot during install)? Return conflict error.

## Requirements

### Functional Requirements

- **FR-001**: System MUST list Elastic Metal servers with pagination in a specified zone
- **FR-002**: System MUST get detailed server information by ID and zone
- **FR-003**: System MUST create an Elastic Metal server with offer, name, and project
- **FR-004**: System MUST delete an Elastic Metal server by ID and zone
- **FR-005**: System MUST install an OS on a server with SSH key configuration
- **FR-006**: System MUST support server power actions: reboot, start, stop
- **FR-007**: System MUST list available offers filtered by zone
- **FR-008**: System MUST list available operating systems filtered by zone
- **FR-009**: System MUST provide BMC access credentials for a server
- **FR-010**: System MUST list flexible IPs with pagination in a specified zone
- **FR-011**: System MUST create and delete flexible IPs
- **FR-012**: All tools MUST validate inputs with Zod schemas
- **FR-013**: All tools MUST return structured JSON responses
- **FR-014**: All tools MUST map Scaleway API errors to actionable MCP error responses

### Key Entities

- **Server**: Dedicated bare-metal server (id, name, status, offer_id, offer_name, tags, ips, zone, project_id, install, description)
- **Offer**: Available server configuration (id, name, stock, bandwidth, max_bandwidth, commercial_range, cpus, memories, disks, enabled, subscription_period)
- **OS**: Installable operating system (id, name, version, enabled, license_required)
- **IP**: Flexible IP address (id, address, reverse, server_id, zone, project_id, type, status, tags, mac_address)
- **BMCAccess**: Out-of-band management access (url, login, password, expires_at)
- **Option**: Server add-on/feature (id, name, manageable)

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 14 MCP tools register and respond correctly to valid inputs
- **SC-002**: 100% line and branch code coverage on all new source files
- **SC-003**: Every tool has a contract test validating request shape, response shape, pagination, auth, and error codes
- **SC-004**: All Scaleway API errors are mapped to structured MCP error responses with actionable messages
- **SC-005**: Parity matrix updated with all Elastic Metal API operations mapped to contract tests
