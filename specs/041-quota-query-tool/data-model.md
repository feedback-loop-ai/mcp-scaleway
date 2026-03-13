# Data Model: Quota Query Tool

**Feature Branch**: `041-quota-query-tool`
**Date**: 2026-03-13
**Status**: BLOCKED — Scaleway quota API does not exist (see research.md)

> **Note**: This data model is based on the `QuotasExceededError` shape from `@scaleway/sdk-client` and the spec requirements. It represents the **target** data model for when Scaleway releases a public quota API.

## Entities

### Quota

Represents a resource limit within a Scaleway organization or project.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| resource | string | Yes | Resource type name (e.g., "instances", "snapshots", "volumes") |
| current | number | Yes | Current usage count |
| quota | number | Yes | Maximum allowed limit |
| scope | QuotaScope | No | Scoping context (organization or project) |

### QuotaScope

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| kind | "organization" \| "project" | Yes | Scope level |
| id | string (UUID) | Yes | Organization or project ID |

### ListQuotasResponse (paginated)

| Field | Type | Description |
|-------|------|-------------|
| quotas | Quota[] | Array of quota entries |
| total_count | number | Total number of quota entries |

## Relationships

```
Organization (1) ──── has many ──── Quota (scoped to org)
Project (1) ──── has many ──── Quota (scoped to project)
```

## Validation Rules

- `resource`: non-empty string
- `current`: non-negative integer
- `quota`: non-negative integer (0 = unlimited or not set)
- `scope.kind`: must be "organization" or "project"
- `scope.id`: valid UUID

## State Transitions

N/A — quotas are read-only in this feature (no mutations).

## Source

Data shape derived from:
- `@scaleway/sdk-client` → `QuotasExceededErrorDetails` interface
- Spec FR-001 requirements (resource name, current usage, maximum limit)
