# Data Model: Scaleway Load Balancer MCP Tools

**Feature**: 017-lb | **Date**: 2026-03-11

## Entities

### LoadBalancer

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique load balancer identifier |
| name | string | yes | Load balancer name |
| description | string | yes | Description |
| status | enum | yes | unknown, ready, pending, stopped, error, locked, migrating, to_create, creating, to_delete, deleting |
| type | string | yes | LB type (e.g., lb-s) |
| zone | string | yes | Availability zone (e.g., fr-par-1) |
| project_id | string (UUID) | yes | Project ID |
| ip | array | yes | Associated IP addresses |
| tags | string[] | no | User-defined tags |
| ssl_compatibility_level | enum | no | ssl_compatibility_level_unknown, ssl_compatibility_level_intermediate, ssl_compatibility_level_modern, ssl_compatibility_level_old_backward |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last modification timestamp |
| frontend_count | number | yes | Number of frontends |
| backend_count | number | yes | Number of backends |
| private_network_count | number | yes | Number of attached private networks |
| route_count | number | yes | Number of routes |
| organization_id | string (UUID) | yes | Organization ID |
| subscriber | object/null | no | Subscriber information |

### Frontend

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique frontend identifier |
| name | string | yes | Frontend name |
| inbound_port | number | yes | Listening port (1-65535) |
| backend | object | yes | Associated backend |
| lb | object | yes | Associated load balancer |
| timeout_client | string/null | no | Client timeout duration |
| certificate | object/null | no | Main TLS certificate |
| certificate_ids | string[] | no | List of certificate IDs |
| enable_http3 | boolean | no | Whether HTTP/3 is enabled |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last modification timestamp |

### Backend

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique backend identifier |
| name | string | yes | Backend name |
| forward_protocol | enum | yes | tcp, http |
| forward_port | number | yes | Target port (1-65535) |
| forward_port_algorithm | enum | yes | roundrobin, leastconn, first |
| sticky_sessions | enum | yes | none, cookie, table |
| sticky_sessions_cookie_name | string | no | Cookie name for sticky sessions |
| health_check | object | no | Health check configuration |
| pool | string[] | yes | List of backend server IPs |
| lb | object | yes | Associated load balancer |
| timeout_server | string/null | no | Server timeout duration |
| timeout_connect | string/null | no | Connection timeout duration |
| timeout_tunnel | string/null | no | Tunnel timeout duration |
| on_marked_down_action | enum | no | on_marked_down_action_none, shutdown_sessions |
| proxy_protocol | enum | no | proxy_protocol_unknown, proxy_protocol_none, proxy_protocol_v1, proxy_protocol_v2, proxy_protocol_v2_ssl, proxy_protocol_v2_ssl_cn |
| failover_host | string/null | no | Failover host URL |
| ssl_bridging | boolean | no | Whether SSL bridging is enabled |
| ignore_ssl_server_verify | boolean | no | Whether to skip SSL server verification |
| redispatch_attempt_count | number | no | Max redispatch attempts |
| max_retries | number | no | Max retries on failure |
| max_connections | number/null | no | Max simultaneous connections |
| timeout_queue | string/null | no | Queue timeout duration |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last modification timestamp |

### HealthCheck

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| port | number | yes | Health check port |
| check_delay | string | no | Time between checks (e.g., 3000ms) |
| check_timeout | string | no | Timeout per check (e.g., 1000ms) |
| check_max_retries | number | no | Max retries before marking unhealthy |
| tcp_config | object | no | TCP health check (empty object) |
| http_config | object | no | HTTP health check (uri, method, code, host_header) |
| https_config | object | no | HTTPS health check (uri, method, code, host_header, sni) |

### Route

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique route identifier |
| frontend_id | string (UUID) | yes | Associated frontend |
| backend_id | string (UUID) | yes | Target backend |
| match_sni | string/null | no | SNI value to match |
| match_host_header | string/null | no | Host header value to match |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last modification timestamp |

### Certificate

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique certificate identifier |
| name | string | yes | Certificate name |
| type | enum | yes | letsencryt, custom |
| status | enum | yes | pending, ready, error |
| common_name | string | yes | Main domain name |
| subject_alternative_name | string[] | no | Subject alternative names |
| fingerprint | string | yes | Certificate fingerprint |
| not_valid_before | string (ISO 8601) | yes | Valid from timestamp |
| not_valid_after | string (ISO 8601) | yes | Valid until timestamp |
| lb | object | yes | Associated load balancer |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last modification timestamp |
| status_details | string/null | no | Status detail message |

### LbType

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Type name (e.g., lb-s) |
| stock_status | string | yes | Availability (available, shortage, out_of_stock) |
| description | string | yes | Human-readable description |
| zone | string | yes | Availability zone |
| bandwidth | number | yes | Bandwidth in bps |
| max_connections | number | yes | Max concurrent connections |

### BackendServerStats

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| instance_id | string (UUID) | yes | Server instance ID |
| backend_id | string (UUID) | yes | Backend ID |
| ip | string | yes | Server IP address |
| server_state | string | yes | Health state (stopped, starting, running, stopping) |
| server_state_changed_at | string (ISO 8601) | yes | Last state change timestamp |
| last_health_check_status | string | yes | Last health check result |
