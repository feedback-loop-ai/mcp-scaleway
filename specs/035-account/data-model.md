# Data Model: Scaleway Account MCP Tools

**Feature**: 035-account | **Date**: 2026-03-11

## Entities

### Project

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique project identifier |
| name | string | yes | Project name (max 64 characters) |
| organization_id | string (UUID) | yes | Organization the project belongs to |
| description | string | yes | Project description (max 200 characters) |
| created_at | string (ISO 8601) / null | yes | Creation timestamp |
| updated_at | string (ISO 8601) / null | yes | Last modification timestamp |

### ListProjectsApiResponse

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| projects | ProjectResponse[] | yes | Array of project objects |
| total_count | number | yes | Total number of projects matching the query |
| page | number | yes | Current page number |
| page_size | number | yes | Number of items per page |
