# Quickstart: Scaleway Cockpit (Observability) MCP Tools

**Feature**: 031-cockpit | **Date**: 2026-03-11

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

### Get Cockpit Info

```json
{
  "tool": "scaleway_cockpit_get_cockpit",
  "arguments": {
    "project_id": "your-project-id",
    "region": "fr-par"
  }
}
```

### Activate Cockpit

```json
{
  "tool": "scaleway_cockpit_activate_cockpit",
  "arguments": {
    "project_id": "your-project-id",
    "region": "fr-par"
  }
}
```

### Create a Token

```json
{
  "tool": "scaleway_cockpit_create_token",
  "arguments": {
    "project_id": "your-project-id",
    "name": "my-metrics-token",
    "scopes": ["read_only_metrics", "write_only_metrics"],
    "region": "fr-par"
  }
}
```

### List Tokens

```json
{
  "tool": "scaleway_cockpit_list_tokens",
  "arguments": {
    "project_id": "your-project-id",
    "region": "fr-par",
    "page": 1,
    "pageSize": 10
  }
}
```

### Create a Data Source

```json
{
  "tool": "scaleway_cockpit_create_data_source",
  "arguments": {
    "project_id": "your-project-id",
    "name": "my-metrics-source",
    "type": "metrics",
    "region": "fr-par"
  }
}
```

### List Data Sources

```json
{
  "tool": "scaleway_cockpit_list_data_sources",
  "arguments": {
    "project_id": "your-project-id",
    "region": "fr-par",
    "page": 1,
    "pageSize": 20
  }
}
```

### Create a Grafana User

```json
{
  "tool": "scaleway_cockpit_create_grafana_user",
  "arguments": {
    "project_id": "your-project-id",
    "login": "dev-user",
    "role": "editor"
  }
}
```

### List Grafana Users

```json
{
  "tool": "scaleway_cockpit_list_grafana_users",
  "arguments": {
    "project_id": "your-project-id",
    "page": 1,
    "pageSize": 10
  }
}
```

### Reset Grafana User Password

```json
{
  "tool": "scaleway_cockpit_reset_grafana_user_password",
  "arguments": {
    "grafana_user_id": 42,
    "project_id": "your-project-id"
  }
}
```

### Enable Alert Manager

```json
{
  "tool": "scaleway_cockpit_enable_alert_manager",
  "arguments": {
    "project_id": "your-project-id",
    "region": "fr-par"
  }
}
```

### Create a Contact Point

```json
{
  "tool": "scaleway_cockpit_create_contact_point",
  "arguments": {
    "project_id": "your-project-id",
    "email": "alerts@example.com",
    "region": "fr-par"
  }
}
```

### Enable Managed Alerts

```json
{
  "tool": "scaleway_cockpit_enable_managed_alerts",
  "arguments": {
    "project_id": "your-project-id",
    "region": "fr-par"
  }
}
```
