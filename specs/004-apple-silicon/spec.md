# Apple Silicon MCP Tools - Specification

## Feature ID: 004-apple-silicon

## Overview

MCP tools for managing Scaleway Apple Silicon (Mac mini as-a-Service). The API is **zoned** (available in `fr-par-3`). Manages Apple Silicon servers, OS types, server types, and private networks.

## User Stories

### P1 - Core Server Management

| ID | Story | Acceptance Criteria |
|----|-------|-------------------|
| US-AS-001 | As a user, I want to list Apple Silicon servers so I can see all my Mac minis | Paginated list with order_by, project_id filters |
| US-AS-002 | As a user, I want to get a specific server by ID so I can check its status | Returns full server details including IP, status, OS |
| US-AS-003 | As a user, I want to create an Apple Silicon server so I can provision a Mac mini | Supports type, name, os_id, enable_vpc, commitment_type |
| US-AS-004 | As a user, I want to delete an Apple Silicon server when it is no longer needed | Deletes server by ID (24h minimum allocation) |

### P1 - Server Actions

| ID | Story | Acceptance Criteria |
|----|-------|-------------------|
| US-AS-005 | As a user, I want to reboot a server so I can restart it | Returns updated server with rebooting status |
| US-AS-006 | As a user, I want to reinstall a server OS so I can reset it | Supports os_id for target OS, enable_kext |

### P2 - Server Types and OS

| ID | Story | Acceptance Criteria |
|----|-------|-------------------|
| US-AS-007 | As a user, I want to list server types so I can see available Mac mini configs | Returns all types with CPU, disk, memory, stock info |
| US-AS-008 | As a user, I want to list available OS versions so I can choose one for installation | Paginated, filterable by server_type and name |

## Entities

### Server
- `id` (string) - UUID
- `name` (string)
- `type` (string) - server type identifier
- `project_id` (string)
- `organization_id` (string)
- `ip` (string) - IPv4 address
- `vnc_url` (string)
- `ssh_username` (string)
- `sudo_password` (string)
- `vnc_port` (number)
- `os` (OS | null) - installed OS
- `status` (ServerStatus enum)
- `zone` (string)
- `created_at` (string | null)
- `updated_at` (string | null)
- `deletable_at` (string | null)
- `deletion_scheduled` (boolean)
- `delivered` (boolean)
- `vpc_status` (ServerPrivateNetworkStatus enum)
- `commitment` (Commitment | null)
- `public_bandwidth_bps` (number)
- `tags` (string[])

### ServerStatus enum
`unknown_status`, `starting`, `ready`, `error`, `rebooting`, `updating`, `locking`, `locked`, `unlocking`, `reinstalling`, `busy`

### ServerType
- `name` (string)
- `cpu` (object: name, core_count, frequency, sockets, threads_per_core)
- `disk` (object: capacity, type)
- `memory` (object: capacity, type)
- `gpu` (object: count)
- `npu` (object: count)
- `network` (object: public_bandwidth_bps, supported_bandwidth, default_public_bandwidth)
- `stock` (ServerTypeStock enum)
- `minimum_lease_duration` (string | null)
- `default_os` (OS | null)

### ServerTypeStock enum
`unknown_stock`, `no_stock`, `low_stock`, `high_stock`

### OS
- `id` (string)
- `name` (string)
- `label` (string)
- `image_url` (string)
- `family` (string)
- `is_beta` (boolean)
- `version` (string)
- `xcode_version` (string)
- `release_notes_url` (string)
- `description` (string)
- `tags` (string[])
- `supported_server_types` (OSSupportedServerType[])

### CommitmentType enum
`duration_24h`, `renewed_monthly`, `none`

## MCP Tools

| Tool Name | Method | API Path | Priority |
|-----------|--------|----------|----------|
| `scaleway_apple_silicon_list_servers` | GET | `/apple-silicon/v1alpha1/zones/{zone}/servers` | P1 |
| `scaleway_apple_silicon_get_server` | GET | `/apple-silicon/v1alpha1/zones/{zone}/servers/{server_id}` | P1 |
| `scaleway_apple_silicon_create_server` | POST | `/apple-silicon/v1alpha1/zones/{zone}/servers` | P1 |
| `scaleway_apple_silicon_delete_server` | DELETE | `/apple-silicon/v1alpha1/zones/{zone}/servers/{server_id}` | P1 |
| `scaleway_apple_silicon_reboot_server` | POST | `/apple-silicon/v1alpha1/zones/{zone}/servers/{server_id}/reboot` | P1 |
| `scaleway_apple_silicon_reinstall_server` | POST | `/apple-silicon/v1alpha1/zones/{zone}/servers/{server_id}/reinstall` | P1 |
| `scaleway_apple_silicon_list_server_types` | GET | `/apple-silicon/v1alpha1/zones/{zone}/server-types` | P2 |
| `scaleway_apple_silicon_list_os` | GET | `/apple-silicon/v1alpha1/zones/{zone}/os` | P2 |

## Checklist

- [x] User stories defined with acceptance criteria
- [x] All entities documented with field types
- [x] All enums specified
- [x] MCP tool names follow `scaleway_{product}_{action}` convention
- [x] API paths mapped to Scaleway API reference
- [x] Priority levels assigned (P1/P2)
- [x] Zoned locality documented (fr-par-3)
