# Requirements Checklist: Scaleway NATS Messaging MCP Tools

**Purpose**: Track implementation of all functional requirements from spec.md
**Created**: 2026-03-11
**Feature**: specs/026-nats/spec.md

## NATS Account CRUD (P1)

- [ ] CHK001 FR-001: List NATS accounts with pagination and filtering
- [ ] CHK002 FR-002: Get NATS account by ID and region
- [ ] CHK003 FR-003: Create NATS account with name and optional project_id
- [ ] CHK004 FR-004: Update NATS account name by ID and region
- [ ] CHK005 FR-005: Delete NATS account by ID and region

## NATS Credentials Management (P1)

- [ ] CHK006 FR-006: List NATS credentials for an account with pagination
- [ ] CHK007 FR-007: Get NATS credentials by ID and region
- [ ] CHK008 FR-008: Create NATS credentials with nats_account_id and name
- [ ] CHK009 FR-009: Delete NATS credentials by ID and region

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
