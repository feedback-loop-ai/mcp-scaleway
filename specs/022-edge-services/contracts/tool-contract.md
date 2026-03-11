# Tool Contracts: Scaleway Edge Services MCP Tools

**Feature**: 022-edge-services | **Date**: 2026-03-11

## Pipeline Tools

### scaleway_edge_services_list_pipelines

**Scaleway API**: `GET /edge-services/v1beta1/pipelines`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| name | string | no | - | Filter by pipeline name |
| projectId | string | no | - | Filter by project ID |
| organizationId | string | no | - | Filter by organization ID |
| orderBy | enum | no | - | created_at_asc, created_at_desc, name_asc, name_desc |

**Output**: `{ pipelines: Pipeline[], totalCount: number }`

---

### scaleway_edge_services_get_pipeline

**Scaleway API**: `GET /edge-services/v1beta1/pipelines/{pipeline_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| pipelineId | string | yes | Pipeline UUID |

**Output**: `{ Pipeline }`

---

### scaleway_edge_services_create_pipeline

**Scaleway API**: `POST /edge-services/v1beta1/pipelines`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Pipeline name |
| description | string | yes | Pipeline description |
| projectId | string | no | Project ID |

**Output**: `{ Pipeline }`

---

### scaleway_edge_services_update_pipeline

**Scaleway API**: `PATCH /edge-services/v1beta1/pipelines/{pipeline_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| pipelineId | string | yes | Pipeline UUID |
| name | string | no | New name |
| description | string | no | New description |

**Output**: `{ Pipeline }`

---

### scaleway_edge_services_delete_pipeline

**Scaleway API**: `DELETE /edge-services/v1beta1/pipelines/{pipeline_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| pipelineId | string | yes | Pipeline UUID |

**Output**: `{ success: true }`

---

## DNS Stage Tools

### scaleway_edge_services_list_dns_stages

**Scaleway API**: `GET /edge-services/v1beta1/dns-stages`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| pipelineId | string | yes | - | Pipeline ID to filter for |
| page | number | no | 1 | Page number |
| pageSize | number | no | 50 | Items per page |
| orderBy | enum | no | - | created_at_asc, created_at_desc |
| fqdn | string | no | - | Filter by FQDN |

**Output**: `{ stages: DNSStage[], totalCount: number }`

---

### scaleway_edge_services_get_dns_stage

**Scaleway API**: `GET /edge-services/v1beta1/dns-stages/{dns_stage_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| dnsStageId | string | yes | DNS stage UUID |

**Output**: `{ DNSStage }`

---

### scaleway_edge_services_create_dns_stage

**Scaleway API**: `POST /edge-services/v1beta1/dns-stages`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| pipelineId | string | yes | Pipeline ID |
| fqdns | string[] | no | Custom Fully Qualified Domain Names |
| tlsStageId | string | no | Next TLS stage ID |
| cacheStageId | string | no | Next cache stage ID |
| backendStageId | string | no | Next backend stage ID |

**Output**: `{ DNSStage }`

---

### scaleway_edge_services_update_dns_stage

**Scaleway API**: `PATCH /edge-services/v1beta1/dns-stages/{dns_stage_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| dnsStageId | string | yes | DNS stage UUID |
| fqdns | string[] | no | Custom FQDNs |
| tlsStageId | string | no | Next TLS stage ID |
| cacheStageId | string | no | Next cache stage ID |
| backendStageId | string | no | Next backend stage ID |

**Output**: `{ DNSStage }`

---

### scaleway_edge_services_delete_dns_stage

**Scaleway API**: `DELETE /edge-services/v1beta1/dns-stages/{dns_stage_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| dnsStageId | string | yes | DNS stage UUID |

**Output**: `{ success: true }`

---

## TLS Stage Tools

### scaleway_edge_services_list_tls_stages

**Scaleway API**: `GET /edge-services/v1beta1/tls-stages`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| pipelineId | string | yes | - | Pipeline ID to filter for |
| page | number | no | 1 | Page number |
| pageSize | number | no | 50 | Items per page |
| orderBy | enum | no | - | created_at_asc, created_at_desc |
| secretId | string | no | - | Filter by secret ID |
| secretRegion | string | no | - | Filter by secret region |

**Output**: `{ stages: TLSStage[], totalCount: number }`

---

### scaleway_edge_services_get_tls_stage

**Scaleway API**: `GET /edge-services/v1beta1/tls-stages/{tls_stage_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| tlsStageId | string | yes | TLS stage UUID |

**Output**: `{ TLSStage }`

---

### scaleway_edge_services_create_tls_stage

**Scaleway API**: `POST /edge-services/v1beta1/tls-stages`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| pipelineId | string | yes | Pipeline ID |
| secrets | TLSSecret[] | no | Custom TLS certificate secrets |
| managedCertificate | boolean | no | Use Scaleway-managed Let's Encrypt certificate |
| cacheStageId | string | no | Next cache stage ID |
| backendStageId | string | no | Next backend stage ID |
| routeStageId | string | no | Next route stage ID |
| wafStageId | string | no | Next WAF stage ID |

**Output**: `{ TLSStage }`

---

### scaleway_edge_services_update_tls_stage

**Scaleway API**: `PATCH /edge-services/v1beta1/tls-stages/{tls_stage_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| tlsStageId | string | yes | TLS stage UUID |
| managedCertificate | boolean | no | Use managed certificate |
| tlsSecretsConfig | object | no | TLS secrets configuration (contains tlsSecrets array) |
| cacheStageId | string | no | Next cache stage ID |
| backendStageId | string | no | Next backend stage ID |
| routeStageId | string | no | Next route stage ID |
| wafStageId | string | no | Next WAF stage ID |

**Output**: `{ TLSStage }`

---

### scaleway_edge_services_delete_tls_stage

**Scaleway API**: `DELETE /edge-services/v1beta1/tls-stages/{tls_stage_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| tlsStageId | string | yes | TLS stage UUID |

**Output**: `{ success: true }`

---

## Cache Stage Tools

### scaleway_edge_services_list_cache_stages

**Scaleway API**: `GET /edge-services/v1beta1/cache-stages`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| pipelineId | string | yes | - | Pipeline ID to filter for |
| page | number | no | 1 | Page number |
| pageSize | number | no | 50 | Items per page |
| orderBy | enum | no | - | created_at_asc, created_at_desc |

**Output**: `{ stages: CacheStage[], totalCount: number }`

---

### scaleway_edge_services_get_cache_stage

**Scaleway API**: `GET /edge-services/v1beta1/cache-stages/{cache_stage_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| cacheStageId | string | yes | Cache stage UUID |

**Output**: `{ CacheStage }`

---

### scaleway_edge_services_create_cache_stage

**Scaleway API**: `POST /edge-services/v1beta1/cache-stages`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| pipelineId | string | yes | Pipeline ID |
| fallbackTtl | string | no | TTL in seconds for cached content |
| includeCookies | boolean | no | Cache responses with cookies |
| backendStageId | string | no | Next backend stage ID |
| wafStageId | string | no | Next WAF stage ID |
| routeStageId | string | no | Next route stage ID |

**Output**: `{ CacheStage }`

---

### scaleway_edge_services_update_cache_stage

**Scaleway API**: `PATCH /edge-services/v1beta1/cache-stages/{cache_stage_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| cacheStageId | string | yes | Cache stage UUID |
| fallbackTtl | string | no | TTL in seconds |
| includeCookies | boolean | no | Cache responses with cookies |
| backendStageId | string | no | Next backend stage ID |
| wafStageId | string | no | Next WAF stage ID |
| routeStageId | string | no | Next route stage ID |

**Output**: `{ CacheStage }`

---

### scaleway_edge_services_delete_cache_stage

**Scaleway API**: `DELETE /edge-services/v1beta1/cache-stages/{cache_stage_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| cacheStageId | string | yes | Cache stage UUID |

**Output**: `{ success: true }`

---

## Backend Stage Tools

### scaleway_edge_services_list_backend_stages

**Scaleway API**: `GET /edge-services/v1beta1/backend-stages`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| pipelineId | string | yes | - | Pipeline ID to filter for |
| page | number | no | 1 | Page number |
| pageSize | number | no | 50 | Items per page |
| orderBy | enum | no | - | created_at_asc, created_at_desc |
| bucketName | string | no | - | Filter by S3 bucket name |
| bucketRegion | string | no | - | Filter by S3 bucket region |
| lbId | string | no | - | Filter by Load Balancer ID |

**Output**: `{ stages: BackendStage[], totalCount: number }`

---

### scaleway_edge_services_get_backend_stage

**Scaleway API**: `GET /edge-services/v1beta1/backend-stages/{backend_stage_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| backendStageId | string | yes | Backend stage UUID |

**Output**: `{ BackendStage }`

---

### scaleway_edge_services_create_backend_stage

**Scaleway API**: `POST /edge-services/v1beta1/backend-stages`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| pipelineId | string | yes | Pipeline ID |
| scalewayS3 | ScalewayS3Config | no | S3 bucket origin configuration |
| scalewayLb | ScalewayLbConfig | no | Load Balancer origin configuration |

**Output**: `{ BackendStage }`

---

### scaleway_edge_services_update_backend_stage

**Scaleway API**: `PATCH /edge-services/v1beta1/backend-stages/{backend_stage_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| backendStageId | string | yes | Backend stage UUID |
| pipelineId | string | yes | Pipeline ID |
| scalewayS3 | ScalewayS3Config | no | S3 bucket origin configuration |
| scalewayLb | ScalewayLbConfig | no | Load Balancer origin configuration |

**Output**: `{ BackendStage }`

---

### scaleway_edge_services_delete_backend_stage

**Scaleway API**: `DELETE /edge-services/v1beta1/backend-stages/{backend_stage_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| backendStageId | string | yes | Backend stage UUID |

**Output**: `{ success: true }`

---

## Purge Request Tools

### scaleway_edge_services_purge_cache

**Scaleway API**: `POST /edge-services/v1beta1/purge-requests`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| pipelineId | string | yes | Pipeline ID to purge cache for |
| assets | string[] | no | Specific asset URLs to purge |
| all | boolean | no | Purge all cached content |

**Output**: `{ PurgeRequest }`

---

### scaleway_edge_services_list_purge_requests

**Scaleway API**: `GET /edge-services/v1beta1/purge-requests`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| page | number | no | 1 | Page number |
| pageSize | number | no | 50 | Items per page |
| pipelineId | string | no | - | Filter by pipeline ID |
| projectId | string | no | - | Filter by project ID |
| organizationId | string | no | - | Filter by organization ID |
| orderBy | enum | no | - | created_at_asc, created_at_desc |

**Output**: `{ purgeRequests: PurgeRequest[], totalCount: number }`

---

### scaleway_edge_services_get_purge_request

**Scaleway API**: `GET /edge-services/v1beta1/purge-requests/{purge_request_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| purgeRequestId | string | yes | Purge request UUID |

**Output**: `{ PurgeRequest }`
