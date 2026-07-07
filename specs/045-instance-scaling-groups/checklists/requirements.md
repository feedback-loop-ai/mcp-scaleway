# Requirements Checklist: Instance Scaling Groups (Autoscaling)

- [X] Instance group CRUD tools implemented (list/get/create/update/delete)
- [X] Instance group events tool implemented
- [X] Instance template CRUD tools implemented
- [X] Instance policy CRUD tools implemented
- [X] Policy list supports `instanceGroupId` filter
- [X] All tools require and validate `zone` (zoned API)
- [X] List tools support `page`/`pageSize`/`orderBy` and return paginated envelope
- [X] Request/response zod schemas match `specs/scaleway-api/autoscaling/api-reference.md`
- [X] Errors mapped via shared `mapScalewayError`/`formatErrorResponse`
- [X] Unit tests cover every handler: success, error, optional-param, pagination
- [X] Contract tests cover every tool's request + response shape and enums
- [X] 100% line and branch coverage for `src/tools/autoscaling`
- [X] Biome clean; `tsc --noEmit` clean for new files
- [X] Parity fragment written (`<scratchpad>/parity-fragments/autoscaling.json`)
- [X] `registerAutoscalingTools` exported for orchestrator wiring
