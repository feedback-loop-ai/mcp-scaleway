# Requirements Checklist: Scaleway Marketplace MCP Tools

**Purpose**: Track implementation of all functional requirements from spec.md
**Created**: 2026-03-11
**Feature**: specs/037-marketplace/spec.md

## Image Browsing (P1)

- [ ] CHK001 FR-001: List images with pagination and filtering (arch, category, includeEol, orderBy)
- [ ] CHK002 FR-002: Get image by UUID

## Local Image Discovery (P1)

- [ ] CHK003 FR-003: List local images with pagination and filtering (zone, arch, imageId, versionId, imageLabel, type, orderBy)
- [ ] CHK004 FR-004: Get local image by UUID

## Category Browsing (P2)

- [ ] CHK005 FR-005: List categories with pagination
- [ ] CHK006 FR-006: Get category by UUID

## Version Management (P3)

- [ ] CHK007 FR-007: List versions for an image with pagination and ordering
- [ ] CHK008 FR-008: Get version by UUID

## Cross-Cutting

- [ ] CHK009 FR-009: All tools validate inputs with Zod schemas
- [ ] CHK010 FR-010: All errors mapped to structured MCP error responses
- [ ] CHK011 FR-011: All list operations support pagination (page, page_size, total_count)
- [ ] CHK012 100% line and branch code coverage
- [ ] CHK013 All operations in parity-matrix.json
- [ ] CHK014 Contract tests for all tools

## Notes

- Check items off as completed: `[x]`
- All items trace to functional requirements in spec.md
