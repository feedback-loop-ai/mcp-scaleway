# Scaleway Account / Project API Reference

Base URL: `https://api.scaleway.com/account/v3`

## Entities

### Project
| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Project ID |
| name | string | Project name |
| organization_id | string (UUID) | Organization ID |
| description | string | Project description |
| created_at | string (ISO 8601) | Creation timestamp |
| updated_at | string (ISO 8601) | Last update timestamp |

## Endpoints

### List Projects
- **Method**: `GET /account/v3/projects`
- **Auth**: `X-Auth-Token` header (SCW secret key)
- **Query params**: `organization_id`, `name`, `page`, `page_size`, `order_by`, `project_ids[]`
- **Response**: `{ projects: Project[], total_count: number }`
- **Pagination**: offset-based (`page`, `page_size`)
- **Order by**: `created_at_asc`, `created_at_desc`, `name_asc`, `name_desc`
- **Error codes**: 401, 403

### Get Project
- **Method**: `GET /account/v3/projects/{project_id}`
- **Auth**: `X-Auth-Token` header
- **Response**: `Project`
- **Error codes**: 401, 403, 404

### Create Project
- **Method**: `POST /account/v3/projects`
- **Auth**: `X-Auth-Token` header
- **Body**: `{ name?: string, organization_id?: string, description: string }`
- **Response**: `Project`
- **Error codes**: 400, 401, 403

### Update Project
- **Method**: `PATCH /account/v3/projects/{project_id}`
- **Auth**: `X-Auth-Token` header
- **Body**: `{ name?: string, description?: string }`
- **Response**: `Project`
- **Error codes**: 400, 401, 403, 404

### Delete Project
- **Method**: `DELETE /account/v3/projects/{project_id}`
- **Auth**: `X-Auth-Token` header
- **Response**: 204 No Content
- **Error codes**: 400 (not empty), 401, 403, 404

## SDK Package
`@scaleway/sdk-account` - `Accountv3.ProjectAPI`
