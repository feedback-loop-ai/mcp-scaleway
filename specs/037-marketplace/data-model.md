# Data Model: Scaleway Marketplace MCP Tools

**Feature**: 037-marketplace | **Date**: 2026-03-11

## Entities

### Image

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique image identifier |
| name | string | yes | Image name |
| description | string | yes | Image description |
| logo | string | yes | Logo URL |
| categories | string[] | yes | Category IDs this image belongs to |
| createdAt | string (ISO 8601) | no | Creation timestamp |
| updatedAt | string (ISO 8601) | no | Last update timestamp |
| validUntil | string (ISO 8601) | no | End-of-life date (null if not EOL) |
| label | string | yes | Image label (e.g., "ubuntu_jammy") |

### LocalImage

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique local image identifier |
| compatibleCommercialTypes | string[] | yes | Compatible instance types (e.g., DEV1-S, GP1-XS) |
| arch | string | yes | CPU architecture (x86_64, arm64) |
| zone | string | yes | Availability zone (e.g., fr-par-1) |
| label | string | yes | Image label |
| type | enum | yes | Image type: unknown_type, instance_local, instance_sbs |

### Version

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique version identifier |
| name | string | yes | Version name |
| createdAt | string (ISO 8601) | no | Creation timestamp |
| updatedAt | string (ISO 8601) | no | Last update timestamp |
| publishedAt | string (ISO 8601) | no | Publish timestamp |

### Category

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique category identifier |
| name | string | yes | Category name |
| description | string | yes | Category description |

## Enumerations

### ListImagesOrderBy

Values: `name_asc`, `name_desc`, `created_at_asc`, `created_at_desc`, `updated_at_asc`, `updated_at_desc`

### ListLocalImagesOrderBy

Values: `type_asc`, `type_desc`, `created_at_asc`, `created_at_desc`

### ListVersionsOrderBy

Values: `created_at_asc`, `created_at_desc`

### LocalImageType

Values: `unknown_type`, `instance_local`, `instance_sbs`
