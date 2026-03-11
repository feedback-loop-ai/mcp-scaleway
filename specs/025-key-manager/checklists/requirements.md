# Requirements Checklist: Scaleway Key Manager MCP Tools

**Purpose**: Track implementation of all functional requirements from spec.md
**Created**: 2026-03-11
**Feature**: specs/025-key-manager/spec.md

## Key CRUD & Lifecycle (P1)

- [ ] CHK001 FR-001: List keys with pagination and filtering (name, tags, usage, organizationId, projectId, orderBy, scheduledForDeletion)
- [ ] CHK002 FR-002: Get key by ID and region
- [ ] CHK003 FR-003: Create key with name, usage, description, tags, rotationPolicy, unprotected, origin
- [ ] CHK004 FR-004: Update key name, description, tags, and rotationPolicy
- [ ] CHK005 FR-005: Delete key by ID and region
- [ ] CHK006 FR-006: Rotate key by ID and region
- [ ] CHK007 FR-007: Protect key by ID and region
- [ ] CHK008 FR-008: Unprotect key by ID and region
- [ ] CHK009 FR-009: Enable key by ID and region
- [ ] CHK010 FR-010: Disable key by ID and region

## Cryptographic Operations (P1)

- [ ] CHK011 FR-011: Encrypt plaintext with key (max 64KB, optional associated data)
- [ ] CHK012 FR-012: Decrypt ciphertext with key (optional associated data)
- [ ] CHK013 FR-013: Generate data encryption key (algorithm, withoutPlaintext options)

## Cross-Cutting

- [ ] CHK014 FR-014: All tools validate inputs with Zod schemas
- [ ] CHK015 FR-015: All errors mapped to structured MCP error responses
- [ ] CHK016 FR-016: All list operations support pagination (page, pageSize, totalCount)
- [ ] CHK017 FR-017: All tools accept optional region parameter
- [ ] CHK018 100% line and branch code coverage
- [ ] CHK019 All operations in parity-matrix.json
- [ ] CHK020 Contract tests for all tools

## Notes

- Check items off as completed: `[x]`
- All items trace to functional requirements in spec.md
