# Data Model: Scaleway Public Gateway MCP Tools

**Feature**: 018-public-gateway | **Date**: 2026-03-11

## Entities

### Gateway

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique gateway identifier |
| name | string | yes | Gateway name |
| type | string | yes | Commercial offer type (e.g., VPC-GW-S) |
| status | enum | yes | unknown_status, stopped, allocating, configuring, running, stopping, failed, deleting, locked |
| zone | string | yes | Availability zone (e.g., fr-par-1) |
| project_id | string (UUID) | yes | Project ID |
| organization_id | string (UUID) | yes | Organization ID |
| ip | object/null | no | Attached flexible IP address |
| tags | string[] | no | User-defined tags |
| enable_smtp | boolean | yes | Whether SMTP traffic is allowed |
| enable_bastion | boolean | yes | Whether SSH bastion is enabled |
| bastion_port | number/null | no | SSH bastion port |
| gateway_networks | array | no | Attached gateway network connections |
| upstream_dns_servers | string[] | no | Upstream DNS servers |
| can_upgrade_to | string/null | no | Available upgrade target type |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last update timestamp |

### GatewayNetwork

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique gateway network identifier |
| gateway_id | string (UUID) | yes | Gateway this connection belongs to |
| private_network_id | string (UUID) | yes | Private Network this connection links to |
| enable_masquerade | boolean | yes | Whether masquerade (dynamic NAT) is enabled |
| push_default_route | boolean | yes | Whether the default route is pushed to the network |
| status | enum | yes | unknown_status, created, attaching, configuring, ready, detaching |
| ipam_ip_id | string (UUID)/null | no | IPAM-booked IP for the gateway in this network |
| mac_address | string/null | no | MAC address of the gateway interface |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last update timestamp |
| zone | string | yes | Availability zone |

### DHCP (v1 API)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique DHCP configuration identifier |
| subnet | string | yes | Subnet in CIDR notation |
| address | string | yes | DHCP server IP address in the Private Network |
| pool_low | string | yes | Low IP (inclusive) of the dynamic address pool |
| pool_high | string | yes | High IP (inclusive) of the dynamic address pool |
| enable_dynamic | boolean | yes | Whether dynamic IP pooling is enabled |
| valid_lifetime | string | yes | How long DHCP entries are valid |
| renew_timer | string | yes | Renew attempt interval |
| rebind_timer | string | yes | Rebind query interval |
| push_default_route | boolean | yes | Whether default route is pushed to clients |
| push_dns_server | boolean | yes | Whether custom DNS servers are pushed |
| dns_servers_override | string[] | no | Override DNS server IPs |
| dns_search | string[] | no | DNS search paths |
| dns_local_name | string | yes | TLD for hostnames in Private Networks |
| project_id | string (UUID) | yes | Project ID |
| organization_id | string (UUID) | yes | Organization ID |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last update timestamp |
| zone | string | yes | Availability zone |

### PatRule

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique PAT rule identifier |
| gateway_id | string (UUID) | yes | Gateway this rule belongs to |
| public_port | number | yes | Public port to listen on (1-65535) |
| private_ip | string | yes | Private IP to forward data to |
| private_port | number | yes | Private port to translate to (1-65535) |
| protocol | enum | yes | unknown_protocol, both, tcp, udp |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last update timestamp |
| zone | string | yes | Availability zone |

### IP (Flexible IP)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique IP identifier |
| address | string | yes | IP address |
| reverse | string/null | no | Reverse DNS hostname |
| tags | string[] | no | User-defined tags |
| gateway_id | string (UUID)/null | no | Gateway this IP is attached to |
| project_id | string (UUID) | yes | Project ID |
| organization_id | string (UUID) | yes | Organization ID |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last update timestamp |
| zone | string | yes | Availability zone |

### GatewayType

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Type name (e.g., VPC-GW-S) |
| bandwidth | number | yes | Bandwidth in bps |
