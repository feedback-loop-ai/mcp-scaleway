# Quickstart: Scaleway SQS (Queues) MCP Tools

**Feature**: 027-sqs | **Date**: 2026-03-11

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

### Activate SQS Service

```json
{
  "tool": "scaleway_sqs_activate",
  "arguments": {
    "region": "fr-par",
    "project_id": "your-project-uuid"
  }
}
```

### Get SQS Service Info

```json
{
  "tool": "scaleway_sqs_get_info",
  "arguments": {
    "region": "fr-par"
  }
}
```

### Create SQS Credentials

```json
{
  "tool": "scaleway_sqs_create_credentials",
  "arguments": {
    "region": "fr-par",
    "name": "my-sqs-creds",
    "permissions": {
      "can_publish": true,
      "can_receive": true,
      "can_manage": false
    }
  }
}
```

### List SQS Credentials

```json
{
  "tool": "scaleway_sqs_list_credentials",
  "arguments": {
    "region": "fr-par",
    "page": 1,
    "page_size": 20,
    "order_by": "created_at_desc"
  }
}
```

### Get SQS Credentials by ID

```json
{
  "tool": "scaleway_sqs_get_credentials",
  "arguments": {
    "region": "fr-par",
    "credential_id": "credential-uuid"
  }
}
```

### Update SQS Credentials

```json
{
  "tool": "scaleway_sqs_update_credentials",
  "arguments": {
    "region": "fr-par",
    "credential_id": "credential-uuid",
    "name": "updated-creds-name",
    "permissions": {
      "can_publish": true,
      "can_receive": true,
      "can_manage": true
    }
  }
}
```

### Delete SQS Credentials

```json
{
  "tool": "scaleway_sqs_delete_credentials",
  "arguments": {
    "region": "fr-par",
    "credential_id": "credential-uuid"
  }
}
```

### Deactivate SQS Service

```json
{
  "tool": "scaleway_sqs_deactivate",
  "arguments": {
    "region": "fr-par"
  }
}
```
