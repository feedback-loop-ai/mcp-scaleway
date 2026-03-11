# Data Model: Scaleway Serverless Containers MCP Tools

**Feature**: 008-containers | **Date**: 2026-03-11

## Entities

### Namespace

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique namespace identifier |
| name | string | yes | Namespace name |
| description | string | no | Namespace description |
| organization_id | string (UUID) | yes | Organization ID |
| project_id | string (UUID) | yes | Project ID |
| status | enum | yes | ready, pending, error, locked, deleting |
| registry_namespace_id | string (UUID) | yes | Associated container registry namespace ID |
| registry_endpoint | string | yes | Container registry endpoint URL |
| error_message | string/null | no | Error message if status is error |
| environment_variables | Record<string, string> | no | Environment variables inherited by all containers |
| secret_environment_variables | Array<{key, value}> | no | Secret environment variables (write-only) |
| region | string | yes | Scaleway region (e.g., fr-par) |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last modification timestamp |

### Container

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique container identifier |
| name | string | yes | Container name |
| namespace_id | string (UUID) | yes | Parent namespace ID |
| status | enum | yes | unknown, ready, deleting, error, locked, creating, pending, created |
| registry_image | string | yes | Docker image URI |
| min_scale | number | yes | Minimum number of instances (0 = scale to zero) |
| max_scale | number | yes | Maximum number of instances |
| memory_limit | number | yes | Memory limit in MB |
| cpu_limit | number | yes | CPU limit in millicores |
| timeout | string | yes | Request timeout duration (e.g., "300s") |
| privacy | enum | yes | public, private |
| protocol | enum | yes | http1, h2c |
| port | number | yes | Container listening port |
| domain_name | string | yes | Auto-generated domain name |
| http_option | enum | yes | enabled, redirected, doNotForce |
| description | string | no | Container description |
| environment_variables | Record<string, string> | no | Container-level environment variables |
| secret_environment_variables | Array<{key, value}> | no | Secret environment variables (write-only) |
| error_message | string/null | no | Error message if status is error |
| region | string | yes | Scaleway region |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last modification timestamp |

### Cron

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique cron trigger identifier |
| container_id | string (UUID) | yes | Associated container ID |
| schedule | string | yes | Cron schedule expression (e.g., "0 * * * *") |
| args | Record<string, unknown> | no | JSON arguments passed to the container on trigger |
| name | string | no | Cron trigger name |
| status | enum | yes | unknown, ready, deleting, error, locked, creating, pending |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last modification timestamp |

### Domain

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique domain identifier |
| hostname | string | yes | Custom domain hostname (e.g., app.example.com) |
| container_id | string (UUID) | yes | Associated container ID |
| url | string | yes | Full URL for the custom domain |
| status | enum | yes | unknown, ready, deleting, error, creating, pending |
| error_message | string/null | no | Error message if status is error |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last modification timestamp |

### Token

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique token identifier |
| token | string | yes | Authentication token value (only returned on creation) |
| container_id | string (UUID)/null | no | Scoped container ID (mutually exclusive with namespace_id) |
| namespace_id | string (UUID)/null | no | Scoped namespace ID (mutually exclusive with container_id) |
| description | string | no | Token description |
| expires_at | string (ISO 8601)/null | no | Expiration date |
| status | enum | yes | unknown, ready, deleting, error, creating |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last modification timestamp |
