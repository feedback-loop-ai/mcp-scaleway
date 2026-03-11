# Quickstart: Scaleway IAM MCP Tools

**Feature**: 023-iam | **Date**: 2026-03-11

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

### List Users

```json
{
  "tool": "scaleway_iam_list_users",
  "arguments": {
    "organization_id": "org-uuid",
    "page": 1,
    "page_size": 10
  }
}
```

### Invite a User

```json
{
  "tool": "scaleway_iam_create_user",
  "arguments": {
    "organization_id": "org-uuid",
    "email": "user@example.com"
  }
}
```

### Create an Application

```json
{
  "tool": "scaleway_iam_create_application",
  "arguments": {
    "name": "my-ci-bot",
    "organization_id": "org-uuid",
    "description": "CI/CD service account"
  }
}
```

### Create an API Key for an Application

```json
{
  "tool": "scaleway_iam_create_api_key",
  "arguments": {
    "application_id": "app-uuid",
    "description": "CI deployment key",
    "default_project_id": "project-uuid"
  }
}
```

### Create a Policy with Rules

```json
{
  "tool": "scaleway_iam_create_policy",
  "arguments": {
    "name": "instances-readonly",
    "organization_id": "org-uuid",
    "description": "Read-only access to instances",
    "application_id": "app-uuid",
    "rules": [
      {
        "permission_set_names": ["InstancesReadOnly"],
        "project_ids": ["project-uuid"]
      }
    ]
  }
}
```

### Create a Group and Add Members

```json
{
  "tool": "scaleway_iam_create_group",
  "arguments": {
    "name": "developers",
    "organization_id": "org-uuid",
    "description": "Development team"
  }
}
```

```json
{
  "tool": "scaleway_iam_add_group_member",
  "arguments": {
    "group_id": "group-uuid",
    "user_id": "user-uuid"
  }
}
```

### List Permission Sets

```json
{
  "tool": "scaleway_iam_list_permission_sets",
  "arguments": {
    "organization_id": "org-uuid",
    "page": 1,
    "page_size": 50
  }
}
```

### List Rules for a Policy

```json
{
  "tool": "scaleway_iam_list_rules",
  "arguments": {
    "policy_id": "policy-uuid",
    "page": 1,
    "page_size": 50
  }
}
```
