# Scaleway File Storage API Reference

Official reference: https://www.scaleway.com/en/developers/api/file-storage/
Cross-checked against the Scaleway SDK definition (`scaleway-sdk-go/api/file/v1alpha1`).

Product status: **Beta**. API version: **v1alpha1**.

Base URL: `https://api.scaleway.com/file/v1alpha1/regions/{region}`

All endpoints are **region-scoped** (e.g. `fr-par`, `nl-ams`, `pl-waw`). File Storage
provides managed network filesystems (POSIX file systems) that can be attached to
compute resources such as Instances within the same region.

Tools live in `src/tools/file-storage/`. Each endpoint below is annotated with the
MCP tool that invokes it. Verified against `src/tools/file-storage/handlers.ts`.

## Authentication
- Header: `X-Auth-Token: <secret_key>` (applied by the shared Scaleway client)

## Pagination
- Query params: `page` (int, 1-indexed), `page_size` (int, max 100)
- List responses include `total_count` (integer) alongside the item array.

## Entities

### FileSystem
| Field | Type | Notes |
|-------|------|-------|
| `id` | string (uuid) | File system ID |
| `name` | string | |
| `size` | integer | Size in **bytes** |
| `status` | FileSystemStatus | see enum below |
| `project_id` | string (uuid) | |
| `organization_id` | string (uuid) | |
| `tags` | string[] | |
| `number_of_attachments` | integer | Count of resources the FS is attached to |
| `region` | string | |
| `created_at` | string (RFC 3339) | |
| `updated_at` | string (RFC 3339) | |

### Attachment
| Field | Type | Notes |
|-------|------|-------|
| `id` | string (uuid) | Attachment ID |
| `filesystem_id` | string (uuid) | |
| `resource_id` | string (uuid) | Attached resource ID |
| `resource_type` | AttachmentResourceType | see enum below |
| `zone` | string \| null | Zone of the attached resource |

## Enums

### FileSystemStatus
`unknown_status`, `available`, `error`, `creating`, `updating`

### AttachmentResourceType
`unknown_resource_type`, `instance_server`

### ListFileSystemsRequestOrderBy
`created_at_asc` (default), `created_at_desc`, `name_asc`, `name_desc`

## File Systems

### List File Systems — `scaleway_file_storage_list_filesystems`
`GET /filesystems`
- Query: `page` (int), `page_size` (int), `project_id` (string), `organization_id` (string), `name` (string), `tags` (string[], repeatable), `order_by` (string)
- Response: `{ filesystems: FileSystem[], total_count: number }`

### Get File System — `scaleway_file_storage_get_filesystem`
`GET /filesystems/{filesystem_id}`
- Response: FileSystem object

### Create File System — `scaleway_file_storage_create_filesystem`
`POST /filesystems`
- Body: `{ name, size, project_id?, tags? }` (`size` in bytes; must respect product min/max)
- Response: FileSystem object (status: `creating`)

### Update File System — `scaleway_file_storage_update_filesystem`
`PATCH /filesystems/{filesystem_id}`
- Body: `{ name?, size?, tags? }` (`size` can only be increased; drives the resize action)
- Response: FileSystem object

### Delete File System — `scaleway_file_storage_delete_filesystem`
`DELETE /filesystems/{filesystem_id}`
- Deletes a **detached** file system.
- Response: 204 No Content (the MCP tool returns `{ deleted: true, id }`)

## Attachments

### List Attachments — `scaleway_file_storage_list_attachments`
`GET /attachments`
- Query: `page` (int), `page_size` (int), `filesystem_id` (string), `resource_id` (string), `resource_type` (string), `zone` (string)
- Response: `{ attachments: Attachment[], total_count: number }`

## Error Codes
Standard Scaleway HTTP error codes, mapped by the shared error handler:
- `400` invalid_input — malformed request / invalid size
- `401` / `403` permission_denied — missing or insufficient credentials
- `404` not_found — file system or attachment does not exist
- `429` rate_limited — too many requests
- `5xx` server_error

## Out of Scope (owned by other APIs)
- **Attaching / detaching** a file system to an Instance is performed via the Instance
  API (`POST /instance/v1/zones/{zone}/servers/{server_id}/attach-filesystem` and the
  corresponding detach action), not the File Storage API. Those operations belong to the
  `instances` tool area and are therefore not exposed by this vertical. The File Storage
  API only lets you *list* attachments.
