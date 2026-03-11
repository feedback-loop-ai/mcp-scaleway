# Requirements Checklist: Scaleway Block Storage MCP Tools

**Purpose**: Track implementation of all functional requirements from spec.md
**Created**: 2026-03-11
**Feature**: specs/011-block-storage/spec.md

## Volume CRUD (P1)

- [ ] CHK001 FR-001: List volumes with pagination and filtering (name, projectId, status)
- [ ] CHK002 FR-002: Get volume by volumeId and zone
- [ ] CHK003 FR-003: Create volume from empty or from snapshot
- [ ] CHK004 FR-004: Update volume (name, size, perfIops, tags)
- [ ] CHK005 FR-005: Delete volume by volumeId and zone

## Snapshot Management (P2)

- [ ] CHK006 FR-006: List snapshots with pagination and filtering (name, projectId, volumeId, status)
- [ ] CHK007 FR-007: Get snapshot by snapshotId and zone
- [ ] CHK008 FR-008: Create snapshot from volume with name and tags
- [ ] CHK009 FR-009: Update snapshot (name, tags)
- [ ] CHK010 FR-010: Delete snapshot by snapshotId and zone

## Volume Type Discovery (P3)

- [ ] CHK011 FR-011: List volume types with pricing and specs

## Cross-Cutting

- [ ] CHK012 FR-012: All tools validate inputs with Zod schemas
- [ ] CHK013 FR-013: All errors mapped to structured MCP error responses
- [ ] CHK014 FR-014: All list operations support pagination
- [ ] CHK015 FR-015: All tools accept zone parameter
- [ ] CHK016 100% line and branch code coverage
- [ ] CHK017 All operations in parity-matrix.json
- [ ] CHK018 Contract tests for all tools

## Notes

- Check items off as completed: `[x]`
- All items trace to functional requirements in spec.md
