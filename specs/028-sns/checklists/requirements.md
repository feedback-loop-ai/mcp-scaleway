# Requirements Checklist: Scaleway SNS (Topics & Events) MCP Tools

**Purpose**: Track implementation of all functional requirements from spec.md
**Created**: 2026-03-11
**Feature**: specs/028-sns/spec.md

## SNS Service Activation (P1)

- [ ] CHK001 FR-001: Activate SNS for a project in a region
- [ ] CHK002 FR-002: Deactivate SNS for a project in a region
- [ ] CHK003 FR-003: Get SNS info (status, endpoint URL, timestamps)

## SNS Credentials Management (P1)

- [ ] CHK004 FR-004: List SNS credentials with pagination and ordering
- [ ] CHK005 FR-005: Get SNS credentials by ID
- [ ] CHK006 FR-006: Create SNS credentials with name and permissions
- [ ] CHK007 FR-007: Update SNS credentials name and/or permissions
- [ ] CHK008 FR-008: Delete SNS credentials by ID

## Cross-Cutting

- [ ] CHK009 FR-009: All tools validate inputs with Zod schemas
- [ ] CHK010 FR-010: All errors mapped to structured MCP error responses
- [ ] CHK011 FR-011: All list operations support pagination
- [ ] CHK012 FR-012: All tools accept optional region parameter
- [ ] CHK013 100% line and branch code coverage
- [ ] CHK014 All operations in parity-matrix.json
- [ ] CHK015 Contract tests for all tools

## Notes

- Check items off as completed: `[x]`
- All items trace to functional requirements in spec.md
