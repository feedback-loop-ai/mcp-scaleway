# Scaleway Load Balancer API Reference (Zoned)

Official reference: https://www.scaleway.com/en/developers/api/load-balancer/zoned-api/

Base URL: `https://api.scaleway.com/lb/v1/zones/{zone}`

- **API version:** v1, **zoned** variant (the tools target the zoned API, not the `/lb/v1/regions/{region}` regional/multi-zone variant).
- **Locality:** zonal (e.g. `fr-par-1`, `nl-ams-1`, `pl-waw-1`). Zone defaults to `loadAuthConfig().defaultZone`.
- **Authentication:** header `X-Auth-Token: <secret_key>`.
- **Pagination:** query `page` / `page_size`; list responses return `{ <collection>: [...], total_count }`. LB list handlers return the raw Scaleway body (they do not re-wrap into `{ items, ... }`).
- **Update method convention:** LB/frontend/backend/route/certificate updates use **PUT** (full replace); IP-address updates use PATCH. Create + actions use POST.

## Load Balancers

| Tool | Method + Path |
|------|---------------|
| `scaleway_lb_list_lbs` | `GET /lb/v1/zones/{zone}/lbs` — query `page`, `page_size`, `name`, `project_id`, `order_by`, `tags` |
| `scaleway_lb_get_lb` | `GET /lb/v1/zones/{zone}/lbs/{lb_id}` |
| `scaleway_lb_create_lb` | `POST /lb/v1/zones/{zone}/lbs` |
| `scaleway_lb_update_lb` | `PUT /lb/v1/zones/{zone}/lbs/{lb_id}` |
| `scaleway_lb_delete_lb` | `DELETE /lb/v1/zones/{zone}/lbs/{lb_id}` — query `release_ip` |
| `scaleway_lb_migrate_lb` | `POST /lb/v1/zones/{zone}/lbs/{lb_id}/migrate` — body `{ type }` |

- **Create LB body:** `{ name, project_id?, description?, ip_ids?: string[], assign_flexible_ip?, assign_flexible_ipv6?, type?, tags?, ssl_compatibility_level? }`
- **Fixed (2026-07):** the handler now sends `ip_ids` (array of IP IDs), matching the current zoned CreateLB request. The deprecated single `ip_id` field was replaced. Verified against the Scaleway Go SDK `api/lb/v1/lb_sdk.go` (`ZonedAPICreateLBRequest`).
- **Update LB body:** `{ name, description, tags?, ssl_compatibility_level? }` (name + description required by the schema).

## Frontends

| Tool | Method + Path |
|------|---------------|
| `scaleway_lb_list_frontends` | `GET /lb/v1/zones/{zone}/lbs/{lb_id}/frontends` |
| `scaleway_lb_get_frontend` | `GET /lb/v1/zones/{zone}/frontends/{frontend_id}` |
| `scaleway_lb_create_frontend` | `POST /lb/v1/zones/{zone}/lbs/{lb_id}/frontends` |
| `scaleway_lb_update_frontend` | `PUT /lb/v1/zones/{zone}/frontends/{frontend_id}` |
| `scaleway_lb_delete_frontend` | `DELETE /lb/v1/zones/{zone}/frontends/{frontend_id}` |

- **Create/Update frontend body:** `{ name, inbound_port, backend_id, timeout_client?, certificate_id?, certificate_ids?, enable_http3? }`

## Backends

| Tool | Method + Path |
|------|---------------|
| `scaleway_lb_list_backends` | `GET /lb/v1/zones/{zone}/lbs/{lb_id}/backends` |
| `scaleway_lb_get_backend` | `GET /lb/v1/zones/{zone}/backends/{backend_id}` |
| `scaleway_lb_create_backend` | `POST /lb/v1/zones/{zone}/lbs/{lb_id}/backends` |
| `scaleway_lb_update_backend` | `PUT /lb/v1/zones/{zone}/backends/{backend_id}` |
| `scaleway_lb_delete_backend` | `DELETE /lb/v1/zones/{zone}/backends/{backend_id}` |
| `scaleway_lb_add_backend_servers` | `POST /lb/v1/zones/{zone}/backends/{backend_id}/servers` — body `{ server_ip: string[] }` |
| `scaleway_lb_remove_backend_servers` | `DELETE /lb/v1/zones/{zone}/backends/{backend_id}/servers` — body `{ server_ip: string[] }` |
| `scaleway_lb_set_backend_servers` | `PUT /lb/v1/zones/{zone}/backends/{backend_id}/servers` — body `{ server_ip: string[] }` |

