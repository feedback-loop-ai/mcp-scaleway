# Requirements Checklist: Scaleway Domain Registrar MCP Tools

**Purpose**: Track implementation of all functional requirements from spec.md
**Created**: 2026-03-11
**Feature**: specs/020-domain-registrar/spec.md

## Domain Management (P1)

- [ ] CHK001 FR-001: List domains with pagination and filtering (project_id, organization_id, order_by)
- [ ] CHK002 FR-002: Get domain by fully qualified domain name
- [ ] CHK003 FR-003: Register domain with domain name, duration, project_id, and contact IDs
- [ ] CHK004 FR-004: Renew domain with configurable duration (1-10 years)
- [ ] CHK005 FR-005: Transfer domain with authorization/EPP code
- [ ] CHK006 FR-006: Update domain contacts (owner, admin, tech)
- [ ] CHK007 FR-007: Enable auto-renewal for a domain
- [ ] CHK008 FR-007: Disable auto-renewal for a domain
- [ ] CHK009 FR-008: Check domain name availability

## Contact Management (P2)

- [ ] CHK010 FR-009: List contacts with pagination and filtering
- [ ] CHK011 FR-009: Get contact by UUID
- [ ] CHK012 FR-009: Create contact with full WHOIS fields
- [ ] CHK013 FR-009: Update contact fields

## TLD Information (P3)

- [ ] CHK014 FR-010: List TLDs with pagination
- [ ] CHK015 FR-010: Get TLD details with pricing and DNSSEC support

## Cross-Cutting

- [ ] CHK016 FR-011: All tools validate inputs with Zod schemas
- [ ] CHK017 FR-012: All errors mapped to structured MCP error responses
- [ ] CHK018 FR-013: All list operations support pagination (page, page_size, total_count)
- [ ] CHK019 100% line and branch code coverage
- [ ] CHK020 All operations in parity-matrix.json
- [ ] CHK021 Contract tests for all tools

## Notes

- Check items off as completed: `[x]`
- All items trace to functional requirements in spec.md
