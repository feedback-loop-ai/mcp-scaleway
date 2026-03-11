# Marketplace API Specification (037-marketplace)

## Overview
Scaleway Marketplace API v2 - Global API for managing instance images catalog, local images, versions, and categories.

**Base URL:** `https://api.scaleway.com/marketplace/v2`
**Locality:** Global (no region/zone scoping for most endpoints)

## Entities

### Image
| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Unique identifier |
| name | string | Image name |
| description | string | Image description |
| logo | string | Logo URL |
| categories | string[] | Category IDs |
| createdAt | Date | Creation timestamp |
| updatedAt | Date | Last update timestamp |
| validUntil | Date | End-of-life date |
| label | string | Image label |

### LocalImage
| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Unique identifier |
| compatibleCommercialTypes | string[] | Compatible instance types |
| arch | string | CPU architecture |
| zone | Zone | Availability zone |
| label | string | Image label |
| type | LocalImageType | Image type (instance_local, instance_sbs) |

### Version
| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Unique identifier |
| name | string | Version name |
| createdAt | Date | Creation timestamp |
| updatedAt | Date | Last update timestamp |
| publishedAt | Date | Publish timestamp |

### Category
| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Unique identifier |
| name | string | Category name |
| description | string | Category description |

## Endpoints

### GET /marketplace/v2/images
List all marketplace images. Supports pagination and filtering.
- **Params:** page, pageSize, orderBy, arch, category, includeEol
- **Response:** `{ images: Image[], totalCount: number }`

### GET /marketplace/v2/images/{imageId}
Get a single image by UUID.
- **Params:** imageId (path)
- **Response:** `Image`

### GET /marketplace/v2/local-images
List local images. Requires at least one filter: imageId, versionId, or imageLabel.
- **Params:** page, pageSize, orderBy, zone, arch, imageId, versionId, imageLabel, type
- **Response:** `{ localImages: LocalImage[], totalCount: number }`

### GET /marketplace/v2/local-images/{localImageId}
Get a single local image by UUID.
- **Params:** localImageId (path)
- **Response:** `LocalImage`

### GET /marketplace/v2/categories
List all categories.
- **Params:** page, pageSize
- **Response:** `{ categories: Category[], totalCount: number }`

### GET /marketplace/v2/categories/{categoryId}
Get a single category by UUID.
- **Params:** categoryId (path)
- **Response:** `Category`

### GET /marketplace/v2/versions
List versions for an image.
- **Params:** imageId (required), page, pageSize, orderBy
- **Response:** `{ versions: Version[], totalCount: number }`

### GET /marketplace/v2/versions/{versionId}
Get a single version by UUID.
- **Params:** versionId (path)
- **Response:** `Version`

## MCP Tools

| Tool Name | Priority | Endpoint |
|-----------|----------|----------|
| scaleway_marketplace_list_images | P1 | GET /marketplace/v2/images |
| scaleway_marketplace_get_image | P1 | GET /marketplace/v2/images/{imageId} |
| scaleway_marketplace_list_local_images | P1 | GET /marketplace/v2/local-images |
| scaleway_marketplace_get_local_image | P1 | GET /marketplace/v2/local-images/{localImageId} |
| scaleway_marketplace_list_categories | P2 | GET /marketplace/v2/categories |
| scaleway_marketplace_get_category | P2 | GET /marketplace/v2/categories/{categoryId} |
| scaleway_marketplace_list_versions | P3 | GET /marketplace/v2/versions |
| scaleway_marketplace_get_version | P3 | GET /marketplace/v2/versions/{versionId} |
