# Quickstart: Scaleway Environmental Footprint MCP Tools

**Feature**: 053-environmental-footprint | **Date**: 2026-07-07

## Prerequisites

1. Set environment variables:
   ```bash
   export SCW_ACCESS_KEY="your-access-key"
   export SCW_SECRET_KEY="your-secret-key"
   export SCW_DEFAULT_ORGANIZATION_ID="your-organization-id"
   ```

2. Start the MCP server:
   ```bash
   bun run start
   ```

## Usage Examples

### Retrieve impact data (whole Organization, default range)

```json
{
  "tool": "scaleway_environmental_footprint_get_impact_data",
  "arguments": {}
}
```

### Retrieve impact data for a period, filtered

```json
{
  "tool": "scaleway_environmental_footprint_get_impact_data",
  "arguments": {
    "organizationId": "11111111-1111-1111-1111-111111111111",
    "startDate": "2025-05-01T00:00:00Z",
    "endDate": "2025-06-01T00:00:00Z",
    "regions": ["fr-par", "nl-ams"],
    "zones": ["fr-par-1"],
    "projectIds": ["22222222-2222-2222-2222-222222222222"],
    "serviceCategories": ["compute", "storage"],
    "productCategories": ["instances"]
  }
}
```

### List available reports

```json
{
  "tool": "scaleway_environmental_footprint_get_report_availability",
  "arguments": {
    "startDate": "2025-01-01T00:00:00Z",
    "endDate": "2025-06-01T00:00:00Z"
  }
}
```

### Download a monthly report

```json
{
  "tool": "scaleway_environmental_footprint_download_impact_report",
  "arguments": {
    "date": "2025-05-01T00:00:00Z",
    "type": "monthly"
  }
}
```

### Download a yearly report

```json
{
  "tool": "scaleway_environmental_footprint_download_impact_report",
  "arguments": {
    "organizationId": "11111111-1111-1111-1111-111111111111",
    "date": "2025-01-01T00:00:00Z",
    "type": "yearly"
  }
}
```
