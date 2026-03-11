# Requirements Checklist: Scaleway IAM MCP Tools

**Purpose**: Track implementation of all functional requirements from spec.md
**Created**: 2026-03-11
**Feature**: specs/023-iam/spec.md

## User Management (P1)

- [ ] CHK001 FR-001: List users with pagination and optional organization_id filter
- [ ] CHK002 FR-002: Get user by user_id
- [ ] CHK003 FR-003: Create user by inviting via email and organization_id
- [ ] CHK004 FR-004: Update user by user_id
- [ ] CHK005 FR-005: Delete user by user_id

## Application Management (P1)

- [ ] CHK006 FR-006: List applications with pagination
- [ ] CHK007 FR-006: Get application by application_id
- [ ] CHK008 FR-006: Create application with name and optional organization_id
- [ ] CHK009 FR-006: Update application by application_id
- [ ] CHK010 FR-006: Delete application by application_id

## API Key Management (P1)

- [ ] CHK011 FR-007: List API keys with pagination and filtering (organization_id, application_id, user_id)
- [ ] CHK012 FR-007: Get API key by access_key
- [ ] CHK013 FR-007: Create API key for application or user
- [ ] CHK014 FR-007: Update API key by access_key
- [ ] CHK015 FR-007: Delete API key by access_key

## Policy Management (P2)

- [ ] CHK016 FR-008: List policies with pagination
- [ ] CHK017 FR-008: Get policy by policy_id
- [ ] CHK018 FR-008: Create policy with optional inline rules
- [ ] CHK019 FR-008: Update policy by policy_id
- [ ] CHK020 FR-008: Delete policy by policy_id

## Rule Management (P2)

- [ ] CHK021 FR-009: List rules filtered by policy_id with pagination
- [ ] CHK022 FR-009: Create rule with permission_set_names and project_ids
- [ ] CHK023 FR-009: Update rule by rule_id
- [ ] CHK024 FR-009: Delete rule by rule_id

## Group Management (P2)

- [ ] CHK025 FR-010: List groups with pagination
- [ ] CHK026 FR-010: Get group by group_id
- [ ] CHK027 FR-010: Create group with name and optional organization_id
- [ ] CHK028 FR-010: Update group by group_id
- [ ] CHK029 FR-010: Delete group by group_id
- [ ] CHK030 FR-011: Add member (user or application) to group
- [ ] CHK031 FR-011: Remove member (user or application) from group

## Permission Sets (P3)

- [ ] CHK032 FR-012: List available permission sets with pagination

## Cross-Cutting

- [ ] CHK033 FR-013: All tools validate inputs with Zod schemas
- [ ] CHK034 FR-014: All errors mapped to structured MCP error responses
- [ ] CHK035 FR-015: All list operations support pagination
- [ ] CHK036 100% line and branch code coverage
- [ ] CHK037 All operations in parity-matrix.json
- [ ] CHK038 Contract tests for all tools

## Notes

- Check items off as completed: `[x]`
- All items trace to functional requirements in spec.md
