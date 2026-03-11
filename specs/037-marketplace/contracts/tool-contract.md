# Tool Contracts: Scaleway Marketplace MCP Tools

**Feature**: 037-marketplace | **Date**: 2026-03-11

## Image Tools

### scaleway_marketplace_list_images

**Scaleway API**: `GET /marketplace/v2/images`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| orderBy | enum | no | - | Sort order: name_asc, name_desc, created_at_asc, created_at_desc, updated_at_asc, updated_at_desc |
| arch | string | no | - | Filter by CPU architecture (e.g., x86_64, arm64) |
| category | string | no | - | Filter by category ID |
| includeEol | boolean | no | false | Include end-of-life images in results |

**Output**: `{ items: Image[], total_count: number, page: number, page_size: number }`

---

### scaleway_marketplace_get_image

**Scaleway API**: `GET /marketplace/v2/images/{imageId}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| imageId | string | yes | UUID of the marketplace image |

**Output**: `Image`

---

## Local Image Tools

### scaleway_marketplace_list_local_images

**Scaleway API**: `GET /marketplace/v2/local-images`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| orderBy | enum | no | - | Sort order: type_asc, type_desc, created_at_asc, created_at_desc |
| zone | string | no | - | Filter by availability zone (e.g., fr-par-1) |
| arch | string | no | - | Filter by CPU architecture |
| imageId | string | no | - | Filter by parent image UUID |
| versionId | string | no | - | Filter by version UUID |
| imageLabel | string | no | - | Filter by image label |
| type | enum | no | - | Filter by type: unknown_type, instance_local, instance_sbs |

**Output**: `{ items: LocalImage[], total_count: number, page: number, page_size: number }`

---

### scaleway_marketplace_get_local_image

**Scaleway API**: `GET /marketplace/v2/local-images/{localImageId}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| localImageId | string | yes | UUID of the local image |

**Output**: `LocalImage`

---

## Category Tools

### scaleway_marketplace_list_categories

**Scaleway API**: `GET /marketplace/v2/categories`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |

**Output**: `{ items: Category[], total_count: number, page: number, page_size: number }`

---

### scaleway_marketplace_get_category

**Scaleway API**: `GET /marketplace/v2/categories/{categoryId}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| categoryId | string | yes | UUID of the category |

**Output**: `Category`

---

## Version Tools

### scaleway_marketplace_list_versions

**Scaleway API**: `GET /marketplace/v2/versions`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| imageId | string | yes | - | UUID of the parent image |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| orderBy | enum | no | - | Sort order: created_at_asc, created_at_desc |

**Output**: `{ items: Version[], total_count: number, page: number, page_size: number }`

---

### scaleway_marketplace_get_version

**Scaleway API**: `GET /marketplace/v2/versions/{versionId}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| versionId | string | yes | UUID of the version |

**Output**: `Version`
