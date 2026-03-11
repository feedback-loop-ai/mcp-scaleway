# Tool Contracts: Scaleway Load Balancer MCP Tools

**Feature**: 017-lb | **Date**: 2026-03-11

## LB Tools

### scaleway_lb_list_lbs

**Scaleway API**: `GET /lb/v1/zones/{zone}/lbs`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| zone | string | no | default zone | Availability zone (e.g., fr-par-1) |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| name | string | no | - | Filter by name (partial match) |
| project_id | string (UUID) | no | - | Filter by project ID |
| order_by | enum | no | - | created_at_asc, created_at_desc, name_asc, name_desc |
| tags | string[] | no | - | Filter by tags |

**Output**: `{ lbs: LoadBalancer[], total_count: number }`

---

### scaleway_lb_get_lb

**Scaleway API**: `GET /lb/v1/zones/{zone}/lbs/{lb_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| lb_id | string (UUID) | yes | Load balancer ID |

**Output**: `{ lb: LoadBalancer }`

---

### scaleway_lb_create_lb

**Scaleway API**: `POST /lb/v1/zones/{zone}/lbs`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| project_id | string (UUID) | no | Project ID |
| name | string | yes | Load balancer name |
| description | string | no | Description |
| ip_id | string (UUID) | no | Existing IP ID to assign |
| assign_flexible_ip | boolean | no | Assign a new flexible IP |
| assign_flexible_ipv6 | boolean | no | Assign a new flexible IPv6 |
| type | string | no | LB type (e.g., lb-s) |
| tags | string[] | no | Tags |
| ssl_compatibility_level | enum | no | ssl_compatibility_level_unknown, ssl_compatibility_level_intermediate, ssl_compatibility_level_modern, ssl_compatibility_level_old_backward |

**Output**: `{ lb: LoadBalancer }`

---

### scaleway_lb_update_lb

**Scaleway API**: `PUT /lb/v1/zones/{zone}/lbs/{lb_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| lb_id | string (UUID) | yes | Load balancer ID |
| name | string | yes | New name |
| description | string | yes | New description |
| tags | string[] | no | New tags |
| ssl_compatibility_level | enum | no | SSL compatibility level |

**Output**: `{ lb: LoadBalancer }`

---

### scaleway_lb_delete_lb

**Scaleway API**: `DELETE /lb/v1/zones/{zone}/lbs/{lb_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| lb_id | string (UUID) | yes | Load balancer ID |
| release_ip | boolean | no | Release the associated IP address |

**Output**: `{ success: true }`

---

### scaleway_lb_migrate_lb

**Scaleway API**: `POST /lb/v1/zones/{zone}/lbs/{lb_id}/migrate`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| lb_id | string (UUID) | yes | Load balancer ID |
| type | string | yes | Target LB type (e.g., lb-gp-m) |

**Output**: `{ lb: LoadBalancer }`

---

## Frontend Tools

### scaleway_lb_list_frontends

**Scaleway API**: `GET /lb/v1/zones/{zone}/lbs/{lb_id}/frontends`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| zone | string | no | default zone | Availability zone |
| lb_id | string (UUID) | yes | - | Load balancer ID |
| name | string | no | - | Filter by name |
| order_by | enum | no | - | created_at_asc, created_at_desc, name_asc, name_desc |
| page | number | no | 1 | Page number |
| pageSize | number | no | 50 | Items per page |

**Output**: `{ frontends: Frontend[], total_count: number }`

---

### scaleway_lb_get_frontend

**Scaleway API**: `GET /lb/v1/zones/{zone}/frontends/{frontend_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| frontend_id | string (UUID) | yes | Frontend ID |

**Output**: `{ frontend: Frontend }`

---

### scaleway_lb_create_frontend

**Scaleway API**: `POST /lb/v1/zones/{zone}/lbs/{lb_id}/frontends`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| lb_id | string (UUID) | yes | Load balancer ID |
| name | string | yes | Frontend name |
| inbound_port | number | yes | Listening port (1-65535) |
| backend_id | string (UUID) | yes | Backend ID to forward to |
| timeout_client | string | no | Client timeout (e.g., 30000ms) |
| certificate_id | string (UUID) | no | Certificate ID for HTTPS |
| certificate_ids | string[] (UUID) | no | Multiple certificate IDs |
| enable_http3 | boolean | no | Enable HTTP/3 |

**Output**: `{ frontend: Frontend }`

---

### scaleway_lb_update_frontend

**Scaleway API**: `PUT /lb/v1/zones/{zone}/frontends/{frontend_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| frontend_id | string (UUID) | yes | Frontend ID |
| name | string | yes | New name |
| inbound_port | number | yes | New listening port (1-65535) |
| backend_id | string (UUID) | yes | Backend ID |
| timeout_client | string | no | Client timeout |
| certificate_id | string (UUID) | no | Certificate ID |
| certificate_ids | string[] (UUID) | no | Certificate IDs |
| enable_http3 | boolean | no | Enable HTTP/3 |

**Output**: `{ frontend: Frontend }`

---

### scaleway_lb_delete_frontend

**Scaleway API**: `DELETE /lb/v1/zones/{zone}/frontends/{frontend_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| frontend_id | string (UUID) | yes | Frontend ID |

**Output**: `{ success: true }`

---

## Backend Tools

### scaleway_lb_list_backends

**Scaleway API**: `GET /lb/v1/zones/{zone}/lbs/{lb_id}/backends`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| zone | string | no | default zone | Availability zone |
| lb_id | string (UUID) | yes | - | Load balancer ID |
| name | string | no | - | Filter by name |
| order_by | enum | no | - | created_at_asc, created_at_desc, name_asc, name_desc |
| page | number | no | 1 | Page number |
| pageSize | number | no | 50 | Items per page |

**Output**: `{ backends: Backend[], total_count: number }`

---

### scaleway_lb_get_backend

**Scaleway API**: `GET /lb/v1/zones/{zone}/backends/{backend_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| backend_id | string (UUID) | yes | Backend ID |

**Output**: `{ backend: Backend }`

---

### scaleway_lb_create_backend

**Scaleway API**: `POST /lb/v1/zones/{zone}/lbs/{lb_id}/backends`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| lb_id | string (UUID) | yes | Load balancer ID |
| name | string | yes | Backend name |
| forward_protocol | enum | yes | tcp, http |
| forward_port | number | yes | Target port (1-65535) |
| forward_port_algorithm | enum | no | roundrobin, leastconn, first |
| sticky_sessions | enum | no | none, cookie, table |
| sticky_sessions_cookie_name | string | no | Cookie name for sticky sessions |
| health_check | object | no | Health check configuration |
| server_ip | string[] | no | Backend server IPs |
| timeout_server | string | no | Server timeout |
| timeout_connect | string | no | Connection timeout |
| timeout_tunnel | string | no | Tunnel timeout |
| on_marked_down_action | enum | no | on_marked_down_action_none, shutdown_sessions |
| proxy_protocol | enum | no | proxy_protocol_unknown, proxy_protocol_none, proxy_protocol_v1, proxy_protocol_v2, proxy_protocol_v2_ssl, proxy_protocol_v2_ssl_cn |
| failover_host | string | no | Failover host |
| ssl_bridging | boolean | no | Enable SSL bridging |
| ignore_ssl_server_verify | boolean | no | Ignore SSL server verification |
| redispatch_attempt_count | number | no | Max redispatch attempts |
| max_retries | number | no | Max retries on failure |
| max_connections | number | no | Max simultaneous connections |
| timeout_queue | string | no | Queue timeout |

**Output**: `{ backend: Backend }`

---

### scaleway_lb_update_backend

**Scaleway API**: `PUT /lb/v1/zones/{zone}/backends/{backend_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| backend_id | string (UUID) | yes | Backend ID |
| name | string | yes | New name |
| forward_protocol | enum | yes | tcp, http |
| forward_port | number | yes | Target port (1-65535) |
| forward_port_algorithm | enum | no | roundrobin, leastconn, first |
| sticky_sessions | enum | no | none, cookie, table |
| sticky_sessions_cookie_name | string | no | Cookie name |
| timeout_server | string | no | Server timeout |
| timeout_connect | string | no | Connection timeout |
| timeout_tunnel | string | no | Tunnel timeout |
| on_marked_down_action | enum | no | Action when marked down |
| proxy_protocol | enum | no | PROXY protocol version |
| failover_host | string | no | Failover host |
| ssl_bridging | boolean | no | SSL bridging |
| ignore_ssl_server_verify | boolean | no | Ignore SSL verification |
| redispatch_attempt_count | number | no | Redispatch attempts |
| max_retries | number | no | Max retries |
| max_connections | number | no | Max connections |
| timeout_queue | string | no | Queue timeout |

**Output**: `{ backend: Backend }`

---

### scaleway_lb_delete_backend

**Scaleway API**: `DELETE /lb/v1/zones/{zone}/backends/{backend_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| backend_id | string (UUID) | yes | Backend ID |

**Output**: `{ success: true }`

---

### scaleway_lb_add_backend_servers

**Scaleway API**: `POST /lb/v1/zones/{zone}/backends/{backend_id}/servers`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| backend_id | string (UUID) | yes | Backend ID |
| server_ip | string[] | yes | Server IPs to add |

**Output**: `{ backend: Backend }`

---

### scaleway_lb_remove_backend_servers

**Scaleway API**: `DELETE /lb/v1/zones/{zone}/backends/{backend_id}/servers`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| backend_id | string (UUID) | yes | Backend ID |
| server_ip | string[] | yes | Server IPs to remove |

**Output**: `{ backend: Backend }`

---

### scaleway_lb_set_backend_servers

**Scaleway API**: `PUT /lb/v1/zones/{zone}/backends/{backend_id}/servers`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| backend_id | string (UUID) | yes | Backend ID |
| server_ip | string[] | yes | Complete list of server IPs |

**Output**: `{ backend: Backend }`

---

## Route Tools

### scaleway_lb_list_routes

**Scaleway API**: `GET /lb/v1/zones/{zone}/routes`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| zone | string | no | default zone | Availability zone |
| frontend_id | string (UUID) | no | - | Filter by frontend ID |
| order_by | enum | no | - | created_at_asc, created_at_desc |
| page | number | no | 1 | Page number |
| pageSize | number | no | 50 | Items per page |

**Output**: `{ routes: Route[], total_count: number }`

---

### scaleway_lb_get_route

**Scaleway API**: `GET /lb/v1/zones/{zone}/routes/{route_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| route_id | string (UUID) | yes | Route ID |

**Output**: `{ route: Route }`

---

### scaleway_lb_create_route

**Scaleway API**: `POST /lb/v1/zones/{zone}/routes`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| frontend_id | string (UUID) | yes | Frontend ID |
| backend_id | string (UUID) | yes | Backend ID to route to |
| match_sni | string | no | SNI to match |
| match_host_header | string | no | Host header to match |

**Output**: `{ route: Route }`

---

### scaleway_lb_update_route

**Scaleway API**: `PUT /lb/v1/zones/{zone}/routes/{route_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| route_id | string (UUID) | yes | Route ID |
| backend_id | string (UUID) | yes | Backend ID to route to |
| match_sni | string | no | SNI to match |
| match_host_header | string | no | Host header to match |

**Output**: `{ route: Route }`

---

### scaleway_lb_delete_route

**Scaleway API**: `DELETE /lb/v1/zones/{zone}/routes/{route_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| route_id | string (UUID) | yes | Route ID |

**Output**: `{ success: true }`

---

## Certificate Tools

### scaleway_lb_list_certificates

**Scaleway API**: `GET /lb/v1/zones/{zone}/lbs/{lb_id}/certificates`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| zone | string | no | default zone | Availability zone |
| lb_id | string (UUID) | yes | - | Load balancer ID |
| name | string | no | - | Filter by name |
| order_by | enum | no | - | created_at_asc, created_at_desc, name_asc, name_desc |
| page | number | no | 1 | Page number |
| pageSize | number | no | 50 | Items per page |

**Output**: `{ certificates: Certificate[], total_count: number }`

---

### scaleway_lb_get_certificate

**Scaleway API**: `GET /lb/v1/zones/{zone}/certificates/{certificate_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| certificate_id | string (UUID) | yes | Certificate ID |

**Output**: `{ certificate: Certificate }`

---

### scaleway_lb_create_certificate

**Scaleway API**: `POST /lb/v1/zones/{zone}/lbs/{lb_id}/certificates`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| lb_id | string (UUID) | yes | Load balancer ID |
| name | string | yes | Certificate name |
| letsencrypt | object | no | Let's Encrypt config (common_name, subject_alternative_name[]) |
| custom_certificate | object | no | Custom cert config (certificate_chain) |

**Output**: `{ certificate: Certificate }`

---

### scaleway_lb_update_certificate

**Scaleway API**: `PUT /lb/v1/zones/{zone}/certificates/{certificate_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| certificate_id | string (UUID) | yes | Certificate ID |
| name | string | yes | New name |

**Output**: `{ certificate: Certificate }`

---

### scaleway_lb_delete_certificate

**Scaleway API**: `DELETE /lb/v1/zones/{zone}/certificates/{certificate_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| certificate_id | string (UUID) | yes | Certificate ID |

**Output**: `{ success: true }`

---

## Stats & Types Tools

### scaleway_lb_get_lb_stats

**Scaleway API**: `GET /lb/v1/zones/{zone}/lbs/{lb_id}/stats`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | no | Availability zone |
| lb_id | string (UUID) | yes | Load balancer ID |
| backend_id | string (UUID) | no | Filter by backend ID |

**Output**: `{ backend_servers_stats: BackendServerStats[] }`

---

### scaleway_lb_list_lb_types

**Scaleway API**: `GET /lb/v1/zones/{zone}/lb-types`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| zone | string | no | default zone | Availability zone |
| page | number | no | 1 | Page number |
| pageSize | number | no | 50 | Items per page |

**Output**: `{ lb_types: LbType[], total_count: number }`
