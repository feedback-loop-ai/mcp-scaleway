# SDD: Edge Services API

**Spec**: 022-edge-services | **Date**: 2026-03-11
**API Group**: Networking & Security | **Locality**: global
**SDK Package**: `@scaleway/sdk-edge-services`

## Overview

Scaleway Edge Services provides a CDN/edge computing platform with pipeline-based request processing. Pipelines chain stages (DNS, TLS, cache, backend) to handle HTTP requests from edge to origin. Supports custom domains, managed TLS certificates, cache purging, and multiple backend types (S3, Load Balancer, Serverless Containers/Functions).

## Tool Contracts

### scaleway_edge_services_list_pipelines

```yaml
Tool: scaleway_edge_services_list_pipelines
Title: List Edge Services pipelines
Description: List all Edge Services pipelines with optional filtering by name and project
Scaleway API: GET /edge-services/v1beta1/pipelines
Locality: global

Input Schema:
  name: z.string().optional() - Filter by pipeline name
  projectId: z.string().optional() - Filter by project ID
  orderBy: z.enum() - Sort order [optional]
  page: z.number() - Page number [optional, default 1]
  pageSize: z.number() - Items per page [optional, default 50]

Output Schema:
  pipelines: Pipeline[] - List of pipelines
  totalCount: number - Total count

Pagination: yes

Error Codes:
  - 400: Invalid input -> invalid_input
  - 403: Forbidden -> permission_denied
  - 404: Not found -> not_found
  - 429: Rate limited -> rate_limited
```

### scaleway_edge_services_get_pipeline

```yaml
Tool: scaleway_edge_services_get_pipeline
Title: Get Edge Services pipeline
Description: Retrieve details of a specific pipeline by ID
Scaleway API: GET /edge-services/v1beta1/pipelines/{pipeline_id}
Locality: global

Input Schema:
  pipelineId: z.string() - Pipeline ID [required]

Output Schema:
  Pipeline object with id, name, description, status, errors, projectId, organizationId, createdAt, updatedAt

Pagination: no

Error Codes:
  - 400: Invalid input -> invalid_input
  - 403: Forbidden -> permission_denied
  - 404: Not found -> not_found
  - 429: Rate limited -> rate_limited
```

### scaleway_edge_services_create_pipeline

```yaml
Tool: scaleway_edge_services_create_pipeline
Title: Create Edge Services pipeline
Description: Create a new Edge Services pipeline
Scaleway API: POST /edge-services/v1beta1/pipelines
Locality: global

Input Schema:
  name: z.string() - Pipeline name [required]
  description: z.string() - Pipeline description [required]
  projectId: z.string().optional() - Project ID

Output Schema:
  Pipeline object

Pagination: no

Error Codes:
  - 400: Invalid input -> invalid_input
  - 403: Forbidden -> permission_denied
  - 429: Rate limited -> rate_limited
```

### scaleway_edge_services_update_pipeline

```yaml
Tool: scaleway_edge_services_update_pipeline
Title: Update Edge Services pipeline
Description: Update an existing pipeline's name or description
Scaleway API: PATCH /edge-services/v1beta1/pipelines/{pipeline_id}
Locality: global

Input Schema:
  pipelineId: z.string() - Pipeline ID [required]
  name: z.string().optional() - New name
  description: z.string().optional() - New description

Output Schema:
  Pipeline object

Pagination: no

Error Codes:
  - 400: Invalid input -> invalid_input
  - 403: Forbidden -> permission_denied
  - 404: Not found -> not_found
  - 429: Rate limited -> rate_limited
```

### scaleway_edge_services_delete_pipeline

