# Quickstart: Scaleway Serverless Jobs MCP Tools

**Feature**: 009-jobs | **Date**: 2026-03-11

## Prerequisites

1. Set environment variables:
   ```bash
   export SCW_ACCESS_KEY="your-access-key"
   export SCW_SECRET_KEY="your-secret-key"
   export SCW_DEFAULT_PROJECT_ID="your-project-id"
   export SCW_DEFAULT_REGION="fr-par"
   ```

2. Start the MCP server:
   ```bash
   bun run start
   ```

## Usage Examples

### List Job Definitions

```json
{
  "tool": "scaleway_jobs_list_definitions",
  "arguments": {
    "region": "fr-par",
    "page": 1,
    "pageSize": 10
  }
}
```

### Create a Job Definition

```json
{
  "tool": "scaleway_jobs_create_definition",
  "arguments": {
    "region": "fr-par",
    "name": "data-processor",
    "cpu_limit": 1000,
    "memory_limit": 256,
    "image_uri": "rg.fr-par.scw.cloud/my-namespace/processor:latest",
    "command": "python main.py",
    "description": "Nightly data processing job",
    "environment_variables": {
      "DATABASE_URL": "postgres://...",
      "LOG_LEVEL": "info"
    },
    "job_timeout": "3600s"
  }
}
```

### Create a Job Definition with Cron Schedule

```json
{
  "tool": "scaleway_jobs_create_definition",
  "arguments": {
    "region": "fr-par",
    "name": "hourly-sync",
    "cpu_limit": 500,
    "memory_limit": 128,
    "image_uri": "rg.fr-par.scw.cloud/my-namespace/sync:latest",
    "cron_schedule": {
      "schedule": "0 * * * *",
      "timezone": "Europe/Paris"
    }
  }
}
```

### Update a Job Definition

```json
{
  "tool": "scaleway_jobs_update_definition",
  "arguments": {
    "region": "fr-par",
    "job_definition_id": "job-definition-uuid",
    "cpu_limit": 2000,
    "memory_limit": 512,
    "image_uri": "rg.fr-par.scw.cloud/my-namespace/processor:v2"
  }
}
```

### Get a Job Definition

```json
{
  "tool": "scaleway_jobs_get_definition",
  "arguments": {
    "region": "fr-par",
    "job_definition_id": "job-definition-uuid"
  }
}
```

### Delete a Job Definition

```json
{
  "tool": "scaleway_jobs_delete_definition",
  "arguments": {
    "region": "fr-par",
    "job_definition_id": "job-definition-uuid"
  }
}
```

### Start a Job Run

```json
{
  "tool": "scaleway_jobs_start",
  "arguments": {
    "region": "fr-par",
    "job_definition_id": "job-definition-uuid"
  }
}
```

### Start a Job Run with Overrides

```json
{
  "tool": "scaleway_jobs_start",
  "arguments": {
    "region": "fr-par",
    "job_definition_id": "job-definition-uuid",
    "command": "python main.py --mode=backfill",
    "environment_variables": {
      "START_DATE": "2026-01-01",
      "END_DATE": "2026-03-01"
    }
  }
}
```

### List Job Runs

```json
{
  "tool": "scaleway_jobs_list_runs",
  "arguments": {
    "region": "fr-par",
    "job_definition_id": "job-definition-uuid",
    "page": 1,
    "pageSize": 20
  }
}
```

### Get Job Run Details

```json
{
  "tool": "scaleway_jobs_get_run",
  "arguments": {
    "region": "fr-par",
    "job_run_id": "job-run-uuid"
  }
}
```

### Stop a Running Job

```json
{
  "tool": "scaleway_jobs_stop_run",
  "arguments": {
    "region": "fr-par",
    "job_run_id": "job-run-uuid"
  }
}
```
