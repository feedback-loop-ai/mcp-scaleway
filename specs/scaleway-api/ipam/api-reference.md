# Scaleway IPAM API Reference

Official reference: https://www.scaleway.com/en/developers/api/ipam/

Base URL: `https://api.scaleway.com/ipam/v1/regions/{region}`

- **API version:** v1 (regional).
- **Locality:** regional (e.g. `fr-par`, `nl-ams`, `pl-waw`). IPs may be zonal or attached to a private network / subnet via their `source`.
- **Authentication:** header `X-Auth-Token: <secret_key>`.
- **Pagination:** query params `page` and `page_size`; list responses return `{ ips: [...], total_count }`, re-wrapped by the MCP layer into `{ items, totalCount, page, pageSize }`.

Path prefix used by handlers: `/ipam/v1/regions/{region}` (`src/tools/ipam/handlers.ts`).

## IPs

### List IPs — `scaleway_ipam_list_ips`
`GET /ipam/v1/regions/{region}/ips`
- Query: `page`, `page_size`, `order_by` (created_at/updated_at/attached_at × asc/desc), `project_id`, `organization_id`, `zonal`, `private_network_id`, `subnet_id`, `vpc_id`, `attached` (bool), `resource_type`, `resource_id`, `mac_address`, `tags` (repeated key), `is_ipv6` (bool), `resource_name`.
- Response: `{ ips: IP[], total_count: number }`

### Get IP — `scaleway_ipam_get_ip`
`GET /ipam/v1/regions/{region}/ips/{ip_id}`
- Response: `IP` object

### Book (reserve) IP — `scaleway_ipam_book_ip`
`POST /ipam/v1/regions/{region}/ips`
- Body: `{ project_id, source, is_ipv6, tags, address?, resource? }`
  - `source`: `{ zonal?, private_network_id?, subnet_id? }` — exactly one selects the pool.
  - `address?`: specific address (CIDR) to book; otherwise auto-allocated.
  - `resource?`: custom resource `{ mac_address, name? }` (only for `type=custom`).
- Response: `IP` object

### Release IP — `scaleway_ipam_release_ip`
`DELETE /ipam/v1/regions/{region}/ips/{ip_id}`
- Response: empty; MCP returns `{ success: true, ip_id }`.

### Update IP — `scaleway_ipam_update_ip`
`PATCH /ipam/v1/regions/{region}/ips/{ip_id}`
- Body: `{ tags?, reverses? }` — `reverses`: `[{ hostname, address? }]`.
- Response: `IP` object

### IP object
`{ id, address, project_id, is_ipv6, created_at, updated_at, source: { zonal, private_network_id, subnet_id }, resource: { type, id, mac_address, name }, tags: string[], reverses: [{ hostname, address }], region, zone }`

- `resource.type` enum: `unknown_type, custom, instance_server, instance_ip, instance_private_nic, lb_server, fip_ip, vpc_gateway, vpc_gateway_network, k8s_node, k8s_cluster, rdb_instance, redis_cluster, baremetal_server, baremetal_private_nic, llm_deployment, mgdb_instance, apple_silicon_server, apple_silicon_private_nic`.

## Endpoints present in the official API but NOT exposed as tools
- `POST /ipam/v1/regions/{region}/ips/{ip_id}/attach`
- `POST /ipam/v1/regions/{region}/ips/{ip_id}/detach`
- `POST /ipam/v1/regions/{region}/ips/{ip_id}/move`

## Error codes
- 400 invalid input · 401/403 permission denied · 404 not found · 409 conflict · 429 rate limited · 500 server error.
