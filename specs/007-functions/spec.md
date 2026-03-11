# SDD: Serverless Functions API

**Spec**: 007-functions | **Date**: 2026-03-11
**API Group**: Serverless | **Locality**: regional (fr-par, nl-ams, pl-waw)
**SDK Package**: `@scaleway/sdk-client` (raw fetch)

## Overview

Scaleway Serverless Functions enables deploying and managing serverless function workloads. The API manages function namespaces (isolation boundaries), functions (code units with runtime/handler/scaling config), cron triggers (scheduled invocations), custom domains, and access tokens.

## User Stories

### US-1: Manage Function Namespaces (P1)

A user creates, lists, gets, updates, and deletes function namespaces to organize serverless workloads by project/environment.

**Acceptance Scenarios**:
1. Given valid credentials, when listing namespaces, then return paginated list with id, name, status, region.
2. Given valid credentials, when creating a namespace with name and environment_variables, then return the created namespace.
3. Given a namespace ID, when getting it, then return full namespace details.
4. Given a namespace ID and updated fields, when updating, then return the updated namespace.
5. Given a namespace ID, when deleting, then return confirmation of deletion.

### US-2: Manage Functions (P1)

A user creates, lists, gets, updates, deletes, and deploys functions within namespaces.

**Acceptance Scenarios**:
1. Given a namespace ID, when listing functions, then return paginated list.
2. Given function config (name, namespace_id, runtime, handler, etc.), when creating, then return created function.
3. Given a function ID, when getting, then return full function details including domain_name and status.
4. Given a function ID and updated fields, when updating, then return updated function.
5. Given a function ID, when deleting, then return confirmation.
6. Given a function ID, when deploying, then trigger deployment and return updated function.

### US-3: Manage Cron Triggers (P2)

A user creates, lists, updates, and deletes cron triggers to schedule function invocations.

**Acceptance Scenarios**:
1. Given a function ID, when listing crons, then return paginated list.
2. Given function_id, schedule, and optional args, when creating a cron, then return created cron.
3. Given a cron ID and updated schedule/args, when updating, then return updated cron.
4. Given a cron ID, when deleting, then return confirmation.

### US-4: Manage Custom Domains and Tokens (P3)

A user manages custom domains for functions and creates/revokes access tokens.

**Acceptance Scenarios**:
1. Given a function ID, when listing domains, then return domains attached to function.
2. Given function_id and hostname, when creating a domain, then return created domain.
3. Given a domain ID, when deleting, then return confirmation.
4. Given function_id and optional description/expires_at, when creating a token, then return token with value.
5. Given a token ID, when deleting (revoking), then return confirmation.

## Entities

### Namespace
| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | Namespace identifier |
| name | string | Namespace name |
| region | string | Region (fr-par, nl-ams, pl-waw) |
| environment_variables | Record<string,string> | Environment variables |
| project_id | string (uuid) | Project ID |
| status | string | Status (ready, pending, error, locked, deleting) |
| description | string | Description |
| registry_namespace_id | string | Associated container registry namespace |
| registry_endpoint | string | Registry endpoint URL |
| secret_environment_variables | Array<{key,value}> | Secret env vars (write-only) |
| created_at | string (datetime) | Creation timestamp |
| updated_at | string (datetime) | Last update timestamp |

### Function
| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | Function identifier |
| name | string | Function name |
| namespace_id | string (uuid) | Parent namespace ID |
| runtime | string | Runtime (node22, python312, go123, etc.) |
| handler | string | Handler entry point |
| memory_limit | number | Memory limit in MB (128-4096) |
| timeout | string | Timeout duration (e.g., "300s") |
| min_scale | number | Minimum instances (0+) |
| max_scale | number | Maximum instances |
| status | string | Status (ready, pending, error, locked, deleting, created, building) |
| domain_name | string | Auto-assigned domain |
| privacy | string | Privacy level (public, private) |
| http_option | string | HTTP option (enabled, redirected) |
| description | string | Description |
| environment_variables | Record<string,string> | Environment variables |
| secret_environment_variables | Array<{key,value}> | Secret env vars (write-only) |
| cpu_limit | number | CPU limit in mVCPU |
| region | string | Region |
| created_at | string (datetime) | Creation timestamp |
| updated_at | string (datetime) | Last update timestamp |

