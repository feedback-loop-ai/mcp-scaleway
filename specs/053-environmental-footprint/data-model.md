# Data Model: Scaleway Environmental Footprint MCP Tools

**Feature**: 053-environmental-footprint | **Date**: 2026-07-07

## Entities

### Impact

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| kg_co2_equivalent | number | yes | Estimated carbon emissions in kilograms of CO₂ equivalent (kgCO₂e) |
| m3_water_usage | number | yes | Estimated water consumption in cubic meters (m³) |

### SkuImpact

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| sku | string | yes | Unique ID of the product+region+zone combination |
| total_sku_impact | Impact \| null | yes | Total estimated impact for this SKU |
| service_category | enum ServiceCategory | yes | Service category of the SKU |
| product_category | enum ProductCategory | yes | Product category of the SKU |

### ZoneImpact

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| zone | string | yes | Zone ID (e.g. fr-par-1) |
| total_zone_impact | Impact \| null | yes | Total estimated impact for this zone |
| skus | SkuImpact[] | yes | Per-SKU impact for this zone |

### RegionImpact

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Region ID (e.g. fr-par) |
| total_region_impact | Impact \| null | yes | Total estimated impact for this region |
| zones | ZoneImpact[] | yes | Per-zone impact |
| skus | SkuImpact[] | yes | Per-SKU impact for this region |

### ProjectImpact

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| project_id | string | yes | Project ID |
| total_project_impact | Impact \| null | yes | Total estimated impact for this project |
| regions | RegionImpact[] | yes | Per-region impact |

### ImpactDataResponse

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| start_date | string \| null | yes | Start of the impact period (inclusive) |
| end_date | string \| null | yes | End of the impact period (exclusive) |
| total_impact | Impact \| null | yes | Total estimated impact across all projects |
| projects | ProjectImpact[] | yes | Per-project impact breakdown |

### ImpactReportAvailability

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| month_summary_reports | string[] | yes | Calendar months with an available report (ISO datetimes) |
| yearly_summary_reports | string[] | yes | Calendar years with an available report (ISO datetimes) |

## Enums

### ServiceCategory
unknown_service_category, baremetal, compute, storage, network, containers,
databases, ai

### ProductCategory
unknown_product_category, apple_silicon, block_storage, dedibox, elastic_metal,
instances, object_storage, load_balancer, kubernetes,
managed_relational_databases, managed_mongodb, managed_redis, managed_inference,
generative_apis

### ReportType
unknown_report_type, monthly, yearly
