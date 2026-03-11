# Feature Specification: Scaleway Public Gateway MCP Tools

**Feature Branch**: `018-public-gateway`
**Created**: 2026-03-11
**Status**: Approved
**Input**: Implement MCP tools for the Scaleway Public Gateway API (VPC-GW v1/v2, zoned networking)

## User Scenarios & Testing

### User Story 1 - Gateway CRUD (Priority: P1)

As an AI agent, I need to list, get, create, update, and delete Public Gateways so that I can manage NAT gateways for Private Networks.

**Why this priority**: Gateways are the core resource. All other resources (gateway networks, DHCP, PAT rules, IPs) exist to support and configure gateways.

**Independent Test**: Can be fully tested by creating a gateway, listing it, updating it, and deleting it.

**Acceptance Scenarios**:

1. **Given** valid credentials and zone, **When** I call `scaleway_public_gateway_list_gateways`, **Then** I receive a paginated list of gateways with total_count
2. **Given** a valid gateway_id and zone, **When** I call `scaleway_public_gateway_get_gateway`, **Then** I receive the full gateway object
3. **Given** valid parameters (type, enableSmtp, enableBastion), **When** I call `scaleway_public_gateway_create_gateway`, **Then** a new gateway is created and returned
4. **Given** a valid gateway_id and zone, **When** I call `scaleway_public_gateway_update_gateway`, **Then** the gateway is updated and returned
5. **Given** a valid gateway_id and zone, **When** I call `scaleway_public_gateway_delete_gateway`, **Then** the gateway is deleted

---

### User Story 2 - Gateway Network Management (Priority: P1)

As an AI agent, I need to list, get, create, update, and delete GatewayNetwork connections so that I can attach Public Gateways to Private Networks with masquerade and routing.

**Why this priority**: Connecting gateways to Private Networks is the primary use case for Public Gateways (NAT, routing).

**Independent Test**: Can be tested by creating a gateway network connection, listing it, updating it, and deleting it.

**Acceptance Scenarios**:

1. **Given** valid credentials and zone, **When** I call `scaleway_public_gateway_list_gateway_networks`, **Then** I receive a paginated list of gateway networks with total_count
2. **Given** a valid gateway_network_id and zone, **When** I call `scaleway_public_gateway_get_gateway_network`, **Then** I receive the full gateway network object
3. **Given** valid parameters (gatewayId, privateNetworkId, enableMasquerade, pushDefaultRoute), **When** I call `scaleway_public_gateway_create_gateway_network`, **Then** a new connection is created
4. **Given** a valid gateway_network_id and zone, **When** I call `scaleway_public_gateway_update_gateway_network`, **Then** the connection is updated
5. **Given** a valid gateway_network_id and zone, **When** I call `scaleway_public_gateway_delete_gateway_network`, **Then** the connection is deleted

---

### User Story 3 - DHCP Configuration (Priority: P2)

As an AI agent, I need to list, get, create, update, and delete DHCP configurations so that I can manage IP address assignment in Private Networks behind gateways.

**Why this priority**: DHCP is essential for automatic IP configuration but is a v1 API resource used alongside gateway networks.

**Independent Test**: Can be tested by creating a DHCP config, listing it, updating it, and deleting it.

**Acceptance Scenarios**:

1. **Given** valid credentials and zone, **When** I call `scaleway_public_gateway_list_dhcps`, **Then** I receive a paginated list of DHCP configurations
2. **Given** a valid dhcp_id and zone, **When** I call `scaleway_public_gateway_get_dhcp`, **Then** I receive the full DHCP object
3. **Given** valid parameters (subnet), **When** I call `scaleway_public_gateway_create_dhcp`, **Then** a new DHCP configuration is created
4. **Given** a valid dhcp_id and zone, **When** I call `scaleway_public_gateway_update_dhcp`, **Then** the configuration is updated
5. **Given** a valid dhcp_id and zone, **When** I call `scaleway_public_gateway_delete_dhcp`, **Then** the configuration is deleted

---

### User Story 4 - PAT Rules (Priority: P2)

As an AI agent, I need to list, get, create, update, and delete PAT (Port Address Translation) rules so that I can forward public ports to private IPs behind a gateway.

**Why this priority**: PAT rules enable port forwarding, a common networking requirement for exposing services.

**Independent Test**: Can be tested by creating a PAT rule, listing it, updating it, and deleting it.

**Acceptance Scenarios**:

1. **Given** valid credentials and zone, **When** I call `scaleway_public_gateway_list_pat_rules`, **Then** I receive a paginated list of PAT rules
2. **Given** a valid pat_rule_id and zone, **When** I call `scaleway_public_gateway_get_pat_rule`, **Then** I receive the full PAT rule object
3. **Given** valid parameters (gatewayId, publicPort, privateIp, privatePort), **When** I call `scaleway_public_gateway_create_pat_rule`, **Then** a new PAT rule is created
4. **Given** a valid pat_rule_id and zone, **When** I call `scaleway_public_gateway_update_pat_rule`, **Then** the rule is updated
5. **Given** a valid pat_rule_id and zone, **When** I call `scaleway_public_gateway_delete_pat_rule`, **Then** the rule is deleted

---

### User Story 5 - Flexible IP Management (Priority: P3)

As an AI agent, I need to list, get, create, update, and delete flexible IP addresses so that I can manage public IPs for Public Gateways.