### Cron
| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | Cron identifier |
| function_id | string (uuid) | Target function ID |
| schedule | string | Cron schedule expression |
| args | object | JSON arguments passed to function |
| status | string | Status (ready, pending, error, locked, deleting) |
| name | string | Cron name |
| created_at | string (datetime) | Creation timestamp |
| updated_at | string (datetime) | Last update timestamp |

### Domain
| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | Domain identifier |
| hostname | string | Custom domain hostname |
| function_id | string (uuid) | Associated function ID |
| url | string | Full URL |
| status | string | Status (ready, pending, error, deleting) |
| created_at | string (datetime) | Creation timestamp |
| updated_at | string (datetime) | Last update timestamp |

### Token
| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | Token identifier |
| function_id | string (uuid) | Associated function ID |
| token | string | Token value (only on creation) |
| status | string | Status (ready, deleting) |
| description | string | Token description |
| expires_at | string (datetime) | Expiration timestamp |
| created_at | string (datetime) | Creation timestamp |
| updated_at | string (datetime) | Last update timestamp |

## Tool Contracts

### scaleway_functions_list_namespaces

```yaml
Tool: scaleway_functions_list_namespaces
Title: List Function Namespaces
Description: List all function namespaces in a region
Scaleway API: GET /functions/v1beta1/regions/{region}/namespaces
Locality: regional

Input Schema:
  region: z.string() - Scaleway region [required]
  page: z.number() - Page number [optional, default=1]
  page_size: z.number() - Items per page [optional, default=50]
  project_id: z.string() - Filter by project [optional]
  name: z.string() - Filter by name [optional]
  order_by: z.string() - Order by field [optional]

Output Schema:
  namespaces: Namespace[] - List of namespaces
  total_count: number - Total number of namespaces

Pagination: yes
Error Codes:
  - 400: Invalid input -> invalid_input
  - 403: Forbidden -> permission_denied
  - 404: Not found -> not_found
  - 429: Rate limited -> rate_limited
```

### scaleway_functions_get_namespace

```yaml
Tool: scaleway_functions_get_namespace
Title: Get Function Namespace
Description: Get details of a specific function namespace
Scaleway API: GET /functions/v1beta1/regions/{region}/namespaces/{namespace_id}
Locality: regional

Input Schema:
  region: z.string() - Scaleway region [required]
  namespace_id: z.string() - Namespace ID [required]

Output Schema:
  Namespace object

Pagination: no
Error Codes:
  - 403: Forbidden -> permission_denied
  - 404: Not found -> not_found
```

### scaleway_functions_create_namespace

```yaml
Tool: scaleway_functions_create_namespace
Title: Create Function Namespace
Description: Create a new function namespace
Scaleway API: POST /functions/v1beta1/regions/{region}/namespaces
Locality: regional

Input Schema:
  region: z.string() - Scaleway region [required]
  name: z.string() - Namespace name [required]
  project_id: z.string() - Project ID [optional]
  description: z.string() - Description [optional]
  environment_variables: z.record() - Env vars [optional]
  secret_environment_variables: z.array() - Secret env vars [optional]

Output Schema:
  Namespace object

Pagination: no
Error Codes:
  - 400: Invalid input -> invalid_input
  - 403: Forbidden -> permission_denied
  - 409: Conflict -> invalid_input
```

### scaleway_functions_update_namespace

```yaml
Tool: scaleway_functions_update_namespace
Title: Update Function Namespace
Description: Update an existing function namespace
Scaleway API: PATCH /functions/v1beta1/regions/{region}/namespaces/{namespace_id}
Locality: regional

Input Schema:
  region: z.string() - Scaleway region [required]
  namespace_id: z.string() - Namespace ID [required]
  description: z.string() - Description [optional]
  environment_variables: z.record() - Env vars [optional]
  secret_environment_variables: z.array() - Secret env vars [optional]

Output Schema:
  Namespace object

Pagination: no
Error Codes:
  - 400: Invalid input -> invalid_input
  - 403: Forbidden -> permission_denied
  - 404: Not found -> not_found
```

