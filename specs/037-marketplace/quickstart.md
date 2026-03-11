# Quickstart: Scaleway Marketplace MCP Tools

**Feature**: 037-marketplace | **Date**: 2026-03-11

## Prerequisites

1. Set environment variables:
   ```bash
   export SCW_ACCESS_KEY="your-access-key"
   export SCW_SECRET_KEY="your-secret-key"
   ```

2. Start the MCP server:
   ```bash
   bun run start
   ```

## Usage Examples

### List Marketplace Images

```json
{
  "tool": "scaleway_marketplace_list_images",
  "arguments": {
    "page": 1,
    "pageSize": 10
  }
}
```

### List Images Filtered by Architecture

```json
{
  "tool": "scaleway_marketplace_list_images",
  "arguments": {
    "arch": "x86_64",
    "includeEol": false,
    "orderBy": "name_asc"
  }
}
```

### Get a Specific Image

```json
{
  "tool": "scaleway_marketplace_get_image",
  "arguments": {
    "imageId": "image-uuid"
  }
}
```

### List Local Images for a Zone

```json
{
  "tool": "scaleway_marketplace_list_local_images",
  "arguments": {
    "zone": "fr-par-1",
    "arch": "x86_64",
    "type": "instance_local"
  }
}
```

### Get a Specific Local Image

```json
{
  "tool": "scaleway_marketplace_get_local_image",
  "arguments": {
    "localImageId": "local-image-uuid"
  }
}
```

### List Categories

```json
{
  "tool": "scaleway_marketplace_list_categories",
  "arguments": {
    "page": 1,
    "pageSize": 50
  }
}
```

### Get a Specific Category

```json
{
  "tool": "scaleway_marketplace_get_category",
  "arguments": {
    "categoryId": "category-uuid"
  }
}
```

### List Versions for an Image

```json
{
  "tool": "scaleway_marketplace_list_versions",
  "arguments": {
    "imageId": "image-uuid",
    "orderBy": "created_at_desc"
  }
}
```

### Get a Specific Version

```json
{
  "tool": "scaleway_marketplace_get_version",
  "arguments": {
    "versionId": "version-uuid"
  }
}
```
