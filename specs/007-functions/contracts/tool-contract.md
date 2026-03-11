# Tool Contracts: Scaleway Serverless Functions MCP Tools

**Feature**: 007-functions | **Date**: 2026-03-11

## Namespace Tools

### scaleway_functions_list_namespaces

**Scaleway API**: `GET /functions/v1beta1/regions/{region}/namespaces`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | yes | - | Scaleway region (fr-par, nl-ams, pl-waw) |
| page | number | no | 1 | Page number (1-indexed) |
| page_size | number | no | 50 | Items per page (1-100) |
| project_id | string | no | - | Filter by project ID |
| name | string | no | - | Filter by name |
| order_by | string | no | - | Order by field |

**Output**: `{ namespaces: Namespace[], total_count: number }`

---

### scaleway_functions_get_namespace

**Scaleway API**: `GET /functions/v1beta1/regions/{region}/namespaces/{namespace_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| namespace_id | string | yes | Namespace UUID |

**Output**: `Namespace`

---

### scaleway_functions_create_namespace

**Scaleway API**: `POST /functions/v1beta1/regions/{region}/namespaces`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| name | string | yes | Namespace name |
| project_id | string | no | Project ID |
| description | string | no | Description |
| environment_variables | Record<string,string> | no | Environment variables |
| secret_environment_variables | Array<{key,value}> | no | Secret env vars (write-only) |

**Output**: `Namespace`

---

### scaleway_functions_update_namespace

**Scaleway API**: `PATCH /functions/v1beta1/regions/{region}/namespaces/{namespace_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| namespace_id | string | yes | Namespace UUID |
| description | string | no | Description |
| environment_variables | Record<string,string> | no | Environment variables |
| secret_environment_variables | Array<{key,value}> | no | Secret env vars (write-only) |

**Output**: `Namespace`

---

### scaleway_functions_delete_namespace

**Scaleway API**: `DELETE /functions/v1beta1/regions/{region}/namespaces/{namespace_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| namespace_id | string | yes | Namespace UUID |

**Output**: `Namespace` (with deleting status)

---

## Function Tools

### scaleway_functions_list_functions

**Scaleway API**: `GET /functions/v1beta1/regions/{region}/functions`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | yes | - | Scaleway region |
| namespace_id | string | yes | - | Namespace UUID |
| page | number | no | 1 | Page number (1-indexed) |
| page_size | number | no | 50 | Items per page (1-100) |
| name | string | no | - | Filter by name |
| order_by | string | no | - | Order by field |
| project_id | string | no | - | Filter by project ID |

**Output**: `{ functions: Function[], total_count: number }`

---

### scaleway_functions_get_function

**Scaleway API**: `GET /functions/v1beta1/regions/{region}/functions/{function_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| function_id | string | yes | Function UUID |

**Output**: `Function`

---

### scaleway_functions_create_function

**Scaleway API**: `POST /functions/v1beta1/regions/{region}/functions`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| namespace_id | string | yes | Namespace UUID |
| name | string | yes | Function name |
| runtime | string | yes | Runtime (e.g., node22, python312) |
| handler | string | yes | Handler entry point |
| privacy | enum | yes | public, private |
| memory_limit | number | no | Memory limit in MB (128-4096) |
| timeout | string | no | Timeout duration (e.g., "300s") |
| min_scale | number | no | Minimum instances (0+) |
| max_scale | number | no | Maximum instances |
| description | string | no | Description |
| environment_variables | Record<string,string> | no | Environment variables |
| secret_environment_variables | Array<{key,value}> | no | Secret env vars (write-only) |
| http_option | enum | no | enabled, redirected |

**Output**: `Function`

---

### scaleway_functions_update_function

**Scaleway API**: `PATCH /functions/v1beta1/regions/{region}/functions/{function_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| function_id | string | yes | Function UUID |
| runtime | string | no | Runtime |
| handler | string | no | Handler entry point |
| privacy | enum | no | public, private |
| memory_limit | number | no | Memory limit in MB (128-4096) |
| timeout | string | no | Timeout duration |
| min_scale | number | no | Minimum instances |
| max_scale | number | no | Maximum instances |
| description | string | no | Description |
| environment_variables | Record<string,string> | no | Environment variables |
| secret_environment_variables | Array<{key,value}> | no | Secret env vars (write-only) |
| http_option | enum | no | enabled, redirected |

**Output**: `Function`

---

### scaleway_functions_delete_function

**Scaleway API**: `DELETE /functions/v1beta1/regions/{region}/functions/{function_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| function_id | string | yes | Function UUID |

**Output**: `Function` (with deleting status)

---

### scaleway_functions_deploy_function

**Scaleway API**: `POST /functions/v1beta1/regions/{region}/functions/{function_id}/deploy`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| function_id | string | yes | Function UUID |

**Output**: `Function` (with building/pending status)

---

## Cron Tools

### scaleway_functions_list_crons

**Scaleway API**: `GET /functions/v1beta1/regions/{region}/crons`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | yes | - | Scaleway region |
| function_id | string | yes | - | Function UUID to filter by |
| page | number | no | 1 | Page number (1-indexed) |
| page_size | number | no | 50 | Items per page (1-100) |
| order_by | string | no | - | Order by field |

**Output**: `{ crons: Cron[], total_count: number }`

---

### scaleway_functions_create_cron

**Scaleway API**: `POST /functions/v1beta1/regions/{region}/crons`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| function_id | string | yes | Function UUID |
| schedule | string | yes | Cron schedule expression |
| name | string | no | Cron name |
| args | Record<string,unknown> | no | JSON arguments passed to function |

**Output**: `Cron`

---

### scaleway_functions_update_cron

**Scaleway API**: `PATCH /functions/v1beta1/regions/{region}/crons/{cron_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| cron_id | string | yes | Cron UUID |
| schedule | string | no | Cron schedule expression |
| name | string | no | Cron name |
| args | Record<string,unknown> | no | JSON arguments |
| function_id | string | no | Function UUID |

**Output**: `Cron`

---

### scaleway_functions_delete_cron

**Scaleway API**: `DELETE /functions/v1beta1/regions/{region}/crons/{cron_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| cron_id | string | yes | Cron UUID |

**Output**: `Cron` (with deleting status)

---

## Domain Tools

### scaleway_functions_list_domains

**Scaleway API**: `GET /functions/v1beta1/regions/{region}/domains`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | yes | - | Scaleway region |
| function_id | string | yes | - | Function UUID to filter by |
| page | number | no | 1 | Page number (1-indexed) |
| page_size | number | no | 50 | Items per page (1-100) |
| order_by | string | no | - | Order by field |

**Output**: `{ domains: Domain[], total_count: number }`

---

### scaleway_functions_create_domain

**Scaleway API**: `POST /functions/v1beta1/regions/{region}/domains`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| function_id | string | yes | Function UUID |
| hostname | string | yes | Custom domain hostname |

**Output**: `Domain`

---

### scaleway_functions_delete_domain

**Scaleway API**: `DELETE /functions/v1beta1/regions/{region}/domains/{domain_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| domain_id | string | yes | Domain UUID |

**Output**: `Domain` (with deleting status)

---

## Token Tools

### scaleway_functions_create_token

**Scaleway API**: `POST /functions/v1beta1/regions/{region}/tokens`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| function_id | string | yes | Function UUID |
| description | string | no | Token description |
| expires_at | string | no | Expiration datetime (ISO 8601) |

**Output**: `Token` (includes secret token value, only on creation)

---

### scaleway_functions_delete_token

**Scaleway API**: `DELETE /functions/v1beta1/regions/{region}/tokens/{token_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | yes | Scaleway region |
| token_id | string | yes | Token UUID |

**Output**: `Token` (with deleting status)
