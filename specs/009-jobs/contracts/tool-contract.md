# Tool Contracts: Scaleway Serverless Jobs MCP Tools

**Feature**: 009-jobs | **Date**: 2026-03-11

## Job Definition Tools

### scaleway_jobs_list_definitions

**Scaleway API**: `GET /jobs/v1alpha2/regions/{region}/job-definitions`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | default region | Scaleway region (e.g., fr-par) |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| project_id | string (UUID) | no | - | Filter by project ID |

**Output**: `{ items: JobDefinition[], totalCount: number, page: number, pageSize: number }`

---

### scaleway_jobs_get_definition

**Scaleway API**: `GET /jobs/v1alpha2/regions/{region}/job-definitions/{job_definition_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region |
| job_definition_id | string (UUID) | yes | Job definition ID |

**Output**: `JobDefinition` (single object)

---

### scaleway_jobs_create_definition

**Scaleway API**: `POST /jobs/v1alpha2/regions/{region}/job-definitions`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region |
| name | string | yes | Job definition name (min 1 char) |
| cpu_limit | number | yes | CPU limit in millicores (positive integer) |
| memory_limit | number | yes | Memory limit in MiB (positive integer) |
| image_uri | string | yes | Container image URI (min 1 char) |
| command | string | no | Command to run |
| description | string | no | Job description |
| environment_variables | Record<string, string> | no | Key-value environment variables |
| job_timeout | string | no | Timeout duration (e.g., "3600s") |
| project_id | string (UUID) | no | Project ID |
| cron_schedule | object | no | Cron schedule with schedule (string) and optional timezone (string) |

**Output**: `JobDefinition` (created object)

---

### scaleway_jobs_update_definition

**Scaleway API**: `PATCH /jobs/v1alpha2/regions/{region}/job-definitions/{job_definition_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region |
| job_definition_id | string (UUID) | yes | Job definition ID to update |
| name | string | no | New name (min 1 char) |
| cpu_limit | number | no | CPU limit in millicores |
| memory_limit | number | no | Memory limit in MiB |
| image_uri | string | no | Container image URI |
| command | string | no | Command to run |
| description | string | no | Job description |
| environment_variables | Record<string, string> | no | Key-value environment variables |
| job_timeout | string | no | Timeout duration |
| cron_schedule | object | no | Cron schedule |

**Output**: `JobDefinition` (updated object)

---

### scaleway_jobs_delete_definition

**Scaleway API**: `DELETE /jobs/v1alpha2/regions/{region}/job-definitions/{job_definition_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region |
| job_definition_id | string (UUID) | yes | Job definition ID to delete |

**Output**: `{ deleted: true, job_definition_id: string }`

---

## Job Run Tools

### scaleway_jobs_start

**Scaleway API**: `POST /jobs/v1alpha2/regions/{region}/job-runs`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region |
| job_definition_id | string (UUID) | yes | Job definition ID to start |
| command | string | no | Override command |
| environment_variables | Record<string, string> | no | Override environment variables |

**Output**: `JobRun` (created run object with initial state)

---

### scaleway_jobs_list_runs

**Scaleway API**: `GET /jobs/v1alpha2/regions/{region}/job-runs`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | default region | Scaleway region |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| job_definition_id | string (UUID) | no | - | Filter by job definition ID |
| project_id | string (UUID) | no | - | Filter by project ID |

**Output**: `{ items: JobRun[], totalCount: number, page: number, pageSize: number }`

---

### scaleway_jobs_get_run

**Scaleway API**: `GET /jobs/v1alpha2/regions/{region}/job-runs/{job_run_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region |
| job_run_id | string (UUID) | yes | Job run ID |

**Output**: `JobRun` (single object with state, timing, exit code)

---

### scaleway_jobs_stop_run

**Scaleway API**: `POST /jobs/v1alpha2/regions/{region}/job-runs/{job_run_id}/stop`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Scaleway region |
| job_run_id | string (UUID) | yes | Job run ID to stop |

**Output**: `JobRun` (updated object with canceled state)
