# Tool Contracts: Scaleway Account MCP Tools

**Feature**: 035-account | **Date**: 2026-03-11

## Project Tools

### scaleway_account_list_projects

**Scaleway API**: `GET /account/v3/projects`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| organization_id | string (UUID) | no | - | Organization ID to filter projects by |
| name | string | no | - | Name filter - returns projects matching this name |
| project_ids | string[] (UUID) | no | - | Filter by specific project IDs |
| order_by | enum | no | created_at_asc | Sort order (created_at_asc, created_at_desc, name_asc, name_desc) |
| page | number | no | 1 | Page number (1-indexed) |
| page_size | number | no | 50 | Items per page (1-100) |

**Output**: `{ projects: Project[], total_count: number, page: number, page_size: number }`

---

### scaleway_account_get_project

**Scaleway API**: `GET /account/v3/projects/{project_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| project_id | string (UUID) | yes | ID of the project to retrieve |

**Output**: `{ id, name, organization_id, description, created_at, updated_at }`

---

### scaleway_account_create_project

**Scaleway API**: `POST /account/v3/projects`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | no | Project name (max 64 chars, auto-generated if omitted) |
| organization_id | string (UUID) | no | Organization ID (uses default if omitted) |
| description | string | yes | Project description (max 200 chars) |

**Output**: `{ id, name, organization_id, description, created_at, updated_at }`

---

### scaleway_account_update_project

**Scaleway API**: `PATCH /account/v3/projects/{project_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| project_id | string (UUID) | yes | ID of the project to update |
| name | string | no | New name for the project (max 64 chars) |
| description | string | no | New description for the project (max 200 chars) |

**Output**: `{ id, name, organization_id, description, created_at, updated_at }`

---

### scaleway_account_delete_project

**Scaleway API**: `DELETE /account/v3/projects/{project_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| project_id | string (UUID) | yes | ID of the project to delete (must be empty) |

**Output**: `{ message: "Project {project_id} deleted successfully" }`
