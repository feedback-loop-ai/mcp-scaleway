# Requirements Checklist: Scaleway Serverless Jobs MCP Tools

**Purpose**: Track implementation of all functional requirements from spec.md
**Created**: 2026-03-11
**Feature**: specs/009-jobs/spec.md

## Job Definition CRUD (P1)

- [ ] CHK001 FR-001: List job definitions with pagination and project_id filtering
- [ ] CHK002 FR-002: Get job definition by ID and region
- [ ] CHK003 FR-003: Create job definition with all required and optional fields
- [ ] CHK004 FR-004: Update job definition with partial fields via PATCH
- [ ] CHK005 FR-005: Delete job definition by ID and region

## Job Run Management (P1)

- [ ] CHK006 FR-006: Start job run from definition with optional overrides
- [ ] CHK007 FR-007: List job runs with pagination and filtering by job_definition_id and project_id
- [ ] CHK008 FR-008: Get job run by ID and region
- [ ] CHK009 FR-009: Stop running job run by ID and region

## Cross-Cutting

- [ ] CHK010 FR-010: All tools validate inputs with Zod schemas
- [ ] CHK011 FR-011: All errors mapped to structured MCP error responses
- [ ] CHK012 FR-012: All list operations support pagination
- [ ] CHK013 FR-013: All tools accept optional region parameter
- [ ] CHK014 100% line and branch code coverage
- [ ] CHK015 All operations in parity-matrix.json
- [ ] CHK016 Contract tests for all tools

## Notes

- Check items off as completed: `[x]`
- All items trace to functional requirements in spec.md
