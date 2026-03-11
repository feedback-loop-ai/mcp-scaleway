# 027-sqs Requirements Checklist

## User Stories
- [x] P1: Activate SQS - `scaleway_sqs_activate`
- [x] P1: Deactivate SQS - `scaleway_sqs_deactivate`
- [x] P1: Create Credentials - `scaleway_sqs_create_credentials`
- [x] P1: Delete Credentials - `scaleway_sqs_delete_credentials`
- [x] P1: Get Credentials - `scaleway_sqs_get_credentials`
- [x] P1: List Credentials - `scaleway_sqs_list_credentials`
- [x] P1: Update Credentials - `scaleway_sqs_update_credentials`
- [x] P2: Get SQS Info - `scaleway_sqs_get_info`

## Implementation
- [x] `src/tools/sqs/types.ts` - Zod schemas for all input/output types
- [x] `src/tools/sqs/handlers.ts` - Handler functions for all 8 tools
- [x] `src/tools/sqs/index.ts` - Tool registration with MCP server

## Testing
- [x] Unit tests: `tests/unit/tools/sqs.test.ts` (64 tests)
- [x] Contract tests: `tests/contract/tools/sqs.contract.test.ts` (45 tests)
- [x] 100% line coverage
- [x] 100% branch coverage
- [x] Parity matrix updated: `tests/parity-matrix.json`

## Specs
- [x] SDD spec: `specs/027-sqs/spec.md`
- [x] API reference: `specs/scaleway-api/sqs/api-reference.md`

## Quality
- [x] Biome lint: pass
- [x] TypeScript strict: pass
- [x] All 192 tests pass (44 test files)
