# Data Model: Scaleway SQS (Queues) MCP Tools

**Feature**: 027-sqs | **Date**: 2026-03-11

## Entities

### SqsInfo

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| project_id | string (UUID) | yes | Project ID |
| region | string | yes | Scaleway region (e.g., fr-par) |
| status | enum | yes | Service status: unknown_status, enabled, disabled |
| sqs_endpoint_url | string | yes | SQS-compatible endpoint URL |
| created_at | string (ISO 8601)/null | no | Creation timestamp |
| updated_at | string (ISO 8601)/null | no | Last update timestamp |

### SqsCredentials

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique credential identifier |
| name | string | yes | Credential name |
| project_id | string (UUID) | yes | Project ID |
| region | string | yes | Scaleway region |
| access_key | string | yes | SQS access key for the SQS-compatible endpoint |
| secret_key | string | yes | SQS secret key (only returned at creation time) |
| created_at | string (ISO 8601)/null | no | Creation timestamp |
| updated_at | string (ISO 8601)/null | no | Last update timestamp |
| permissions | SqsPermissions/null | no | Permission set |

### SqsPermissions

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| can_publish | boolean | no | false | Allow publishing messages to queues |
| can_receive | boolean | no | false | Allow receiving messages from queues |
| can_manage | boolean | no | false | Allow managing queues (create, delete, configure) |

## Enums

### SqsStatus

| Value | Description |
|-------|-------------|
| unknown_status | Status is unknown |
| enabled | SQS service is active |
| disabled | SQS service is deactivated |

### SqsCredentialsOrderBy

| Value | Description |
|-------|-------------|
| created_at_asc | Oldest first |
| created_at_desc | Newest first |
| name_asc | Alphabetical by name |
| name_desc | Reverse alphabetical by name |
| updated_at_asc | Least recently updated first |
| updated_at_desc | Most recently updated first |
