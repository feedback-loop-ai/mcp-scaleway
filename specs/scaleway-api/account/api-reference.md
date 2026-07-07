# Scaleway Account API Reference

Official docs: https://www.scaleway.com/en/developers/api/account/project-api/

Base URL: `https://api.scaleway.com/account/v3`

## Authentication

- Header: `X-Auth-Token: <secret_key>` (Scaleway API secret key)
- Requires IAM permissions on the Project/Organization.

## Pagination

Offset-based via `page` (1-indexed) and `page_size` (1-100, default 50 in this
server). List responses return `total_count`.

## Entities

### Project

| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Project ID |
| name | string | Project name |
| organization_id | string (UUID) | Organization ID |
| description | string | Project description |
| created_at | string (ISO 8601) \| null | Creation timestamp |
| updated_at | string (ISO 8601) \| null | Last update timestamp |

## Endpoints (Project API)

### List Projects
- **Method/Path**: `GET /account/v3/projects`
- **Query**: `organization_id`, `name`, `project_ids[]`, `order_by`, `page`, `page_size`
- **order_by**: `created_at_asc` (default), `created_at_desc`, `name_asc`, `name_desc`
- **Response**: `{ projects: Project[], total_count: number }`
- **Errors**: 400, 401, 403
- **Tool**: `scaleway_account_list_projects`

### Get Project
- **Method/Path**: `GET /account/v3/projects/{project_id}`
- **Response**: `Project`
- **Errors**: 401, 403, 404
- **Tool**: `scaleway_account_get_project`

### Create Project
- **Method/Path**: `POST /account/v3/projects`
- **Body**: `{ name?: string (<=64), organization_id?: string (UUID), description: string (<=200) }`
- **Response**: `Project`
- **Errors**: 400, 401, 403
- **Tool**: `scaleway_account_create_project`

### Update Project
- **Method/Path**: `PATCH /account/v3/projects/{project_id}`
- **Body**: `{ name?: string (<=64), description?: string (<=200) }`
- **Response**: `Project`
- **Errors**: 400, 401, 403, 404
- **Tool**: `scaleway_account_update_project`

### Delete Project
- **Method/Path**: `DELETE /account/v3/projects/{project_id}`
- **Response**: 204 No Content (project must be empty)
- **Errors**: 400 (not empty), 401, 403, 404
- **Tool**: `scaleway_account_delete_project`

## SDK Package

`@scaleway/sdk-account` — `Accountv3.ProjectAPI`. Handlers translate snake_case
tool params to the SDK's camelCase request fields and back.

## Notes / Verification

- All 5 endpoints verified against the official Project API reference.
- The server surfaces only the Project API subset of Account v3 (not the
  Contract, Qualification, or Organization sub-APIs).
