# Scaleway Edge Services API Reference

Official reference: https://www.scaleway.com/en/developers/api/edge-services/

Base URL: `https://api.scaleway.com/edge-services/v1beta1`

The tools in `src/tools/edge-services/` call the API through the
`@scaleway/sdk-edge-services` `EdgeServicesv1beta1.API` client. Paths below are
taken from that SDK (`node_modules/@scaleway/sdk-edge-services/dist/v1beta1/api.gen.js`),
which is authoritative for this product. Edge Services is a **global** product —
paths are not region-scoped.

## Authentication

- Header: `X-Auth-Token: <secret_key>` (added by the shared Scaleway client).

## Pagination

List endpoints accept `page` and `page_size` (SDK `page` / `pageSize`) and
return `{ <collection>: T[], total_count }`. The MCP layer normalizes to
`{ items, totalCount, page, pageSize }`.

## Pipelines

### List Pipelines — `scaleway_edge_services_list_pipelines`
`GET /pipelines`
- Query: `page`, `page_size`, `name?`, `project_id?`, `organization_id?`,
  `order_by?` (`created_at_asc|created_at_desc|name_asc|name_desc`)
- Response: `{ pipelines: Pipeline[], total_count }`

### Get Pipeline — `scaleway_edge_services_get_pipeline`
`GET /pipelines/{pipeline_id}` → `Pipeline`

### Create Pipeline — `scaleway_edge_services_create_pipeline`
`POST /pipelines`
- Body: `{ name, description, project_id? }` → `Pipeline`

### Update Pipeline — `scaleway_edge_services_update_pipeline`
`PATCH /pipelines/{pipeline_id}`
- Body: `{ name?, description? }` → `Pipeline`

### Delete Pipeline — `scaleway_edge_services_delete_pipeline`
`DELETE /pipelines/{pipeline_id}` → empty

## DNS Stages

### List DNS Stages — `scaleway_edge_services_list_dns_stages`
`GET /pipelines/{pipeline_id}/dns-stages`
- Query: `page`, `page_size`, `order_by?` (`created_at_asc|created_at_desc`), `fqdn?`
- Response: `{ stages: DnsStage[], total_count }`

### Get DNS Stage — `scaleway_edge_services_get_dns_stage`
`GET /dns-stages/{dns_stage_id}` → `DnsStage`

### Create DNS Stage — `scaleway_edge_services_create_dns_stage`
`POST /pipelines/{pipeline_id}/dns-stages`
- Body: `{ fqdns?, tls_stage_id? | cache_stage_id? | backend_stage_id? }` → `DnsStage`

### Update DNS Stage — `scaleway_edge_services_update_dns_stage`
`PATCH /dns-stages/{dns_stage_id}`
- Body: `{ fqdns?, tls_stage_id? | cache_stage_id? | backend_stage_id? }` → `DnsStage`

### Delete DNS Stage — `scaleway_edge_services_delete_dns_stage`
`DELETE /dns-stages/{dns_stage_id}` → empty

## TLS Stages

### List TLS Stages — `scaleway_edge_services_list_tls_stages`
`GET /pipelines/{pipeline_id}/tls-stages`
- Query: `page`, `page_size`, `order_by?`, `secret_id?`, `secret_region?`
- Response: `{ stages: TlsStage[], total_count }`

### Get TLS Stage — `scaleway_edge_services_get_tls_stage`
`GET /tls-stages/{tls_stage_id}` → `TlsStage`

### Create TLS Stage — `scaleway_edge_services_create_tls_stage`
`POST /pipelines/{pipeline_id}/tls-stages`
- Body: `{ secrets?: { secret_id, region }[], managed_certificate?, cache_stage_id? | backend_stage_id? | route_stage_id? | waf_stage_id? }` → `TlsStage`

### Update TLS Stage — `scaleway_edge_services_update_tls_stage`
`PATCH /tls-stages/{tls_stage_id}`
- Body: `{ managed_certificate?, tls_secrets_config?: { tls_secrets: { secret_id, region }[] }, cache_stage_id? | backend_stage_id? | route_stage_id? | waf_stage_id? }` → `TlsStage`

