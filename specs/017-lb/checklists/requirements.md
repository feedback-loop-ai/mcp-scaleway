# Requirements Checklist: Scaleway Load Balancer MCP Tools

**Purpose**: Track implementation of all functional requirements from spec.md
**Created**: 2026-03-11
**Feature**: specs/017-lb/spec.md

## LB CRUD & Migration (P1)

- [ ] CHK001 FR-001: List LBs with pagination and filtering (name, tags, project_id, order_by)
- [ ] CHK002 FR-002: Get LB by ID and zone
- [ ] CHK003 FR-003: Create LB with name, type, project_id, IP options, tags, SSL level
- [ ] CHK004 FR-004: Update LB name, description, tags, SSL level
- [ ] CHK005 FR-005: Delete LB by ID with optional IP release
- [ ] CHK006 FR-006: Migrate LB to a different type

## Frontend Management (P1)

- [ ] CHK007 FR-007: List frontends with pagination
- [ ] CHK008 FR-007: Get frontend by ID and zone
- [ ] CHK009 FR-007: Create frontend with name, inbound_port, backend_id, certificate options, HTTP/3
- [ ] CHK010 FR-007: Update frontend
- [ ] CHK011 FR-007: Delete frontend by ID and zone

## Backend Management (P1)

- [ ] CHK012 FR-008: List backends with pagination
- [ ] CHK013 FR-008: Get backend by ID and zone
- [ ] CHK014 FR-008: Create backend with forward_protocol, forward_port, health check, timeouts
- [ ] CHK015 FR-008: Update backend
- [ ] CHK016 FR-008: Delete backend by ID and zone
- [ ] CHK017 FR-009: Add server IPs to backend pool
- [ ] CHK018 FR-009: Remove server IPs from backend pool
- [ ] CHK019 FR-009: Set complete server IP list for backend pool

## Route Management (P2)

- [ ] CHK020 FR-010: List routes with pagination and frontend filter
- [ ] CHK021 FR-010: Get route by ID and zone
- [ ] CHK022 FR-010: Create route with frontend_id, backend_id, match_sni, match_host_header
- [ ] CHK023 FR-010: Update route
- [ ] CHK024 FR-010: Delete route by ID and zone

## Certificate Management (P2)

- [ ] CHK025 FR-011: List certificates with pagination
- [ ] CHK026 FR-011: Get certificate by ID and zone
- [ ] CHK027 FR-011: Create Let's Encrypt certificate
- [ ] CHK028 FR-011: Create custom certificate
- [ ] CHK029 FR-011: Update certificate name
- [ ] CHK030 FR-011: Delete certificate by ID and zone

## Stats & Types (P3)

- [ ] CHK031 FR-012: Get LB statistics with optional backend filter
- [ ] CHK032 FR-013: List available LB types with pagination

## Cross-Cutting

- [ ] CHK033 FR-014: All tools validate inputs with Zod schemas
- [ ] CHK034 FR-015: All errors mapped to structured MCP error responses
- [ ] CHK035 FR-016: All list operations support pagination
- [ ] CHK036 FR-017: All tools accept zone parameter
- [ ] CHK037 100% line and branch code coverage
- [ ] CHK038 All operations in parity-matrix.json
- [ ] CHK039 Contract tests for all 28 tools

## Notes

- Check items off as completed: `[x]`
- All items trace to functional requirements in spec.md