### scaleway_functions_delete_namespace

```yaml
Tool: scaleway_functions_delete_namespace
Title: Delete Function Namespace
Description: Delete a function namespace
Scaleway API: DELETE /functions/v1beta1/regions/{region}/namespaces/{namespace_id}
Locality: regional

Input Schema:
  region: z.string() - Scaleway region [required]
  namespace_id: z.string() - Namespace ID [required]

Output Schema:
  Namespace object (with deleting status)

Pagination: no
Error Codes:
  - 403: Forbidden -> permission_denied
  - 404: Not found -> not_found
```

### scaleway_functions_list_functions

```yaml
Tool: scaleway_functions_list_functions
Title: List Functions
Description: List all functions in a namespace
Scaleway API: GET /functions/v1beta1/regions/{region}/functions
Locality: regional

Input Schema:
  region: z.string() - Scaleway region [required]
  namespace_id: z.string() - Namespace ID [required]
  page: z.number() - Page number [optional, default=1]
  page_size: z.number() - Items per page [optional, default=50]
  name: z.string() - Filter by name [optional]
  order_by: z.string() - Order by field [optional]
  project_id: z.string() - Filter by project [optional]

Output Schema:
  functions: Function[] - List of functions
  total_count: number - Total number of functions

Pagination: yes
Error Codes:
  - 400: Invalid input -> invalid_input
  - 403: Forbidden -> permission_denied
  - 404: Not found -> not_found
```

### scaleway_functions_get_function

```yaml
Tool: scaleway_functions_get_function
Title: Get Function
Description: Get details of a specific function
Scaleway API: GET /functions/v1beta1/regions/{region}/functions/{function_id}
Locality: regional

Input Schema:
  region: z.string() - Scaleway region [required]
  function_id: z.string() - Function ID [required]

Output Schema:
  Function object

Pagination: no
Error Codes:
  - 403: Forbidden -> permission_denied
  - 404: Not found -> not_found
```

### scaleway_functions_create_function

```yaml
Tool: scaleway_functions_create_function
Title: Create Function
Description: Create a new function in a namespace
Scaleway API: POST /functions/v1beta1/regions/{region}/functions
Locality: regional

Input Schema:
  region: z.string() - Scaleway region [required]
  namespace_id: z.string() - Namespace ID [required]
  name: z.string() - Function name [required]
  runtime: z.string() - Runtime [required]
  handler: z.string() - Handler entry point [required]
  privacy: z.string() - Privacy level [required]
  memory_limit: z.number() - Memory limit in MB [optional]
  timeout: z.string() - Timeout duration [optional]
  min_scale: z.number() - Minimum scale [optional]
  max_scale: z.number() - Maximum scale [optional]
  description: z.string() - Description [optional]
  environment_variables: z.record() - Env vars [optional]
  secret_environment_variables: z.array() - Secret env vars [optional]
  http_option: z.string() - HTTP option [optional]

Output Schema:
  Function object

Pagination: no
Error Codes:
  - 400: Invalid input -> invalid_input
  - 403: Forbidden -> permission_denied
  - 404: Namespace not found -> not_found
  - 409: Conflict -> invalid_input
```

### scaleway_functions_update_function

```yaml
Tool: scaleway_functions_update_function
Title: Update Function
Description: Update an existing function
Scaleway API: PATCH /functions/v1beta1/regions/{region}/functions/{function_id}
Locality: regional

Input Schema:
  region: z.string() - Scaleway region [required]
  function_id: z.string() - Function ID [required]
  runtime: z.string() - Runtime [optional]
  handler: z.string() - Handler [optional]
  privacy: z.string() - Privacy level [optional]
  memory_limit: z.number() - Memory limit in MB [optional]
  timeout: z.string() - Timeout duration [optional]
  min_scale: z.number() - Minimum scale [optional]
  max_scale: z.number() - Maximum scale [optional]
  description: z.string() - Description [optional]
  environment_variables: z.record() - Env vars [optional]
  secret_environment_variables: z.array() - Secret env vars [optional]
  http_option: z.string() - HTTP option [optional]

Output Schema:
  Function object

Pagination: no
Error Codes:
  - 400: Invalid input -> invalid_input
  - 403: Forbidden -> permission_denied
  - 404: Not found -> not_found
```

