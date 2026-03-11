# Requirements Checklist: Scaleway Serverless SQL DB MCP Tools

**Purpose**: Track implementation of all functional requirements from spec.md
**Created**: 2026-03-11
**Feature**: specs/010-serverless-sqldb/spec.md

## Database CRUD & Scaling (P1)

- [ ] CHK001 FR-001: List databases with pagination and filtering
- [ ] CHK002 FR-002: Get database by ID and region
- [ ] CHK003 FR-003: Create database with name, cpu_min, cpu_max
- [ ] CHK004 FR-004: Update database cpu_min and/or cpu_max
- [ ] CHK005 FR-005: Delete database by ID and region

## Backup Management (P2)

- [ ] CHK006 FR-006: List backups for a database with pagination
- [ ] CHK007 FR-007: Get backup by ID and region
- [ ] CHK008 FR-008: Export backup to obtain download URL
- [ ] CHK009 FR-009: Restore database from backup

## Cross-Cutting

- [ ] CHK010 FR-010: All tools validate inputs with Zod schemas
- [ ] CHK011 FR-011: All errors mapped to structured MCP error responses
- [ ] CHK012 FR-012: All list operations support pagination
- [ ] CHK013 FR-013: All tools accept region parameter
- [ ] CHK014 100% line and branch code coverage
- [ ] CHK015 All operations in parity-matrix.json
- [ ] CHK016 Contract tests for all tools

## Notes

- Check items off as completed: `[x]`
- All items trace to functional requirements in spec.md
