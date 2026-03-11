# Quickstart: Scaleway Container Registry MCP Tools

**Feature**: 006-registry | **Date**: 2026-03-11

## Prerequisites

1. Set environment variables:
   ```bash
   export SCW_ACCESS_KEY="your-access-key"
   export SCW_SECRET_KEY="your-secret-key"
   export SCW_DEFAULT_PROJECT_ID="your-project-id"
   export SCW_DEFAULT_REGION="fr-par"
   ```

2. Start the MCP server:
   ```bash
   bun run start
   ```

## Usage Examples

### List Namespaces

```json
{
  "tool": "scaleway_registry_list_namespaces",
  "arguments": {
    "region": "fr-par",
    "page": 1,
    "page_size": 20
  }
}
```

### Create a Namespace

```json
{
  "tool": "scaleway_registry_create_namespace",
  "arguments": {
    "region": "fr-par",
    "name": "my-app-registry",
    "description": "Container images for my application",
    "is_public": false
  }
}
```

### Get a Namespace

```json
{
  "tool": "scaleway_registry_get_namespace",
  "arguments": {
    "region": "fr-par",
    "namespace_id": "namespace-uuid"
  }
}
```

### Update a Namespace

```json
{
  "tool": "scaleway_registry_update_namespace",
  "arguments": {
    "region": "fr-par",
    "namespace_id": "namespace-uuid",
    "description": "Updated description",
    "is_public": true
  }
}
```

### Delete a Namespace

```json
{
  "tool": "scaleway_registry_delete_namespace",
  "arguments": {
    "region": "fr-par",
    "namespace_id": "namespace-uuid"
  }
}
```

### List Images in a Namespace

```json
{
  "tool": "scaleway_registry_list_images",
  "arguments": {
    "region": "fr-par",
    "namespace_id": "namespace-uuid",
    "page": 1,
    "page_size": 50
  }
}
```

### Get an Image

```json
{
  "tool": "scaleway_registry_get_image",
  "arguments": {
    "region": "fr-par",
    "image_id": "image-uuid"
  }
}
```

### Update Image Visibility

```json
{
  "tool": "scaleway_registry_update_image",
  "arguments": {
    "region": "fr-par",
    "image_id": "image-uuid",
    "visibility": "private"
  }
}
```

### Delete an Image

```json
{
  "tool": "scaleway_registry_delete_image",
  "arguments": {
    "region": "fr-par",
    "image_id": "image-uuid"
  }
}
```

### List Tags for an Image

```json
{
  "tool": "scaleway_registry_list_tags",
  "arguments": {
    "region": "fr-par",
    "image_id": "image-uuid",
    "page": 1,
    "page_size": 50
  }
}
```

### Get a Tag

```json
{
  "tool": "scaleway_registry_get_tag",
  "arguments": {
    "region": "fr-par",
    "tag_id": "tag-uuid"
  }
}
```

### Delete a Tag

```json
{
  "tool": "scaleway_registry_delete_tag",
  "arguments": {
    "region": "fr-par",
    "tag_id": "tag-uuid"
  }
}
```
