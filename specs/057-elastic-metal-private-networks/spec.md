# Feature Specification: Elastic Metal Private Networks

**Feature Branch**: `057-elastic-metal-private-networks`
**Status**: Implemented
**Area**: elastic-metal (extension)
**Input**: Add Private Network attachment management to the existing Elastic Metal MCP tools.

## Overview

Extends the existing Elastic Metal (Bare Metal) tool area with the ability to manage the
attachment of dedicated servers to Scaleway VPC **Private Networks**. Private Networks give
Elastic Metal servers an isolated L2 network interface (VLAN) so they can communicate
privately with other resources (Instances, Load Balancers, other bare-metal servers) in the
same VPC. A server can be attached to up to 8 Private Networks.

This is an **extension** of area `elastic-metal`: the existing 14 tools (server CRUD, server
actions, offers/OS, BMC access, flexible IPs) are unchanged. Four new tools are added and
registered by the same `registerElasticMetalTools` function.

## User Scenarios & Testing

### User Story 1 - List a server's Private Network attachments (Priority: P1)

An operator wants to see which Private Networks an Elastic Metal server is attached to, along
with the VLAN ID and configuration status of each attachment.

**Acceptance Scenarios**:

1. **Given** a zone, **When** the operator lists server Private Networks, **Then** a paginated
   list of attachments (id, server_id, private_network_id, vlan, status) is returned.
2. **Given** a `server_id` filter, **When** listing, **Then** only that server's attachments
   are returned.
3. **Given** `private_network_id`, `project_id`, `organization_id`, or `order_by` filters,
   **When** listing, **Then** they are passed through as query parameters.

### User Story 2 - Attach a server to a Private Network (Priority: P1)

An operator wants to connect a running server to an existing Private Network.

**Acceptance Scenarios**:

1. **Given** a `server_id` and a `private_network_id`, **When** the operator adds the
   attachment, **Then** a ServerPrivateNetwork is returned (status typically `attaching`).
2. **Given** a server already attached to 8 networks, **When** adding another, **Then** the API
   error is surfaced.

### User Story 3 - Replace a server's full set of Private Networks (Priority: P2)

An operator wants to declaratively set the exact list of Private Networks a server should be
attached to.

**Acceptance Scenarios**:

1. **Given** a list of `private_network_ids`, **When** the operator sets them, **Then** the
   server's attachments are replaced and the resulting list is returned.
2. **Given** an empty list, **When** setting, **Then** the server is detached from all
   Private Networks.

### User Story 4 - Detach a server from a Private Network (Priority: P2)

**Acceptance Scenarios**:

1. **Given** a `server_id` and `private_network_id`, **When** the operator deletes the
   attachment, **Then** the server is detached (empty `204` response, surfaced as `{}`).
2. **Given** a non-existent attachment, **When** deleting, **Then** a `not_found` error is
   surfaced.

### Edge Cases

- Empty `private_network_ids` on set → detach all (valid).
- More than 8 `private_network_ids` on set → rejected client-side (schema `.max(8)`).
- Invalid UUIDs for any id → rejected client-side by zod.
- `204 No Content` on delete → normalized to `{}` by the shared `apiCall` helper.

## Requirements

### Functional Requirements

- **FR-001**: The system MUST expose a tool to list a server's Private Network attachments in a
  zone with pagination and optional filters (`server_id`, `private_network_id`,
  `organization_id`, `project_id`, `order_by`).
- **FR-002**: The system MUST expose a tool to attach a server to a single Private Network.
- **FR-003**: The system MUST expose a tool to set (replace) the complete set of Private
  Networks attached to a server, including detaching all via an empty list.
- **FR-004**: The system MUST expose a tool to detach a server from a single Private Network.
- **FR-005**: All tools MUST validate `zone` against `ScalewayZone` and all ids as UUIDs.
- **FR-006**: The set tool MUST reject more than 8 Private Network ids client-side.
- **FR-007**: All tools MUST surface Scaleway API errors via the shared error mapper
  (`invalid_input`, `permission_denied`, `not_found`, `rate_limited`, `server_error`).
- **FR-008**: New tools MUST be registered by the existing `registerElasticMetalTools`.

### Key Entities

- **ServerPrivateNetwork**: an attachment linking a server to a Private Network. Fields:
  `id`, `project_id`, `server_id`, `private_network_id`, `vlan` (nullable), `status`
  (`unknown`/`attaching`/`attached`/`error`/`detaching`/`locked`), `created_at`, `updated_at`.

## Out of Scope

- Creating/deleting the Private Networks themselves — that is the VPC API
  (`scaleway_vpc_*` tools), not Bare Metal.
- IPAM IP reservation options (`ipam_ip_ids`, `per_pn_ipam_ip_ids`) present in the raw API —
  omitted to keep the tool surface simple; can be added later without breaking changes.

## Success Criteria

- **SC-001**: Four new tools are registered; the area exposes 18 tools total.
- **SC-002**: 100% line and branch coverage across the elastic-metal `src` files.
- **SC-003**: Every new tool has contract-test coverage referencing the API reference.
