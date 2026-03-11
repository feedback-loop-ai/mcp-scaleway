# Feature Specification: Container Registry API

**Feature Branch**: `006-registry`
**Created**: 2026-03-11
**Status**: Draft
**Input**: Implement MCP tools for Scaleway Container Registry API (regional)

## User Scenarios & Testing

### User Story 1 - Manage Container Registry Namespaces (Priority: P1)

An AI assistant user asks the MCP server to list, get, create, update, or delete container registry namespaces. The server routes requests to the Scaleway Container Registry API and returns structured results.

**Acceptance Scenarios**:

1. **Given** a configured MCP server with valid Scaleway credentials, **When** a user requests to list namespaces in a region, **Then** the server returns a paginated list of namespaces with id, name, endpoint, image_count, size, and project info.
2. **Given** a configured MCP server, **When** a user requests to create a namespace with a name and region, **Then** the server validates input, calls the Scaleway API, and returns the created namespace details.
3. **Given** a configured MCP server, **When** a user requests to update a namespace's description or privacy settings, **Then** the server updates the namespace and returns the updated details.
4. **Given** a configured MCP server, **When** a user requests to delete a namespace by ID, **Then** the server deletes the namespace and confirms deletion.
5. **Given** a configured MCP server, **When** a user requests a namespace by ID, **Then** the server returns the full namespace details.

### User Story 2 - Manage Container Images (Priority: P1)

An AI assistant user asks the MCP server to list, get, update, or delete container images within a namespace.

**Acceptance Scenarios**:

1. **Given** a configured MCP server, **When** a user requests to list images in a namespace, **Then** the server returns a paginated list of images with id, name, tags, size, visibility, and status.
2. **Given** a configured MCP server, **When** a user requests to get an image by ID, **Then** the server returns the full image details.
3. **Given** a configured MCP server, **When** a user requests to update an image's visibility, **Then** the server updates the image and returns updated details.
4. **Given** a configured MCP server, **When** a user requests to delete an image by ID, **Then** the server deletes the image and confirms deletion.

### User Story 3 - Manage Image Tags (Priority: P1)

An AI assistant user asks the MCP server to list, get, or delete tags on container images.

**Acceptance Scenarios**:

1. **Given** a configured MCP server, **When** a user requests to list tags for an image, **Then** the server returns a paginated list of tags with name, digest, and timestamps.
2. **Given** a configured MCP server, **When** a user requests to get a tag by ID, **Then** the server returns the full tag details.
3. **Given** a configured MCP server, **When** a user requests to delete a tag by ID, **Then** the server deletes the tag and confirms deletion.

### Edge Cases

- Invalid region format returns a validation error.
- Non-existent namespace/image/tag ID returns a 404 error.
- Permission denied returns a 403 error.
- Rate limiting returns a 429 error with retry guidance.

## Key Entities

### Namespace
| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Unique identifier |
| name | string | Namespace name |
| description | string | Optional description |
| organization_id | string (UUID) | Organization ID |
| project_id | string (UUID) | Project ID |
| status | enum | ready, deleting, error, locked |
| status_message | string | Status details |
| endpoint | string | Registry endpoint URL |
| is_public | boolean | Whether namespace is publicly accessible |
| size | number | Total size in bytes |
| image_count | number | Number of images |
| region | string | Region (fr-par, nl-ams, pl-waw) |
| created_at | string (ISO 8601) | Creation timestamp |
| updated_at | string (ISO 8601) | Last update timestamp |

### Image
| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Unique identifier |
| name | string | Image name |
| namespace_id | string (UUID) | Parent namespace ID |
| status | enum | unknown, ready, deleting, error, locked |
| visibility | enum | visibility_unknown, inherit, public, private |
| size | number | Total size in bytes |
| tags | string[] | List of tag names |
| created_at | string (ISO 8601) | Creation timestamp |
| updated_at | string (ISO 8601) | Last update timestamp |

### Tag
| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Unique identifier |
| name | string | Tag name (e.g., "latest", "v1.0") |
| image_id | string (UUID) | Parent image ID |
| status | enum | unknown, ready, deleting, error, locked |
| digest | string | Content digest |
| created_at | string (ISO 8601) | Creation timestamp |
| updated_at | string (ISO 8601) | Last update timestamp |

## MCP Tools

| Tool Name | HTTP | Endpoint | Description |
|-----------|------|----------|-------------|
| scaleway_registry_list_namespaces | GET | /registry/v1/regions/{region}/namespaces | List container registry namespaces |
| scaleway_registry_get_namespace | GET | /registry/v1/regions/{region}/namespaces/{namespace_id} | Get namespace details |
| scaleway_registry_create_namespace | POST | /registry/v1/regions/{region}/namespaces | Create a new namespace |
| scaleway_registry_update_namespace | PATCH | /registry/v1/regions/{region}/namespaces/{namespace_id} | Update namespace settings |
| scaleway_registry_delete_namespace | DELETE | /registry/v1/regions/{region}/namespaces/{namespace_id} | Delete a namespace |
| scaleway_registry_list_images | GET | /registry/v1/regions/{region}/images | List container images |
| scaleway_registry_get_image | GET | /registry/v1/regions/{region}/images/{image_id} | Get image details |
| scaleway_registry_update_image | PATCH | /registry/v1/regions/{region}/images/{image_id} | Update image visibility |
| scaleway_registry_delete_image | DELETE | /registry/v1/regions/{region}/images/{image_id} | Delete an image |
| scaleway_registry_list_tags | GET | /registry/v1/regions/{region}/images/{image_id}/tags | List image tags |
| scaleway_registry_get_tag | GET | /registry/v1/regions/{region}/tags/{tag_id} | Get tag details |
| scaleway_registry_delete_tag | DELETE | /registry/v1/regions/{region}/tags/{tag_id} | Delete a tag |

## Locality

- **Type**: Regional
- **Supported regions**: fr-par, nl-ams, pl-waw

## Pagination

All list endpoints use standard Scaleway pagination: `page` (1-indexed) and `page_size` (default 50, max 100). Responses include `total_count`.

## Error Codes

- 400: Invalid input (malformed request)
- 401: Unauthorized (invalid/missing API key)
- 403: Permission denied
- 404: Resource not found
- 409: Conflict (e.g., duplicate namespace name)
- 429: Rate limited
- 500: Internal server error
