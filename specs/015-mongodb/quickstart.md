# Quickstart: Scaleway Managed MongoDB MCP Tools

**Feature**: 015-mongodb | **Date**: 2026-03-11

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

### List MongoDB Instances

```json
{
  "tool": "scaleway_mongodb_list_instances",
  "arguments": {
    "region": "fr-par",
    "page": 1,
    "pageSize": 10
  }
}
```

### Create a MongoDB Instance

```json
{
  "tool": "scaleway_mongodb_create_instance",
  "arguments": {
    "region": "fr-par",
    "name": "my-mongodb",
    "version": "7.0.12",
    "node_type": "MGDB-PLAY2-NANO",
    "node_number": 1,
    "user_name": "admin",
    "password": "securePassword123!",
    "volume": {
      "volume_type": "sbs_5k",
      "volume_size": 10000000000
    }
  }
}
```

### Get a MongoDB Instance

```json
{
  "tool": "scaleway_mongodb_get_instance",
  "arguments": {
    "region": "fr-par",
    "instance_id": "instance-uuid"
  }
}
```

### Update a MongoDB Instance

```json
{
  "tool": "scaleway_mongodb_update_instance",
  "arguments": {
    "region": "fr-par",
    "instance_id": "instance-uuid",
    "name": "renamed-mongodb",
    "tags": ["production", "team-backend"]
  }
}
```

### Delete a MongoDB Instance

```json
{
  "tool": "scaleway_mongodb_delete_instance",
  "arguments": {
    "region": "fr-par",
    "instance_id": "instance-uuid"
  }
}
```

### List Users on an Instance

```json
{
  "tool": "scaleway_mongodb_list_users",
  "arguments": {
    "region": "fr-par",
    "instance_id": "instance-uuid",
    "page": 1,
    "pageSize": 10
  }
}
```

### Create a User

```json
{
  "tool": "scaleway_mongodb_create_user",
  "arguments": {
    "region": "fr-par",
    "instance_id": "instance-uuid",
    "name": "app-user",
    "password": "userPassword456!"
  }
}
```

### Update a User Password

```json
{
  "tool": "scaleway_mongodb_update_user",
  "arguments": {
    "region": "fr-par",
    "instance_id": "instance-uuid",
    "name": "app-user",
    "password": "newPassword789!"
  }
}
```

### Delete a User

```json
{
  "tool": "scaleway_mongodb_delete_user",
  "arguments": {
    "region": "fr-par",
    "instance_id": "instance-uuid",
    "name": "app-user"
  }
}
```

### List Snapshots

```json
{
  "tool": "scaleway_mongodb_list_snapshots",
  "arguments": {
    "region": "fr-par",
    "instance_id": "instance-uuid",
    "page": 1,
    "pageSize": 10
  }
}
```

### Create a Snapshot

```json
{
  "tool": "scaleway_mongodb_create_snapshot",
  "arguments": {
    "region": "fr-par",
    "instance_id": "instance-uuid",
    "name": "pre-migration-backup",
    "expires_at": "2026-04-11T00:00:00Z"
  }
}
```

### Restore a Snapshot

```json
{
  "tool": "scaleway_mongodb_restore_snapshot",
  "arguments": {
    "region": "fr-par",
    "snapshot_id": "snapshot-uuid",
    "instance_name": "restored-mongodb",
    "node_type": "MGDB-PLAY2-NANO",
    "node_number": 1
  }
}
```

### Delete a Snapshot

```json
{
  "tool": "scaleway_mongodb_delete_snapshot",
  "arguments": {
    "region": "fr-par",
    "snapshot_id": "snapshot-uuid"
  }
}
```

### List Available Node Types

```json
{
  "tool": "scaleway_mongodb_list_node_types",
  "arguments": {
    "region": "fr-par",
    "include_disabled_types": false
  }
}
```

### List Available MongoDB Versions

```json
{
  "tool": "scaleway_mongodb_list_versions",
  "arguments": {
    "region": "fr-par"
  }
}
```
