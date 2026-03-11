# Requirements Checklist: Scaleway Elastic Metal MCP Tools

**Purpose**: Track implementation completeness of all functional requirements
**Created**: 2026-03-11
**Feature**: [spec.md](../spec.md)

## Server CRUD (US1 - P1)

- [ ] CHK001 FR-001: List servers with pagination and zone filtering
- [ ] CHK002 FR-002: Get server details by ID and zone
- [ ] CHK003 FR-003: Create server with offer, name, project
- [ ] CHK004 FR-004: Delete server by ID and zone

## Server Actions (US2 - P1)

- [ ] CHK005 FR-005: Install OS on server with SSH key configuration
- [ ] CHK006 FR-006a: Reboot server
- [ ] CHK007 FR-006b: Start server
- [ ] CHK008 FR-006c: Stop server

## Options & BMC (US3 - P2)

- [ ] CHK009 FR-007: List offers by zone
- [ ] CHK010 FR-008: List operating systems by zone
- [ ] CHK011 FR-009: Get BMC access for server

## Flexible IPs (US4 - P3)

- [ ] CHK012 FR-010: List flexible IPs with pagination
- [ ] CHK013 FR-011a: Create flexible IP
- [ ] CHK014 FR-011b: Delete flexible IP

## Cross-Cutting

- [ ] CHK015 FR-012: All tools validate inputs with Zod schemas
- [ ] CHK016 FR-013: All tools return structured JSON responses
- [ ] CHK017 FR-014: All tools map Scaleway errors to MCP error responses
- [ ] CHK018 100% line and branch code coverage
- [ ] CHK019 Contract tests for all tools
- [ ] CHK020 Parity matrix updated

## Notes

- Check items off as completed: `[x]`
- Items are numbered sequentially for easy reference
