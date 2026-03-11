# Quickstart: Scaleway Web Hosting MCP Tools

**Feature**: 034-webhosting | **Date**: 2026-03-11

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

### List Hostings

```json
{
  "tool": "scaleway_webhosting_list_hostings",
  "arguments": {
    "region": "fr-par",
    "page": 1,
    "pageSize": 10
  }
}
```

### Get a Hosting

```json
{
  "tool": "scaleway_webhosting_get_hosting",
  "arguments": {
    "region": "fr-par",
    "hosting_id": "hosting-uuid"
  }
}
```

### Create a Hosting

```json
{
  "tool": "scaleway_webhosting_create_hosting",
  "arguments": {
    "region": "fr-par",
    "offer_id": "offer-uuid",
    "domain": "example.com",
    "tags": ["production"]
  }
}
```

### Update a Hosting

```json
{
  "tool": "scaleway_webhosting_update_hosting",
  "arguments": {
    "region": "fr-par",
    "hosting_id": "hosting-uuid",
    "email": "admin@example.com",
    "protected": true
  }
}
```

### Delete a Hosting

```json
{
  "tool": "scaleway_webhosting_delete_hosting",
  "arguments": {
    "region": "fr-par",
    "hosting_id": "hosting-uuid"
  }
}
```

### Restore a Deleted Hosting

```json
{
  "tool": "scaleway_webhosting_restore_hosting",
  "arguments": {
    "region": "fr-par",
    "hosting_id": "hosting-uuid"
  }
}
```

### Get DNS Records

```json
{
  "tool": "scaleway_webhosting_get_dns_records",
  "arguments": {
    "region": "fr-par",
    "hosting_id": "hosting-uuid"
  }
}
```

### List Offers

```json
{
  "tool": "scaleway_webhosting_list_offers",
  "arguments": {
    "region": "fr-par",
    "without_options": true
  }
}
```

### List Control Panels

```json
{
  "tool": "scaleway_webhosting_list_control_panels",
  "arguments": {
    "region": "fr-par"
  }
}
```
