# Requirements Checklist: Scaleway Domains and DNS MCP Tools

**Purpose**: Track implementation of all functional requirements from spec.md
**Created**: 2026-03-11
**Feature**: specs/019-dns/spec.md

## DNS Zone Management (P1)

- [ ] CHK001 FR-001: List DNS zones with pagination and filtering (domain, project_id, order_by, dns_zones)
- [ ] CHK002 FR-002: Create a DNS zone with domain, subdomain, and project_id
- [ ] CHK003 FR-003: Update a DNS zone (rename subdomain or reassign project)
- [ ] CHK004 FR-004: Delete a DNS zone by name and project_id
- [ ] CHK005 FR-005: Clone a DNS zone to a new destination zone
- [ ] CHK006 FR-006: Refresh a DNS zone with optional recreate flags

## DNS Record Management (P1)

- [ ] CHK007 FR-007: List DNS records with pagination and filtering (name, type, id, project_id, order_by)
- [ ] CHK008 FR-008: Batch update DNS records with add/set/delete/clear change operations
- [ ] CHK009 FR-009: Clear all records from a DNS zone

## Raw Zone Import/Export (P1)

- [ ] CHK010 FR-010: Export a DNS zone as raw BIND zone file
- [ ] CHK011 FR-011: Import a raw BIND zone file into a DNS zone

## Nameserver Management (P2)

- [ ] CHK012 FR-012: List nameservers for a DNS zone
- [ ] CHK013 FR-013: Update nameservers for a DNS zone

## SSL Certificate Management (P3)

- [ ] CHK014 FR-014: Get SSL certificate for a DNS zone
- [ ] CHK015 FR-015: Create SSL certificate for a DNS zone with optional alternative zones
- [ ] CHK016 FR-016: Delete SSL certificate for a DNS zone

## TSIG Key Management (P3)

- [ ] CHK017 FR-017: Get TSIG key for a DNS zone
- [ ] CHK018 FR-018: Delete TSIG key for a DNS zone

## Cross-Cutting

- [ ] CHK019 FR-019: All tools validate inputs with Zod schemas
- [ ] CHK020 FR-020: All errors mapped to structured MCP error responses
- [ ] CHK021 FR-021: All list operations support pagination (where applicable)
- [ ] CHK022 FR-022: DNS zone name is URL-encoded in all path parameters
- [ ] CHK023 100% line and branch code coverage
- [ ] CHK024 All operations in parity-matrix.json
- [ ] CHK025 Contract tests for all tools

## Notes

- Check items off as completed: `[x]`
- All items trace to functional requirements in spec.md