```yaml
Tool: scaleway_edge_services_delete_pipeline
Title: Delete Edge Services pipeline
Description: Delete an Edge Services pipeline and all linked stages
Scaleway API: DELETE /edge-services/v1beta1/pipelines/{pipeline_id}
Locality: global

Input Schema:
  pipelineId: z.string() - Pipeline ID [required]

Output Schema:
  success: boolean

Pagination: no

Error Codes:
  - 400: Invalid input -> invalid_input
  - 403: Forbidden -> permission_denied
  - 404: Not found -> not_found
  - 429: Rate limited -> rate_limited
```

### scaleway_edge_services_list_dns_stages

```yaml
Tool: scaleway_edge_services_list_dns_stages
Title: List DNS stages
Description: List all DNS stages for a pipeline
Scaleway API: GET /edge-services/v1beta1/dns-stages
Locality: global

Input Schema:
  pipelineId: z.string() - Pipeline ID [required]
  page: z.number() - Page number [optional]
  pageSize: z.number() - Items per page [optional]

Output Schema:
  stages: DNSStage[] - List of DNS stages
  totalCount: number

Pagination: yes
```

### scaleway_edge_services_get_dns_stage

```yaml
Tool: scaleway_edge_services_get_dns_stage
Title: Get DNS stage
Description: Retrieve details of a specific DNS stage
Scaleway API: GET /edge-services/v1beta1/dns-stages/{dns_stage_id}
Locality: global

Input Schema:
  dnsStageId: z.string() - DNS stage ID [required]

Output Schema:
  DNSStage object
```

### scaleway_edge_services_create_dns_stage

```yaml
Tool: scaleway_edge_services_create_dns_stage
Title: Create DNS stage
Description: Create a new DNS stage for a pipeline
Scaleway API: POST /edge-services/v1beta1/dns-stages
Locality: global

Input Schema:
  pipelineId: z.string() - Pipeline ID [required]
  fqdns: z.array(z.string()).optional() - Custom FQDNs
  tlsStageId: z.string().optional() - Next TLS stage
  cacheStageId: z.string().optional() - Next cache stage
  backendStageId: z.string().optional() - Next backend stage

Output Schema:
  DNSStage object
```

### scaleway_edge_services_update_dns_stage

```yaml
Tool: scaleway_edge_services_update_dns_stage
Title: Update DNS stage
Description: Update an existing DNS stage
Scaleway API: PATCH /edge-services/v1beta1/dns-stages/{dns_stage_id}
Locality: global

Input Schema:
  dnsStageId: z.string() - DNS stage ID [required]
  fqdns: z.array(z.string()).optional()
  tlsStageId: z.string().optional()
  cacheStageId: z.string().optional()
  backendStageId: z.string().optional()

Output Schema:
  DNSStage object
```

### scaleway_edge_services_delete_dns_stage

```yaml
Tool: scaleway_edge_services_delete_dns_stage
Title: Delete DNS stage
Description: Delete an existing DNS stage
Scaleway API: DELETE /edge-services/v1beta1/dns-stages/{dns_stage_id}
Locality: global

Input Schema:
  dnsStageId: z.string() - DNS stage ID [required]

Output Schema:
  success: boolean
```

### scaleway_edge_services_list_tls_stages

```yaml
Tool: scaleway_edge_services_list_tls_stages
Title: List TLS stages
Description: List all TLS stages for a pipeline
Scaleway API: GET /edge-services/v1beta1/tls-stages
Locality: global

Input Schema:
  pipelineId: z.string() - Pipeline ID [required]
  page: z.number().optional()
  pageSize: z.number().optional()
  secretId: z.string().optional() - Filter by secret ID
  secretRegion: z.string().optional() - Filter by secret region

Output Schema:
  stages: TLSStage[]
  totalCount: number

Pagination: yes
```

### scaleway_edge_services_get_tls_stage

```yaml
Tool: scaleway_edge_services_get_tls_stage
Title: Get TLS stage
Description: Retrieve details of a specific TLS stage
Scaleway API: GET /edge-services/v1beta1/tls-stages/{tls_stage_id}

Input Schema:
  tlsStageId: z.string() [required]

Output Schema:
  TLSStage object
```

