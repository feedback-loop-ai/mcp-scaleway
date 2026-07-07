# Quickstart: Scaleway Audit Trail MCP Tools

**Feature**: 052-audit-trail | **Date**: 2026-07-07

## Prerequisites

1. Set environment variables (the API key needs `AuditTrailReadOnly` or `OrganizationManager`):
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

### List recent audit events

```json
{
  "tool": "scaleway_audit_trail_list_events",
  "arguments": {
    "region": "fr-par",
    "organizationId": "11111111-1111-1111-1111-111111111111",
    "orderBy": "recorded_at_desc",
    "pageSize": 50
  }
}
```

### Investigate failed Instance actions in a date range

```json
{
  "tool": "scaleway_audit_trail_list_events",
  "arguments": {
    "region": "fr-par",
    "organizationId": "11111111-1111-1111-1111-111111111111",
    "productName": "instance",
    "resourceType": "instance_server",
    "status": 403,
    "recordedAfter": "2026-06-01T00:00:00Z",
    "recordedBefore": "2026-07-01T00:00:00Z"
  }
}
```

### Page through events with the cursor

```json
{
  "tool": "scaleway_audit_trail_list_events",
  "arguments": {
    "region": "fr-par",
    "organizationId": "11111111-1111-1111-1111-111111111111",
    "pageToken": "<next_page_token from previous response>"
  }
}
```

### List integrated products

```json
{
  "tool": "scaleway_audit_trail_list_products",
  "arguments": {
    "region": "fr-par",
    "organizationId": "11111111-1111-1111-1111-111111111111"
  }
}
```

### Create an export job to Object Storage

```json
{
  "tool": "scaleway_audit_trail_create_export_job",
  "arguments": {
    "region": "fr-par",
    "organizationId": "11111111-1111-1111-1111-111111111111",
    "name": "nightly-audit-export",
    "s3Bucket": "my-audit-bucket",
    "s3Region": "fr-par",
    "s3Prefix": "audit-trail/",
    "tags": ["compliance"]
  }
}
```

### List export jobs

```json
{
  "tool": "scaleway_audit_trail_list_export_jobs",
  "arguments": {
    "region": "fr-par",
    "organizationId": "11111111-1111-1111-1111-111111111111",
    "page": 1,
    "pageSize": 20
  }
}
```

### Delete an export job

```json
{
  "tool": "scaleway_audit_trail_delete_export_job",
  "arguments": {
    "region": "fr-par",
    "exportJobId": "22222222-2222-2222-2222-222222222222"
  }
}
```
