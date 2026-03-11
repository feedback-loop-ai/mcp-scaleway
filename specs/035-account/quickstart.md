# Quickstart: Scaleway Account MCP Tools

**Feature**: 035-account | **Date**: 2026-03-11

## Prerequisites

1. Set environment variables:
   ```bash
   export SCW_ACCESS_KEY="your-access-key"
   export SCW_SECRET_KEY="your-secret-key"
   export SCW_DEFAULT_PROJECT_ID="your-project-id"
   ```

2. Start the MCP server:
   ```bash
   bun run start
   ```

## Usage Examples

### List Projects

```json
{
  "tool": "scaleway_account_list_projects",
  "arguments": {
    "page": 1,
    "page_size": 10
  }
}
```

### List Projects with Filtering

```json
{
  "tool": "scaleway_account_list_projects",
  "arguments": {
    "name": "production",
    "order_by": "name_asc",
    "page": 1,
    "page_size": 20
  }
}
```

### Get a Project

```json
{
  "tool": "scaleway_account_get_project",
  "arguments": {
    "project_id": "project-uuid"
  }
}
```

### Create a Project

```json
{
  "tool": "scaleway_account_create_project",
  "arguments": {
    "name": "my-new-project",
    "description": "A project for staging infrastructure"
  }
}
```

### Update a Project

```json
{
  "tool": "scaleway_account_update_project",
  "arguments": {
    "project_id": "project-uuid",
    "name": "renamed-project",
    "description": "Updated description"
  }
}
```

### Delete a Project

```json
{
  "tool": "scaleway_account_delete_project",
  "arguments": {
    "project_id": "project-uuid"
  }
}
```
