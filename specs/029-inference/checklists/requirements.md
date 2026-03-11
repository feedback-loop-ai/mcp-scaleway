# Requirements Checklist: Scaleway Managed Inference MCP Tools

**Purpose**: Track implementation of all functional requirements from spec.md
**Created**: 2026-03-11
**Feature**: specs/029-inference/spec.md

## Deployment CRUD & Events (P1)

- [ ] CHK001 FR-001: List deployments with pagination and filtering (name, project_id, tags, order_by)
- [ ] CHK002 FR-002: Get deployment by ID and region
- [ ] CHK003 FR-003: Create deployment with name, model_id, node_type, endpoints, scaling
- [ ] CHK004 FR-004: Update deployment (name, tags, min_size, max_size)
- [ ] CHK005 FR-005: Delete deployment by ID and region
- [ ] CHK006 FR-006: List deployment events with pagination

## Endpoint Management (P1)

- [ ] CHK007 FR-007: List endpoints with optional deployment_id filter and pagination
- [ ] CHK008 FR-008: Create endpoint on a deployment (is_public, private_network_id, disable_auth)
- [ ] CHK009 FR-009: Update endpoint (disable_auth)
- [ ] CHK010 FR-010: Delete endpoint by ID and region

## Model Discovery (P2)

- [ ] CHK011 FR-011: List models with pagination and filtering (name, project_id, tags)
- [ ] CHK012 FR-012: Get model by ID and region

## Node Type Discovery (P2)

- [ ] CHK013 FR-013: List node types with pagination

## EULA Management (P3)

- [ ] CHK014 FR-014: Get EULA content for a model
- [ ] CHK015 FR-015: Accept EULA for a model

## Cross-Cutting

- [ ] CHK016 FR-016: All tools validate inputs with Zod schemas
- [ ] CHK017 FR-017: All errors mapped to structured MCP error responses
- [ ] CHK018 FR-018: All list operations support standard pagination (page, pageSize, total_count)
- [ ] CHK019 FR-019: All tools accept a region parameter (regional API locality)
- [ ] CHK020 100% line and branch code coverage
- [ ] CHK021 All operations in parity-matrix.json
- [ ] CHK022 Contract tests for all tools

## Notes

- Check items off as completed: `[x]`
- All items trace to functional requirements in spec.md
