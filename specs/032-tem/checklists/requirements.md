# Requirements Checklist: Scaleway Transactional Email (TEM) MCP Tools

**Purpose**: Track implementation of all functional requirements from spec.md
**Created**: 2026-03-11
**Feature**: specs/032-tem/spec.md

## Domain Management (P1)

- [ ] CHK001 FR-001: List domains with pagination and filtering
- [ ] CHK002 FR-002: Get domain by ID and region
- [ ] CHK003 FR-003: Create domain with project_id, domain_name, accept_tos
- [ ] CHK004 FR-004: Revoke domain by ID and region
- [ ] CHK005 FR-005: Trigger DNS check on domain
- [ ] CHK006 FR-006: Get domain last DNS verification status

## Email Management (P1)

- [ ] CHK007 FR-007: List emails with pagination and filtering
- [ ] CHK008 FR-008: Get email by ID and region
- [ ] CHK009 FR-009: Create/send email with from, to, subject, body, attachments
- [ ] CHK010 FR-010: Cancel queued email by ID and region

## Statistics (P2)

- [ ] CHK011 FR-011: Get email statistics with optional filters

## Webhook Management (P2)

- [ ] CHK012 FR-012: List webhooks with pagination and filtering
- [ ] CHK013 FR-013: Create webhook with domain_id, name, event_types, sns_arn
- [ ] CHK014 FR-014: Update webhook name, event_types, or sns_arn
- [ ] CHK015 FR-015: Delete webhook by ID and region

## Cross-Cutting

- [ ] CHK016 FR-016: All tools validate inputs with Zod schemas
- [ ] CHK017 FR-017: All errors mapped to structured MCP error responses
- [ ] CHK018 FR-018: All list operations support pagination
- [ ] CHK019 FR-019: All tools accept region parameter
- [ ] CHK020 100% line and branch code coverage
- [ ] CHK021 All operations in parity-matrix.json
- [ ] CHK022 Contract tests for all tools

## Notes

- Check items off as completed: `[x]`
- All items trace to functional requirements in spec.md
