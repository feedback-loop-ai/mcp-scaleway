# Requirements Checklist: Scaleway Apple Silicon MCP Tools

**Purpose**: Track implementation completeness of all functional requirements
**Created**: 2026-03-11
**Feature**: [spec.md](../spec.md)

## Server CRUD (US-AS-001 to US-AS-004 - P1)

- [x] CHK001 FR-001: List servers with pagination, order_by, project_id, and organization_id filtering
- [x] CHK002 FR-002: Get server by ID and zone (returns full details including IP, OS, VNC, status)
- [x] CHK003 FR-003: Create server with type, name, os_id, enable_vpc, commitment_type, public_bandwidth_bps, enable_kext
- [x] CHK004 FR-004: Delete server by ID and zone (respects 24h minimum allocation)

## Server Actions (US-AS-005 to US-AS-006 - P1)

- [x] CHK005 FR-005: Reboot server by ID and zone
- [x] CHK006 FR-006: Reinstall server OS with os_id and enable_kext options

## Server Types & OS (US-AS-007 to US-AS-008 - P2)

- [x] CHK007 FR-007: List server types by zone (CPU, disk, memory, GPU, NPU, stock info)
- [x] CHK008 FR-008: List OS versions with pagination, server_type and name filtering

## Cross-Cutting

- [x] CHK009 FR-009: All tools validate inputs with Zod schemas
- [x] CHK010 FR-010: All tools return structured JSON responses via jsonResponse helper
- [x] CHK011 FR-011: All errors mapped to MCP error responses via mapScalewayError
- [x] CHK012 FR-012: All list operations support pagination (page, pageSize)
- [x] CHK013 FR-013: All tools accept zone parameter with defaultZone fallback
- [ ] CHK014 100% line and branch code coverage
- [ ] CHK015 Contract tests for all 8 tools
- [ ] CHK016 Parity matrix updated for all Apple Silicon operations

## Notes

- Check items off as completed: `[x]`
- Items trace to user stories US-AS-001 through US-AS-008 in spec.md
- Apple Silicon API is zoned, available in `fr-par-3`
- API base path: `/apple-silicon/v1alpha1/zones/{zone}/`
