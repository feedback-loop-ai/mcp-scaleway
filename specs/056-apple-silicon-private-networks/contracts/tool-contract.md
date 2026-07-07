# Tool Contract: Apple silicon Private Networks

Base path: `/apple-silicon/v1alpha1/zones/{zone}` (zone defaults to configured default zone).
Auth: `X-Auth-Token` (injected by `@scaleway/sdk-client`).

## scaleway_apple_silicon_list_server_private_networks
- **API**: `GET /server-private-networks`
- **Input**: `zone?`, `order_by?` (`created_at_asc|created_at_desc|updated_at_asc|updated_at_desc`),
  `server_id?`, `private_network_id?`, `organization_id?`, `project_id?`, `ipam_ip_ids?` (string[]),
  `page?` (default 1), `pageSize?` (default 50)
- **Query encoding**: scalar filters as single keys; `ipam_ip_ids` appended once per element;
  `page`/`page_size` from `paginationToQuery`
- **Output**: JSON text of `{ server_private_networks: ServerPrivateNetwork[], total_count: number }`

## scaleway_apple_silicon_get_server_private_network
- **API**: `GET /servers/{server_id}/private-networks/{private_network_id}`
- **Input**: `zone?`, `server_id` (req), `private_network_id` (req)
- **Output**: JSON text of `ServerPrivateNetwork`

## scaleway_apple_silicon_add_server_private_network
- **API**: `POST /servers/{server_id}/private-networks`
- **Input**: `zone?`, `server_id` (req), `private_network_id` (req), `ipam_ip_ids?` (string[])
- **Body**: `{ private_network_id, ipam_ip_ids? }` (Content-Type: application/json)
- **Output**: JSON text of `ServerPrivateNetwork`

## scaleway_apple_silicon_set_server_private_networks
- **API**: `PUT /servers/{server_id}/private-networks`
- **Input**: `zone?`, `server_id` (req), `per_private_network_ipam_ip_ids` (req, `Record<string,string[]>`)
- **Body**: `{ per_private_network_ipam_ip_ids }`
- **Output**: JSON text of `{ server_private_networks: ServerPrivateNetwork[] }`

## scaleway_apple_silicon_delete_server_private_network
- **API**: `DELETE /servers/{server_id}/private-networks/{private_network_id}`
- **Input**: `zone?`, `server_id` (req), `private_network_id` (req)
- **Output**: JSON text `{ "message": "Private Network detached successfully" }`

## Error mapping (shared taxonomy)
| HTTP | type |
|------|------|
| 400 | `invalid_input` |
| 401 / 403 | `permission_denied` |
| 404 | `not_found` |
| 429 | `rate_limited` |
| 500 / other | `server_error` |
