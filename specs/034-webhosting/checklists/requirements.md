# Requirements Checklist: Scaleway Web Hosting MCP Tools

**Purpose**: Track implementation of all functional requirements from spec.md
**Created**: 2026-03-11
**Feature**: specs/034-webhosting/spec.md

## Hosting CRUD & Lifecycle (P1)

- [ ] CHK001 FR-001: List hostings with pagination and filtering
- [ ] CHK002 FR-002: Get hosting by ID and region
- [ ] CHK003 FR-003: Create hosting with offer_id, domain, and optional fields
- [ ] CHK004 FR-004: Update hosting (email, tags, option_ids, offer_id, protected)
- [ ] CHK005 FR-005: Delete hosting by ID and region
- [ ] CHK006 FR-006: Restore hosting by ID and region

## DNS Records (P2)

- [ ] CHK007 FR-007: Get DNS records for a hosting by ID and region

## Offers & Control Panels (P3)

- [ ] CHK008 FR-008: List offers with optional filtering
- [ ] CHK009 FR-009: List control panels by region

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
