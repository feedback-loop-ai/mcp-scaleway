# Requirements Checklist: Scaleway Account MCP Tools

**Purpose**: Track implementation of all functional requirements from spec.md
**Created**: 2026-03-11
**Feature**: specs/035-account/spec.md

## Project CRUD (P1)

- [ ] CHK001 FR-001: List projects with pagination and filtering (name, organization_id, project_ids, order_by)
- [ ] CHK002 FR-002: Get project by project_id
- [ ] CHK003 FR-003: Create project with name, description, organization_id
- [ ] CHK004 FR-004: Update project name and/or description by project_id
- [ ] CHK005 FR-005: Delete project by project_id (must be empty)

## Cross-Cutting

- [ ] CHK006 FR-006: All tools validate inputs with Zod schemas
- [ ] CHK007 FR-007: All errors mapped to structured MCP error responses
- [ ] CHK008 FR-008: All list operations support pagination (page, page_size, total_count)
- [ ] CHK009 100% line and branch code coverage
- [ ] CHK010 All operations in parity-matrix.json
- [ ] CHK011 Contract tests for all tools

## Notes

- Check items off as completed: `[x]`
- All items trace to functional requirements in spec.md
