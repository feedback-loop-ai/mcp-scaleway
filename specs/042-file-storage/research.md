# Research: File Storage Vertical

## API discovery

- Official docs entry `https://www.scaleway.com/en/developers/api/file/` returns 404.
  The correct slug is **`file-storage`**: `https://www.scaleway.com/en/developers/api/file-storage/`.
- Underlying REST API slug is **`file`**, version **`v1alpha1`**.
- Base URL: `https://api.scaleway.com/file/v1alpha1/regions/{region}` — **region-scoped**.
- Product status: **Beta**.

### Sources
- Scaleway Developers — File Storage API: https://www.scaleway.com/en/developers/api/file-storage/
- Scaleway Go SDK (authoritative struct/enum/path definitions): `scaleway-sdk-go/api/file/v1alpha1/file_sdk.go`

## Verified surface (from the Go SDK)

| Operation | HTTP | Path |
|-----------|------|------|
| ListFileSystems | GET | `/file/v1alpha1/regions/{region}/filesystems` |
| GetFileSystem | GET | `/file/v1alpha1/regions/{region}/filesystems/{filesystem_id}` |
| CreateFileSystem | POST | `/file/v1alpha1/regions/{region}/filesystems` |
| UpdateFileSystem | PATCH | `/file/v1alpha1/regions/{region}/filesystems/{filesystem_id}` |
| DeleteFileSystem | DELETE | `/file/v1alpha1/regions/{region}/filesystems/{filesystem_id}` |
| ListAttachments | GET | `/file/v1alpha1/regions/{region}/attachments` |

- `FileSystem`: id, name, size (bytes), status, project_id, organization_id, tags,
  number_of_attachments, region, created_at, updated_at.
- `Attachment`: id, filesystem_id, resource_id, resource_type, zone (nullable).
- `FileSystemStatus`: unknown_status, available, error, creating, updating.
- `AttachmentResourceType`: unknown_resource_type, instance_server.
- `ListFileSystemsRequestOrderBy`: created_at_asc, created_at_desc, name_asc, name_desc.
- List responses: `{ filesystems | attachments, total_count }`.
- ListFileSystems filters: order_by, project_id, organization_id, page, page_size, name, tags.
- ListAttachments filters: filesystem_id, resource_id, resource_type, zone, page, page_size.

## Decisions

- **Decision**: Expose 6 tools (5 file-system CRUD + list attachments).
  **Rationale**: Complete coverage of the File Storage API's own surface.
- **Decision**: Resize is handled by `update_filesystem` (`size` field), not a separate tool.
  **Rationale**: The SDK exposes resize via UpdateFileSystem's `size`; no dedicated resize path exists.
- **Decision**: Attach/detach are excluded.
  **Rationale**: They are Instance API operations, not File Storage; owned by the `instances` area.
- **Decision**: `WaitForFileSystem` (SDK helper) is not exposed.
  **Rationale**: It is a client-side polling helper, not an API endpoint.

## Ambiguities resolved

- `size` unit: bytes (SDK `scw.Size`).
- Status enum limited to the 5 SDK values; contract test rejects `deleting` to lock this.
