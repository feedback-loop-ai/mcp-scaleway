# Data Model: Scaleway IAM MCP Tools

**Feature**: 023-iam | **Date**: 2026-03-11

## Entities

### User

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique user identifier |
| email | string | yes | User email address |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last modification timestamp |
| organization_id | string (UUID) | yes | Organization ID |
| status | string | yes | User status (e.g., active, invited) |
| type | string | yes | User type |
| mfa | boolean | yes | Whether MFA is enabled |
| last_login_at | string (ISO 8601)/null | no | Last login timestamp |

### Application

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique application identifier |
| name | string | yes | Application name |
| description | string | yes | Application description |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last modification timestamp |
| organization_id | string (UUID) | yes | Organization ID |

### ApiKey

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| access_key | string | yes | API key access key identifier |
| secret_key | string | no | Secret key (only returned on creation) |
| application_id | string (UUID)/null | no | Owning application ID |
| user_id | string (UUID)/null | no | Owning user ID |
| description | string | yes | API key description |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last modification timestamp |
| expires_at | string (ISO 8601)/null | no | Expiration timestamp |
| default_project_id | string (UUID)/null | no | Default project ID for this key |

### Policy

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique policy identifier |
| name | string | yes | Policy name |
| description | string | yes | Policy description |
| organization_id | string (UUID) | yes | Organization ID |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last modification timestamp |
| user_id | string (UUID)/null | no | Attached user ID |
| group_id | string (UUID)/null | no | Attached group ID |
| application_id | string (UUID)/null | no | Attached application ID |
| nb_rules | number | no | Number of rules in the policy |
| nb_scopes | number | no | Number of scopes in the policy |
| nb_permission_sets | number | no | Number of permission sets in the policy |

### Rule

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique rule identifier |
| permission_set_names | string[] | yes | Names of granted permission sets |
| project_ids | string[] | yes | Project IDs this rule applies to |
| organization_id | string (UUID) | yes | Organization ID for this rule |

### Group

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique group identifier |
| name | string | yes | Group name |
| description | string | yes | Group description |
| organization_id | string (UUID) | yes | Organization ID |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last modification timestamp |
| user_ids | string[] | yes | IDs of users in the group |
| application_ids | string[] | yes | IDs of applications in the group |

### PermissionSet

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique permission set identifier |
| name | string | yes | Permission set name |
| description | string | yes | Permission set description |
| categories | string[] | no | Permission set categories |
