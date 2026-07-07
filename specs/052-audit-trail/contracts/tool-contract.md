# Tool Contracts: Scaleway Audit Trail MCP Tools

**Feature**: 052-audit-trail | **Date**: 2026-07-07

## scaleway_audit_trail_list_events

**Scaleway API**: `GET /audit-trail/v1alpha1/regions/{region}/events`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | yes | - | Region (fr-par, nl-ams, pl-waw) |
| organizationId | string (UUID) | yes | - | Organization to list events for |
| projectId | string (UUID) | no | - | Filter by project |
| resourceType | enum | no | - | Filter by resource type |
| methodName | string | no | - | Filter by API method name |
| status | number | no | - | Filter by request HTTP status code |
| recordedAfter | string (RFC3339) | no | - | Events recorded after |
| recordedBefore | string (RFC3339) | no | - | Events recorded before |
| productName | string | no | - | Filter by product name |
| serviceName | string | no | - | Filter by service name |
| resourceId | string | no | - | Filter by resource ID |
| principalId | string | no | - | Filter by principal ID |
| sourceIp | string | no | - | Filter by source IP |
| orderBy | enum | no | recorded_at_desc | recorded_at_desc / recorded_at_asc |
| pageSize | number | no | - | Events per page (1-100) |
| pageToken | string | no | - | Pagination cursor |

**Output**: `{ events: Event[], next_page_token?: string }` (raw API response; cursor pagination)

---

## scaleway_audit_trail_list_products

**Scaleway API**: `GET /audit-trail/v1alpha1/regions/{region}/products`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Region |
| organizationId | string (UUID) | yes | Organization |

**Output**: `{ products: Product[], total_count: number }` (raw API response; no pagination params)

---

## scaleway_audit_trail_list_export_jobs

**Scaleway API**: `GET /audit-trail/v1alpha1/regions/{region}/export-jobs`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | yes | - | Region |
| organizationId | string (UUID) | yes | - | Organization |
| name | string | no | - | Filter by name |
| tags | string[] | no | - | Filter by tags |
| orderBy | enum | no | - | created_at_asc / created_at_desc |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |

**Output**: `{ items: ExportJob[], totalCount: number, page: number, pageSize: number }`

---

## scaleway_audit_trail_create_export_job

**Scaleway API**: `POST /audit-trail/v1alpha1/regions/{region}/export-jobs`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Region |
| organizationId | string (UUID) | yes | Organization |
| name | string | yes | Export job name |
| s3Bucket | string | yes | Destination Object Storage bucket |
| s3Region | string | yes | Region of the destination bucket |
| s3Prefix | string | no | Key prefix within the bucket |
| s3ProjectId | string (UUID) | no | Project owning the bucket |
| tags | string[] | no | Tags for the export job |

**Request body**: `{ organization_id, name, s3: { bucket, region, prefix?, project_id? }, tags? }`

**Output**: `ExportJob` object.

---

## scaleway_audit_trail_delete_export_job

**Scaleway API**: `DELETE /audit-trail/v1alpha1/regions/{region}/export-jobs/{export_job_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Region |
| exportJobId | string (UUID) | yes | Export job ID |

**Output**: `{ deleted: true, id: string }`
