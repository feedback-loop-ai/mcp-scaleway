# Data Model: Scaleway Serverless Functions MCP Tools

**Feature**: 007-functions | **Date**: 2026-03-11

## Entities

### Namespace

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique namespace identifier |
| name | string | yes | Namespace name |
| region | string | yes | Region (fr-par, nl-ams, pl-waw) |
| environment_variables | Record<string,string> | no | Environment variables |
| project_id | string (UUID) | yes | Project ID |
| status | enum | yes | ready, pending, error, locked, deleting |
| description | string | no | Description |
| registry_namespace_id | string | yes | Associated container registry namespace ID |
| registry_endpoint | string | yes | Registry endpoint URL |
| secret_environment_variables | Array<{key,value}> | no | Secret env vars (write-only; value is null on read) |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last update timestamp |

### Function

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique function identifier |
| name | string | yes | Function name |
| namespace_id | string (UUID) | yes | Parent namespace ID |
| runtime | string | yes | Runtime (node22, python312, go123, etc.) |
| handler | string | yes | Handler entry point (e.g., handler.handle) |
| memory_limit | number | yes | Memory limit in MB (128, 256, 512, 1024, 2048, 4096) |
| timeout | string | yes | Timeout duration (e.g., "300s") |
| min_scale | number | yes | Minimum instances (0+) |
| max_scale | number | yes | Maximum instances |
| status | enum | yes | ready, pending, error, locked, deleting, created, building |
| domain_name | string | yes | Auto-assigned domain |
| privacy | enum | yes | public, private |
| http_option | enum | yes | enabled, redirected |
| description | string | no | Description |
| environment_variables | Record<string,string> | no | Environment variables |
| secret_environment_variables | Array<{key,value}> | no | Secret env vars (write-only; value is null on read) |
| cpu_limit | number | yes | CPU limit in mVCPU |
| region | string | yes | Region |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last update timestamp |

### Cron

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique cron identifier |
| function_id | string (UUID) | yes | Target function ID |
| schedule | string | yes | Cron schedule expression (e.g., "0 * * * *") |
| args | object | no | JSON arguments passed to function on invocation |
| status | enum | yes | ready, pending, error, locked, deleting |
| name | string | no | Cron name |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last update timestamp |

### Domain

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique domain identifier |
| hostname | string | yes | Custom domain hostname |
| function_id | string (UUID) | yes | Associated function ID |
| url | string | yes | Full URL |
| status | enum | yes | ready, pending, error, deleting |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last update timestamp |

### Token

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique token identifier |
| function_id | string (UUID) | yes | Associated function ID |
| token | string | yes* | Token secret value (*only returned on creation) |
| status | enum | yes | ready, deleting |
| description | string | no | Token description |
| expires_at | string (ISO 8601)/null | no | Expiration timestamp |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last update timestamp |
