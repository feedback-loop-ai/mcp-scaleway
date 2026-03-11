# Quickstart: Scaleway Serverless SQL DB MCP Tools

**Feature**: 010-serverless-sqldb | **Date**: 2026-03-11

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

### List Databases

```json
{
  "tool": "scaleway_serverless_sqldb_list_databases",
  "arguments": {
    "region": "fr-par",
    "page": 1,
    "pageSize": 10
  }
}
```

### Create a Database

```json
{
  "tool": "scaleway_serverless_sqldb_create_database",
  "arguments": {
    "region": "fr-par",
    "name": "my-analytics-db",
    "cpu_min": 0,
    "cpu_max": 4
  }
}
```

### Get a Database

```json
{
  "tool": "scaleway_serverless_sqldb_get_database",
  "arguments": {
    "region": "fr-par",
    "database_id": "database-uuid"
  }
}
```

### Update Database CPU Limits

```json
{
  "tool": "scaleway_serverless_sqldb_update_database",
  "arguments": {
    "region": "fr-par",
    "database_id": "database-uuid",
    "cpu_min": 1,
    "cpu_max": 8
  }
}
```

### Delete a Database

```json
{
  "tool": "scaleway_serverless_sqldb_delete_database",
  "arguments": {
    "region": "fr-par",
    "database_id": "database-uuid"
  }
}
```

### List Database Backups

```json
{
  "tool": "scaleway_serverless_sqldb_list_database_backups",
  "arguments": {
    "region": "fr-par",
    "database_id": "database-uuid",
    "page": 1,
    "pageSize": 10
  }
}
```

### Get a Database Backup

```json
{
  "tool": "scaleway_serverless_sqldb_get_database_backup",
  "arguments": {
    "region": "fr-par",
    "backup_id": "backup-uuid"
  }
}
```

### Export a Database Backup

```json
{
  "tool": "scaleway_serverless_sqldb_export_database_backup",
  "arguments": {
    "region": "fr-par",
    "backup_id": "backup-uuid"
  }
}
```

### Restore a Database from Backup

```json
{
  "tool": "scaleway_serverless_sqldb_restore_database",
  "arguments": {
    "region": "fr-par",
    "database_id": "database-uuid",
    "backup_id": "backup-uuid"
  }
}
```
