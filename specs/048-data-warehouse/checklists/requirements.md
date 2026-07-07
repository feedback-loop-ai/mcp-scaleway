# Requirements Checklist: 048-data-warehouse

- [X] API slug, version, and scope verified against the official reference (datawarehouse / v1beta1 / region)
- [X] Every reference endpoint mapped to exactly one MCP tool (19 tools)
- [X] No invented endpoints; OpenAPI schema treated as source of truth
- [X] Deployment lifecycle: list/get/create/update/delete/start/stop/certificate
- [X] Databases: list/create/delete (name-keyed)
- [X] Users: list/create/update/delete (name-keyed)
- [X] Endpoints: create (public/private one-of)/delete
- [X] Read-only catalogs: presets, versions
- [X] Pagination + documented order_by/filter query params on all list tools
- [X] Errors mapped via shared `mapScalewayError`/`formatErrorResponse`
- [X] Unit tests cover every handler: success, error, optional-param and pagination branches
- [X] Contract tests cover every tool's request params and response shape
- [X] 100% line & branch coverage of src/tools/data-warehouse/*
- [X] Biome clean; tsc clean for the area's files
- [X] Out-of-scope items documented in spec.md
