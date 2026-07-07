# Scaleway Serverless Jobs API Reference

Base URL: `https://api.scaleway.com/serverless-jobs/v1alpha2/regions/{region}`

- Current API version: **v1alpha2** (verified against the official reference and the
  published OpenAPI schema `serverless-jobs/v1alpha2/schema.yml` on 2026-07-07).
- Regional API. Supported regions: `fr-par`, `nl-ams`, `pl-waw`.
- NOTE: the URL segment is `serverless-jobs`, **not** `jobs`.

Official reference: https://www.scaleway.com/en/developers/api/serverless-jobs/

## Authentication
- Header: `X-Auth-Token: <secret_key>`

## Pagination
- List endpoints accept `page` (int, 1-based) and `page_size` (int) query params.
- List responses have shape `{ <collection>: T[], total_count: number }`.

## Job Definitions

### List Job Definitions
`GET /job-definitions`
- Query: `page` (int), `page_size` (int), `order_by` (string), `project_id` (string), `organization_id` (string)
- Response: `{ job_definitions: JobDefinition[], total_count: number }`
- Tool: `scaleway_jobs_list_definitions`

### Get Job Definition
`GET /job-definitions/{job_definition_id}`
- Response: JobDefinition object
- Tool: `scaleway_jobs_get_definition`

### Create Job Definition
`POST /job-definitions`
- Body: `{ name, cpu_limit, memory_limit, image_uri, command?, description?, environment_variables?, job_timeout?, project_id?, cron_schedule? }`
  - `cpu_limit` in mvCPU (millicores), `memory_limit` in MiB.
  - `command` is a legacy string field (deprecated upstream in favour of `startup_command`/`args`, but still accepted).
  - `cron_schedule`: `{ schedule, timezone? }`.
- Response: JobDefinition object
- Tool: `scaleway_jobs_create_definition`

### Update Job Definition
`PATCH /job-definitions/{job_definition_id}`
- Body: `{ name?, cpu_limit?, memory_limit?, image_uri?, command?, description?, environment_variables?, job_timeout?, cron_schedule? }`
- Response: JobDefinition object
- Tool: `scaleway_jobs_update_definition`

### Delete Job Definition
`DELETE /job-definitions/{job_definition_id}`
- Response: empty
- Tool: `scaleway_jobs_delete_definition`

### Start Job Definition (create a run)
`POST /job-definitions/{job_definition_id}/start`
- The job definition id travels in the **path**, not the body.
- Body: `{ command?, startup_command?, args?, environment_variables?, replicas? }`
  (the server also accepts an empty body to run with the definition's defaults).
- Response: JobRun object (initial state e.g. `queued`)
- Tool: `scaleway_jobs_start`
- NOTE: there is **no** `POST /job-runs` endpoint. Runs are created only via this endpoint.

## Job Runs

### List Job Runs
`GET /job-runs`
- Query: `page` (int), `page_size` (int), `order_by` (string), `job_definition_id` (string), `project_id` (string)
- Response: `{ job_runs: JobRun[], total_count: number }`
- Tool: `scaleway_jobs_list_runs`

### Get Job Run
`GET /job-runs/{job_run_id}`
- Response: JobRun object (state, exit_code, timing, etc.)
- Tool: `scaleway_jobs_get_run`

### Stop Job Run
`POST /job-runs/{job_run_id}/stop`
- Response: JobRun object (state transitions toward `canceled`)
- Tool: `scaleway_jobs_stop_run`

## Enums

### JobRunState
`unknown_state`, `queued`, `scheduled`, `running`, `succeeded`, `failed`, `canceled`, `internal_error`

## Error Codes
Standard Scaleway HTTP error mapping applies:
- `400` invalid arguments
- `401` / `403` authentication / permission denied
- `404` resource not found
- `409` conflict / precondition failed
- `429` rate limited
- `5xx` server error
