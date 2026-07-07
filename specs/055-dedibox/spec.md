# 055-dedibox: Dedibox Dedicated Servers API

**Feature Branch**: `042-api-catalog-remediation`
**Created**: 2026-07-07
**Status**: Implemented
**Input**: Build the Scaleway Dedibox vertical (listed under Bare Metal in the API catalog).

## Overview

MCP tools for the Scaleway **Dedibox** API — high-reliability dedicated
(bare-metal) servers. Dedibox is fully exposed under the unified Scaleway API
(`https://api.scaleway.com/dedibox/v1`, zone-scoped, standard `X-Auth-Token`
auth), so it works with the shared MCP client. This vertical covers the primary
server lifecycle plus offers, operating systems, installation, and BMC console
access.

> Historical note: Dedibox originated on the legacy `api.online.net` platform
> with a separate token scheme. That legacy surface is NOT used here — the
> `dedibox/v1` API on `api.scaleway.com` is the modern, unified, token-auth
> surface confirmed by the official docs and the generated Scaleway Go SDK.

## User Scenarios & Testing

### User Story 1 - Inventory & inspect servers (Priority: P1)

As a Dedibox user I can list my dedicated servers in a zone and get the full
details of any one of them.

**Independent Test**: List servers in `fr-par-1`, then get one by its numeric ID
and read status, offer, OS, and location.

**Acceptance Scenarios**:
1. **Given** valid credentials, **When** I list servers in a zone, **Then** I
   receive a paginated set of server summaries with `total_count`.
2. **Given** a known server ID, **When** I get the server, **Then** I receive
   its full details including `status` and `has_bmc`.

### User Story 2 - Provision an operating system (Priority: P1)

As a user I can browse offers and operating systems, then install an OS on a
server and track the install progress.

**Independent Test**: List OS compatible with a server, trigger an install with
`os_id` + `hostname`, then poll the install status until `installed`.

**Acceptance Scenarios**:
1. **Given** a server, **When** I install with a valid `os_id` and `hostname`,
   **Then** an install job starts and returns its status.
2. **Given** an in-progress install, **When** I get the install status, **Then**
   I see one of the documented `ServerInstallStatus` values.
3. **Given** an in-progress install, **When** I cancel it, **Then** the request
   succeeds.

### User Story 3 - Control server power (Priority: P2)

As a user I can reboot, start, stop, update, or delete a server.

**Acceptance Scenarios**:
1. **Given** a server, **When** I reboot/start/stop it, **Then** the action is
   accepted.
2. **Given** a server, **When** I update its hostname or IPv6 flag, **Then** the
   change is applied.

### User Story 4 - BMC console access (Priority: P3)

As a user I can start, retrieve, and stop out-of-band BMC console access.

**Acceptance Scenarios**:
1. **Given** a server, **When** I start BMC access with an authorized IP,
   **Then** access is provisioned.
2. **Given** active BMC access, **When** I get it, **Then** I receive the
   console URL and credentials; **When** I stop it, the session is closed.

## Functional Requirements

- **FR-001**: List servers in a zone with pagination and optional `project_id` /
  `search` (hostname) / `order_by` filters.
- **FR-002**: Get a single server by numeric ID.
- **FR-003**: Update a server's `hostname` and/or `enable_ipv6`.
- **FR-004**: Reboot, start, and stop a server.
- **FR-005**: Delete (release) a server.
- **FR-006**: Install an OS on a server (`os_id`, `hostname`, optional
  credentials, partitions, SSH keys, license).
- **FR-007**: Get install status and cancel an install.
- **FR-008**: List and get offers (with catalog/availability filters).
- **FR-009**: List and get operating systems (with type/server compatibility
  filters).
- **FR-010**: Get, start, and stop BMC console access.
- **FR-011**: All tools authenticate via the shared `X-Auth-Token` client and
  map Scaleway HTTP errors through `src/shared/errors.ts`.

## Out of Scope (and why)

- **Server ordering/creation** (`POST /servers`): Dedibox provisioning is a
  billed order flow returning a `Service`, not a simple create. Deferred to a
  dedicated ordering/billing vertical to avoid accidental purchases.
- **Services & ordered-services, backups, subscribable server/storage options,
  server events & disks**: secondary management surfaces, not needed for the
  primary lifecycle.
- **Failover IPs, reverse DNS, RAID config, rescue mode, remaining quota,
  default partitioning**: advanced networking/recovery features; can be added
  later as separate stories.
- **Global sub-APIs (RPN v1/v2, IPv6 blocks, invoices/refunds/billing)**: these
  are non-zone-scoped billing/network products distinct from server management.

## Success Criteria

- 17 MCP tools registered under the `scaleway_dedibox_` prefix.
- 100% line + branch coverage on all `src/tools/dedibox/` files.
- Every tool has a contract test referencing
  `specs/scaleway-api/dedibox/api-reference.md`.
