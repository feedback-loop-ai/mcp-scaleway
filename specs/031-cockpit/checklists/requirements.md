# Requirements Checklist: Scaleway Cockpit (Observability) MCP Tools

**Purpose**: Track implementation of all functional requirements from spec.md
**Created**: 2026-03-11
**Feature**: specs/031-cockpit/spec.md

## Cockpit Lifecycle (P1)

- [ ] CHK001 FR-001: Get Cockpit info (status, endpoints) for a project
- [ ] CHK002 FR-002: Activate Cockpit for a project
- [ ] CHK003 FR-003: Deactivate Cockpit for a project

## Token Management (P1)

- [ ] CHK004 FR-004: List tokens with pagination
- [ ] CHK005 FR-005: Create token with name and scopes
- [ ] CHK006 FR-006: Delete token by ID

## Data Source Management (P2)

- [ ] CHK007 FR-007: List data sources with pagination and type filtering
- [ ] CHK008 FR-008: Create data source with name and type
- [ ] CHK009 FR-009: Delete data source by ID

## Grafana User Management (P2)

- [ ] CHK010 FR-010: List Grafana users with pagination
- [ ] CHK011 FR-011: Create Grafana user with login and role
- [ ] CHK012 FR-012: Delete Grafana user by ID
- [ ] CHK013 FR-013: Reset Grafana user password

## Alert Manager (P3)

- [ ] CHK014 FR-014: Get alert manager info
- [ ] CHK015 FR-015: Enable alert manager
- [ ] CHK016 FR-016: Disable alert manager

## Contact Points (P3)

- [ ] CHK017 FR-017: List contact points with pagination
- [ ] CHK018 FR-018: Create contact point with email
- [ ] CHK019 FR-019: Delete contact point by email

## Managed Alerts (P3)

- [ ] CHK020 FR-020: List managed alerts contact points with pagination
- [ ] CHK021 FR-021: Enable managed alerts
- [ ] CHK022 FR-022: Disable managed alerts

## Cross-Cutting

- [ ] CHK023 All tools validate inputs with Zod schemas
- [ ] CHK024 All errors mapped to structured MCP error responses
- [ ] CHK025 All list operations support pagination (page, pageSize, totalCount)
- [ ] CHK026 Regional tools accept optional region parameter with default fallback
- [ ] CHK027 Grafana user tools work without region (global endpoints)
- [ ] CHK028 100% line and branch code coverage
- [ ] CHK029 All operations in parity-matrix.json
- [ ] CHK030 Contract tests for all 22 tools

## Notes

- Check items off as completed: `[x]`
- All items trace to functional requirements in spec.md
