# Feature Specification: Scaleway InterLink MCP Tools

**Feature Branch**: `044-interlink`
**Created**: 2026-07-07
**Status**: Implemented
**Input**: Build the Scaleway InterLink (dedicated / partner-hosted direct connectivity) vertical.

## Overview

InterLink provides private, dedicated Layer 3 connectivity between a customer's
on-premises / third-party network and Scaleway VPCs, over a BGP peering session.
Connectivity is either **partner-hosted** (via a `partner`) or **self-hosted**
(via a customer `dedicated connection`). This feature exposes the InterLink
`v1beta1` region-scoped API as MCP tools.

## User Scenarios & Testing

### User Story 1 - Manage InterLink links (Priority: P1)

As a network operator, I can list, inspect, create, update and delete InterLink
links, and manage their attachments (VPC, routing policy) and route propagation,
so I can stand up and operate private connectivity to my Scaleway VPCs.

**Why this priority**: The link is the core InterLink resource (the BGP peering
session). Without it there is no connectivity to manage.

**Independent Test**: Create a link against a PoP/partner, attach a VPC and a
routing policy, enable route propagation, read back BGP session status, then
detach and delete — all via MCP tools with a mocked client.

**Acceptance Scenarios**:

1. **Given** a region and a PoP, **When** I create a hosted link with a partner
   and bandwidth, **Then** a link is returned with a `status` and a
   `partner.pairing_key`.
2. **Given** an existing link, **When** I attach a VPC, **Then** the link's
   `vpc_id` reflects the attached VPC.
3. **Given** an existing link, **When** I get it, **Then** I can read
   `bgp_v4_status` / `bgp_v6_status` and `scw_bgp_config` / `peer_bgp_config`.
4. **Given** an existing link, **When** I enable route propagation, **Then**
   `enable_route_propagation` is true.

### User Story 2 - Manage routing policies (Priority: P2)

As a network operator, I can create, list, get, update and delete routing
policies (inbound/outbound IP prefix filters) so I can control which routes are
accepted from and advertised to the peer.

**Why this priority**: Routing policies govern which prefixes traverse a link;
they are attached to links from User Story 1.

**Independent Test**: Create an IPv4 policy with inbound/outbound prefix
filters, update the filters, list and get it, then delete it.

**Acceptance Scenarios**:

1. **Given** a region, **When** I create a routing policy with `is_ipv6=false`
   and prefix filters, **Then** a policy with those filters is returned.
2. **Given** a policy, **When** I update its `prefix_filter_out`, **Then** the
   updated filter is persisted.

### User Story 3 - Discover partners, PoPs and dedicated connections (Priority: P3)

As a network operator, I can list and get partners, Points of Presence and
dedicated connections so I can decide where and how to establish connectivity.

**Why this priority**: Discovery is read-only and supports (but does not block)
the primary link workflow.

**Independent Test**: List partners filtered by PoP, list PoPs, list dedicated
connections, and get each by ID.

**Acceptance Scenarios**:

1. **Given** a region, **When** I list PoPs, **Then** each PoP includes its
   `available_link_bandwidths_mbps`.
2. **Given** a self-hosted setup, **When** I list dedicated connections, **Then**
   each connection includes its `status` and `bandwidth_mbps`.

### Edge Cases

- Creating a link without either `connection_id` (self-hosted) or `partner_id`
  (hosted) — the API rejects with 400; surfaced as `invalid_input`.
- Attaching a VPC to a link that already has one — 409 conflict, surfaced.
- Get/attach/detach against a non-existent link/policy — 404, surfaced as
  `not_found`.
- Update with no fields — sends an empty body (valid no-op patch).

## Requirements

### Functional Requirements

- **FR-001**: System MUST list InterLink links in a region with filtering
  (project, org, name, tags, status, BGP status, PoP, bandwidth, partner, VPC,
  routing policy, pairing key, kind, connection) and pagination.
- **FR-002**: System MUST get a single link, exposing BGP session status
  (`bgp_v4_status`, `bgp_v6_status`) and BGP config (`scw_bgp_config`,
  `peer_bgp_config`).
- **FR-003**: System MUST create, update and delete links.
- **FR-004**: System MUST attach and detach a VPC on a link.
- **FR-005**: System MUST attach, detach and set a routing policy on a link.
- **FR-006**: System MUST enable and disable route propagation on a link.
- **FR-007**: System MUST list, get, create, update and delete routing policies.
- **FR-008**: System MUST list and get partners (filterable by PoP).
- **FR-009**: System MUST list and get Points of Presence (filterable by name,
  hosting provider, partner, bandwidth, dedicated availability).
- **FR-010**: System MUST list and get dedicated connections.
- **FR-011**: All tools MUST require a `region` and authenticate via
  `X-Auth-Token`; errors MUST be mapped to the shared error taxonomy.

### Key Entities

- **Link**: A BGP peering session (hosted or self_hosted); holds BGP session
  status/config, attached VPC and routing policies, route propagation flag.
- **RoutingPolicy**: Inbound/outbound IP prefix filters; IPv4 or IPv6.
- **Partner**: A hosting provider offering InterLink connectivity.
- **Pop**: A datacenter Point of Presence where InterLink is available.
- **DedicatedConnection**: A physical self-hosted connection to Scaleway.

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 23 InterLink operations from the official `v1beta1` reference
  are exposed as MCP tools.
- **SC-002**: 100% line and branch coverage of the `src/tools/interlink/`
  sources.
- **SC-003**: Every tool has a contract test validating request/response shapes
  against `specs/scaleway-api/interlink/api-reference.md`.
- **SC-004**: Type check and lint pass clean for all InterLink files.

## Out of Scope

- **BGP session mutation**: The API exposes BGP session *data* on the Link
  entity but no standalone BGP-session write endpoint; nothing to add beyond
  Get/List Link. Documented as read-through.
- **Dedicated connection create/update/delete**: The `v1beta1` public reference
  only exposes list/get for dedicated connections (provisioning is handled out
  of band / via the console), so only read tools are provided.
