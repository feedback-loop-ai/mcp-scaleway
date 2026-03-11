# SDD Spec: 021-ipam (IP Address Management)

## Overview
IPAM (IP Address Management) is a regional Scaleway API that manages IP address reservations across VPCs, private networks, and Scaleway resources.

## User Stories

### P1 - Core IP Management
- **US-1**: As a cloud operator, I want to list IPs with filters (project, region, resource type, tags, attached status, IPv6) so I can audit my IP allocations.
- **US-2**: As a cloud operator, I want to get details of a specific IP so I can inspect its source, resource attachment, and metadata.
- **US-3**: As a cloud operator, I want to book (reserve) a new IP so I can allocate addresses for my infrastructure.
- **US-4**: As a cloud operator, I want to release an IP so I can free unused address space.

### P2 - IP Metadata
- **US-5**: As a cloud operator, I want to update IP tags and reverses so I can organize and configure DNS for my IPs.

## MCP Tools

| Tool Name | API Endpoint | Method | Priority |
|---|---|---|---|
| `scaleway_ipam_list_ips` | `GET /ipam/v1/regions/{region}/ips` | List | P1 |
| `scaleway_ipam_get_ip` | `GET /ipam/v1/regions/{region}/ips/{ip_id}` | Get | P1 |
| `scaleway_ipam_book_ip` | `POST /ipam/v1/regions/{region}/ips` | Create | P1 |
| `scaleway_ipam_release_ip` | `DELETE /ipam/v1/regions/{region}/ips/{ip_id}` | Delete | P1 |
| `scaleway_ipam_update_ip` | `PATCH /ipam/v1/regions/{region}/ips/{ip_id}` | Update | P2 |

## Entities

### IP
- `id` (string, UUID)
- `address` (string, CIDR notation)
- `project_id` (string, UUID)
- `is_ipv6` (boolean)
- `created_at` (string, ISO 8601)
- `updated_at` (string, ISO 8601)
- `source` (Source object)
- `resource` (Resource object, nullable)
- `tags` (string[])
- `reverses` (Reverse[])
- `region` (string)
- `zone` (string, nullable)

### Source (oneOf)
- `zonal` (string) - zone identifier
- `private_network_id` (string, UUID)
- `subnet_id` (string, UUID)

### Resource
- `type` (ResourceType enum)
- `id` (string, UUID)
- `mac_address` (string, nullable)
- `name` (string, nullable)

### Reverse
- `hostname` (string)
- `address` (string, nullable)

### ResourceType (enum)
`unknown_type`, `custom`, `instance_server`, `instance_ip`, `instance_private_nic`, `lb_server`, `fip_ip`, `vpc_gateway`, `vpc_gateway_network`, `k8s_node`, `k8s_cluster`, `rdb_instance`, `redis_cluster`, `baremetal_server`, `baremetal_private_nic`, `llm_deployment`, `mgdb_instance`, `apple_silicon_server`, `apple_silicon_private_nic`

### ListIPsRequestOrderBy (enum)
`created_at_desc`, `created_at_asc`, `updated_at_desc`, `updated_at_asc`, `attached_at_desc`, `attached_at_asc`

## API Base Path
`https://api.scaleway.com/ipam/v1/regions/{region}`

## Authentication
Bearer token via `X-Auth-Token` header (handled by `@scaleway/sdk-client`).

## Pagination
Standard Scaleway pagination: `page` (1-indexed), `page_size` (default 50, max 100), response includes `total_count`.
