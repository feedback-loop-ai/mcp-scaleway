# Requirements Checklist: Scaleway VPC & Private Networks MCP Tools

**Purpose**: Track implementation of all functional requirements from spec.md
**Created**: 2026-03-11
**Feature**: specs/016-vpc/spec.md

## VPC CRUD (P1)

- [ ] CHK001 FR-001: List VPCs with pagination and filtering (name, tags, project)
- [ ] CHK002 FR-001: Get VPC by ID and region
- [ ] CHK003 FR-001: Create VPC with name, project, and optional tags
- [ ] CHK004 FR-001: Update VPC name and/or tags
- [ ] CHK005 FR-001: Delete VPC by ID and region

## Private Network CRUD (P1)

- [ ] CHK006 FR-002: List private networks with pagination and filtering (name, tags, vpc_id, project_id)
- [ ] CHK007 FR-002: Get private network by ID and region
- [ ] CHK008 FR-002: Create private network with name, project_id, vpc_id, optional tags and subnets
- [ ] CHK009 FR-002: Update private network name, tags, and/or subnets
- [ ] CHK010 FR-002: Delete private network by ID and region

## Subnet Management (P2)

- [ ] CHK011 FR-003: Specify CIDR subnets on private network creation
- [ ] CHK012 FR-003: Update CIDR subnets on existing private network

## Cross-Cutting

- [ ] CHK013 FR-004: All tools validate inputs with Zod schemas
- [ ] CHK014 FR-005: All errors mapped to structured MCP error responses
- [ ] CHK015 FR-006: All list operations support pagination (page, pageSize)
- [ ] CHK016 FR-007: All tools accept region parameter (regional API)
- [ ] CHK017 100% line and branch code coverage
- [ ] CHK018 All operations in parity-matrix.json
- [ ] CHK019 Contract tests for all tools

## Notes

- Check items off as completed: `[x]`
- All items trace to functional requirements in spec.md
