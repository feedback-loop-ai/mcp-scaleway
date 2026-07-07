# Data Model: Apple silicon Private Networks

## Entities

### ServerPrivateNetwork (response object)
| Field | Type | Notes |
|-------|------|-------|
| `id` | string | ID of the server-to-Private-Network mapping |
| `project_id` | string | Private Network project ID |
| `server_id` | string | Apple silicon server ID |
| `private_network_id` | string | Private Network ID |
| `vlan` | number? | VLAN associated with the Private Network |
| `status` | enum | `vpc_unknown_status` \| `vpc_enabled` \| `vpc_updating` \| `vpc_disabled` |
| `created_at` | datetime? | |
| `updated_at` | datetime? | |
| `ipam_ip_ids` | string[] | IPAM IP IDs assigned to the server |

## Input schemas (zod, in `types.ts`)

### ListServerPrivateNetworksParams
`zone?`, `order_by?` (enum), `server_id?`, `private_network_id?`, `organization_id?`,
`project_id?`, `ipam_ip_ids?` (string[]), + `PaginationParams` (`page`, `pageSize`).

### GetServerPrivateNetworkParams
`zone?`, `server_id` (required), `private_network_id` (required).

### AddServerPrivateNetworkParams
`zone?`, `server_id` (required), `private_network_id` (required), `ipam_ip_ids?` (string[]).

### SetServerPrivateNetworksParams
`zone?`, `server_id` (required),
`per_private_network_ipam_ip_ids` (required, `Record<string, string[]>`).

### DeleteServerPrivateNetworkParams
`zone?`, `server_id` (required), `private_network_id` (required).

## Response shapes

- List: `{ server_private_networks: ServerPrivateNetwork[], total_count: number }`
- Get / Add: `ServerPrivateNetwork`
- Set: `{ server_private_networks: ServerPrivateNetwork[] }`
- Delete: empty body → tool returns `{ message: "Private Network detached successfully" }`

## Enums

- `ListServerPrivateNetworksOrderBy`: `created_at_asc | created_at_desc | updated_at_asc | updated_at_desc`
- `ServerPrivateNetworkStatus` (response only): `vpc_unknown_status | vpc_enabled | vpc_updating | vpc_disabled`
