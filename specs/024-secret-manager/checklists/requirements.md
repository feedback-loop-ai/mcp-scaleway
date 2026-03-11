# Requirements Checklist: Scaleway Secret Manager MCP Tools

**Purpose**: Track implementation of all functional requirements from spec.md
**Created**: 2026-03-11
**Feature**: specs/024-secret-manager/spec.md

## Secret CRUD (P1)

- [ ] CHK001 FR-001: List secrets with pagination and filtering
- [ ] CHK002 FR-002: Get secret by ID and region
- [ ] CHK003 FR-003: Create secret with name, type, tags, description, path, ephemeralPolicy, isProtected
- [ ] CHK004 FR-004: Update secret metadata (name, tags, description, path, ephemeralPolicy)
- [ ] CHK005 FR-005: Delete secret by ID and region

## Secret Versions (P1)

- [ ] CHK006 FR-006: List secret versions with pagination and status filtering
- [ ] CHK007 FR-007: Get secret version by secretId and revision
- [ ] CHK008 FR-008: Create secret version with base64-encoded data
- [ ] CHK009 FR-009: Access secret version payload by secretId and revision
- [ ] CHK010 FR-010: Disable secret version by secretId and revision
- [ ] CHK011 FR-011: Enable secret version by secretId and revision
- [ ] CHK012 FR-012: Destroy secret version by secretId and revision

## Protection (P2)

- [ ] CHK013 FR-013: Protect secret by ID
- [ ] CHK014 FR-014: Unprotect secret by ID

## Tags & Ownership (P3)

- [ ] CHK015 FR-015: List tags with pagination and projectId filtering
- [ ] CHK016 FR-016: Add owner (Scaleway product) to a secret

## Cross-Cutting

- [ ] CHK017 FR-017: All tools validate inputs with Zod schemas
- [ ] CHK018 FR-018: All errors mapped to structured MCP error responses
- [ ] CHK019 FR-019: All list operations support pagination
- [ ] CHK020 FR-020: All tools accept optional region parameter
- [ ] CHK021 100% line and branch code coverage
- [ ] CHK022 All operations in parity-matrix.json
- [ ] CHK023 Contract tests for all tools

## Notes

- Check items off as completed: `[x]`
- All items trace to functional requirements in spec.md
