# Tool Contracts: Scaleway Environmental Footprint MCP Tools

**Feature**: 053-environmental-footprint | **Date**: 2026-07-07

Base path: `/environmental-footprint/v1alpha1` (Organization-scoped / global).

## Impact Data Tools

### scaleway_environmental_footprint_get_impact_data

**Scaleway API**: `GET /environmental-footprint/v1alpha1/data/query`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| organizationId | string (UUID) | no | credentials' Org | Organization to query |
| startDate | string (ISO 8601 datetime) | no | - | Start date (inclusive) |
| endDate | string (ISO 8601 datetime) | no | today | End date (exclusive) |
| regions | string[] (region format) | no | all | Filter by regions |
| zones | string[] (zone format) | no | all | Filter by zones |
| projectIds | string[] (UUID) | no | all | Filter by project IDs |
| serviceCategories | ServiceCategory[] | no | all | Filter by service categories |
| productCategories | ProductCategory[] | no | all | Filter by product categories |

**Output**: `{ start_date, end_date, total_impact: { kg_co2_equivalent, m3_water_usage } | null, projects: ProjectImpact[] }`

---

### scaleway_environmental_footprint_get_report_availability

**Scaleway API**: `GET /environmental-footprint/v1alpha1/reports/availability`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| organizationId | string (UUID) | no | credentials' Org | Organization to query |
| startDate | string (ISO 8601 datetime) | no | - | Start of search period (inclusive) |
| endDate | string (ISO 8601 datetime) | no | today | End of search period (inclusive) |

**Output**: `{ month_summary_reports: string[], yearly_summary_reports: string[] }`

---

### scaleway_environmental_footprint_download_impact_report

**Scaleway API**: `POST /environmental-footprint/v1alpha1/reports/download`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| organizationId | string (UUID) | no | Organization for the report (defaults to credentials' Org) |
| date | string (ISO 8601 datetime) | yes | Start date of the report period |
| type | enum (`monthly`, `yearly`) | yes | Report type |

**Output**: report file (PDF) payload as returned by the API.