### scaleway_functions_delete_function

```yaml
Tool: scaleway_functions_delete_function
Title: Delete Function
Description: Delete a function
Scaleway API: DELETE /functions/v1beta1/regions/{region}/functions/{function_id}
Locality: regional

Input Schema:
  region: z.string() - Scaleway region [required]
  function_id: z.string() - Function ID [required]

Output Schema:
  Function object (with deleting status)

Pagination: no
Error Codes:
  - 403: Forbidden -> permission_denied
  - 404: Not found -> not_found
```

### scaleway_functions_deploy_function

```yaml
Tool: scaleway_functions_deploy_function
Title: Deploy Function
Description: Deploy a function (trigger build and deployment)
Scaleway API: POST /functions/v1beta1/regions/{region}/functions/{function_id}/deploy
Locality: regional

Input Schema:
  region: z.string() - Scaleway region [required]
  function_id: z.string() - Function ID [required]

Output Schema:
  Function object (with building/pending status)

Pagination: no
Error Codes:
  - 403: Forbidden -> permission_denied
  - 404: Not found -> not_found
```

### scaleway_functions_list_crons

```yaml
Tool: scaleway_functions_list_crons
Title: List Cron Triggers
Description: List all cron triggers for functions
Scaleway API: GET /functions/v1beta1/regions/{region}/crons
Locality: regional

Input Schema:
  region: z.string() - Scaleway region [required]
  function_id: z.string() - Filter by function ID [required]
  page: z.number() - Page number [optional, default=1]
  page_size: z.number() - Items per page [optional, default=50]
  order_by: z.string() - Order by field [optional]

Output Schema:
  crons: Cron[] - List of crons
  total_count: number - Total number of crons

Pagination: yes
Error Codes:
  - 400: Invalid input -> invalid_input
  - 403: Forbidden -> permission_denied
  - 404: Not found -> not_found
```

### scaleway_functions_create_cron

```yaml
Tool: scaleway_functions_create_cron
Title: Create Cron Trigger
Description: Create a cron trigger for a function
Scaleway API: POST /functions/v1beta1/regions/{region}/crons
Locality: regional

Input Schema:
  region: z.string() - Scaleway region [required]
  function_id: z.string() - Function ID [required]
  schedule: z.string() - Cron schedule expression [required]
  name: z.string() - Cron name [optional]
  args: z.record() - JSON args passed to function [optional]

Output Schema:
  Cron object

Pagination: no
Error Codes:
  - 400: Invalid input -> invalid_input
  - 403: Forbidden -> permission_denied
  - 404: Function not found -> not_found
```

### scaleway_functions_update_cron

```yaml
Tool: scaleway_functions_update_cron
Title: Update Cron Trigger
Description: Update a cron trigger
Scaleway API: PATCH /functions/v1beta1/regions/{region}/crons/{cron_id}
Locality: regional

Input Schema:
  region: z.string() - Scaleway region [required]
  cron_id: z.string() - Cron ID [required]
  schedule: z.string() - Cron schedule expression [optional]
  name: z.string() - Cron name [optional]
  args: z.record() - JSON args [optional]
  function_id: z.string() - Function ID [optional]

Output Schema:
  Cron object

Pagination: no
Error Codes:
  - 400: Invalid input -> invalid_input
  - 403: Forbidden -> permission_denied
  - 404: Not found -> not_found
```

### scaleway_functions_delete_cron

```yaml
Tool: scaleway_functions_delete_cron
Title: Delete Cron Trigger
Description: Delete a cron trigger
Scaleway API: DELETE /functions/v1beta1/regions/{region}/crons/{cron_id}
Locality: regional

Input Schema:
  region: z.string() - Scaleway region [required]
  cron_id: z.string() - Cron ID [required]

Output Schema:
  Cron object (with deleting status)

Pagination: no
Error Codes:
  - 403: Forbidden -> permission_denied
  - 404: Not found -> not_found
```

