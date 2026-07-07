# Research: Scaleway Environmental Footprint MCP Tools

**Feature**: 053-environmental-footprint | **Date**: 2026-07-07

## API Discovery

- Docs entry point: https://www.scaleway.com/en/developers/api/ → "Environmental
  Footprint" (Monitoring section).
- Official reference: https://www.scaleway.com/en/developers/api/environmental-footprint/user-api/
- The docs site is a client-rendered SPA whose per-endpoint detail did not fully
  render via plain fetch. The authoritative request/response shapes were taken
  from the generated Scaleway Go SDK, which is produced directly from the same
  API definition:
  `scaleway-sdk-go` `api/environmental_footprint/v1alpha1/environmental_footprint_sdk.go`.

## Decisions

### API slug, version, scoping
- **Slug/path**: `environmental-footprint` → base path
  `/environmental-footprint/v1alpha1`.
- **Version**: `v1alpha1` (alpha).
- **Scoping**: Global / Organization-scoped. No `{region}`/`{zone}` path
  segment; the Organization is chosen with the `organization_id` query/body
  parameter (defaults to the credentials' Organization when omitted). Regions
  and zones are *filters*, not path scope.

### Endpoints (verified in the SDK)
- `GET /data/query` — `UserAPI.GetImpactData` → `ImpactDataResponse`.
- `GET /reports/availability` — `UserAPI.GetImpactReportAvailability` →
  `ImpactReportAvailability`.
- `POST /reports/download` — `UserAPI.DownloadImpactReport` → `scw.File` (PDF).

### Array query parameters
The Scaleway JS client's `urlParams(...)` helper (from `@scaleway/sdk-client`)
appends array values as repeated keys and serializes `Date` values as ISO
strings. This matches the Go SDK's `parameter.AddToQuery` behavior. We therefore
use `urlParams` (as the `nats` vertical does) rather than hand-rolling
`URLSearchParams`, so `regions`, `zones`, `project_ids`, `service_categories`,
and `product_categories` are sent as repeated params.

### `organization_id` optionality
The Go SDK fills a default Organization ID when the field is empty. The JS
`client.fetch` does not auto-inject it into the query, so `organizationId` is an
**optional** tool parameter — when supplied it is sent; when omitted the API
resolves the Organization from the credentials (mirroring billing's approach).

### Download report response
`POST /reports/download` returns the PDF report file. The MCP tool issues the
request and returns whatever payload the client yields; this is a text-channel
limitation for binary content, but the endpoint is a documented, first-class
capability so it is exposed.

### Pagination
None. All three endpoints return aggregate documents; there are no
`page`/`page_size` parameters, so `buildPaginatedResponse` is not used.

### Error handling
All handlers wrap the call in try/catch and map errors through the shared
`mapScalewayError` + `formatErrorResponse` in `src/shared/errors.js`.

## Enumerations (verified in the SDK)

- **ServiceCategory**: unknown_service_category, baremetal, compute, storage,
  network, containers, databases, ai
- **ProductCategory**: unknown_product_category, apple_silicon, block_storage,
  dedibox, elastic_metal, instances, object_storage, load_balancer, kubernetes,
  managed_relational_databases, managed_mongodb, managed_redis,
  managed_inference, generative_apis
- **ReportType**: unknown_report_type, monthly, yearly
