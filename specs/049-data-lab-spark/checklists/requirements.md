# Requirements Checklist: Data Lab for Apache Spark

- [X] CHK-001: API slug/version/scoping verified against official docs (`datalab` v1beta1, region-scoped).
- [X] CHK-002: Every endpoint documented in `specs/scaleway-api/data-lab/api-reference.md` with method, path, request, response, pagination, auth, errors.
- [X] CHK-003: Cluster lifecycle covered: list, get, create, update, delete.
- [X] CHK-004: Catalog reads covered: node types, cluster versions, notebook versions.
- [X] CHK-005: All request params validated with zod (region format, uuids, node_count > 0, pageSize ≤ 100).
- [X] CHK-006: All handlers wrap errors via `mapScalewayError` + `formatErrorResponse`.
- [X] CHK-007: List handlers use `buildPaginatedResponse`.
- [X] CHK-008: `registerDataLabTools` registers exactly 8 tools with `scaleway_data_lab_` prefix.
- [X] CHK-009: Unit tests cover every handler (success, error, optional-param, empty-list branches).
- [X] CHK-010: Contract test covers every tool and references api-reference.md + parity-matrix.json.
- [X] CHK-011: 100% line and branch coverage of `src/tools/data-lab/`.
- [X] CHK-012: `biome check` clean; `tsc --noEmit` clean for feature files.
- [X] CHK-013: Out-of-scope items (run/session/job endpoints) documented with rationale — not invented.
- [X] CHK-014: Parity fragment written for all 8 tools.
