# Quickstart: Scaleway Block Storage MCP Tools

**Feature**: 011-block-storage | **Date**: 2026-03-11

## Prerequisites

1. Set environment variables:
   ```bash
   export SCW_ACCESS_KEY="your-access-key"
   export SCW_SECRET_KEY="your-secret-key"
   export SCW_DEFAULT_PROJECT_ID="your-project-id"
   export SCW_DEFAULT_ZONE="fr-par-1"
   ```

2. Start the MCP server:
   ```bash
   bun run start
   ```

## Usage Examples

### List Volumes

```json
{
  "tool": "scaleway_block_storage_list_volumes",
  "arguments": {
    "zone": "fr-par-1",
    "page": 1,
    "pageSize": 10
  }
}
```

### Get a Volume

```json
{
  "tool": "scaleway_block_storage_get_volume",
  "arguments": {
    "zone": "fr-par-1",
    "volumeId": "volume-uuid"
  }
}
```

### Create a Volume (from empty)

```json
{
  "tool": "scaleway_block_storage_create_volume",
  "arguments": {
    "zone": "fr-par-1",
    "name": "my-volume",
    "fromEmpty": {
      "size": 20000000000
    },
    "perfIops": 5000
  }
}
```

### Create a Volume (from snapshot)

```json
{
  "tool": "scaleway_block_storage_create_volume",
  "arguments": {
    "zone": "fr-par-1",
    "name": "restored-volume",
    "fromSnapshot": {
      "snapshotId": "snapshot-uuid"
    }
  }
}
```

### Update a Volume

```json
{
  "tool": "scaleway_block_storage_update_volume",
  "arguments": {
    "zone": "fr-par-1",
    "volumeId": "volume-uuid",
    "name": "renamed-volume",
    "tags": ["env:prod", "team:backend"]
  }
}
```

### Delete a Volume

```json
{
  "tool": "scaleway_block_storage_delete_volume",
  "arguments": {
    "zone": "fr-par-1",
    "volumeId": "volume-uuid"
  }
}
```

### List Snapshots

```json
{
  "tool": "scaleway_block_storage_list_snapshots",
  "arguments": {
    "zone": "fr-par-1",
    "page": 1,
    "pageSize": 10
  }
}
```

### Get a Snapshot

```json
{
  "tool": "scaleway_block_storage_get_snapshot",
  "arguments": {
    "zone": "fr-par-1",
    "snapshotId": "snapshot-uuid"
  }
}
```

### Create a Snapshot

```json
{
  "tool": "scaleway_block_storage_create_snapshot",
  "arguments": {
    "zone": "fr-par-1",
    "name": "my-snapshot",
    "volumeId": "volume-uuid"
  }
}
```

### Update a Snapshot

```json
{
  "tool": "scaleway_block_storage_update_snapshot",
  "arguments": {
    "zone": "fr-par-1",
    "snapshotId": "snapshot-uuid",
    "name": "renamed-snapshot",
    "tags": ["backup:weekly"]
  }
}
```

### Delete a Snapshot

```json
{
  "tool": "scaleway_block_storage_delete_snapshot",
  "arguments": {
    "zone": "fr-par-1",
    "snapshotId": "snapshot-uuid"
  }
}
```

### List Volume Types

```json
{
  "tool": "scaleway_block_storage_list_volume_types",
  "arguments": {
    "zone": "fr-par-1"
  }
}
```
