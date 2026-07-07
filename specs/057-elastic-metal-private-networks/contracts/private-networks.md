# Tool Contract: Elastic Metal Private Networks

API reference: `specs/scaleway-api/elastic-metal/api-reference.md` (Private Networks section)
Contract tests: `tests/contract/tools/elastic-metal/contract.test.ts`

## scaleway_elastic_metal_list_server_private_networks

- **API**: `GET /baremetal/v1/zones/{zone}/server-private-networks`
- **Input**: `zone` (required), `server_id?`, `private_network_id?`, `organization_id?`,
  `project_id?`, `order_by?` (created_at_asc|created_at_desc|updated_at_asc|updated_at_desc),
  `page?` (default 1), `pageSize?` (default 50, max 100)
- **Output**: paginated `{ items: ServerPrivateNetwork[], totalCount, page, pageSize }`
- **Errors**: `invalid_input`, `permission_denied`, `not_found`, `rate_limited`, `server_error`

## scaleway_elastic_metal_add_server_private_network

- **API**: `POST /baremetal/v1/zones/{zone}/servers/{server_id}/private-networks`
- **Input**: `zone`, `server_id`, `private_network_id` (all required)
- **Body**: `{ private_network_id }`
- **Output**: `ServerPrivateNetwork` (status typically `attaching`)

## scaleway_elastic_metal_set_server_private_networks

- **API**: `PUT /baremetal/v1/zones/{zone}/servers/{server_id}/private-networks`
- **Input**: `zone`, `server_id`, `private_network_ids` (array of UUID, max 8; `[]` detaches all)
- **Body**: `{ private_network_ids }`
- **Output**: `{ server_private_networks: ServerPrivateNetwork[] }`

## scaleway_elastic_metal_delete_server_private_network

- **API**: `DELETE /baremetal/v1/zones/{zone}/servers/{server_id}/private-networks/{private_network_id}`
- **Input**: `zone`, `server_id`, `private_network_id` (all required)
- **Output**: `{}` (204 No Content)
