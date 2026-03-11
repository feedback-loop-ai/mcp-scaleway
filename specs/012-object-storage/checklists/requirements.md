# Requirements Checklist: Scaleway Object Storage MCP Tools

**Purpose**: Track implementation of all functional requirements from spec.md
**Created**: 2026-03-11
**Feature**: specs/012-object-storage/spec.md

## Bucket Management (P1)

- [ ] CHK001 FR-001: List all buckets in a region
- [ ] CHK002 FR-002: Create bucket with name, region, and optional ACL
- [ ] CHK003 FR-003: Delete bucket by name and region
- [ ] CHK004 FR-004: Get bucket info (versioning, object count)

## Object Operations (P1)

- [ ] CHK005 FR-005: List objects with prefix filtering and continuation-token pagination
- [ ] CHK006 FR-006: Get object metadata via HEAD request
- [ ] CHK007 FR-007: Upload small objects with base64-encoded content
- [ ] CHK008 FR-008: Delete objects by bucket and key

## Bucket Policies (P2)

- [ ] CHK009 FR-009: Get bucket policy (JSON) or null if none set
- [ ] CHK010 FR-009: Set bucket policy (JSON)

## Lifecycle & Versioning (P3)

- [ ] CHK011 FR-010: Get lifecycle rules (or empty array if none)
- [ ] CHK012 FR-010: Set lifecycle rules (expiration, transitions)
- [ ] CHK013 FR-011: Get bucket versioning status
- [ ] CHK014 FR-011: Set bucket versioning status (Enabled, Suspended)

## Cross-Cutting

- [ ] CHK015 FR-012: All tools validate inputs with Zod schemas
- [ ] CHK016 FR-013: All errors mapped to structured MCP error responses
- [ ] CHK017 FR-014: All tools accept optional region parameter (defaults to fr-par)
- [ ] CHK018 100% line and branch code coverage
- [ ] CHK019 All operations in parity-matrix.json
- [ ] CHK020 Contract tests for all tools

## Notes

- Check items off as completed: `[x]`
- All items trace to functional requirements in spec.md
