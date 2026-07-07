# Requirements Checklist: Scaleway RabbitMQ (MessageQ) MCP Tools

**Purpose**: Track implementation of all functional requirements from spec.md
**Created**: 2026-07-07
**Feature**: specs/050-rabbitmq/spec.md

## Deployment Lifecycle (P1)

- [x] CHK001 FR-001: List deployments with pagination and filtering (organization_id, project_id, name, tags, order_by)
- [x] CHK002 FR-002: Get deployment by ID and region
- [x] CHK003 FR-003: Create deployment (name, node_type, node_count, version, optional project_id, tags, user, volume, endpoints)
- [x] CHK004 FR-004: Update deployment (name, tags)
- [x] CHK005 FR-005: Upgrade deployment by node_count or volume_size_bytes (exactly one)
- [x] CHK006 FR-006: Delete deployment by ID and region
- [x] CHK007 FR-007: Download deployment certificate authority

## User Management (P1)

- [x] CHK008 FR-008: List users with pagination and filtering (name, order_by)
- [x] CHK009 FR-009: Create user (username, password)
- [x] CHK010 FR-010: Update user password
- [x] CHK011 FR-011: Delete user by username

## Endpoint Management (P2)

- [x] CHK012 FR-012: Create public or Private Network endpoint for a deployment
- [x] CHK013 FR-013: Delete endpoint by ID

## Catalog Discovery (P2)

- [x] CHK014 FR-014: List node types with pagination and ordering
- [x] CHK015 FR-015: List versions with pagination, ordering, and version filter

## Cross-Cutting

- [x] CHK016 FR-016: All tools validate inputs with Zod schemas
- [x] CHK017 FR-017: All errors mapped to structured MCP error responses
- [x] CHK018 FR-018: All list operations support standard pagination (page, pageSize, total_count)
- [x] CHK019 FR-019: All tools accept a region parameter (regional API locality)
- [x] CHK020 100% line and branch code coverage
- [x] CHK021 All operations recorded in the parity fragment (rabbitmq.json)
- [x] CHK022 Contract tests for all tools

## Notes

- All items trace to functional requirements in spec.md.
- Vhost/queue/exchange management is out of scope (not exposed by the messageq API).
