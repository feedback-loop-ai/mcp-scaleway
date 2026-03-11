# Requirements Checklist: Scaleway Managed Database (RDB) MCP Tools

**Purpose**: Track implementation of all functional requirements from spec.md
**Created**: 2026-03-11
**Feature**: specs/013-rdb/spec.md

## Instance CRUD & Upgrade (P1)

- [ ] CHK001 FR-001: List instances with pagination and filtering
- [ ] CHK002 FR-002: Get instance by ID and region
- [ ] CHK003 FR-003: Create instance with name, engine, node_type, and optional config
- [ ] CHK004 FR-004: Update instance name, tags, and backup schedule
- [ ] CHK005 FR-005: Delete instance by ID and region
- [ ] CHK006 FR-006: Upgrade instance node type, volume, or engine version

## Database & User Management (P1)

- [ ] CHK007 FR-007: List databases with pagination and filtering
- [ ] CHK008 FR-007: Create database within an instance
- [ ] CHK009 FR-007: Delete database by name
- [ ] CHK010 FR-008: List users with pagination and filtering
- [ ] CHK011 FR-008: Create user with name, password, and optional admin flag
- [ ] CHK012 FR-008: Update user password or admin status
- [ ] CHK013 FR-008: Delete user by name

## Backup & Restore (P2)

- [ ] CHK014 FR-009: List backups with pagination and filtering
- [ ] CHK015 FR-009: Create backup for an instance or specific database
- [ ] CHK016 FR-009: Restore backup to a target instance

## Endpoints & ACL Rules (P2)

- [ ] CHK017 FR-010: List endpoints for an instance
- [ ] CHK018 FR-010: Create endpoint (private network or load balancer)
- [ ] CHK019 FR-010: Delete endpoint by ID
- [ ] CHK020 FR-011: List ACL rules for an instance
- [ ] CHK021 FR-011: Add ACL rules to an instance
- [ ] CHK022 FR-011: Delete ACL rules by IP range

## Snapshots (P3)

- [ ] CHK023 FR-012: List snapshots with pagination and filtering
- [ ] CHK024 FR-012: Create snapshot of an instance
- [ ] CHK025 FR-012: Restore snapshot by creating a new instance

## Reference Data (P3)

- [ ] CHK026 FR-013: List available node types
- [ ] CHK027 FR-013: List available database engines and versions

## Cross-Cutting

- [ ] CHK028 FR-014: All tools validate inputs with Zod schemas
- [ ] CHK029 FR-015: All errors mapped to structured MCP error responses
- [ ] CHK030 FR-016: All list operations support pagination
- [ ] CHK031 FR-017: All tools accept region parameter
- [ ] CHK032 100% line and branch code coverage
- [ ] CHK033 All operations in parity-matrix.json
- [ ] CHK034 Contract tests for all tools

## Notes

- Check items off as completed: `[x]`
- All items trace to functional requirements in spec.md
