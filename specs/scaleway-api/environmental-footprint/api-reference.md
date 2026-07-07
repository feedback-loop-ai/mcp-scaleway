# Scaleway Environmental Footprint API Reference

Official reference: https://www.scaleway.com/en/developers/api/environmental-footprint/user-api/

Base URL: `https://api.scaleway.com/environmental-footprint/v1alpha1`

Shapes verified against the generated Scaleway Go SDK
(`scaleway-sdk-go` `api/environmental_footprint/v1alpha1`), which is generated
directly from the official API definition.

Tools live in `src/tools/environmental-footprint/`. Each endpoint below is
annotated with the MCP tool that invokes it. Verified against the
implementation in `src/tools/environmental-footprint/handlers.ts`.

## Scope

- **Global / Organization-scoped.** There is no `{region}` or `{zone}` segment
  in the path; the Organization is selected via the `organization_id` query
  parameter (or the Organization tied to the credentials when omitted).
- **API status**: `v1alpha1` (alpha).
- **Read-only product**: the API only exposes data retrieval and report
  download; there are no create/update/delete operations.

## Authentication

- Header: `X-Auth-Token: <secret_key>`

## Data Types

### Impact
- `kg_co2_equivalent` (number) — estimated carbon emissions in kilograms of CO₂
  equivalent (kgCO₂e)
- `m3_water_usage` (number) — estimated water consumption in cubic meters (m³)

### SkuImpact
- `sku` (string) — unique ID of the combination of product, region and zone
- `total_sku_impact` (Impact | null)
- `service_category` (enum ServiceCategory)
- `product_category` (enum ProductCategory)

### ZoneImpact
- `zone` (string) — zone ID (e.g. `fr-par-1`)
- `total_zone_impact` (Impact | null)
- `skus` (SkuImpact[])

### RegionImpact
- `region` (string) — region ID (e.g. `fr-par`)
- `total_region_impact` (Impact | null)
- `zones` (ZoneImpact[])
- `skus` (SkuImpact[])

### ProjectImpact
- `project_id` (string)
- `total_project_impact` (Impact | null)
- `regions` (RegionImpact[])

## Endpoints

### Retrieve detailed impact data — `scaleway_environmental_footprint_get_impact_data`
`GET /data/query`

Retrieve detailed estimated impact data for your projects within a date range,
filtered by project ID, region, zone, service category, and/or product
category.

- Query parameters:
  - `organization_id` (string, optional) — defaults to the credentials'
    Organization
  - `start_date` (RFC 3339 datetime, optional) — inclusive
  - `end_date` (RFC 3339 datetime, optional) — exclusive; defaults to today
  - `regions` (string[], optional) — repeated query param, e.g. `fr-par`
  - `zones` (string[], optional) — repeated query param, e.g. `fr-par-1`
  - `project_ids` (string[], optional) — repeated query param
  - `service_categories` (ServiceCategory[], optional) — repeated query param
  - `product_categories` (ProductCategory[], optional) — repeated query param
- Response `ImpactDataResponse`:
  - `start_date` (datetime | null) — inclusive
  - `end_date` (datetime | null) — exclusive
  - `total_impact` (Impact | null)
  - `projects` (ProjectImpact[])

### List available reports — `scaleway_environmental_footprint_get_report_availability`
`GET /reports/availability`

Return a list of dates for which impact reports are available.

- Query parameters:
  - `organization_id` (string, optional)
  - `start_date` (RFC 3339 datetime, optional) — inclusive
  - `end_date` (RFC 3339 datetime, optional) — inclusive; defaults to today
- Response `ImpactReportAvailability`:
  - `month_summary_reports` (datetime[]) — calendar months with an available
    report
  - `yearly_summary_reports` (datetime[]) — calendar years with an available
    report

### Download report — `scaleway_environmental_footprint_download_impact_report`
`POST /reports/download`

Download a Scaleway impact PDF report with detailed impact data for your
projects. The response is the report file (PDF) content.

- Body:
  - `organization_id` (string, optional)
  - `date` (RFC 3339 datetime, required) — start date of the report period
  - `type` (enum ReportType, required) — `monthly` or `yearly`
- Response: file (`scw.File` — PDF content). The MCP tool returns the raw
  response payload.

## Enums

### ServiceCategory
`unknown_service_category`, `baremetal`, `compute`, `storage`, `network`,
`containers`, `databases`, `ai`

### ProductCategory
`unknown_product_category`, `apple_silicon`, `block_storage`, `dedibox`,
`elastic_metal`, `instances`, `object_storage`, `load_balancer`, `kubernetes`,
`managed_relational_databases`, `managed_mongodb`, `managed_redis`,
`managed_inference`, `generative_apis`

### ReportType
`unknown_report_type`, `monthly`, `yearly`

## Pagination

None. All endpoints return aggregate documents (not paginated collections);
there are no `page` / `page_size` parameters.

## Error Codes

- 400: Invalid input (malformed dates, invalid filter values)
- 401/403: Permission denied (missing/insufficient IAM permissions)
- 404: Not found (no report for the requested period)
- 429: Rate limited
- 500: Server error
