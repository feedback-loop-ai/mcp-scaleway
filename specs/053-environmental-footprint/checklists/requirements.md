# Requirements Checklist: Scaleway Environmental Footprint MCP Tools

**Purpose**: Track implementation of all functional requirements from spec.md
**Created**: 2026-07-07
**Feature**: specs/053-environmental-footprint/spec.md

## Impact Data (P1)

- [X] CHK001 FR-001: Retrieve impact data over a date range with optional
  project/region/zone/service-category/product-category filters
- [X] CHK006 FR-006: Array filters serialized as repeated query parameters

## Report Availability (P2)

- [X] CHK002 FR-002: List available monthly and yearly reports over a date range

## Report Download (P3)

- [X] CHK003 FR-003: Download a monthly or yearly report for a given date

## Cross-Cutting

- [X] CHK004 FR-004: All tools validate inputs with Zod schemas (UUID,
  region/zone format, ISO datetime, enum membership)
- [X] CHK005 FR-005: All errors mapped to structured MCP error responses
- [X] CHK007 100% line and branch code coverage
- [X] CHK008 Parity fragment provided for all operations
- [X] CHK009 Contract tests for all tools

## Notes

- All items trace to functional requirements in spec.md.
- The API is read-only and non-paginated; no list-pagination requirement applies.