**Why this priority**: Flexible IPs are supplementary resources that can be managed independently or attached to gateways.

**Independent Test**: Can be tested by creating, listing, updating, and deleting IPs independently.

**Acceptance Scenarios**:

1. **Given** valid credentials and zone, **When** I call `scaleway_public_gateway_list_ips`, **Then** I receive a paginated list of IPs
2. **Given** a valid ip_id and zone, **When** I call `scaleway_public_gateway_get_ip`, **Then** I receive the full IP object
3. **Given** valid parameters (zone), **When** I call `scaleway_public_gateway_create_ip`, **Then** a new IP is reserved
4. **Given** a valid ip_id and zone, **When** I call `scaleway_public_gateway_update_ip`, **Then** the IP is updated (tags, reverse DNS, gateway attachment)
5. **Given** a valid ip_id and zone, **When** I call `scaleway_public_gateway_delete_ip`, **Then** the IP is released

---

### User Story 6 - Gateway Types (Priority: P3)

As an AI agent, I need to list available gateway types so that I can select the right commercial offer when creating gateways.

**Why this priority**: Read-only reference data needed for gateway creation decisions.

**Independent Test**: Can be tested by listing gateway types and verifying the response structure.

**Acceptance Scenarios**:

1. **Given** valid credentials and zone, **When** I call `scaleway_public_gateway_list_gateway_types`, **Then** I receive a list of available gateway types with bandwidth specs

---

### Edge Cases

- Invalid zone format (e.g., "invalid-zone") returns a structured validation error
- Gateway not found (404) returns a `not_found` error type
- Missing required fields (e.g., no type on create gateway) returns `invalid_input` error
- Deleting a gateway with attached networks returns appropriate error
- DHCP subnet validation (invalid CIDR) returns structured error
- PAT rule port out of range (0 or >65535) returns validation error
- Pagination with page > total pages returns empty items array

## Requirements

### Functional Requirements

- **FR-001**: System MUST list gateways with pagination and filtering (name, tags, types, status, project, private_network_ids, include_legacy)
- **FR-002**: System MUST get a single gateway by ID and zone
- **FR-003**: System MUST create a gateway with type, enableSmtp, enableBastion, and optional name/tags/ipId/bastionPort
- **FR-004**: System MUST update a gateway's name, tags, bastion, and SMTP settings
- **FR-005**: System MUST delete a gateway with option to also delete its IP
- **FR-006**: System MUST list, get, create, update, and delete gateway network connections
- **FR-007**: System MUST list, get, create, update, and delete DHCP configurations (v1 API)
- **FR-008**: System MUST list, get, create, update, and delete PAT rules
- **FR-009**: System MUST list, get, create, update, and delete flexible IPs
- **FR-010**: System MUST list available gateway types
- **FR-011**: All tools MUST validate inputs using Zod schemas
- **FR-012**: All Scaleway API errors MUST be mapped to structured MCP error responses
- **FR-013**: All list operations MUST support standard pagination (page, page_size, total_count)
- **FR-014**: All tools MUST accept a zone parameter (zoned API locality)

### Key Entities

- **Gateway**: NAT gateway with id, name, type, status, ip_id, tags, bastion config, SMTP setting, zone, project, creation_date
- **GatewayNetwork**: Connection between gateway and Private Network with id, gateway_id, private_network_id, masquerade, default_route, status, ipam_ip_id
- **DHCP**: DHCP configuration with id, subnet, address, pool range, DNS settings, lease timers, project (v1 API)
- **PatRule**: Port forwarding rule with id, gateway_id, public_port, private_ip, private_port, protocol
- **IP**: Flexible IP with id, address, reverse DNS, tags, gateway attachment, zone, project
- **GatewayType**: Commercial offer type with name and bandwidth specifications

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 26 MCP tools are registered and callable via the MCP protocol
- **SC-002**: 100% line and branch code coverage across all public gateway tool files
- **SC-003**: All tools map to documented Scaleway API endpoints (VPC-GW v1 and v2)
- **SC-004**: Contract tests validate request/response shapes for every tool
- **SC-005**: Parity matrix includes all Public Gateway API operations

## Clarifications

**Resolved decisions from self-clarification:**

- **Locality**: Zoned API. Supported zones: fr-par-1, fr-par-2, fr-par-3, nl-ams-1, nl-ams-2, pl-waw-1, pl-waw-2, pl-waw-3
- **API Versions**: Gateways, GatewayNetworks, PAT rules, IPs, and Gateway Types use v2 (`/vpc-gw/v2/zones/{zone}/`). DHCP uses v1 (`/vpc-gw/v1/zones/{zone}/`)
- **Pagination**: Standard Scaleway page/page_size with total_count in responses
- **Auth**: SCW_ACCESS_KEY + SCW_SECRET_KEY + SCW_DEFAULT_PROJECT_ID (via shared auth module)
- **Tool naming**: `scaleway_public_gateway_{action}_{resource}` pattern
- **Error handling**: Use shared `mapScalewayError` + `formatErrorResponse` from `src/shared/errors.ts`
- **Client**: Use shared `createScalewayClient` from `src/shared/client.ts` with `loadAuthConfig` from `src/shared/auth.ts`
- **Gateway types**: Commercial offers like VPC-GW-S with different bandwidth tiers
- **PAT rule protocols**: both, tcp, udp
- **DHCP timers**: validLifetime, renewTimer, rebindTimer as string durations
