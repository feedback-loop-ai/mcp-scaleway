# Quickstart: Scaleway Managed Database (RDB) MCP Tools

**Feature**: 013-rdb | **Date**: 2026-03-11

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

### List Database Instances

```json
{
  "tool": "scaleway_rdb_list_instances",
  "arguments": {
    "region": "fr-par",
    "page": 1,
    "page_size": 10
  }
}
```

### Create a PostgreSQL Instance

```json
{
  "tool": "scaleway_rdb_create_instance",
  "arguments": {
    "region": "fr-par",
    "name": "my-postgres-db",
    "engine": "PostgreSQL-15",
    "node_type": "db-dev-s",
    "volume_type": "lssd",
    "volume_size": 10000000000,
    "user_name": "admin",
    "password": "securePassword123!"
  }
}
```

### Get Instance Details

```json
{
  "tool": "scaleway_rdb_get_instance",
  "arguments": {
    "region": "fr-par",
    "instance_id": "instance-uuid"
  }
}
```

### Upgrade Instance Node Type

```json
{
  "tool": "scaleway_rdb_upgrade_instance",
  "arguments": {
    "region": "fr-par",
    "instance_id": "instance-uuid",
    "node_type": "db-gp-xs"
  }
}
```

### Create a Database

```json
{
  "tool": "scaleway_rdb_create_database",
  "arguments": {
    "region": "fr-par",
    "instance_id": "instance-uuid",
    "name": "my_application_db"
  }
}
```

### Create a User

```json
{
  "tool": "scaleway_rdb_create_user",
  "arguments": {
    "region": "fr-par",
    "instance_id": "instance-uuid",
    "name": "app_user",
    "password": "securePassword456!",
    "is_admin": false
  }
}
```

### Create a Manual Backup

```json
{
  "tool": "scaleway_rdb_create_backup",
  "arguments": {
    "region": "fr-par",
    "instance_id": "instance-uuid",
    "name": "pre-migration-backup",
    "database_name": "my_application_db"
  }
}
```

### Add ACL Rules

```json
{
  "tool": "scaleway_rdb_add_acl_rules",
  "arguments": {
    "region": "fr-par",
    "instance_id": "instance-uuid",
    "rules": [
      {
        "ip": "203.0.113.0/24",
        "description": "Office network"
      }
    ]
  }
}
```

### Create a Private Network Endpoint

```json
{
  "tool": "scaleway_rdb_create_endpoint",
  "arguments": {
    "region": "fr-par",
    "instance_id": "instance-uuid",
    "endpoint_spec": {
      "private_network": {
        "private_network_id": "pn-uuid",
        "service_ip": "10.0.0.1/24"
      }
    }
  }
}
```

### Create a Snapshot

```json
{
  "tool": "scaleway_rdb_create_snapshot",
  "arguments": {
    "region": "fr-par",
    "instance_id": "instance-uuid",
    "name": "my-snapshot"
  }
}
```

### Restore a Snapshot to a New Instance

```json
{
  "tool": "scaleway_rdb_restore_snapshot",
  "arguments": {
    "region": "fr-par",
    "snapshot_id": "snapshot-uuid",
    "instance_name": "restored-from-snapshot",
    "node_type": "db-dev-s"
  }
}
```

### List Available Database Engines

```json
{
  "tool": "scaleway_rdb_list_database_engines",
  "arguments": {
    "region": "fr-par"
  }
}
```

### List Available Node Types

```json
{
  "tool": "scaleway_rdb_list_node_types",
  "arguments": {
    "region": "fr-par"
  }
}
```
