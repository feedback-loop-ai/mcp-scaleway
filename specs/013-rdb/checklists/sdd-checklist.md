# SDD Checklist - 013-rdb (Managed Database for PostgreSQL & MySQL)

## Step 1: Branch & Structure
- [x] Branch `013-rdb` created
- [x] `specs/013-rdb/{checklists,contracts}` created

## Step 2: SPECIFY
- [x] User stories defined (P1: Instance CRUD, DB/User mgmt; P2: Backup, Endpoints, ACLs; P3: Snapshots)
- [x] 27 MCP tools specified

## Step 3: DESIGN
- [x] Types defined in `src/tools/rdb/types.ts`
- [x] Entity schemas: RdbInstance, RdbDatabase, RdbUser, RdbBackup, RdbEndpoint, RdbAclRule, RdbSnapshot, RdbNodeType, RdbDatabaseEngine
- [x] Input schemas for all 27 tools
- [x] Regional API pattern: `https://api.scaleway.com/rdb/v1/regions/{region}/...`

## Step 4: CONTRACT TESTS
- [x] Contract tests in `tests/contract/rdb.test.ts` (76 tests)
- [x] All entity schemas validated
- [x] All input schemas validated
- [x] Parity matrix updated in `tests/parity-matrix.json`

## Step 5: IMPLEMENT
- [x] Handlers in `src/tools/rdb/handlers.ts`
- [x] Tool registration in `src/tools/rdb/index.ts`
- [x] Unit tests in `tests/unit/tools/rdb.test.ts` (82 tests)

## Step 6: ANALYZE
- [x] Lint: passes (Biome)
- [x] Type check: passes (tsc --noEmit)
- [x] Tests: 241 total (all pass)
- [x] Coverage: 100% lines, 100% branches for src/tools/rdb/*
