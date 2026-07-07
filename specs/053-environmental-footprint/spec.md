# 053-environmental-footprint: Environmental Footprint API

## Overview
MCP tools for the Scaleway Environmental Footprint API (User API, `v1alpha1`).
A read-only, Organization-scoped (global) API that quantifies the estimated
environmental impact — carbon emissions (kgCO₂e) and water usage (m³) — of using
Scaleway services, and exposes downloadable impact reports.

**Status**: Implemented.

## User Stories

### P1 - Retrieve detailed impact data
- As a user, I can retrieve estimated environmental impact data (carbon
  emissions and water usage) for my Organization across a date range.
- As a user, I can filter impact data by project ID, region, zone, service
  category, and/or product category.

### P2 - Discover available reports
- As a user, I can list the calendar months and years for which impact reports
  are available.

### P3 - Download impact reports
- As a user, I can download a monthly or yearly impact PDF report for a given
  period.

## Acceptance Scenarios

1. **Given** valid credentials, **when** I call `get_impact_data` with no
   filters, **then** I receive the total estimated impact and a per-project
   breakdown for the default date range.
2. **Given** a date range and a set of filters (regions, product categories),
   **when** I call `get_impact_data`, **then** the response is restricted to the
   requested scope and each array filter is sent as a repeated query parameter.
3. **Given** valid credentials, **when** I call `get_report_availability`,
   **then** I receive the lists of months and years with available reports.
4. **Given** a `date` and `type` (`monthly`/`yearly`), **when** I call
   `download_impact_report`, **then** the report file payload is returned.
5. **Given** an invalid region/zone/category value, **when** I call
   `get_impact_data`, **then** the request is rejected by Zod validation before
   any API call.

## Entities

### Impact
- kg_co2_equivalent: number — carbon emissions in kilograms of CO₂ equivalent
- m3_water_usage: number — water consumption in cubic meters

### ProjectImpact / RegionImpact / ZoneImpact / SkuImpact
Nested breakdown of `Impact` per project → region → zone → SKU, each carrying a
`total_*_impact` aggregate.

### ImpactReportAvailability
- month_summary_reports: string[] (ISO datetimes)
- yearly_summary_reports: string[] (ISO datetimes)

## Tools

| Tool | HTTP | Priority |
|------|------|----------|
| scaleway_environmental_footprint_get_impact_data | GET /environmental-footprint/v1alpha1/data/query | P1 |
| scaleway_environmental_footprint_get_report_availability | GET /environmental-footprint/v1alpha1/reports/availability | P2 |
| scaleway_environmental_footprint_download_impact_report | POST /environmental-footprint/v1alpha1/reports/download | P3 |

## Functional Requirements

- FR-001: Retrieve impact data for an Organization over a date range with
  optional project/region/zone/service-category/product-category filters.
- FR-002: List available monthly and yearly impact reports over a date range.
- FR-003: Download a monthly or yearly impact report for a given date.
- FR-004: All tool inputs are validated with Zod schemas (UUID, region/zone
  format, ISO datetime, enum membership).
- FR-005: All errors are mapped to structured MCP error responses.
- FR-006: Array filters are serialized as repeated query parameters.

## Out of Scope

- **`GET /organization/enabled` and `POST /organization/enabled`** (feature
  enable/disable) and **`GET /usage/dashboard/metrics`**: these appear in the
  console/dashboard-oriented surface of the product and are not part of the
  documented public "User API" read/report workflow this vertical targets. They
  are administrative toggles rather than footprint data retrieval, so they are
  excluded to keep the vertical focused on impact reporting. They can be added
  later if a stable public contract is confirmed.
- No create/update/delete operations: the Environmental Footprint API is
  read-only (data retrieval + report download only).
