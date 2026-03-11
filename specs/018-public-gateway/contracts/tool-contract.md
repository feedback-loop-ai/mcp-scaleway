# Tool Contracts: Scaleway Public Gateway MCP Tools

**Feature**: 018-public-gateway | **Date**: 2026-03-11

## Gateway Tools

### scaleway_public_gateway_list_gateways

**Scaleway API**: `GET /vpc-gw/v2/zones/{zone}/gateways`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| zone | string | no | fr-par-1 | Availability zone |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| orderBy | enum | no | - | created_at_asc, created_at_desc, name_asc, name_desc, type_asc, type_desc, status_asc, status_desc |
| organizationId | string | no | - | Filter by Organization ID |
| projectId | string | no | - | Filter by Project ID |
| name | string | no | - | Filter by name (partial match) |
| tags | string[] | no | - | Filter by tags |
| types | string[] | no | - | Filter by gateway types |
| status | enum[] | no | - | Filter by status |
| privateNetworkIds | string[] | no | - | Filter by attached Private Network IDs |
| includeLegacy | boolean | no | - | Include legacy gateways |

**Output**: `{ items: Gateway[], total_count: number, page: number, page_size: number }`

---

### scaleway_public_gateway_get_gateway

**Scaleway API**: `GET /vpc-gw/v2/zones/{zone}/gateways/{gateway_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| gatewayId | string (UUID) | yes | Gateway ID |

**Output**: Gateway object

---

### scaleway_public_gateway_create_gateway

**Scaleway API**: `POST /vpc-gw/v2/zones/{zone}/gateways`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| projectId | string (UUID) | no | Project ID |
| name | string | no | Gateway name |
| tags | string[] | no | Tags |
| type | string | yes | Gateway type (e.g., VPC-GW-S) |
| ipId | string (UUID) | no | Existing IP to attach |
| enableSmtp | boolean | yes | Allow SMTP traffic |
| enableBastion | boolean | yes | Enable SSH bastion |
| bastionPort | number | no | SSH bastion port |

**Output**: Gateway object

---

### scaleway_public_gateway_update_gateway

**Scaleway API**: `PATCH /vpc-gw/v2/zones/{zone}/gateways/{gateway_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| gatewayId | string (UUID) | yes | Gateway ID |
| name | string | no | New name |
| tags | string[] | no | New tags |
| enableBastion | boolean | no | Enable/disable bastion |
| bastionPort | number | no | Bastion port |
| enableSmtp | boolean | no | Allow/disallow SMTP |

**Output**: Gateway object

---

### scaleway_public_gateway_delete_gateway

**Scaleway API**: `DELETE /vpc-gw/v2/zones/{zone}/gateways/{gateway_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| gatewayId | string (UUID) | yes | Gateway ID |
| deleteIp | boolean | yes | Whether to also delete the gateway's IP |

**Output**: Gateway object

---

## Gateway Network Tools

### scaleway_public_gateway_list_gateway_networks

**Scaleway API**: `GET /vpc-gw/v2/zones/{zone}/gateway-networks`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| zone | string | no | fr-par-1 | Availability zone |
| page | number | no | 1 | Page number |
| pageSize | number | no | 50 | Items per page |
| orderBy | enum | no | - | created_at_asc, created_at_desc, status_asc, status_desc |
| status | enum[] | no | - | Filter by status |
| gatewayIds | string[] | no | - | Filter by gateway IDs |
| privateNetworkIds | string[] | no | - | Filter by Private Network IDs |
| masqueradeEnabled | boolean | no | - | Filter by masquerade setting |

**Output**: `{ items: GatewayNetwork[], total_count: number, page: number, page_size: number }`

---

### scaleway_public_gateway_get_gateway_network

**Scaleway API**: `GET /vpc-gw/v2/zones/{zone}/gateway-networks/{gateway_network_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| gatewayNetworkId | string (UUID) | yes | GatewayNetwork ID |

**Output**: GatewayNetwork object

---

### scaleway_public_gateway_create_gateway_network

**Scaleway API**: `POST /vpc-gw/v2/zones/{zone}/gateway-networks`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| gatewayId | string (UUID) | yes | Gateway to connect |
| privateNetworkId | string (UUID) | yes | Private Network to connect |
| enableMasquerade | boolean | yes | Enable masquerade (dynamic NAT) |
| pushDefaultRoute | boolean | yes | Push default route |
| ipamIpId | string (UUID) | no | IPAM-booked IP ID |

**Output**: GatewayNetwork object

---

### scaleway_public_gateway_update_gateway_network

**Scaleway API**: `PATCH /vpc-gw/v2/zones/{zone}/gateway-networks/{gateway_network_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| gatewayNetworkId | string (UUID) | yes | GatewayNetwork ID |
| enableMasquerade | boolean | no | Enable/disable masquerade |
| pushDefaultRoute | boolean | no | Enable/disable default route |
| ipamIpId | string (UUID) | no | IPAM-booked IP ID |

**Output**: GatewayNetwork object

---

### scaleway_public_gateway_delete_gateway_network

**Scaleway API**: `DELETE /vpc-gw/v2/zones/{zone}/gateway-networks/{gateway_network_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| gatewayNetworkId | string (UUID) | yes | GatewayNetwork ID |

**Output**: GatewayNetwork object

---

## DHCP Tools (v1 API)

### scaleway_public_gateway_list_dhcps

**Scaleway API**: `GET /vpc-gw/v1/zones/{zone}/dhcps`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| zone | string | no | fr-par-1 | Availability zone |
| page | number | no | 1 | Page number |
| pageSize | number | no | 50 | Items per page |
| orderBy | enum | no | - | created_at_asc, created_at_desc, subnet_asc, subnet_desc |
| organizationId | string | no | - | Filter by Organization ID |
| projectId | string | no | - | Filter by Project ID |
| address | string | no | - | Filter by DHCP server address |
| hasAddress | string | no | - | Filter for subnets containing this IP |

**Output**: `{ items: DHCP[], total_count: number, page: number, page_size: number }`

---

### scaleway_public_gateway_get_dhcp

**Scaleway API**: `GET /vpc-gw/v1/zones/{zone}/dhcps/{dhcp_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| dhcpId | string (UUID) | yes | DHCP configuration ID |

**Output**: DHCP object

---

### scaleway_public_gateway_create_dhcp

**Scaleway API**: `POST /vpc-gw/v1/zones/{zone}/dhcps`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| projectId | string (UUID) | no | Project ID |
| subnet | string | yes | Subnet in CIDR notation |
| address | string | no | DHCP server IP |
| poolLow | string | no | Low IP of dynamic pool |
| poolHigh | string | no | High IP of dynamic pool |
| enableDynamic | boolean | no | Enable dynamic pooling |
| validLifetime | string | no | DHCP entry validity |
| renewTimer | string | no | Renew interval |
| rebindTimer | string | no | Rebind interval |
| pushDefaultRoute | boolean | no | Push default route |
| pushDnsServer | boolean | no | Push DNS servers |
| dnsServersOverride | string[] | no | Override DNS servers |
| dnsSearch | string[] | no | DNS search paths |
| dnsLocalName | string | no | TLD for Private Network hostnames |

**Output**: DHCP object

---

### scaleway_public_gateway_update_dhcp

**Scaleway API**: `PATCH /vpc-gw/v1/zones/{zone}/dhcps/{dhcp_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| dhcpId | string (UUID) | yes | DHCP configuration ID |
| subnet | string | no | Subnet in CIDR notation |
| address | string | no | DHCP server IP |
| poolLow | string | no | Low IP of pool |
| poolHigh | string | no | High IP of pool |
| enableDynamic | boolean | no | Enable dynamic pooling |
| validLifetime | string | no | Entry validity |
| renewTimer | string | no | Renew interval |
| rebindTimer | string | no | Rebind interval |
| pushDefaultRoute | boolean | no | Push default route |
| pushDnsServer | boolean | no | Push DNS servers |
| dnsServersOverride | string[] | no | Override DNS servers |
| dnsSearch | string[] | no | DNS search paths |
| dnsLocalName | string | no | TLD for hostnames |

**Output**: DHCP object

---

### scaleway_public_gateway_delete_dhcp

**Scaleway API**: `DELETE /vpc-gw/v1/zones/{zone}/dhcps/{dhcp_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| dhcpId | string (UUID) | yes | DHCP configuration ID |

**Output**: `{ success: true }`

---

## PAT Rule Tools

### scaleway_public_gateway_list_pat_rules

**Scaleway API**: `GET /vpc-gw/v2/zones/{zone}/pat-rules`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| zone | string | no | fr-par-1 | Availability zone |
| page | number | no | 1 | Page number |
| pageSize | number | no | 50 | Items per page |
| orderBy | enum | no | - | created_at_asc, created_at_desc, public_port_asc, public_port_desc |
| gatewayIds | string[] | no | - | Filter by gateway IDs |
| privateIps | string[] | no | - | Filter by private IPs |
| protocol | enum | no | - | Filter by protocol (both, tcp, udp) |

**Output**: `{ items: PatRule[], total_count: number, page: number, page_size: number }`

---

### scaleway_public_gateway_get_pat_rule

**Scaleway API**: `GET /vpc-gw/v2/zones/{zone}/pat-rules/{pat_rule_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| patRuleId | string (UUID) | yes | PAT rule ID |

**Output**: PatRule object

---

### scaleway_public_gateway_create_pat_rule

**Scaleway API**: `POST /vpc-gw/v2/zones/{zone}/pat-rules`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| gatewayId | string (UUID) | yes | Gateway to create rule on |
| publicPort | number (1-65535) | yes | Public port to listen on |
| privateIp | string | yes | Private IP to forward to |
| privatePort | number (1-65535) | yes | Private port to forward to |
| protocol | enum | no | Protocol (both, tcp, udp) |

**Output**: PatRule object

---

### scaleway_public_gateway_update_pat_rule

**Scaleway API**: `PATCH /vpc-gw/v2/zones/{zone}/pat-rules/{pat_rule_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| patRuleId | string (UUID) | yes | PAT rule ID |
| publicPort | number (1-65535) | no | Public port |
| privateIp | string | no | Private IP |
| privatePort | number (1-65535) | no | Private port |
| protocol | enum | no | Protocol |

**Output**: PatRule object

---

### scaleway_public_gateway_delete_pat_rule

**Scaleway API**: `DELETE /vpc-gw/v2/zones/{zone}/pat-rules/{pat_rule_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| patRuleId | string (UUID) | yes | PAT rule ID |

**Output**: `{ success: true }`

---

## IP Tools

### scaleway_public_gateway_list_ips

**Scaleway API**: `GET /vpc-gw/v2/zones/{zone}/ips`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| zone | string | no | fr-par-1 | Availability zone |
| page | number | no | 1 | Page number |
| pageSize | number | no | 50 | Items per page |
| orderBy | enum | no | - | created_at_asc, created_at_desc, address_asc, address_desc, reverse_asc, reverse_desc |
| organizationId | string | no | - | Filter by Organization ID |
| projectId | string | no | - | Filter by Project ID |
| tags | string[] | no | - | Filter by tags |
| reverse | string | no | - | Filter by reverse DNS (partial match) |
| isFree | boolean | no | - | Filter for unattached IPs |

**Output**: `{ items: IP[], total_count: number, page: number, page_size: number }`

---

### scaleway_public_gateway_get_ip

**Scaleway API**: `GET /vpc-gw/v2/zones/{zone}/ips/{ip_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| ipId | string (UUID) | yes | IP address ID |

**Output**: IP object

---

### scaleway_public_gateway_create_ip

**Scaleway API**: `POST /vpc-gw/v2/zones/{zone}/ips`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| projectId | string (UUID) | no | Project ID |
| tags | string[] | no | Tags |

**Output**: IP object

---

### scaleway_public_gateway_update_ip

**Scaleway API**: `PATCH /vpc-gw/v2/zones/{zone}/ips/{ip_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| ipId | string (UUID) | yes | IP address ID |
| tags | string[] | no | Tags |
| reverse | string | no | Reverse DNS (empty to unset) |
| gatewayId | string | no | Gateway to attach (empty to detach) |

**Output**: IP object

---

### scaleway_public_gateway_delete_ip

**Scaleway API**: `DELETE /vpc-gw/v2/zones/{zone}/ips/{ip_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| ipId | string (UUID) | yes | IP address ID |

**Output**: `{ success: true }`

---

## Gateway Types Tool

### scaleway_public_gateway_list_gateway_types

**Scaleway API**: `GET /vpc-gw/v2/zones/{zone}/gateway-types`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |

**Output**: `{ type: { [name: string]: GatewayType } }`
