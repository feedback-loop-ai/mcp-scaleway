# Requirements Checklist: 046-opensearch

## API research
- [X] Discovered real API slug/version: `searchdb/v1alpha1`
- [X] Confirmed scope: region-scoped (fr-par)
- [X] Verified every endpoint against official reference + Go SDK
- [X] Confirmed snapshots/ACLs have no API endpoints (documented as out of scope)

## Coverage of primary resources
- [X] Deployments: list, get, create, update, delete, upgrade
- [X] Deployment CA download
- [X] Node types: list
- [X] Versions: list
- [X] Users: list, create, update, delete
- [X] Endpoints: create, delete

## Implementation
- [X] `src/tools/opensearch/types.ts` (zod params, entities, enums, list wrappers)
- [X] `src/tools/opensearch/handlers.ts` (all 15 handlers, error-wrapped)
- [X] `src/tools/opensearch/index.ts` exports `registerOpensearchTools`
- [X] Tool names use prefix `scaleway_opensearch_`
- [X] camelCase inputs mapped to snake_case wire bodies

## Testing
- [X] Unit tests: every handler — success, error, optional-param, pagination
- [X] Contract tests: every tool request/response shape
- [X] Contract header references api-reference.md + parity-matrix.json
- [X] 100% line + branch coverage of the three src files
- [X] `bun x tsc --noEmit` clean for these files
- [X] `bun x biome check` clean for these files

## Artifacts
- [X] specs/scaleway-api/opensearch/api-reference.md
- [X] specs/046-opensearch/{spec,plan,research,data-model,quickstart,tasks}.md
- [X] specs/046-opensearch/contracts/tool-contract.md
- [X] Parity fragment written to scratchpad
