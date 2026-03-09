# Data Model: Scaleway API Group Specs & Modular Architecture

**Feature**: 001-scaleway-api-specs | **Date**: 2026-03-06

## Overview

This feature delivers architectural scaffolding, not runtime data. The "data model" here describes the structural entities and their relationships — the types and contracts that govern how product modules are organized and how tools are registered.

## Entities

### ScalewayConfig

Configuration loaded at server startup from environment variables.

| Field | Type | Required | Source |
|-------|------|----------|--------|
| accessKey | `string` | Yes | `SCW_ACCESS_KEY` |
| secretKey | `string` | Yes | `SCW_SECRET_KEY` |
| defaultProjectId | `string` | Yes | `SCW_DEFAULT_PROJECT_ID` |
| defaultOrganizationId | `string` | No | `SCW_DEFAULT_ORGANIZATION_ID` |
| defaultRegion | `string` | No | `SCW_DEFAULT_REGION` (default: `fr-par`) |
| defaultZone | `string` | No | `SCW_DEFAULT_ZONE` (default: `fr-par-1`) |

**Validation**: Fail fast at startup if required fields are missing. Region/zone validated against known Scaleway localities.

### Locality (enum)

Describes the scope at which a Scaleway API operates.

| Value | URL Pattern | Parameter |
|-------|-------------|-----------|
| `zoned` | `/zones/{zone}/...` | `zone` (e.g., `fr-par-1`) |
| `regional` | `/regions/{region}/...` | `region` (e.g., `fr-par`) |
| `global` | `/...` | none |

### PaginationParams

Standard pagination parameters shared across all Scaleway APIs.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| page | `number` | No | `1` | Page number (1-indexed) |
| pageSize | `number` | No | `50` | Items per page (API default: 100, our default: 50 for MCP readability) |

### PaginatedResponse\<T\>

Standard pagination response wrapper.

| Field | Type | Description |
|-------|------|-------------|
| items | `T[]` | Page of results |
| totalCount | `number` | Total items across all pages |
| page | `number` | Current page number |
| pageSize | `number` | Items per page |

### ToolModule

Conceptual entity — each product directory under `src/tools/` represents a tool module.

| Attribute | Description |
|-----------|-------------|
| name | Product directory name (e.g., `instances`, `k8s`, `lb`) |
| locality | `zoned`, `regional`, or `global` |
| sdkPackage | npm package name (e.g., `@scaleway/sdk-instance`) |
| registerTools | Function: `(server: McpServer) => void` |

### ApiError

Scaleway API error mapped to MCP error response.

| Field | Type | Description |
|-------|------|-------------|
| type | `string` | Error type (e.g., `not_found`, `permission_denied`) |
| message | `string` | Human-readable error message |
| statusCode | `number` | HTTP status code from Scaleway API |

## Relationships

```text
ScalewayConfig ──creates──> SDK Client (one shared client instance)
SDK Client ──used by──> ToolModule[] (all product modules share the client)
ToolModule ──registers──> MCP Tools (via server.registerTool)
MCP Tool ──accepts──> Zod-validated input (product-specific schema)
MCP Tool ──returns──> PaginatedResponse<T> | single resource | ApiError
```

## State Transitions

Not applicable — the MCP server is stateless. Each tool call is an independent request to the Scaleway API. No entities have lifecycle state managed by this server.
