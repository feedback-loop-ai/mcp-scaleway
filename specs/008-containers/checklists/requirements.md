# Requirements Checklist: Scaleway Serverless Containers MCP Tools

**Purpose**: Track implementation of all functional requirements from spec.md
**Created**: 2026-03-11
**Feature**: specs/008-containers/spec.md

## Namespace CRUD (P1)

- [ ] CHK001 FR-001: List namespaces with pagination and filtering (name, projectId, organizationId)
- [ ] CHK002 FR-002: Get namespace by ID and region
- [ ] CHK003 FR-003: Create namespace with name, projectId, description, environment variables
- [ ] CHK004 FR-004: Update namespace properties (description, environment variables)
- [ ] CHK005 FR-005: Delete namespace by ID and region

## Container CRUD & Deploy (P1)

- [ ] CHK006 FR-006: List containers in a namespace with pagination and filtering
- [ ] CHK007 FR-007: Get container by ID and region
- [ ] CHK008 FR-008: Create container with required fields (namespaceId, name, registryImage) and optional config
- [ ] CHK009 FR-009: Update container configuration (image, scaling, resources, privacy, protocol, etc.)
- [ ] CHK010 FR-010: Delete container by ID and region
- [ ] CHK011 FR-011: Deploy container (trigger deployment of latest config)

## Cron Triggers (P2)

- [ ] CHK012 FR-012: List cron triggers for a container with pagination
- [ ] CHK013 FR-013: Create cron trigger with schedule expression and optional args
- [ ] CHK014 FR-014: Update cron trigger (schedule, args, name)
- [ ] CHK015 FR-015: Delete cron trigger by ID and region

## Domains & Tokens (P3)

- [ ] CHK016 FR-016: List custom domains for a container with pagination
- [ ] CHK017 FR-017: Create custom domain mapping with hostname
- [ ] CHK018 FR-018: Delete custom domain by ID and region
- [ ] CHK019 FR-019: Create authentication token (scoped to container or namespace)
- [ ] CHK020 FR-020: Delete authentication token by ID and region

## Cross-Cutting

- [ ] CHK021 FR-021: All tools validate inputs with Zod schemas
- [ ] CHK022 FR-022: All errors mapped to structured MCP error responses via mapScalewayError
- [ ] CHK023 FR-023: All list operations support standard pagination (page, pageSize, total_count)
- [ ] CHK024 FR-024: All tools accept optional region parameter (regional API)
- [ ] CHK025 100% line and branch code coverage
- [ ] CHK026 All operations in parity-matrix.json
- [ ] CHK027 Contract tests for all tools

## Notes

- Check items off as completed: `[x]`
- All items trace to functional requirements in spec.md
