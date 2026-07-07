# Research: Scaleway Audit Trail MCP Tools

**Feature**: 052-audit-trail | **Date**: 2026-07-07

## Sources

- Official API reference: <https://www.scaleway.com/en/developers/api/audit-trail/>
- Scaleway Go SDK `api/audit_trail/v1alpha1` (used to confirm exact request/response structs,
  query-parameter names, pagination style, and enum values — the developer portal renders as a SPA
  and does not expose full field-level detail cleanly).
- Product documentation: <https://www.scaleway.com/en/docs/audit-trail/>

## Key Decisions

### API slug, version, locality
- Slug: `audit-trail`; version: `v1alpha1` (Beta); **regional** API. Regions: `fr-par`, `nl-ams`,
  `pl-waw`. Base path: `/audit-trail/v1alpha1/regions/{region}`.

### Organization scoping
- `organization_id` is a **required** parameter on `ListEvents`, `ListProducts`, `ListExportJobs`,
  and `CreateExportJob` (non-pointer `string` in the SDK request structs). The MCP schemas therefore
  make `organizationId` required for those tools. `DeleteExportJob` is keyed only by
  `export_job_id` + region.

### Pagination differs per endpoint (important)
- **Events**: cursor-based. Request takes `page_size` + `page_token`; response returns
  `next_page_token` and has **no** `total_count`. The handler returns the raw response
  (`{ events, next_page_token }`) rather than the offset-style `buildPaginatedResponse` wrapper,
  because there is no total count and paging is by opaque cursor.
- **Products**: no pagination parameters; response carries `total_count`. Handler returns the raw
  `{ products, total_count }`.
- **Export jobs**: offset-based (`page` / `page_size`) with `total_count`. Handler uses the shared
  `buildPaginatedResponse` helper (items / totalCount / page / pageSize), consistent with other
  list tools in the repo.

### Read-vs-write scope
- Audit Trail is primarily an observability/read product. The verified, stable write surface is
  export-job **create** and **delete** (S3 destination config). Alert rules and the auxiliary event
  streams (authentication/system/combined events) were left out of scope (see spec Out of Scope)
  to avoid shipping endpoints whose shapes are not confirmed against the SDK.

### Resource oneof handling
- Each `Event.resources[]` entry carries common fields (`id`, `type`, `name`, `created_at`,
  `updated_at`, `deleted_at`) plus exactly one product-specific `*_info` oneof object
  (e.g. `instance_server_info`). Enumerating all oneofs in Zod adds no validation value for a
  read-through proxy, so the `Resource` schema validates the common fields and tolerates the extra
  `*_info` key (Zod strips unknown keys instead of rejecting). This is asserted in the contract test.

### Filters
- `ListEvents` filters map 1:1 to query params: `organization_id`, `project_id`, `resource_type`,
  `method_name`, `status` (HTTP status code as `uint32`), `recorded_after`, `recorded_before`,
  `product_name`, `service_name`, `resource_id`, `principal_id`, `source_ip`, `order_by`,
  `page_size`, `page_token`. `order_by` supports `recorded_at_desc` (default) / `recorded_at_asc`.

### Client & error handling
- Reuses the repo conventions: `loadAuthConfig()` + `createScalewayClient()`, `client.fetch<T>()`
  with `urlParams(...)` from `@scaleway/sdk-client`, and `mapScalewayError` / `formatErrorResponse`
  from `src/shared/errors.ts`. Auth via `X-Auth-Token` handled by the shared client.

## Open items / ambiguities resolved
- `status` is the request's HTTP status code filter (a number), not a lifecycle enum — modeled as an
  optional integer.
- `ExportJobS3.region` is the Object Storage bucket region and may differ from the Audit Trail query
  region; modeled as a separate `s3Region` input.
