# Scaleway Audit Trail API Reference

Base URL: `https://api.scaleway.com/audit-trail/v1alpha1/regions/{region}`

- **API slug**: `audit-trail`
- **Version**: `v1alpha1` (Beta)
- **Locality**: Regional. Regions: `fr-par`, `nl-ams`, `pl-waw`
- **Source**: <https://www.scaleway.com/en/developers/api/audit-trail/> and the Scaleway Go SDK
  (`api/audit_trail/v1alpha1`), used to confirm exact request/response shapes.

## Authentication

- Header: `X-Auth-Token: <secret_key>`
- IAM permission set: `AuditTrailReadOnly` (read) / `OrganizationManager` (management), scoped at
  organization level.

## Events

### List Events
`GET /events`

Query parameters:

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| organization_id | string (UUID) | yes | Organization to list events for |
| project_id | string (UUID) | no | Filter by project |
| resource_type | ResourceType (enum) | no | Filter by resource type |
| method_name | string | no | Filter by API method name |
| status | uint32 | no | Filter by HTTP status code of the request |
| recorded_after | RFC3339 timestamp | no | Only events recorded after |
| recorded_before | RFC3339 timestamp | no | Only events recorded before |
| product_name | string | no | Filter by Scaleway product name |
| service_name | string | no | Filter by API service name |
| resource_id | string | no | Filter by a specific resource ID |
| principal_id | string | no | Filter by principal (user/application) ID |
| source_ip | string | no | Filter by source IP address |
| order_by | enum | no | `recorded_at_desc` (default), `recorded_at_asc` |
| page_size | uint32 | no | Number of events per page (1-100) |
| page_token | string | no | Pagination cursor |

**Pagination**: cursor-based. Response returns `next_page_token`; pass it back as `page_token`.
There is **no** `total_count` on this endpoint.

Response: `{ events: Event[], next_page_token?: string }`

`Event`:

| Field | Type | Description |
|-------|------|-------------|
| id | string | Event ID |
| recorded_at | RFC3339 timestamp | When the event was recorded |
| locality | string | Locality of the resource (e.g. `fr-par`, `global`) |
| principal | `{ id: string }` | Identity that performed the action |
| organization_id | string (UUID) | Organization |
| project_id | string (UUID) | Project (nullable) |
| source_ip | string | Source IP of the request |
| user_agent | string | User agent (nullable) |
| product_name | string | Scaleway product |
| service_name | string | API service |
| method_name | string | API method invoked |
| resources | Resource[] | Resources affected by the action |
| request_id | string | Request correlation ID |
| request_body | object | Request payload (nullable) |
| status_code | uint32 | HTTP status code of the request |

`Resource`: `{ id, type (ResourceType), name?, created_at?, updated_at?, deleted_at? }` plus one
product-specific `*_info` object (a oneof, e.g. `instance_server_info`, `secm_secret_info`). The
MCP schema keeps the common fields and tolerates the extra `*_info` key.

## Products

### List Products
`GET /products`

Query parameters:

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| organization_id | string (UUID) | yes | Organization to list integrated products for |

**Pagination**: none. Response includes `total_count`.

Response: `{ products: Product[], total_count: number }`

- `Product`: `{ title: string, name: string, services: ProductService[] }`
- `ProductService`: `{ name: string, methods: string[] }`

## Export Jobs

Scheduled exports of audit events to a Scaleway Object Storage (S3) bucket.

### List Export Jobs
`GET /export-jobs`

Query parameters:

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| organization_id | string (UUID) | yes | Organization |
| name | string | no | Filter by name |
| tags | string[] | no | Filter by tags |
| order_by | enum | no | `created_at_asc`, `created_at_desc` |
| page | int32 | no | Page number (1-indexed) |
| page_size | uint32 | no | Items per page (1-100) |

**Pagination**: offset-based (`page` / `page_size`). Response includes `total_count`.

Response: `{ export_jobs: ExportJob[], total_count: number }`

`ExportJob`:

| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Export job ID |
| organization_id | string (UUID) | Organization |
| name | string | Job name |
| s3 | ExportJobS3 | Destination bucket configuration |
| created_at | RFC3339 timestamp | Creation time |
| last_run_at | RFC3339 timestamp | Last successful run (nullable) |
| tags | string[] | Tags |
| last_status | `{ status_code: string }` | Last run status (nullable) |

`ExportJobS3`: `{ bucket: string, region: string, prefix?: string, project_id?: string (UUID) }`

### Create Export Job
`POST /export-jobs`

Body:
```json
{
  "organization_id": "<uuid>",
  "name": "nightly-export",
  "s3": { "bucket": "audit-bucket", "region": "fr-par", "prefix": "logs/", "project_id": "<uuid>" },
  "tags": ["prod"]
}
```
Response: `ExportJob` object.

### Delete Export Job
`DELETE /export-jobs/{export_job_id}`

Response: empty (204).

## Error Codes

- 400: Invalid input
- 401 / 403: Permission denied (missing `AuditTrailReadOnly`/`OrganizationManager`)
- 404: Not found
- 429: Rate limited
- 500: Server error

## Enums

### ResourceType
`unknown_type`, `secm_secret`, `secm_secret_version`, `kube_cluster`, `kube_pool`, `kube_node`,
`kube_acl`, `keym_key`, `iam_user`, `iam_application`, `iam_group`, `iam_policy`, `iam_api_key`,
`iam_ssh_key`, `iam_rule`, `iam_saml`, `iam_saml_certificate`, `iam_scim`, `iam_scim_token`,
`secret_manager_secret`, `secret_manager_version`, `key_manager_key`, `account_user`,
`account_organization`, `account_project`, `account_contract_signature`, `instance_server`,
`instance_placement_group`, `instance_security_group`, `instance_volume`, `instance_snapshot`,
`instance_image`, `instance_template`, `apple_silicon_server`, `baremetal_server`,
`baremetal_setting`, `ipam_ip`, `sbs_volume`, `sbs_snapshot`, `load_balancer_lb`,
`load_balancer_ip`, `load_balancer_frontend`, `load_balancer_backend`, `load_balancer_route`,
`load_balancer_acl`, `load_balancer_certificate`, `sfs_filesystem`, `vpc_private_network`,
`vpc_vpc`, `vpc_subnet`, `vpc_route`, `vpc_acl`, `edge_services_plan`, `edge_services_pipeline`,
`edge_services_dns_stage`, `edge_services_tls_stage`, `edge_services_cache_stage`,
`edge_services_route_stage`, `edge_services_route_rules`, `edge_services_waf_stage`,
`edge_services_backend_stage`, `s2s_vpn_gateway`, `s2s_customer_gateway`, `s2s_routing_policy`,
`s2s_connection`, `vpc_gw_gateway`, `vpc_gw_gateway_network`, `vpc_gw_dhcp`, `vpc_gw_dhcp_entry`,
`vpc_gw_pat_rule`, `vpc_gw_ip`, `audit_trail_export_job`, `rdb_instance`, `rdb_instance_backup`,
`rdb_instance_endpoint`, `rdb_instance_logs`, `rdb_instance_read_replica`, `rdb_instance_snapshot`

### ListEventsRequestOrderBy
`recorded_at_desc`, `recorded_at_asc`

### ListExportJobsRequestOrderBy
`created_at_asc`, `created_at_desc`

## Not exposed by the MCP server (see spec Out of Scope)

The API also exposes `authentication-events`, `system-events`, `combined-events`, and alert-rule
management (`alert-rules` GET/PATCH + enable/disable). These are omitted from the initial vertical;
see `specs/052-audit-trail/spec.md`.
