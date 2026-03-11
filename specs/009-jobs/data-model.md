# Data Model: Scaleway Serverless Jobs MCP Tools

**Feature**: 009-jobs | **Date**: 2026-03-11

## Entities

### JobDefinition

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique job definition identifier |
| name | string | yes | Job definition name |
| cpu_limit | number | yes | CPU limit in millicores (e.g., 1000 = 1 vCPU) |
| memory_limit | number | yes | Memory limit in MiB (e.g., 256) |
| image_uri | string | yes | Container image URI (e.g., rg.fr-par.scw.cloud/namespace/image:latest) |
| command | string | no | Command to run inside the container |
| description | string | no | Human-readable description |
| environment_variables | Record<string, string> | no | Key-value environment variables |
| job_timeout | string | no | Timeout duration (e.g., "3600s") |
| project_id | string (UUID) | yes | Scaleway project ID |
| cron_schedule | CronSchedule/null | no | Optional recurring execution schedule |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last modification timestamp |
| region | string | yes | Scaleway region (e.g., fr-par) |

### JobRun

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique job run identifier |
| job_definition_id | string (UUID) | yes | Parent job definition ID |
| state | enum | yes | unknown_state, queued, scheduled, running, succeeded, failed, canceled, internal_error |
| command | string | no | Command executed (may override definition) |
| environment_variables | Record<string, string> | no | Environment variables (may override definition) |
| exit_code | number/null | no | Process exit code (available after completion) |
| error_message | string | no | Error message if run failed |
| cpu_limit | number | yes | CPU limit used for this run |
| memory_limit | number | yes | Memory limit used for this run |
| started_at | string (ISO 8601)/null | no | Timestamp when run started executing |
| terminated_at | string (ISO 8601)/null | no | Timestamp when run completed or was stopped |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| region | string | yes | Scaleway region |

### CronSchedule

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| schedule | string | yes | Cron expression (e.g., "0 * * * *" for hourly) |
| timezone | string | no | IANA timezone (e.g., "Europe/Paris"), defaults to UTC |
