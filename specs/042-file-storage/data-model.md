# Data Model: File Storage

## FileSystem

| Field | Type | Constraints |
|-------|------|-------------|
| id | string (uuid) | required |
| name | string | required |
| size | integer | bytes, ≥ 0 |
| status | enum | unknown_status \| available \| error \| creating \| updating |
| project_id | string (uuid) | required |
| organization_id | string (uuid) | required |
| tags | string[] | required (may be empty) |
| number_of_attachments | integer | ≥ 0 |
| region | string | required |
| created_at | string | RFC 3339, offset |
| updated_at | string | RFC 3339, offset |

## Attachment

| Field | Type | Constraints |
|-------|------|-------------|
| id | string (uuid) | required |
| filesystem_id | string (uuid) | required |
| resource_id | string (uuid) | required |
| resource_type | enum | unknown_resource_type \| instance_server |
| zone | string \| null | nullable |

## Request Schemas (zod, in `src/tools/file-storage/types.ts`)

- `ListFileSystemsParams` = PaginationParams + { region, projectId?, organizationId?, name?, tags?, orderBy? }
- `GetFileSystemParams` = { region, filesystemId }
- `CreateFileSystemParams` = { region, name, size, projectId?, tags? }
- `UpdateFileSystemParams` = { region, filesystemId, name?, size?, tags? }
- `DeleteFileSystemParams` = { region, filesystemId }
- `ListAttachmentsParams` = PaginationParams + { region, filesystemId?, resourceId?, resourceType?, zone? }

## Response Envelopes

- `ListFileSystemsResponse` = { filesystems: FileSystem[], total_count }
- `ListAttachmentsResponse` = { attachments: Attachment[], total_count }

List handlers wrap items in the shared `{ items, totalCount, page, pageSize }` envelope via
`buildPaginatedResponse`.

## State Transitions (informational)

`creating` → `available` → (`updating` during resize) → `available`; `error` on failure.
Deletion requires `number_of_attachments == 0` (detached).