### scaleway_edge_services_create_tls_stage

```yaml
Tool: scaleway_edge_services_create_tls_stage
Title: Create TLS stage
Description: Create a new TLS stage with managed or custom certificate
Scaleway API: POST /edge-services/v1beta1/tls-stages

Input Schema:
  pipelineId: z.string() [required]
  managedCertificate: z.boolean().optional()
  secrets: z.array(TLSSecret).optional()
  cacheStageId: z.string().optional()
  backendStageId: z.string().optional()

Output Schema:
  TLSStage object
```

### scaleway_edge_services_update_tls_stage

```yaml
Tool: scaleway_edge_services_update_tls_stage
Title: Update TLS stage
Description: Update an existing TLS stage
Scaleway API: PATCH /edge-services/v1beta1/tls-stages/{tls_stage_id}

Input Schema:
  tlsStageId: z.string() [required]
  managedCertificate: z.boolean().optional()
  tlsSecretsConfig: TLSSecretsConfig.optional()
  cacheStageId: z.string().optional()
  backendStageId: z.string().optional()

Output Schema:
  TLSStage object
```

### scaleway_edge_services_delete_tls_stage

```yaml
Tool: scaleway_edge_services_delete_tls_stage
Title: Delete TLS stage
Description: Delete an existing TLS stage
Scaleway API: DELETE /edge-services/v1beta1/tls-stages/{tls_stage_id}

Input Schema:
  tlsStageId: z.string() [required]

Output Schema:
  success: boolean
```

### scaleway_edge_services_list_cache_stages

```yaml
Tool: scaleway_edge_services_list_cache_stages
Title: List cache stages
Description: List all cache stages for a pipeline
Scaleway API: GET /edge-services/v1beta1/cache-stages

Input Schema:
  pipelineId: z.string() [required]
  page: z.number().optional()
  pageSize: z.number().optional()

Output Schema:
  stages: CacheStage[]
  totalCount: number

Pagination: yes
```

### scaleway_edge_services_get_cache_stage

```yaml
Tool: scaleway_edge_services_get_cache_stage
Title: Get cache stage
Description: Retrieve details of a specific cache stage
Scaleway API: GET /edge-services/v1beta1/cache-stages/{cache_stage_id}

Input Schema:
  cacheStageId: z.string() [required]

Output Schema:
  CacheStage object
```

### scaleway_edge_services_create_cache_stage

```yaml
Tool: scaleway_edge_services_create_cache_stage
Title: Create cache stage
Description: Create a new cache stage with TTL and cookie settings
Scaleway API: POST /edge-services/v1beta1/cache-stages

Input Schema:
  pipelineId: z.string() [required]
  fallbackTtl: z.string().optional() - TTL in seconds
  includeCookies: z.boolean().optional()
  backendStageId: z.string().optional()

Output Schema:
  CacheStage object
```

### scaleway_edge_services_update_cache_stage

```yaml
Tool: scaleway_edge_services_update_cache_stage
Title: Update cache stage
Description: Update an existing cache stage
Scaleway API: PATCH /edge-services/v1beta1/cache-stages/{cache_stage_id}

Input Schema:
  cacheStageId: z.string() [required]
  fallbackTtl: z.string().optional()
  includeCookies: z.boolean().optional()
  backendStageId: z.string().optional()

Output Schema:
  CacheStage object
```

### scaleway_edge_services_delete_cache_stage

```yaml
Tool: scaleway_edge_services_delete_cache_stage
Title: Delete cache stage
Description: Delete an existing cache stage
Scaleway API: DELETE /edge-services/v1beta1/cache-stages/{cache_stage_id}

Input Schema:
  cacheStageId: z.string() [required]

Output Schema:
  success: boolean
```

### scaleway_edge_services_list_backend_stages