### Delete TLS Stage — `scaleway_edge_services_delete_tls_stage`
`DELETE /tls-stages/{tls_stage_id}` → empty

## Cache Stages

### List Cache Stages — `scaleway_edge_services_list_cache_stages`
`GET /pipelines/{pipeline_id}/cache-stages`
- Query: `page`, `page_size`, `order_by?`
- Response: `{ stages: CacheStage[], total_count }`

### Get Cache Stage — `scaleway_edge_services_get_cache_stage`
`GET /cache-stages/{cache_stage_id}` → `CacheStage`

### Create Cache Stage — `scaleway_edge_services_create_cache_stage`
`POST /pipelines/{pipeline_id}/cache-stages`
- Body: `{ fallback_ttl?, include_cookies?, backend_stage_id? | waf_stage_id? | route_stage_id? }` → `CacheStage`

### Update Cache Stage — `scaleway_edge_services_update_cache_stage`
`PATCH /cache-stages/{cache_stage_id}`
- Body: `{ fallback_ttl?, include_cookies?, backend_stage_id? | waf_stage_id? | route_stage_id? }` → `CacheStage`

### Delete Cache Stage — `scaleway_edge_services_delete_cache_stage`
`DELETE /cache-stages/{cache_stage_id}` → empty

## Backend Stages

### List Backend Stages — `scaleway_edge_services_list_backend_stages`
`GET /pipelines/{pipeline_id}/backend-stages`
- Query: `page`, `page_size`, `order_by?`, `bucket_name?`, `bucket_region?`, `lb_id?`
- Response: `{ stages: BackendStage[], total_count }`

### Get Backend Stage — `scaleway_edge_services_get_backend_stage`
`GET /backend-stages/{backend_stage_id}` → `BackendStage`

### Create Backend Stage — `scaleway_edge_services_create_backend_stage`
`POST /pipelines/{pipeline_id}/backend-stages`
- Body: `{ scaleway_s3?: { bucket_name, bucket_region, is_website }, scaleway_lb?: { lbs: { id, zone, frontend_id, is_ssl, domain_name, has_websocket }[] } }` → `BackendStage`

### Update Backend Stage — `scaleway_edge_services_update_backend_stage`
`PATCH /backend-stages/{backend_stage_id}`
- Body: `{ pipeline_id, scaleway_s3?, scaleway_lb? }` → `BackendStage`

### Delete Backend Stage — `scaleway_edge_services_delete_backend_stage`
`DELETE /backend-stages/{backend_stage_id}` → empty

## Purge Requests

### Purge Cache — `scaleway_edge_services_purge_cache`
`POST /purge-requests`
- Body: `{ pipeline_id, assets? | all? }` → `PurgeRequest`

### List Purge Requests — `scaleway_edge_services_list_purge_requests`
`GET /purge-requests`
- Query: `page`, `page_size`, `pipeline_id?`, `project_id?`, `organization_id?`, `order_by?` (`created_at_asc|created_at_desc`)
- Response: `{ purge_requests: PurgeRequest[], total_count }`

### Get Purge Request — `scaleway_edge_services_get_purge_request`
`GET /purge-requests/{purge_request_id}` → `PurgeRequest`

## Enums

- `PipelineStatus`: `unknown_status | ready | error | pending | warning | locked`
- `PurgeRequestStatus`: `unknown_status | done | error | pending`
- `DNSStageType`: `unknown_type | auto | managed | custom`

## Error Codes
- 400: Invalid input
- 401 / 403: Permission denied
- 404: Not found
- 409: Conflict
- 429: Rate limited
- 500: Server error

## Notes

- The SDK exposes additional stage types (WAF stages, route stages, route
  rules) and helper endpoints (`check-domain`, `check-pem-chain`,
  `check-lb-origin`, `plans`, `current-plan`, `billing`) that are **not**
  surfaced as MCP tools. Only the endpoints listed above have corresponding
  tools.
