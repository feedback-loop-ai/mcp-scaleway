# Requirements Checklist: Scaleway Mailbox MCP Tools

**Purpose**: Track implementation of all functional requirements from spec.md
**Created**: 2026-07-07
**Feature**: specs/051-mailbox/spec.md

## Domain lifecycle (P1)

- [X] CHK001 FR-001: List domains with pagination and filtering (project_id, statuses, search, order_by)
- [X] CHK002 FR-002: Get domain by ID
- [X] CHK003 FR-003: Register (create) a domain with name and optional project_id
- [X] CHK004 FR-004: Delete a domain by ID
- [X] CHK005 FR-005: Get the DNS records required to configure a domain
- [X] CHK006 FR-006: Trigger validation of a domain's DNS records

## Mailbox lifecycle (P1)

- [X] CHK007 FR-007: Batch-create one or more mailboxes in a domain (subscription_period)
- [X] CHK008 FR-008: List mailboxes with pagination and filtering (domain_id, project_id, statuses, search, order_by)
- [X] CHK009 FR-009: Get mailbox by ID
- [X] CHK010 FR-010: Update mailbox subscription period and/or password
- [X] CHK011 FR-011: Delete a mailbox by ID (schedules deletion)
- [X] CHK012 FR-012: Restore a mailbox scheduled for deletion

## Alias management (P2)

- [X] CHK013 FR-013: Create an email alias for a mailbox (optional description)
- [X] CHK014 FR-014: List aliases with pagination and filtering (mailbox_id, project_id, status, order_by)
- [X] CHK015 FR-015: Get alias by ID
- [X] CHK016 FR-016: Delete an alias by ID

## Cross-Cutting

- [X] CHK017 FR-017: All tools validate inputs with Zod schemas
- [X] CHK018 FR-018: All errors mapped to structured MCP error responses
- [X] CHK019 FR-019: All list operations support standard pagination (page, pageSize, total_count)
- [X] CHK020 FR-020: Global-scoped API — no tool requires a region parameter
- [X] CHK021 100% line and branch code coverage of src/tools/mailbox/**
- [X] CHK022 Parity fragment covers all 16 operations
- [X] CHK023 Contract tests for all 16 tools

## Notes

- Offers/plans intentionally excluded — no `offers` endpoint exists in the API
  (see spec.md "Out of Scope").
- All items trace to functional requirements in spec.md.
