# Requirements Checklist: Scaleway Audit Trail MCP Tools

**Purpose**: Track implementation of all functional requirements from spec.md
**Created**: 2026-07-07
**Feature**: specs/052-audit-trail/spec.md

## Events (P1)

- [x] CHK001 FR-001: List events with cursor pagination and full filter set
- [x] CHK002 FR-001: organizationId required; region required and format-validated

## Products (P2)

- [x] CHK003 FR-002: List integrated products for an organization

## Export Jobs (P3)

- [x] CHK004 FR-003: List export jobs with offset pagination and name/tags/order_by filters
- [x] CHK005 FR-004: Create export job with S3 destination (bucket, region, prefix?, project_id?) and tags?
- [x] CHK006 FR-005: Delete export job by ID

## Cross-Cutting

- [x] CHK007 FR-006: All tools accept a region parameter (regional locality)
- [x] CHK008 FR-007: All inputs validated with Zod schemas
- [x] CHK009 FR-008: All errors mapped to structured MCP error responses
- [x] CHK010 FR-009: 100% line and branch coverage on src/tools/audit-trail/**
- [x] CHK011 FR-009: Contract tests for all 5 tools referencing api-reference.md
- [x] CHK012 Parity fragment written for all 5 tools

## Notes

- All items trace to functional requirements in spec.md.
- `tests/parity-matrix.json` is owned by the orchestrator; a parity fragment is provided at
  `<scratchpad>/parity-fragments/audit-trail.json`.
