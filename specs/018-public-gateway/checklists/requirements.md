# Requirements Checklist: Scaleway Public Gateway MCP Tools

**Purpose**: Track implementation of all functional requirements from spec.md
**Created**: 2026-03-11
**Feature**: specs/018-public-gateway/spec.md

## Gateway CRUD (P1)

- [ ] CHK001 FR-001: List gateways with pagination and filtering
- [ ] CHK002 FR-002: Get gateway by ID and zone
- [ ] CHK003 FR-003: Create gateway with type, enableSmtp, enableBastion
- [ ] CHK004 FR-004: Update gateway name, tags, bastion, SMTP settings
- [ ] CHK005 FR-005: Delete gateway with optional IP cleanup

## Gateway Network Management (P1)

- [ ] CHK006 FR-006: List gateway networks with pagination and filtering
- [ ] CHK007 FR-006: Get gateway network by ID and zone
- [ ] CHK008 FR-006: Create gateway network with masquerade and default route
- [ ] CHK009 FR-006: Update gateway network masquerade and routing
- [ ] CHK010 FR-006: Delete gateway network

## DHCP Configuration (P2)

- [ ] CHK011 FR-007: List DHCP configurations with pagination (v1 API)
- [ ] CHK012 FR-007: Get DHCP by ID and zone
- [ ] CHK013 FR-007: Create DHCP with subnet, pool, DNS settings
- [ ] CHK014 FR-007: Update DHCP configuration
- [ ] CHK015 FR-007: Delete DHCP configuration

## PAT Rules (P2)

- [ ] CHK016 FR-008: List PAT rules with pagination and filtering
- [ ] CHK017 FR-008: Get PAT rule by ID and zone
- [ ] CHK018 FR-008: Create PAT rule with port mapping
- [ ] CHK019 FR-008: Update PAT rule port mapping and protocol
- [ ] CHK020 FR-008: Delete PAT rule

## Flexible IP Management (P3)

- [ ] CHK021 FR-009: List IPs with pagination and filtering
- [ ] CHK022 FR-009: Get IP by ID and zone
- [ ] CHK023 FR-009: Create (reserve) flexible IP
- [ ] CHK024 FR-009: Update IP (tags, reverse DNS, gateway attachment)
- [ ] CHK025 FR-009: Delete (release) flexible IP

## Gateway Types (P3)

- [ ] CHK026 FR-010: List available gateway types

## Cross-Cutting

- [ ] CHK027 FR-011: All tools validate inputs with Zod schemas
- [ ] CHK028 FR-012: All errors mapped to structured MCP error responses
- [ ] CHK029 FR-013: All list operations support pagination
- [ ] CHK030 FR-014: All tools accept zone parameter
- [ ] CHK031 100% line and branch code coverage
- [ ] CHK032 All operations in parity-matrix.json
- [ ] CHK033 Contract tests for all tools

## Notes

- Check items off as completed: `[x]`
- All items trace to functional requirements in spec.md
- DHCP tools use v1 API (`/vpc-gw/v1/`), all others use v2 API (`/vpc-gw/v2/`)
