# Requirements Checklist: Scaleway Instances MCP Tools

**Purpose**: Track implementation of all functional requirements from spec.md
**Created**: 2026-03-11
**Feature**: specs/002-instances/spec.md

## Server CRUD & Actions (P1)

- [ ] CHK001 FR-001: List servers with pagination and filtering
- [ ] CHK002 FR-002: Get server by ID and zone
- [ ] CHK003 FR-003: Create server with all required fields
- [ ] CHK004 FR-004: Delete server by ID and zone
- [ ] CHK005 FR-005: Server actions (poweron, poweroff, reboot, terminate, stop_in_place, backup)

## Volume Management (P2)

- [ ] CHK006 FR-006: List volumes with pagination
- [ ] CHK007 FR-006: Get volume by ID and zone
- [ ] CHK008 FR-006: Create volume with name, size, volume_type
- [ ] CHK009 FR-006: Delete volume by ID and zone

## Security Group Management (P2)

- [ ] CHK010 FR-007: List security groups with pagination
- [ ] CHK011 FR-007: Get security group by ID and zone
- [ ] CHK012 FR-007: Create security group
- [ ] CHK013 FR-007: Delete security group by ID and zone

## IP & Snapshot Management (P3)

- [ ] CHK014 FR-008: List IPs with pagination
- [ ] CHK015 FR-008: Create IP
- [ ] CHK016 FR-008: Delete IP
- [ ] CHK017 FR-008: Attach IP to server
- [ ] CHK018 FR-009: List snapshots with pagination
- [ ] CHK019 FR-009: Create snapshot
- [ ] CHK020 FR-009: Delete snapshot

## Cross-Cutting

- [ ] CHK021 FR-010: All tools validate inputs with Zod schemas
- [ ] CHK022 FR-011: All errors mapped to structured MCP error responses
- [ ] CHK023 FR-012: All list operations support pagination
- [ ] CHK024 FR-013: All tools accept zone parameter
- [ ] CHK025 100% line and branch code coverage
- [ ] CHK026 All operations in parity-matrix.json
- [ ] CHK027 Contract tests for all tools

## Notes

- Check items off as completed: `[x]`
- All items trace to functional requirements in spec.md
