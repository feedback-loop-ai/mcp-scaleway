# 052-audit-trail: Audit Trail API (Beta)

**Status**: Implemented
**API**: `audit-trail` `v1alpha1` (Beta) — regional (`fr-par`, `nl-ams`, `pl-waw`)

## Overview

MCP tools for the Scaleway Audit Trail API. Audit Trail records the activity performed on an
organization's Scaleway resources: for each API call it captures the principal (user/application),
timestamp, source IP, product/service/method invoked, affected resources, and the request status.
This vertical exposes reading those events, discovering which products feed Audit Trail, and
managing the export jobs that ship events to Object Storage.

## User Stories

### P1 - Query audit events (US1)
- As a security/compliance engineer, I can list audit events for my organization and filter them by
  resource type, API method, HTTP status, date range, principal, product/service, resource ID, and
  source IP so I can investigate who did what and when.
- As a user, I can page through large result sets using the returned cursor (`next_page_token`).

### P2 - Discover integrated products (US2)
- As a user, I can list the Scaleway products integrated with Audit Trail and the services/methods
  each one tracks, so I know what is auditable and how to filter events.

### P3 - Manage export jobs (US3)
- As an organization administrator, I can list, create, and delete export jobs that continuously
  export audit events to a Scaleway Object Storage (S3) bucket for long-term retention.

## Acceptance Scenarios

1. **List events (happy path)**: Given a valid organization ID and region, when I call
   `scaleway_audit_trail_list_events`, then I receive an `events` array and an optional
   `next_page_token`.
2. **Filtered events**: Given filters (e.g. `resourceType=instance_server`, `status=403`,
   `recordedAfter`), when I list events, then only matching events are requested from the API.
3. **List products**: Given a valid organization ID, when I call
   `scaleway_audit_trail_list_products`, then I receive `products` with their services and methods.
4. **Create export job**: Given an org, a name, and an S3 destination, when I call
   `scaleway_audit_trail_create_export_job`, then an export job is created.
5. **Delete export job**: Given an export job ID, when I call
   `scaleway_audit_trail_delete_export_job`, then the job is deleted and a confirmation is returned.
6. **Error mapping**: Given the API returns 401/403/404/429/500, when any tool is called, then a
   structured MCP error response with the mapped error type is returned.

## Functional Requirements

- **FR-001**: List audit events with cursor pagination and the full filter set (organization_id
  [required], project_id, resource_type, method_name, status, recorded_after, recorded_before,
  product_name, service_name, resource_id, principal_id, source_ip, order_by, page_size, page_token).
- **FR-002**: List Audit Trail products for an organization (organization_id required).
- **FR-003**: List export jobs with offset pagination and optional filters (name, tags, order_by).
- **FR-004**: Create an export job with an Object Storage (S3) destination (bucket, region,
  optional prefix, optional project_id) and optional tags.
- **FR-005**: Delete an export job by ID.
- **FR-006**: All tools accept a `region` parameter validated against the regional locality.
- **FR-007**: All inputs are validated with Zod schemas; `organizationId` is required where the API
  requires it.
- **FR-008**: All errors are mapped to structured MCP error responses.
- **FR-009**: 100% line and branch coverage; every tool has a contract test referencing
  `specs/scaleway-api/audit-trail/api-reference.md`.

## Entities

See `data-model.md`. Primary entities: `Event`, `Resource`, `Product`/`ProductService`,
`ExportJob`/`ExportJobS3`.

## Tools

| Tool | HTTP | Priority |
|------|------|----------|
| scaleway_audit_trail_list_events | GET /audit-trail/v1alpha1/regions/{region}/events | P1 |
| scaleway_audit_trail_list_products | GET /audit-trail/v1alpha1/regions/{region}/products | P2 |
| scaleway_audit_trail_list_export_jobs | GET /audit-trail/v1alpha1/regions/{region}/export-jobs | P3 |
| scaleway_audit_trail_create_export_job | POST /audit-trail/v1alpha1/regions/{region}/export-jobs | P3 |
| scaleway_audit_trail_delete_export_job | DELETE /audit-trail/v1alpha1/regions/{region}/export-jobs/{export_job_id} | P3 |

## Out of Scope

- **Authentication events / system events / combined events** (`GET .../authentication-events`,
  `.../system-events`, `.../combined-events`): these are additional read surfaces whose exact
  request/response shapes were not confirmed to the same depth as the core `events` endpoint. They
  can be added in a follow-up once verified; the primary `events` endpoint already covers the core
  "who did what" use case.
- **Alert rules** (`GET/PATCH .../alert-rules`, enable/disable): configuration surface for Cockpit
  alerting on audit activity, not part of the read-focused audit-query vertical.
- **Export job update/get**: the API centers export jobs on create/list/delete; no stable
  get/update endpoint was confirmed, so only create/list/delete are exposed.

These exclusions keep the vertical to endpoints whose shapes are verified against the Scaleway SDK.
