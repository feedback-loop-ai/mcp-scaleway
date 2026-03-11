# Data Model: Scaleway Container Registry MCP Tools

**Feature**: 006-registry | **Date**: 2026-03-11

## Entities

### Namespace

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique namespace identifier |
| name | string | yes | Namespace name |
| description | string | yes | Optional description text |
| organization_id | string (UUID) | yes | Organization ID |
| project_id | string (UUID) | yes | Project ID |
| status | enum | yes | ready, deleting, error, locked, unknown |
| status_message | string | yes | Human-readable status details |
| endpoint | string | yes | Registry endpoint URL (e.g., rg.fr-par.scw.cloud/my-namespace) |
| is_public | boolean | yes | Whether the namespace is publicly accessible |
| size | number | yes | Total size of all images in bytes |
| image_count | number (int) | yes | Number of images in the namespace |
| region | string | yes | Region (fr-par, nl-ams, pl-waw) |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last update timestamp |

### Image

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique image identifier |
| name | string | yes | Image name (relative to namespace) |
| namespace_id | string (UUID) | yes | Parent namespace ID |
| status | enum | yes | unknown, ready, deleting, error, locked |
| visibility | enum | yes | visibility_unknown, inherit, public, private |
| size | number | yes | Total image size in bytes |
| tags | string[] | yes | List of tag names attached to this image |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last update timestamp |

### Tag

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique tag identifier |
| name | string | yes | Tag name (e.g., "latest", "v1.0") |
| image_id | string (UUID) | yes | Parent image ID |
| status | enum | yes | unknown, ready, deleting, error, locked |
| digest | string | yes | Content-addressable digest (e.g., sha256:...) |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last update timestamp |

## Enums

### NamespaceStatus

| Value | Description |
|-------|-------------|
| ready | Namespace is operational |
| deleting | Namespace is being deleted |
| error | Namespace is in an error state |
| locked | Namespace is locked (e.g., billing issue) |
| unknown | Status is unknown |

### ImageStatus

| Value | Description |
|-------|-------------|
| unknown | Status is unknown |
| ready | Image is available for pull |
| deleting | Image is being deleted |
| error | Image is in an error state |
| locked | Image is locked |

### ImageVisibility

| Value | Description |
|-------|-------------|
| visibility_unknown | Visibility is unknown |
| inherit | Inherits visibility from parent namespace |
| public | Image is publicly accessible |
| private | Image requires authentication to pull |

### TagStatus

| Value | Description |
|-------|-------------|
| unknown | Status is unknown |
| ready | Tag is available |
| deleting | Tag is being deleted |
| error | Tag is in an error state |
| locked | Tag is locked |

## Relationships

- A **Namespace** contains zero or more **Images** (1:N via `namespace_id`)
- An **Image** contains zero or more **Tags** (1:N via `image_id`)
- Each **Tag** points to a unique content **digest** within its image
