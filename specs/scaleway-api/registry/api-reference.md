# Scaleway Container Registry API Reference

Base URL: `https://api.scaleway.com/registry/v1/regions/{region}`

Official docs: https://www.scaleway.com/en/developers/api/registry/

## Authentication

- Header: `X-Auth-Token: <secret_key>`
- Region is part of the path.

## Pagination

List endpoints accept `page` (1-indexed) and `page_size` (1-100). Responses
include `total_count`. The MCP tools pass `page`/`page_size` through and return
the raw Scaleway envelope (`{ <collection>, total_count }`).

## Regions

`fr-par`, `nl-ams`, `pl-waw`.

## Namespaces

### List Namespaces
`GET /namespaces`
- Query: `page`, `page_size`, `project_id`, `name`, `order_by`
- Response: `{ namespaces: Namespace[], total_count: number }`

### Get Namespace
`GET /namespaces/{namespace_id}`
- Response: `Namespace`

### Create Namespace
`POST /namespaces`
- Body: `{ name, project_id?, description?, is_public? }`
- Response: `Namespace` (status: `ready` once provisioned)

### Update Namespace
`PATCH /namespaces/{namespace_id}`
- Body: `{ description?, is_public? }`
- Response: `Namespace`

### Delete Namespace
`DELETE /namespaces/{namespace_id}`
- Response: `Namespace` (status: `deleting`)

## Images

### List Images
`GET /images`
- Query: `page`, `page_size`, `namespace_id`, `name`, `order_by`
- Response: `{ images: Image[], total_count: number }`

### Get Image
`GET /images/{image_id}`
- Response: `Image`

### Update Image
`PATCH /images/{image_id}`
- Body: `{ visibility? }`
- `visibility`: `visibility_unknown | inherit | public | private`
- Response: `Image`

### Delete Image
`DELETE /images/{image_id}`
- Response: `Image` (status: `deleting`)

## Tags

### List Tags
`GET /images/{image_id}/tags`
- Query: `page`, `page_size`, `name`, `order_by`
- Response: `{ tags: Tag[], total_count: number }`

### Get Tag
`GET /tags/{tag_id}`
- Response: `Tag`

### Delete Tag
`DELETE /tags/{tag_id}`
- Response: `Tag` (status: `deleting`)

## Entity Shapes

### Namespace
`{ id, name, description, organization_id, project_id, status, status_message, endpoint, is_public, size, image_count, region, created_at, updated_at }`
- `status`: `ready | deleting | error | locked | unknown`

### Image
`{ id, name, namespace_id, status, visibility, size, tags, created_at, updated_at }`
- `status`: `unknown | ready | deleting | error | locked`
- `visibility`: `visibility_unknown | inherit | public | private`

### Tag
`{ id, name, image_id, status, digest, created_at, updated_at }`
- `status`: `unknown | ready | deleting | error | locked`

## Error Codes

- 400: Invalid input
- 401 / 403: Permission denied
- 404: Not found
- 409: Conflict (e.g. duplicate namespace name)
- 429: Rate limited
- 500: Server error

## Deviations (implementation vs. public docs)

For single-tag operations the implementation uses the flat tag paths exposed by
the Scaleway SDK, while the public docs render the nested form:

| Operation | Implementation | Public docs page |
|-----------|----------------|------------------|
| Get Tag | `GET /tags/{tag_id}` | `GET /images/{image_id}/tags/{tag_id}` |
| Delete Tag | `DELETE /tags/{tag_id}` | `DELETE /images/{image_id}/tags/{tag_id}` |

A tag ID is globally unique within a region, so the flat `/tags/{tag_id}` routes
resolve to the same resource. List Tags is nested under the image in both
(`GET /images/{image_id}/tags`).