- **Create backend body:** `{ name, forward_protocol (tcp|http), forward_port, forward_port_algorithm?, sticky_sessions?, sticky_sessions_cookie_name?, health_check?, server_ip?, timeout_server?, timeout_connect?, timeout_tunnel?, on_marked_down_action?, proxy_protocol?, failover_host?, ssl_bridging?, ignore_ssl_server_verify?, redispatch_attempt_count?, max_retries?, max_connections?, timeout_queue? }`
  - `health_check`: `{ port, check_delay?, check_timeout?, check_max_retries?, tcp_config?, http_config?, https_config? }`
- **Update backend body:** same as create minus `health_check` and `server_ip`.

## Routes

| Tool | Method + Path |
|------|---------------|
| `scaleway_lb_list_routes` | `GET /lb/v1/zones/{zone}/routes` — query `frontend_id?`, `order_by?` |
| `scaleway_lb_get_route` | `GET /lb/v1/zones/{zone}/routes/{route_id}` |
| `scaleway_lb_create_route` | `POST /lb/v1/zones/{zone}/routes` — body `{ frontend_id, backend_id, match_sni?, match_host_header? }` |
| `scaleway_lb_update_route` | `PUT /lb/v1/zones/{zone}/routes/{route_id}` — body `{ backend_id, match_sni?, match_host_header? }` |
| `scaleway_lb_delete_route` | `DELETE /lb/v1/zones/{zone}/routes/{route_id}` |

## Certificates

| Tool | Method + Path |
|------|---------------|
| `scaleway_lb_list_certificates` | `GET /lb/v1/zones/{zone}/lbs/{lb_id}/certificates` |
| `scaleway_lb_get_certificate` | `GET /lb/v1/zones/{zone}/certificates/{certificate_id}` |
| `scaleway_lb_create_certificate` | `POST /lb/v1/zones/{zone}/lbs/{lb_id}/certificates` |
| `scaleway_lb_update_certificate` | `PUT /lb/v1/zones/{zone}/certificates/{certificate_id}` — body `{ name }` |
| `scaleway_lb_delete_certificate` | `DELETE /lb/v1/zones/{zone}/certificates/{certificate_id}` |

- **Create certificate body:** `{ name, letsencrypt?: { common_name, subject_alternative_name? }, custom_certificate?: { certificate_chain } }`

## Stats & Types

| Tool | Method + Path |
|------|---------------|
| `scaleway_lb_get_lb_stats` | `GET /lb/v1/zones/{zone}/lbs/{lb_id}/stats` — query `backend_id?` |
| `scaleway_lb_list_lb_types` | `GET /lb/v1/zones/{zone}/lb-types` — query `page`, `page_size` |

## Endpoints present in the official API but NOT exposed as tools
- ACL sub-resource (`/frontends/{frontend_id}/acls`), IP flexible-IP list/attach/detach, private-network attach/detach, alert-subscribers, TLS/SSL-compat listing.

## Enums (from `src/tools/lb/types.ts`)
- `forward_protocol`: `tcp`, `http`
- `forward_port_algorithm`: `roundrobin`, `leastconn`, `first`
- `sticky_sessions`: `none`, `cookie`, `table`
- `proxy_protocol`: `proxy_protocol_unknown|none|v1|v2|v2_ssl|v2_ssl_cn`
- `on_marked_down_action`: `on_marked_down_action_none`, `shutdown_sessions`
- `ssl_compatibility_level`: `ssl_compatibility_level_unknown|intermediate|modern|old_backward`
- **Fixed (2026-07):** the internal `CertificateType` enum typo `letsencryt` was corrected to `letsencrypt` (the official literal). The enum is not exposed on any tool input, so no wire format changed. Verified against the Scaleway Go SDK `api/lb/v1/lb_sdk.go` (`CertificateTypeLetsencrypt = "letsencrypt"`).

## Error codes
- 400 invalid input · 401/403 permission denied · 404 not found · 409 conflict · 429 rate limited · 500 server error.
