# Requirements Checklist: Scaleway IoT Hub MCP Tools

**Purpose**: Track implementation of all functional requirements from spec.md
**Created**: 2026-03-11
**Feature**: specs/033-iot/spec.md

## Hub CRUD & Lifecycle (P1)

- [ ] CHK001 FR-001: List hubs with pagination and filtering
- [ ] CHK002 FR-002: Get hub by ID and region
- [ ] CHK003 FR-003: Create hub with name, product_plan, and configuration
- [ ] CHK004 FR-004: Update hub name, plan, events, and auto-provisioning
- [ ] CHK005 FR-005: Delete hub by ID and region with optional device cascade
- [ ] CHK006 FR-006: Enable and disable a hub
- [ ] CHK007 FR-007: Get and set hub CA certificate

## Device Management (P1)

- [ ] CHK008 FR-008: List devices with pagination and filtering
- [ ] CHK009 FR-009: Get device by ID and region
- [ ] CHK010 FR-010: Create device with hub_id, name, and optional message filters
- [ ] CHK011 FR-011: Update device name, filters, hub assignment, and connection settings
- [ ] CHK012 FR-012: Delete device by ID and region
- [ ] CHK013 FR-013: Enable and disable a device
- [ ] CHK014 FR-014: Get, renew, and set device certificates
- [ ] CHK015 FR-015: Get device metrics with optional start_date

## Route Management (P2)

- [ ] CHK016 FR-016: List routes with pagination and filtering
- [ ] CHK017 FR-016: Get route by ID and region
- [ ] CHK018 FR-016: Create route with S3, database, or REST configuration
- [ ] CHK019 FR-016: Update route name, topic, and backend configuration
- [ ] CHK020 FR-016: Delete route by ID and region

## Network Management (P3)

- [ ] CHK021 FR-017: List networks with pagination and filtering
- [ ] CHK022 FR-017: Get network by ID and region
- [ ] CHK023 FR-017: Create network with hub_id, name, type, and topic_prefix
- [ ] CHK024 FR-017: Delete network by ID and region

## Cross-Cutting

- [ ] CHK025 FR-018: All tools validate inputs with Zod schemas
- [ ] CHK026 FR-019: All errors mapped to structured MCP error responses
- [ ] CHK027 FR-020: All list operations support pagination
- [ ] CHK028 FR-021: All tools accept region parameter
- [ ] CHK029 100% line and branch code coverage
- [ ] CHK030 All operations in parity-matrix.json
- [ ] CHK031 Contract tests for all tools

## Notes

- Check items off as completed: `[x]`
- All items trace to functional requirements in spec.md
