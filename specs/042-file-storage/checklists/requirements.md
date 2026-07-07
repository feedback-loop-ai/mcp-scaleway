# Requirements Checklist: File Storage

- [X] CHK-001 API slug, version, and scoping verified against official docs + SDK (file/v1alpha1, region-scoped)
- [X] CHK-002 All File Storage API endpoints identified (5 filesystem + 1 attachment list)
- [X] CHK-003 Entities, enums, and pagination modeled as zod schemas (snake_case fields)
- [X] CHK-004 Six MCP tools implemented with TOOL_PREFIX scaleway_file_storage_
- [X] CHK-005 Handlers use shared client, urlParams, error mapping, and paginated envelope
- [X] CHK-006 register function exported: registerFileStorageTools
- [X] CHK-007 Unit tests cover every handler: success, error, optional-param and pagination branches
- [X] CHK-008 Contract tests validate request/response shapes, enums, pagination, auth, errors
- [X] CHK-009 100% line and branch coverage on src/tools/file-storage/**
- [X] CHK-010 API reference doc written (specs/scaleway-api/file-storage/api-reference.md)
- [X] CHK-011 Parity fragment written (one entry per tool)
- [X] CHK-012 Biome clean and tsc clean for the vertical's files
- [X] CHK-013 Out-of-scope items documented (attach/detach via Instance API; no filesystem-types endpoint)
