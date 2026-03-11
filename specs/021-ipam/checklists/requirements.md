# Requirements Checklist: Scaleway IPAM MCP Tools

**Purpose**: Track implementation of all functional requirements from spec.md
**Created**: 2026-03-11
**Feature**: specs/021-ipam/spec.md

## Core IP Management (P1)

- [ ] CHK001 FR-001: List IPs with pagination and filtering (project, region, resource type, tags, attached status, IPv6, VPC, private network, subnet, MAC address, resource name, organization)
- [ ] CHK002 FR-002: Get IP by ID and region
- [ ] CHK003 FR-003: Book (reserve) IP with source, project, optional address and tags
- [ ] CHK004 FR-004: Release (delete) IP by ID and region

## IP Metadata (P2)

- [ ] CHK005 FR-005: Update IP tags
- [ ] CHK006 FR-005: Update IP reverse DNS entries

## Cross-Cutting

- [ ] CHK007 FR-006: All tools validate inputs with Zod schemas
- [ ] CHK008 FR-007: All errors mapped to structured MCP error responses
- [ ] CHK009 FR-008: List operation supports pagination (page, pageSize, total_count)
- [ ] CHK010 FR-009: All tools accept region parameter (regional API)
- [ ] CHK011 100% line and branch code coverage
- [ ] CHK012 All operations in parity-matrix.json
- [ ] CHK013 Contract tests for all tools

## Notes

- Check items off as completed: `[x]`
- All items trace to functional requirements and user stories in spec.md
