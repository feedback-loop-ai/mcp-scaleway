# Implementation Plan: File Storage Vertical

**Branch**: `042-file-storage` | **Date**: 2026-07-07 | **Spec**: ./spec.md
**Status**: Implemented

## Summary

Expose the Scaleway File Storage API (`file/v1alpha1`, region-scoped, Beta) as six MCP
tools: file-system CRUD plus attachment listing. Follow the established `src/tools/<area>/`
pattern (types.ts / handlers.ts / index.ts) with the shared client, error mapping, and
pagination helpers.

## Technical Context

- **Language/Runtime**: TypeScript 5.x (strict) on Bun 1.x
- **Key deps**: `@modelcontextprotocol/sdk` ^1.25.x, `@scaleway/sdk-client` (urlParams), `zod` ^3.25.x
- **API**: `file/v1alpha1`, region-scoped, `X-Auth-Token` auth
- **Storage/State**: N/A (stateless proxy)
- **Testing**: Vitest, 100% line+branch coverage; contract tests validate shapes
- **Scope**: read + write (CRUD) over file systems; read over attachments

## Constitution Check

- **Contract-First**: API documented in `specs/scaleway-api/file-storage/api-reference.md` before/with implementation. PASS
- **100% Coverage & Parity**: unit + contract tests cover all six tools; parity fragment maps each tool to its endpoint and contract test. PASS
- **No tool without tests**: every handler has success/error/branch coverage. PASS

## Project Structure

```
src/tools/file-storage/
  types.ts      # zod schemas: entities, enums, request/response
  handlers.ts   # handleListFileSystems, handleGetFileSystem, handleCreateFileSystem,
                # handleUpdateFileSystem, handleDeleteFileSystem, handleListAttachments
  index.ts      # registerFileStorageTools(server)
tests/unit/tools/file-storage.test.ts
tests/contract/file-storage/file-storage.contract.test.ts
specs/scaleway-api/file-storage/api-reference.md
specs/042-file-storage/{spec,research,plan,data-model,quickstart,tasks}.md
specs/042-file-storage/{contracts/,checklists/requirements.md}
```

## Approach

1. Research the real API surface (done — see research.md).
2. Model entities/enums/requests as zod schemas mirroring snake_case API fields.
3. Implement handlers using the shared client `fetch` with `urlParams` for queries and
   JSON bodies for create/update; wrap all in try/catch → `formatErrorResponse`.
4. Register six tools with `TOOL_PREFIX = scaleway_file_storage_`.
5. Test: unit (mock client, all branches) + contract (schema validation).

## Wiring

The orchestrator wires `registerFileStorageTools` into `src/tools/index.ts` (not edited here).

## Complexity Tracking

No deviations from the standard vertical pattern.
