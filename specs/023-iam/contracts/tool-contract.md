# Tool Contracts: Scaleway IAM MCP Tools

**Feature**: 023-iam | **Date**: 2026-03-11

## User Tools

### scaleway_iam_list_users

**Scaleway API**: `GET /iam/v1alpha1/users`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| organization_id | string | no | - | Filter by organization ID |
| page | number | no | 1 | Page number (1-indexed) |
| page_size | number | no | 50 | Items per page (1-100) |
| order_by | string | no | - | Order by field (e.g., created_at_asc) |

**Output**: `{ users: User[], total_count: number }`

---

### scaleway_iam_get_user

**Scaleway API**: `GET /iam/v1alpha1/users/{user_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| user_id | string | yes | User UUID |

**Output**: `{ user: User }`

---

### scaleway_iam_create_user

**Scaleway API**: `POST /iam/v1alpha1/users`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| organization_id | string | yes | Organization ID |
| email | string | yes | User email address |

**Output**: `{ user: User }`

---

### scaleway_iam_update_user

**Scaleway API**: `PATCH /iam/v1alpha1/users/{user_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| user_id | string | yes | User UUID |

**Output**: `{ user: User }`

---

### scaleway_iam_delete_user

**Scaleway API**: `DELETE /iam/v1alpha1/users/{user_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| user_id | string | yes | User UUID |

**Output**: `{ message: "User deleted successfully" }`

---

## Application Tools

### scaleway_iam_list_applications

**Scaleway API**: `GET /iam/v1alpha1/applications`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| organization_id | string | no | - | Filter by organization ID |
| page | number | no | 1 | Page number (1-indexed) |
| page_size | number | no | 50 | Items per page (1-100) |
| order_by | string | no | - | Order by field |

**Output**: `{ applications: Application[], total_count: number }`

---

### scaleway_iam_get_application

**Scaleway API**: `GET /iam/v1alpha1/applications/{application_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| application_id | string | yes | Application UUID |

**Output**: `{ application: Application }`

---

### scaleway_iam_create_application

**Scaleway API**: `POST /iam/v1alpha1/applications`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Application name |
| organization_id | string | no | Organization ID |
| description | string | no | Application description (default: "") |

**Output**: `{ application: Application }`

---

### scaleway_iam_update_application

**Scaleway API**: `PATCH /iam/v1alpha1/applications/{application_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| application_id | string | yes | Application UUID |
| name | string | no | New name |
| description | string | no | New description |

**Output**: `{ application: Application }`

---

### scaleway_iam_delete_application

**Scaleway API**: `DELETE /iam/v1alpha1/applications/{application_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| application_id | string | yes | Application UUID |

**Output**: `{ message: "Application deleted successfully" }`

---

## API Key Tools

### scaleway_iam_list_api_keys

**Scaleway API**: `GET /iam/v1alpha1/api-keys`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| organization_id | string | no | - | Filter by organization ID |
| application_id | string | no | - | Filter by application ID |
| user_id | string | no | - | Filter by user ID |
| page | number | no | 1 | Page number (1-indexed) |
| page_size | number | no | 50 | Items per page (1-100) |
| order_by | string | no | - | Order by field |

**Output**: `{ api_keys: ApiKey[], total_count: number }`

---

### scaleway_iam_get_api_key

**Scaleway API**: `GET /iam/v1alpha1/api-keys/{access_key}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| access_key | string | yes | API key access key |

**Output**: `{ api_key: ApiKey }`

---

### scaleway_iam_create_api_key

**Scaleway API**: `POST /iam/v1alpha1/api-keys`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| application_id | string | no | Application ID (mutually exclusive with user_id) |
| user_id | string | no | User ID (mutually exclusive with application_id) |
| description | string | no | API key description (default: "") |
| expires_at | string | no | Expiration date (ISO 8601) |
| default_project_id | string | no | Default project ID |

**Output**: `{ api_key: ApiKey }` (includes secret_key on creation)

---

### scaleway_iam_update_api_key

**Scaleway API**: `PATCH /iam/v1alpha1/api-keys/{access_key}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| access_key | string | yes | API key access key |
| description | string | no | New description |
| default_project_id | string | no | New default project ID |

**Output**: `{ api_key: ApiKey }`

---

### scaleway_iam_delete_api_key

**Scaleway API**: `DELETE /iam/v1alpha1/api-keys/{access_key}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| access_key | string | yes | API key access key |

**Output**: `{ message: "API key deleted successfully" }`

---

## Policy Tools

### scaleway_iam_list_policies

**Scaleway API**: `GET /iam/v1alpha1/policies`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| organization_id | string | no | - | Filter by organization ID |
| page | number | no | 1 | Page number (1-indexed) |
| page_size | number | no | 50 | Items per page (1-100) |
| order_by | string | no | - | Order by field |

**Output**: `{ policies: Policy[], total_count: number }`

---

### scaleway_iam_get_policy

**Scaleway API**: `GET /iam/v1alpha1/policies/{policy_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| policy_id | string | yes | Policy UUID |

**Output**: `{ policy: Policy }`

---

### scaleway_iam_create_policy

**Scaleway API**: `POST /iam/v1alpha1/policies`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Policy name |
| organization_id | string | no | Organization ID |
| description | string | no | Policy description (default: "") |
| user_id | string | no | User ID to attach the policy to |
| group_id | string | no | Group ID to attach the policy to |
| application_id | string | no | Application ID to attach the policy to |
| rules | array | no | Inline rules (permission_set_names, project_ids, organization_id) |

**Output**: `{ policy: Policy }`

---

### scaleway_iam_update_policy

**Scaleway API**: `PATCH /iam/v1alpha1/policies/{policy_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| policy_id | string | yes | Policy UUID |
| name | string | no | New name |
| description | string | no | New description |
| user_id | string/null | no | User ID |
| group_id | string/null | no | Group ID |
| application_id | string/null | no | Application ID |

**Output**: `{ policy: Policy }`

---

### scaleway_iam_delete_policy

**Scaleway API**: `DELETE /iam/v1alpha1/policies/{policy_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| policy_id | string | yes | Policy UUID |

**Output**: `{ message: "Policy deleted successfully" }`

---

## Rule Tools

### scaleway_iam_list_rules

**Scaleway API**: `GET /iam/v1alpha1/rules`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| policy_id | string | yes | - | Policy ID to list rules for |
| page | number | no | 1 | Page number (1-indexed) |
| page_size | number | no | 50 | Items per page (1-100) |

**Output**: `{ rules: Rule[], total_count: number }`

---

### scaleway_iam_create_rule

**Scaleway API**: `POST /iam/v1alpha1/rules`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| policy_id | string | yes | Policy ID |
| permission_set_names | string[] | yes | Permission set names |
| project_ids | string[] | no | Project IDs |
| organization_id | string | no | Organization ID for this rule |

**Output**: `{ rule: Rule }`

---

### scaleway_iam_update_rule

**Scaleway API**: `PATCH /iam/v1alpha1/rules/{rule_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| rule_id | string | yes | Rule UUID |
| permission_set_names | string[] | no | Permission set names |
| project_ids | string[] | no | Project IDs |
| organization_id | string | no | Organization ID |

**Output**: `{ rule: Rule }`

---

### scaleway_iam_delete_rule

**Scaleway API**: `DELETE /iam/v1alpha1/rules/{rule_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| rule_id | string | yes | Rule UUID |

**Output**: `{ message: "Rule deleted successfully" }`

---

## Group Tools

### scaleway_iam_list_groups

**Scaleway API**: `GET /iam/v1alpha1/groups`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| organization_id | string | no | - | Filter by organization ID |
| page | number | no | 1 | Page number (1-indexed) |
| page_size | number | no | 50 | Items per page (1-100) |
| order_by | string | no | - | Order by field |

**Output**: `{ groups: Group[], total_count: number }`

---

### scaleway_iam_get_group

**Scaleway API**: `GET /iam/v1alpha1/groups/{group_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| group_id | string | yes | Group UUID |

**Output**: `{ group: Group }`

---

### scaleway_iam_create_group

**Scaleway API**: `POST /iam/v1alpha1/groups`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Group name |
| organization_id | string | no | Organization ID |
| description | string | no | Group description (default: "") |

**Output**: `{ group: Group }`

---

### scaleway_iam_update_group

**Scaleway API**: `PATCH /iam/v1alpha1/groups/{group_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| group_id | string | yes | Group UUID |
| name | string | no | New name |
| description | string | no | New description |

**Output**: `{ group: Group }`

---

### scaleway_iam_delete_group

**Scaleway API**: `DELETE /iam/v1alpha1/groups/{group_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| group_id | string | yes | Group UUID |

**Output**: `{ message: "Group deleted successfully" }`

---

### scaleway_iam_add_group_member

**Scaleway API**: `POST /iam/v1alpha1/groups/{group_id}/members`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| group_id | string | yes | Group UUID |
| user_id | string | no | User UUID to add |
| application_id | string | no | Application UUID to add |

**Output**: `{ group: Group }`

---

### scaleway_iam_remove_group_member

**Scaleway API**: `DELETE /iam/v1alpha1/groups/{group_id}/members`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| group_id | string | yes | Group UUID |
| user_id | string | no | User UUID to remove |
| application_id | string | no | Application UUID to remove |

**Output**: `{ group: Group }`

---

## Permission Set Tools

### scaleway_iam_list_permission_sets

**Scaleway API**: `GET /iam/v1alpha1/permission-sets`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| organization_id | string | no | - | Filter by organization ID |
| page | number | no | 1 | Page number (1-indexed) |
| page_size | number | no | 50 | Items per page (1-100) |
| order_by | string | no | - | Order by field |

**Output**: `{ permission_sets: PermissionSet[], total_count: number }`
