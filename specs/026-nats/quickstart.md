# Quickstart: Scaleway NATS Messaging MCP Tools

**Feature**: 026-nats | **Date**: 2026-03-11

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

### List NATS Accounts

```json
{
  "tool": "scaleway_nats_list_accounts",
  "arguments": {
    "region": "fr-par",
    "page": 1,
    "pageSize": 10
  }
}
```

### Create a NATS Account

```json
{
  "tool": "scaleway_nats_create_account",
  "arguments": {
    "region": "fr-par",
    "name": "my-nats-account"
  }
}
```

### Get a NATS Account

```json
{
  "tool": "scaleway_nats_get_account",
  "arguments": {
    "region": "fr-par",
    "natsAccountId": "account-uuid"
  }
}
```

### Update a NATS Account

```json
{
  "tool": "scaleway_nats_update_account",
  "arguments": {
    "region": "fr-par",
    "natsAccountId": "account-uuid",
    "name": "renamed-account"
  }
}
```

### Delete a NATS Account

```json
{
  "tool": "scaleway_nats_delete_account",
  "arguments": {
    "region": "fr-par",
    "natsAccountId": "account-uuid"
  }
}
```

### List Credentials for a NATS Account

```json
{
  "tool": "scaleway_nats_list_credentials",
  "arguments": {
    "region": "fr-par",
    "natsAccountId": "account-uuid",
    "page": 1,
    "pageSize": 10
  }
}
```

### Create NATS Credentials

```json
{
  "tool": "scaleway_nats_create_credentials",
  "arguments": {
    "region": "fr-par",
    "natsAccountId": "account-uuid",
    "name": "my-credentials"
  }
}
```

### Get NATS Credentials

```json
{
  "tool": "scaleway_nats_get_credentials",
  "arguments": {
    "region": "fr-par",
    "natsCredentialsId": "credentials-uuid"
  }
}
```

### Delete NATS Credentials

```json
{
  "tool": "scaleway_nats_delete_credentials",
  "arguments": {
    "region": "fr-par",
    "natsCredentialsId": "credentials-uuid"
  }
}
```
