# Requirements Checklist: Scaleway Managed MongoDB MCP Tools

**Purpose**: Track implementation of all functional requirements from spec.md
**Created**: 2026-03-11
**Feature**: specs/015-mongodb/spec.md

## Instance CRUD (P1)

- [ ] CHK001 FR-001: List instances with pagination and filtering (name, tags, project_id, organization_id, order_by)
- [ ] CHK002 FR-002: Get instance by ID and region
- [ ] CHK003 FR-003: Create instance with name, version, node_type, node_number, user_name, password, optional volume
- [ ] CHK004 FR-004: Update instance name and/or tags
- [ ] CHK005 FR-005: Delete instance by ID and region

## User Management (P2)

- [ ] CHK006 FR-006: List users on an instance with pagination and filtering
- [ ] CHK007 FR-006: Create user with name and password on an instance
- [ ] CHK008 FR-006: Update user password on an instance
- [ ] CHK009 FR-006: Delete user by name on an instance

## Snapshot Management (P2)

- [ ] CHK010 FR-007: List snapshots with pagination and filtering (instance_id, name, project_id, organization_id)
- [ ] CHK011 FR-007: Create snapshot of an instance with name and optional expires_at
- [ ] CHK012 FR-007: Restore snapshot to a new instance with node_type, node_number, optional volume
- [ ] CHK013 FR-007: Delete snapshot by ID and region

## Node Types & Versions (P3)

- [ ] CHK014 FR-008: List available node types with pagination and optional include_disabled_types
- [ ] CHK015 FR-009: List available MongoDB versions with pagination and optional version filter

## Cross-Cutting

- [ ] CHK016 FR-010: All tools validate inputs with Zod schemas
- [ ] CHK017 FR-011: All errors mapped to structured MCP error responses
- [ ] CHK018 FR-012: All list operations support pagination (page, page_size, total_count)
- [ ] CHK019 FR-013: All tools accept region parameter
- [ ] CHK020 100% line and branch code coverage
- [ ] CHK021 All operations in parity-matrix.json
- [ ] CHK022 Contract tests for all tools

## Notes

- Check items off as completed: `[x]`
- All items trace to functional requirements in spec.md
- 15 total MCP tools: 5 instance + 4 user + 4 snapshot + 2 discovery