```yaml
Tool: scaleway_edge_services_list_backend_stages
Title: List backend stages
Description: List all backend stages for a pipeline
Scaleway API: GET /edge-services/v1beta1/backend-stages

Input Schema:
  pipelineId: z.string() [required]
  page: z.number().optional()
  pageSize: z.number().optional()
  bucketName: z.string().optional()
  lbId: z.string().optional()

Output Schema:
  stages: BackendStage[]
  totalCount: number

Pagination: yes
```

### scaleway_edge_services_get_backend_stage

```yaml
Tool: scaleway_edge_services_get_backend_stage
Title: Get backend stage
Description: Retrieve details of a specific backend stage
Scaleway API: GET /edge-services/v1beta1/backend-stages/{backend_stage_id}

Input Schema:
  backendStageId: z.string() [required]

Output Schema:
  BackendStage object
```

### scaleway_edge_services_create_backend_stage

```yaml
Tool: scaleway_edge_services_create_backend_stage
Title: Create backend stage
Description: Create a new backend stage linked to S3 or Load Balancer origin
Scaleway API: POST /edge-services/v1beta1/backend-stages

Input Schema:
  pipelineId: z.string() [required]
  scalewayS3: ScalewayS3BackendConfig.optional()
  scalewayLb: ScalewayLbBackendConfig.optional()

Output Schema:
  BackendStage object
```

### scaleway_edge_services_update_backend_stage

```yaml
Tool: scaleway_edge_services_update_backend_stage
Title: Update backend stage
Description: Update an existing backend stage
Scaleway API: PATCH /edge-services/v1beta1/backend-stages/{backend_stage_id}

Input Schema:
  backendStageId: z.string() [required]
  pipelineId: z.string() [required]
  scalewayS3: ScalewayS3BackendConfig.optional()
  scalewayLb: ScalewayLbBackendConfig.optional()

Output Schema:
  BackendStage object
```

### scaleway_edge_services_delete_backend_stage

```yaml
Tool: scaleway_edge_services_delete_backend_stage
Title: Delete backend stage
Description: Delete an existing backend stage
Scaleway API: DELETE /edge-services/v1beta1/backend-stages/{backend_stage_id}

Input Schema:
  backendStageId: z.string() [required]

Output Schema:
  success: boolean
```

### scaleway_edge_services_purge_cache

```yaml
Tool: scaleway_edge_services_purge_cache
Title: Purge cache
Description: Create a cache purge request for specific assets or all content
Scaleway API: POST /edge-services/v1beta1/purge-requests

Input Schema:
  pipelineId: z.string() [required]
  assets: z.array(z.string()).optional() - Specific URLs to purge
  all: z.boolean().optional() - Purge all content

Output Schema:
  PurgeRequest object
```

### scaleway_edge_services_list_purge_requests

```yaml
Tool: scaleway_edge_services_list_purge_requests
Title: List purge requests
Description: List all cache purge requests
Scaleway API: GET /edge-services/v1beta1/purge-requests

Input Schema:
  pipelineId: z.string().optional()
  projectId: z.string().optional()
  page: z.number().optional()
  pageSize: z.number().optional()

Output Schema:
  purgeRequests: PurgeRequest[]
  totalCount: number

Pagination: yes
```

### scaleway_edge_services_get_purge_request

```yaml
Tool: scaleway_edge_services_get_purge_request
Title: Get purge request
Description: Retrieve details of a specific purge request
Scaleway API: GET /edge-services/v1beta1/purge-requests/{purge_request_id}

Input Schema:
  purgeRequestId: z.string() [required]

Output Schema:
  PurgeRequest object
```

## Implementation Notes

- Edge Services API is **global** (no region/zone parameter needed)
- API is v1beta1 - may have breaking changes
- Pipelines chain stages: DNS -> TLS -> Cache -> Backend
- Backend stages support one-of: scalewayS3, scalewayLb, scalewayServerlessContainer, scalewayServerlessFunction
- Stage linking uses one-of patterns for next stage references
- Purge requests support either specific asset URLs or purge-all
