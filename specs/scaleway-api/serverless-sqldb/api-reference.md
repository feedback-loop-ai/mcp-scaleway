# Scaleway Serverless SQL Databases API Reference

Base URL: `https://api.scaleway.com/serverless-sqldb/v1alpha1/regions/{region}`

Regions: `fr-par` (PostgreSQL). API version: `v1alpha1`.

Official reference: https://www.scaleway.com/en/developers/api/serverless-sql-databases/

## Authentication

- Header: `X-Auth-Token: <secret_key>` (handled by `@scaleway/sdk-client`)

All operations are **regional** (`/serverless-sqldb/v1alpha1/regions/{region}/...`).

## Pagination

List operations accept `page` (int, 1-based) and `page_size` (int, max 100) and
return `{ <collection>: T[], total_count: number }`.

## Databases

### List Databases
`GET /databases`
- Query: `page`, `page_size`, `project_id`, `organization_id`, `name`, `order_by`
  (`created_at_asc|created_at_desc|name_asc|name_desc`, default `created_at_asc`)
- Response: `{ databases: Database[], total_count: number }`
- Database: `{ id (uuid), name, status, endpoint, organization_id, project_id,
  region, created_at, cpu_min, cpu_max, cpu_current, started, engine_major_version }`

### Get Database
`GET /databases/{database_id}`
- Response: Database object

### Create Database
`POST /databases`
- Body: `{ name, cpu_min, cpu_max, project_id?, from_backup_id? }`
- Response: Database object

### Update Database
`PATCH /databases/{database_id}`
- Body: `{ cpu_min?, cpu_max? }`
- Response: Database object

### Delete Database
`DELETE /databases/{database_id}`
- Response: Database object (status: `deleting`)

### Restore Database
`POST /databases/{database_id}/restore`
- Body: `{ backup_id }`
- Response: Database object (status: `restoring`)

## Backups

### List Database Backups
`GET /backups`
- Query: `page`, `page_size`, `database_id` (required), `project_id`,
  `organization_id`, `order_by` (`created_at_asc|created_at_desc`, default
  `created_at_asc`)
- Response: `{ backups: DatabaseBackup[], total_count: number }`
- DatabaseBackup: `{ id (uuid), status, organization_id, project_id, database_id,
  created_at, region, expires_at?, size?, db_size?, download_url?,
  download_url_expires_at? }`

### Get Database Backup
`GET /backups/{backup_id}`
- Response: DatabaseBackup object

### Export Database Backup
`POST /backups/{backup_id}/export`
- Body: `{}`
- Response: DatabaseBackup object (with `download_url` and
  `download_url_expires_at` populated)

## Enums

- **Database status**: unknown_status, error, creating, ready, deleting, restoring,
  locked
- **Backup status**: unknown_status, error, ready, locked

## Error Codes

- 400: Invalid input
- 401: Missing/invalid auth token
- 403: Permission denied
- 404: Not found
- 409: Conflict
- 429: Too many requests
- 500: Internal server error

## Notes

- Backups are addressed at the top-level `/backups` collection filtered by
  `database_id` (not nested under `/databases/{id}/backups`), matching the
  `@scaleway/sdk-client` request paths used by the tool handlers.
