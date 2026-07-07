# Scaleway VPC API Reference

Official reference: https://www.scaleway.com/en/developers/api/vpc/

Base URL: `https://api.scaleway.com/vpc/v2/regions/{region}`

- **API version:** v2 (regional).
- **Locality:** regional. Supported regions: `fr-par`, `nl-ams`, `pl-waw`, `it-mil`.
- **Authentication:** header `X-Auth-Token: <secret_key>`.
- **Pagination:** query params `page` (int, 1-based) and `page_size` (int). List responses return `{ <collection>: [...], total_count: number }`. The MCP layer re-wraps these into `{ items, totalCount, page, pageSize }` via `buildPaginatedResponse`.

The implemented tools use the path prefix `/vpc/v2/regions/{region}` (constant `VPC_API_V2` in `src/tools/vpc/handlers.ts`).

## VPCs

### List VPCs — `scaleway_vpc_list_vpcs`
`GET /vpc/v2/regions/{region}/vpcs`
- Query: `page`, `page_size`, `name` (string), `project_id` (uuid), `tags` (string[], repeated key).
- Response: `{ vpcs: Vpc[], total_count: number }`

### Get VPC — `scaleway_vpc_get_vpc`
`GET /vpc/v2/regions/{region}/vpcs/{vpc_id}`
- Response: `Vpc` object

### Create VPC — `scaleway_vpc_create_vpc`
`POST /vpc/v2/regions/{region}/vpcs`
- Body: `{ name, project_id, tags }`
- Response: `Vpc` object
- **Fixed (2026-07):** the handler now sends `project_id` (was `project`), matching the official CreateVPCRequest. Verified against the Scaleway Go SDK `api/vpc/v2/vpc_sdk.go`.

### Update VPC — `scaleway_vpc_update_vpc`
`PATCH /vpc/v2/regions/{region}/vpcs/{vpc_id}`
- Body: `{ name?, tags? }`
- Response: `Vpc` object

### Delete VPC — `scaleway_vpc_delete_vpc`
`DELETE /vpc/v2/regions/{region}/vpcs/{vpc_id}`
- Response: empty; MCP returns `{ success: true, vpc_id }`.

### Vpc object
`{ id, name, region, project_id, tags: string[], is_default: boolean, private_network_count: number, created_at, updated_at }`

## Private Networks

### List Private Networks — `scaleway_vpc_list_private_networks`
`GET /vpc/v2/regions/{region}/private-networks`
- Query: `page`, `page_size`, `name` (string), `vpc_id` (uuid), `project_id` (uuid), `tags` (string[], repeated key).
- Response: `{ private_networks: PrivateNetwork[], total_count: number }`

### Get Private Network — `scaleway_vpc_get_private_network`
`GET /vpc/v2/regions/{region}/private-networks/{private_network_id}`
- Response: `PrivateNetwork` object

### Create Private Network — `scaleway_vpc_create_private_network`
`POST /vpc/v2/regions/{region}/private-networks`
- Body: `{ name, project_id, vpc_id, tags, subnets }` (`subnets` = CIDR strings; the API allocates IPv4/IPv6 subnets)
- Response: `PrivateNetwork` object

### Update Private Network — `scaleway_vpc_update_private_network`
`PATCH /vpc/v2/regions/{region}/private-networks/{private_network_id}`
- Body: `{ name?, tags?, subnets? }`
- Response: `PrivateNetwork` object

### Delete Private Network — `scaleway_vpc_delete_private_network`
`DELETE /vpc/v2/regions/{region}/private-networks/{private_network_id}`
- Response: empty; MCP returns `{ success: true, private_network_id }`.

### PrivateNetwork object
`{ id, name, vpc_id, region, project_id, tags: string[], subnets: Subnet[], created_at, updated_at }`
- `Subnet`: `{ id, subnet, created_at, updated_at }`

## Endpoints present in the official API but NOT exposed as tools
- `POST /vpc/v2/regions/{region}/vpcs/{vpc_id}/enable-routing`
- `POST /vpc/v2/regions/{region}/private-networks/{private_network_id}/enable-dhcp`
- Subnet / ACL sub-resources.

## Error codes
- 400 invalid input · 401/403 permission denied · 404 not found · 409 conflict (e.g. VPC not empty on delete) · 429 rate limited · 500 server error.
