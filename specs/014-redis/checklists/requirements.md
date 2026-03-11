# Requirements Checklist: Scaleway Managed Redis MCP Tools

**Purpose**: Track implementation of all functional requirements from spec.md
**Created**: 2026-03-11
**Feature**: specs/014-redis/spec.md

## Cluster CRUD (P1)

- [ ] CHK001 FR-001: List clusters with pagination and filtering (name, tags, project_id, organization_id, order_by)
- [ ] CHK002 FR-002: Get cluster by ID and region
- [ ] CHK003 FR-003: Create cluster with all required and optional fields
- [ ] CHK004 FR-004: Update cluster (name, tags, user_name, password)
- [ ] CHK005 FR-005: Delete cluster by ID and region

## Metrics & Certificates (P2)

- [ ] CHK006 FR-006: Get cluster metrics with optional time range and metric name
- [ ] CHK007 FR-007: Get cluster TLS certificate
- [ ] CHK008 FR-008: Renew cluster TLS certificate

## ACL Rule Management (P2)

- [ ] CHK009 FR-009: Add ACL rules to a cluster
- [ ] CHK010 FR-010: Delete ACL rules from a cluster by rule IDs
- [ ] CHK011 FR-011: Set (replace all) ACL rules on a cluster

## Endpoint Management (P2)

- [ ] CHK012 FR-012: Add endpoints to a cluster
- [ ] CHK013 FR-013: Delete an endpoint from a cluster by endpoint ID
- [ ] CHK014 FR-014: Set (replace all) endpoints on a cluster

## Discovery (P3)

- [ ] CHK015 FR-015: List available node types with pagination and include_disabled_types filter
- [ ] CHK016 FR-016: List available cluster versions with pagination and filters

## Cross-Cutting

- [ ] CHK017 FR-017: All tools validate inputs with Zod schemas
- [ ] CHK018 FR-018: All errors mapped to structured MCP error responses
- [ ] CHK019 FR-019: All list operations support pagination (page, page_size, total_count)
- [ ] CHK020 FR-020: All tools accept region parameter
- [ ] CHK021 100% line and branch code coverage
- [ ] CHK022 All operations in parity-matrix.json
- [ ] CHK023 Contract tests for all 16 tools

## Notes

- Check items off as completed: `[x]`
- All items trace to functional requirements in spec.md
