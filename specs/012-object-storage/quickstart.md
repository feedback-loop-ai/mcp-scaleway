# Quickstart: Scaleway Object Storage MCP Tools

**Feature**: 012-object-storage | **Date**: 2026-03-11

## Prerequisites

1. Set environment variables:
   ```bash
   export SCW_ACCESS_KEY="your-access-key"
   export SCW_SECRET_KEY="your-secret-key"
   export SCW_DEFAULT_REGION="fr-par"
   ```

2. Start the MCP server:
   ```bash
   bun run start
   ```

## Usage Examples

### List Buckets

```json
{
  "tool": "scaleway_object_storage_list_buckets",
  "arguments": {
    "region": "fr-par"
  }
}
```

### Create a Bucket

```json
{
  "tool": "scaleway_object_storage_create_bucket",
  "arguments": {
    "name": "my-app-data",
    "region": "fr-par",
    "acl": "private"
  }
}
```

### Get Bucket Info

```json
{
  "tool": "scaleway_object_storage_get_bucket_info",
  "arguments": {
    "name": "my-app-data",
    "region": "fr-par"
  }
}
```

### List Objects

```json
{
  "tool": "scaleway_object_storage_list_objects",
  "arguments": {
    "bucket": "my-app-data",
    "region": "fr-par",
    "prefix": "uploads/",
    "delimiter": "/",
    "maxKeys": 50
  }
}
```

### Upload an Object

```json
{
  "tool": "scaleway_object_storage_put_object",
  "arguments": {
    "bucket": "my-app-data",
    "key": "config/settings.json",
    "contentBase64": "eyJrZXkiOiAidmFsdWUifQ==",
    "contentType": "application/json",
    "metadata": { "env": "production" }
  }
}
```

### Get Object Info

```json
{
  "tool": "scaleway_object_storage_get_object_info",
  "arguments": {
    "bucket": "my-app-data",
    "key": "config/settings.json"
  }
}
```

### Delete an Object

```json
{
  "tool": "scaleway_object_storage_delete_object",
  "arguments": {
    "bucket": "my-app-data",
    "key": "config/settings.json"
  }
}
```

### Set Bucket Policy

```json
{
  "tool": "scaleway_object_storage_set_bucket_policy",
  "arguments": {
    "bucket": "my-app-data",
    "policy": "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Sid\":\"PublicRead\",\"Effect\":\"Allow\",\"Principal\":\"*\",\"Action\":\"s3:GetObject\",\"Resource\":\"arn:scw:s3:::my-app-data/*\"}]}"
  }
}
```

### Set Lifecycle Rules

```json
{
  "tool": "scaleway_object_storage_set_bucket_lifecycle",
  "arguments": {
    "bucket": "my-app-data",
    "rules": [
      {
        "ID": "expire-old-logs",
        "Status": "Enabled",
        "Prefix": "logs/",
        "Expiration": { "Days": 90 }
      },
      {
        "ID": "archive-backups",
        "Status": "Enabled",
        "Prefix": "backups/",
        "Transition": { "Days": 30, "StorageClass": "GLACIER" }
      }
    ]
  }
}
```

### Enable Versioning

```json
{
  "tool": "scaleway_object_storage_set_bucket_versioning",
  "arguments": {
    "bucket": "my-app-data",
    "status": "Enabled"
  }
}
```

### Delete a Bucket

```json
{
  "tool": "scaleway_object_storage_delete_bucket",
  "arguments": {
    "name": "my-app-data",
    "region": "fr-par"
  }
}
```
