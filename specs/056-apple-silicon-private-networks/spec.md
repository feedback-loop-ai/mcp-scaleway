# 056-apple-silicon-private-networks: Apple silicon Private Networks

**Status**: Implemented
**Area**: apple-silicon (extension of existing vertical)
**Tool prefix**: `scaleway_apple_silicon_`

## Overview

Extend the existing Apple silicon MCP vertical with support for VPC **Private Networks**.
Apple silicon (Mac mini as-a-Service) servers can be attached to one or more VPC
Private Networks to enable private, low-latency connectivity to other Scaleway
resources. This feature adds MCP tools to list, inspect, attach, bulk-set, and detach
those Private Network attachments.

The Scaleway API exposes these operations through a dedicated
`Apple silicon - Private Networks` API group (`@scaleway/sdk-applesilicon` →
`PrivateNetworkAPI`, `v1alpha1`, zonal scope). This feature does **not** modify any of
the 8 pre-existing Apple silicon server/OS/type tools.

## User Stories

### P1 - Attach and detach a server to a Private Network
As a platform engineer, I want to attach an Apple silicon server to a Private Network
(optionally pinning specific IPAM IPs) and later detach it, so my build machines can
reach private resources.

Acceptance:
- Given a server ID and Private Network ID, when I add the attachment, then the server
  is attached and an attachment object (`status: vpc_updating`) is returned.
- Given an attached server, when I delete the attachment, then a success confirmation is
  returned.

### P1 - List and inspect Private Network attachments
As an operator, I want to list a server's Private Network attachments and get a single
attachment, so I can audit connectivity and IP assignments.

Acceptance:
- Given filters (server, Private Network, organization, project, IPAM IPs), when I list,
  then a paginated collection with `total_count` is returned.
- Given a server ID and Private Network ID, when I get, then the single attachment object
  (with VLAN, status, IPAM IP IDs) is returned.

### P2 - Bulk-configure all Private Networks on a server
As an operator, I want to declaratively set the full set of Private Networks (and their
IPAM IPs) on a server in one call, so I can reconcile desired state.

Acceptance:
- Given a map of Private Network ID → IPAM IP IDs, when I set, then the server's
  attachments are replaced and the resulting list is returned. An empty array
  auto-assigns the next available IP from the Private Network CIDR.

## Entities

### ServerPrivateNetwork (attachment)
| Field | Type | Notes |
|-------|------|-------|
| `id` | string | ID of the server-to-Private-Network mapping |
| `project_id` | string | Private Network project ID |
| `server_id` | string | Apple silicon server ID |
| `private_network_id` | string | Private Network ID |
| `vlan` | int? | VLAN associated with the Private Network |
| `status` | enum | `vpc_unknown_status` \| `vpc_enabled` \| `vpc_updating` \| `vpc_disabled` |
| `created_at` | datetime? | |
| `updated_at` | datetime? | |
| `ipam_ip_ids` | string[] | IPAM IP IDs assigned to the server |

## Tools

| Tool | API |
|------|-----|
| `scaleway_apple_silicon_list_server_private_networks` | `GET /server-private-networks` |
| `scaleway_apple_silicon_get_server_private_network` | `GET /servers/{server_id}/private-networks/{private_network_id}` |
| `scaleway_apple_silicon_add_server_private_network` | `POST /servers/{server_id}/private-networks` |
| `scaleway_apple_silicon_set_server_private_networks` | `PUT /servers/{server_id}/private-networks` |
| `scaleway_apple_silicon_delete_server_private_network` | `DELETE /servers/{server_id}/private-networks/{private_network_id}` |

All paths are prefixed with `/apple-silicon/v1alpha1/zones/{zone}`.

## Functional Requirements

- **FR-001**: List Private Network attachments with pagination and filters (`order_by`,
  `server_id`, `private_network_id`, `organization_id`, `project_id`, `ipam_ip_ids`).
- **FR-002**: Get a single Private Network attachment by `server_id` + `private_network_id`.
- **FR-003**: Add a server to a Private Network with optional `ipam_ip_ids`.
- **FR-004**: Set the full set of Private Networks on a server via
  `per_private_network_ipam_ip_ids`.
- **FR-005**: Delete (detach) a server from a Private Network.
- **FR-006**: All tools accept an optional `zone`, falling back to the configured default
  zone; zones validated by `ScalewayZone`.
- **FR-007**: All tools map Scaleway errors to the shared error taxonomy and return a
  structured error response on failure.

## Out of Scope

- Managing the Private Networks themselves (VPC create/update/delete) — covered by the
  `vpc` vertical (`scaleway_vpc_*`).
- IPAM IP reservation/booking — covered by the `ipam` vertical (`scaleway_ipam_*`).
- `waitForServerPrivateNetwork` polling helper — the MCP layer is a stateless proxy and
  does not expose long-poll helpers.
