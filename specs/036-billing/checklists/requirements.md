# Requirements Checklist: Scaleway Billing MCP Tools

**Purpose**: Track implementation of all functional requirements from spec.md
**Created**: 2026-03-11
**Feature**: specs/036-billing/spec.md

## Consumption Tracking (P1)

- [ ] CHK001 FR-001: List consumptions with pagination and filtering (organization_id, project_id, category_name, billing_period, order_by)

## Invoice Management (P1)

- [ ] CHK002 FR-002: List invoices with pagination and filtering (organization_id, date range, invoice_type, order_by)
- [ ] CHK003 FR-003: Get invoice by ID
- [ ] CHK004 FR-004: Download invoice as PDF by ID

## Discount Management (P2)

- [ ] CHK005 FR-005: List discounts with pagination and filtering (organization_id, order_by)

## Cross-Cutting

- [ ] CHK006 FR-006: All tools validate inputs with Zod schemas
- [ ] CHK007 FR-007: All errors mapped to structured MCP error responses
- [ ] CHK008 FR-008: All list operations support pagination (page, pageSize, total_count)
- [ ] CHK009 100% line and branch code coverage
- [ ] CHK010 All operations in parity-matrix.json
- [ ] CHK011 Contract tests for all tools

## Notes

- Check items off as completed: `[x]`
- All items trace to functional requirements in spec.md
