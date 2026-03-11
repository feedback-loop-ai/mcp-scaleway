# Quickstart: Scaleway Transactional Email (TEM) MCP Tools

**Feature**: 032-tem | **Date**: 2026-03-11

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

### List Domains

```json
{
  "tool": "scaleway_tem_list_domains",
  "arguments": {
    "region": "fr-par",
    "page": 1,
    "pageSize": 10
  }
}
```

### Create a Domain

```json
{
  "tool": "scaleway_tem_create_domain",
  "arguments": {
    "region": "fr-par",
    "project_id": "project-uuid",
    "domain_name": "notifications.example.com",
    "accept_tos": true,
    "autoconfig": true
  }
}
```

### Check Domain DNS

```json
{
  "tool": "scaleway_tem_check_domain",
  "arguments": {
    "region": "fr-par",
    "domain_id": "domain-uuid"
  }
}
```

### Get Domain Verification Status

```json
{
  "tool": "scaleway_tem_get_domain_last_status",
  "arguments": {
    "region": "fr-par",
    "domain_id": "domain-uuid"
  }
}
```

### Send an Email

```json
{
  "tool": "scaleway_tem_create_email",
  "arguments": {
    "region": "fr-par",
    "from": {
      "email": "noreply@notifications.example.com",
      "name": "My App"
    },
    "to": [
      {
        "email": "user@example.com",
        "name": "User"
      }
    ],
    "subject": "Welcome to My App",
    "html": "<h1>Welcome!</h1><p>Thanks for signing up.</p>",
    "text": "Welcome! Thanks for signing up.",
    "project_id": "project-uuid"
  }
}
```

### List Emails

```json
{
  "tool": "scaleway_tem_list_emails",
  "arguments": {
    "region": "fr-par",
    "page": 1,
    "pageSize": 20,
    "status": "sent"
  }
}
```

### Cancel a Queued Email

```json
{
  "tool": "scaleway_tem_cancel_email",
  "arguments": {
    "region": "fr-par",
    "email_id": "email-uuid"
  }
}
```

### Get Email Statistics

```json
{
  "tool": "scaleway_tem_get_statistics",
  "arguments": {
    "region": "fr-par",
    "project_id": "project-uuid",
    "since": "2026-03-01T00:00:00Z",
    "until": "2026-03-11T23:59:59Z"
  }
}
```

### Create a Webhook

```json
{
  "tool": "scaleway_tem_create_webhook",
  "arguments": {
    "region": "fr-par",
    "domain_id": "domain-uuid",
    "name": "delivery-tracker",
    "event_types": ["email_delivered", "email_dropped", "email_spam"],
    "sns_arn": "arn:scw:sns:fr-par:project-uuid:my-topic"
  }
}
```

### Update a Webhook

```json
{
  "tool": "scaleway_tem_update_webhook",
  "arguments": {
    "region": "fr-par",
    "webhook_id": "webhook-uuid",
    "name": "updated-tracker",
    "event_types": ["email_delivered", "email_dropped"]
  }
}
```

### Delete a Webhook

```json
{
  "tool": "scaleway_tem_delete_webhook",
  "arguments": {
    "region": "fr-par",
    "webhook_id": "webhook-uuid"
  }
}
```
