# Data Model: Scaleway Audit Trail MCP Tools

**Feature**: 052-audit-trail | **Date**: 2026-07-07

## Entities

### Event

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | yes | Event identifier |
| recorded_at | string (RFC3339) | no | When the event was recorded |
| locality | string | yes | Locality of the resource (e.g. `fr-par`, `global`) |
| principal | EventPrincipal | no | Identity that performed the action |
| organization_id | string (UUID) | yes | Organization |
| project_id | string (UUID) | no | Project (nullable) |
| source_ip | string | yes | Source IP of the request |
| user_agent | string | no | User agent (nullable) |
| product_name | string | yes | Scaleway product |
| service_name | string | yes | API service |
| method_name | string | yes | API method invoked |
| resources | Resource[] | yes | Resources affected by the action |
| request_id | string | yes | Request correlation ID |
| request_body | object | no | Request payload (nullable) |
| status_code | number | yes | HTTP status code of the request |

### EventPrincipal

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | yes | Principal (user/application) ID |

### Resource

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | yes | Resource ID |
| type | ResourceType (enum) | yes | Resource type |
| name | string | no | Resource name (nullable) |
| created_at | string (RFC3339) | no | Creation time (nullable) |
| updated_at | string (RFC3339) | no | Update time (nullable) |
| deleted_at | string (RFC3339) | no | Deletion time (nullable) |

> The API also attaches one product-specific `*_info` object per resource (a oneof, e.g.
> `instance_server_info`). The schema tolerates that extra key (unknown keys are stripped).

### Product / ProductService

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Product.title | string | yes | Human-readable product title |
| Product.name | string | yes | Product name (filter value for `product_name`) |
| Product.services | ProductService[] | yes | Services tracked for the product |
| ProductService.name | string | yes | Service name |
| ProductService.methods | string[] | yes | Tracked method names |

### ExportJob / ExportJobS3

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| ExportJob.id | string (UUID) | yes | Export job ID |
| ExportJob.organization_id | string (UUID) | yes | Organization |
| ExportJob.name | string | yes | Job name |
| ExportJob.s3 | ExportJobS3 | no | Destination bucket configuration (nullable) |
| ExportJob.created_at | string (RFC3339) | no | Creation time (nullable) |
| ExportJob.last_run_at | string (RFC3339) | no | Last run time (nullable) |
| ExportJob.tags | string[] | yes | Tags |
| ExportJob.last_status | `{ status_code: string }` | no | Last run status (nullable) |
| ExportJobS3.bucket | string | yes | Object Storage bucket name |
| ExportJobS3.region | string | yes | Object Storage bucket region |
| ExportJobS3.prefix | string | no | Optional key prefix |
| ExportJobS3.project_id | string (UUID) | no | Project owning the bucket |

## Enums

- **ResourceType**: see `specs/scaleway-api/audit-trail/api-reference.md#resourcetype` (81 values).
- **ListEventsOrderBy**: `recorded_at_desc`, `recorded_at_asc`.
- **ListExportJobsOrderBy**: `created_at_asc`, `created_at_desc`.
