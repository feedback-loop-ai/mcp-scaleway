# Data Model: Elastic Metal Private Networks

## ServerPrivateNetwork (response entity)

| Field                | Type                     | Notes                                              |
|----------------------|--------------------------|----------------------------------------------------|
| `id`                 | string (UUID)            | Attachment ID                                      |
| `project_id`         | string (UUID)            | Project of the Private Network                     |
| `server_id`          | string (UUID)            | The bare-metal server                              |
| `private_network_id` | string (UUID)            | The VPC Private Network                            |
| `vlan`               | number \| null (uint32)  | VLAN ID assigned to the server-side interface      |
| `status`             | enum                     | `unknown`/`attaching`/`attached`/`error`/`detaching`/`locked` |
| `created_at`         | string (RFC 3339) \| null| Creation timestamp                                 |
| `updated_at`         | string (RFC 3339) \| null| Last-modified timestamp                            |

## Tool input schemas (zod)

### ListServerPrivateNetworksInput (extends PaginationParams)
- `zone` (ScalewayZone, required)
- `server_id` (UUID, optional)
- `private_network_id` (UUID, optional)
- `organization_id` (UUID, optional)
- `project_id` (UUID, optional)
- `order_by` (enum: created_at_asc|created_at_desc|updated_at_asc|updated_at_desc, optional)
- `page` (int ≥ 1, default 1), `pageSize` (int 1–100, default 50)

### AddServerPrivateNetworkInput
- `zone` (ScalewayZone, required)
- `server_id` (UUID, required)
- `private_network_id` (UUID, required)

### SetServerPrivateNetworksInput
- `zone` (ScalewayZone, required)
- `server_id` (UUID, required)
- `private_network_ids` (array of UUID, max 8) — `[]` detaches all

### DeleteServerPrivateNetworkInput
- `zone` (ScalewayZone, required)
- `server_id` (UUID, required)
- `private_network_id` (UUID, required)

## Response shapes

- List: `{ server_private_networks: ServerPrivateNetwork[], total_count: number }` → wrapped by
  `buildPaginatedResponse()` into `{ items, totalCount, page, pageSize, ... }`.
- Add: `ServerPrivateNetwork`.
- Set: `{ server_private_networks: ServerPrivateNetwork[] }`.
- Delete: `204 No Content` → `{}`.
