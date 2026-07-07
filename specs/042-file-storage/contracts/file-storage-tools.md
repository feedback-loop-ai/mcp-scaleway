# Tool Contracts: File Storage

All tools are region-scoped and require a `region` param (format `xx-xxx`). Errors are
returned as `{ error: { type, message, statusCode } }` with `isError: true`.

## scaleway_file_storage_list_filesystems
- **API**: `GET /file/v1alpha1/regions/{region}/filesystems`
- **Input**: region; optional page, pageSize, projectId, organizationId, name, tags[], orderBy
- **Output**: `{ items: FileSystem[], totalCount, page, pageSize }`

## scaleway_file_storage_get_filesystem
- **API**: `GET /file/v1alpha1/regions/{region}/filesystems/{filesystem_id}`
- **Input**: region, filesystemId
- **Output**: FileSystem

## scaleway_file_storage_create_filesystem
- **API**: `POST /file/v1alpha1/regions/{region}/filesystems`
- **Input**: region, name, size (bytes); optional projectId, tags[]
- **Output**: FileSystem (status `creating`)

## scaleway_file_storage_update_filesystem
- **API**: `PATCH /file/v1alpha1/regions/{region}/filesystems/{filesystem_id}`
- **Input**: region, filesystemId; optional name, size, tags[]
- **Output**: FileSystem

## scaleway_file_storage_delete_filesystem
- **API**: `DELETE /file/v1alpha1/regions/{region}/filesystems/{filesystem_id}`
- **Input**: region, filesystemId (must be detached)
- **Output**: `{ deleted: true, id }`

## scaleway_file_storage_list_attachments
- **API**: `GET /file/v1alpha1/regions/{region}/attachments`
- **Input**: region; optional page, pageSize, filesystemId, resourceId, resourceType, zone
- **Output**: `{ items: Attachment[], totalCount, page, pageSize }`