### scaleway_functions_list_domains

```yaml
Tool: scaleway_functions_list_domains
Title: List Function Domains
Description: List custom domains attached to functions
Scaleway API: GET /functions/v1beta1/regions/{region}/domains
Locality: regional

Input Schema:
  region: z.string() - Scaleway region [required]
  function_id: z.string() - Filter by function ID [required]
  page: z.number() - Page number [optional, default=1]
  page_size: z.number() - Items per page [optional, default=50]
  order_by: z.string() - Order by field [optional]

Output Schema:
  domains: Domain[] - List of domains
  total_count: number - Total number of domains

Pagination: yes
Error Codes:
  - 400: Invalid input -> invalid_input
  - 403: Forbidden -> permission_denied
```

### scaleway_functions_create_domain

```yaml
Tool: scaleway_functions_create_domain
Title: Create Function Domain
Description: Attach a custom domain to a function
Scaleway API: POST /functions/v1beta1/regions/{region}/domains
Locality: regional

Input Schema:
  region: z.string() - Scaleway region [required]
  function_id: z.string() - Function ID [required]
  hostname: z.string() - Custom domain hostname [required]

Output Schema:
  Domain object

Pagination: no
Error Codes:
  - 400: Invalid input -> invalid_input
  - 403: Forbidden -> permission_denied
  - 404: Function not found -> not_found
  - 409: Conflict -> invalid_input
```

### scaleway_functions_delete_domain

```yaml
Tool: scaleway_functions_delete_domain
Title: Delete Function Domain
Description: Remove a custom domain from a function
Scaleway API: DELETE /functions/v1beta1/regions/{region}/domains/{domain_id}
Locality: regional

Input Schema:
  region: z.string() - Scaleway region [required]
  domain_id: z.string() - Domain ID [required]

Output Schema:
  Domain object (with deleting status)

Pagination: no
Error Codes:
  - 403: Forbidden -> permission_denied
  - 404: Not found -> not_found
```

### scaleway_functions_create_token

```yaml
Tool: scaleway_functions_create_token
Title: Create Function Token
Description: Create an access token for a function
Scaleway API: POST /functions/v1beta1/regions/{region}/tokens
Locality: regional

Input Schema:
  region: z.string() - Scaleway region [required]
  function_id: z.string() - Function ID [required]
  description: z.string() - Token description [optional]
  expires_at: z.string() - Expiration datetime [optional]

Output Schema:
  Token object (includes token value)

Pagination: no
Error Codes:
  - 400: Invalid input -> invalid_input
  - 403: Forbidden -> permission_denied
  - 404: Function not found -> not_found
```

### scaleway_functions_delete_token

```yaml
Tool: scaleway_functions_delete_token
Title: Delete Function Token
Description: Revoke and delete a function access token
Scaleway API: DELETE /functions/v1beta1/regions/{region}/tokens/{token_id}
Locality: regional

Input Schema:
  region: z.string() - Scaleway region [required]
  token_id: z.string() - Token ID [required]

Output Schema:
  Token object (with deleting status)

Pagination: no
Error Codes:
  - 403: Forbidden -> permission_denied
  - 404: Not found -> not_found
```

## Scaleway API Reference

Base URL: `https://api.scaleway.com/functions/v1beta1/regions/{region}`

All endpoints require `X-Auth-Token` header with Scaleway secret key.

Pagination uses `page` and `page_size` query parameters; responses include `total_count`.

## Implementation Notes

- API is **v1beta1** -- endpoint paths use this version prefix
- All endpoints are **regional** (fr-par, nl-ams, pl-waw)
- `secret_environment_variables` are write-only; they appear as `{key: "...", value: null}` in read responses
- `deploy` is a POST action on an existing function, not a CRUD operation
- Token `token` field value is only returned on creation; subsequent reads return the token metadata without the secret value
- Memory limits: 128, 256, 512, 1024, 2048, 4096 MB
- Runtimes include: node22, node20, python312, python311, python310, go123, go122, php82, rust165
