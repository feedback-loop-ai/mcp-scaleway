# Tool Contracts: Elastic Metal incl. Flexible IPs (flexible-ip v1alpha1)

Feature 060 migrated or relocated these tools. This file supersedes the corresponding entries in earlier feature contracts (see Superseded contracts below). Input schemas are the Zod shapes in `src/tools/elastic-metal/types.ts`; the JSON projection is served by `scaleway_describe`.

Reference: `specs/scaleway-api/elastic-metal/api-reference.md`. Errors return `{ error: { type, message, statusCode } }` with `isError: true`; `unsupported_operation` (501) marks combinations with no faithful upstream equivalent.

### `scaleway_elastic_metal_create_ip`

- **Endpoint**: `POST /flexible-ip/v1alpha1/zones/{zone}/fips`
- **Read-only**: no
- **Description**: Create a new flexible IP for Elastic Metal servers
- **Required**: `zone`, `project_id`
- **Optional**: `description`, `tags`, `server_id`

### `scaleway_elastic_metal_delete_ip`

- **Endpoint**: `DELETE /flexible-ip/v1alpha1/zones/{zone}/fips/{fip_id}`
- **Read-only**: no
- **Description**: Delete a flexible IP
- **Required**: `zone`, `ip_id`
- **Optional**: none

### `scaleway_elastic_metal_list_ips`

- **Endpoint**: `GET /flexible-ip/v1alpha1/zones/{zone}/fips`
- **Read-only**: yes
- **Description**: List flexible IPs for Elastic Metal servers in a zone
- **Required**: `zone`
- **Optional**: `page`, `pageSize`, `project_id`, `server_id`, `order_by`

## Superseded contracts

- none (the `/baremetal/v1/.../ips` paths were never a documented upstream surface)
