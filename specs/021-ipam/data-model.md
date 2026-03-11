# Data Model: Scaleway IPAM MCP Tools

**Feature**: 021-ipam | **Date**: 2026-03-11

## Entities

### IP

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique IP identifier |
| address | string | yes | IP address in CIDR notation |
| project_id | string (UUID) | yes | Project ID |
| is_ipv6 | boolean | yes | Whether this is an IPv6 address |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last modification timestamp |
| source | Source | yes | Source of the IP (zonal, private network, or subnet) |
| resource | Resource/null | no | Resource the IP is attached to |
| tags | string[] | yes | User-defined tags |
| reverses | Reverse[] | yes | Reverse DNS entries |
| region | string | yes | Region (e.g., fr-par) |
| zone | string/null | no | Zone identifier |

### Source (oneOf)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zonal | string/null | no | Zone identifier for zonal IPs |
| private_network_id | string (UUID)/null | no | Private network ID for private network IPs |
| subnet_id | string (UUID)/null | no | Subnet ID for subnet-scoped IPs |

### Resource

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | ResourceType enum | yes | Type of attached resource |
| id | string (UUID) | yes | Resource UUID |
| mac_address | string/null | no | MAC address of the resource |
| name | string/null | no | Resource name |

### CustomResource (BookIP input only)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| mac_address | string | yes | MAC address for the custom resource |
| name | string | no | Optional name for the custom resource |

### Reverse

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| hostname | string | yes | Reverse DNS hostname |
| address | string/null | no | IP address for the reverse entry |

## Enums

### ResourceType

`unknown_type`, `custom`, `instance_server`, `instance_ip`, `instance_private_nic`, `lb_server`, `fip_ip`, `vpc_gateway`, `vpc_gateway_network`, `k8s_node`, `k8s_cluster`, `rdb_instance`, `redis_cluster`, `baremetal_server`, `baremetal_private_nic`, `llm_deployment`, `mgdb_instance`, `apple_silicon_server`, `apple_silicon_private_nic`

### ListIPsRequestOrderBy

`created_at_desc`, `created_at_asc`, `updated_at_desc`, `updated_at_asc`, `attached_at_desc`, `attached_at_asc`
