# Quickstart: Scaleway SNS (Topics & Events) MCP Tools

**Feature**: 028-sns | **Date**: 2026-03-11

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

### Activate SNS

```json
{
  "tool": "scaleway_sns_activate",
  "arguments": {
    "region": "fr-par",
    "projectId": "your-project-uuid"
  }
}
```

### Get SNS Info

```json
{
  "tool": "scaleway_sns_get_info",
  "arguments": {
    "region": "fr-par",
    "projectId": "your-project-uuid"
  }
}
```

### Create Credentials

```json
{
  "tool": "scaleway_sns_create_credentials",
  "arguments": {
    "region": "fr-par",
    "projectId": "your-project-uuid",
    "name": "my-publisher",
    "permissions": {
      "canPublish": true,
      "canReceive": false,
      "canManage": false
    }
  }
}
```

### List Credentials

```json
{
  "tool": "scaleway_sns_list_credentials",
  "arguments": {
    "region": "fr-par",
    "projectId": "your-project-uuid",
    "page": 1,
    "pageSize": 10,
    "orderBy": "created_at_desc"
  }
}
```

### Get Credentials

```json
{
  "tool": "scaleway_sns_get_credentials",
  "arguments": {
    "region": "fr-par",
    "snsCredentialsId": "credentials-uuid"
  }
}
```

### Update Credentials

```json
{
  "tool": "scaleway_sns_update_credentials",
  "arguments": {
    "region": "fr-par",
    "snsCredentialsId": "credentials-uuid",
    "name": "renamed-publisher",
    "permissions": {
      "canPublish": true,
      "canReceive": true,
      "canManage": false
    }
  }
}
```

### Delete Credentials

```json
{
  "tool": "scaleway_sns_delete_credentials",
  "arguments": {
    "region": "fr-par",
    "snsCredentialsId": "credentials-uuid"
  }
}
```

### Deactivate SNS

```json
{
  "tool": "scaleway_sns_deactivate",
  "arguments": {
    "region": "fr-par",
    "projectId": "your-project-uuid"
  }
}
```
