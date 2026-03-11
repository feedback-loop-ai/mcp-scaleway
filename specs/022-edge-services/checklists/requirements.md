# 022-edge-services Requirements Checklist

## User Stories

- [x] **P1 - Pipeline CRUD**: List, get, create, update, delete pipelines
- [x] **P2 - Stage management**: DNS, TLS, cache, backend stage CRUD
- [x] **P2 - Cache purging**: Create purge requests (assets or all), list, get status
- [x] **P3 - TLS configuration**: Managed certificates, custom secrets

## Tools Implemented (28 total)

### Pipelines (5)
- [x] scaleway_edge_services_list_pipelines
- [x] scaleway_edge_services_get_pipeline
- [x] scaleway_edge_services_create_pipeline
- [x] scaleway_edge_services_update_pipeline
- [x] scaleway_edge_services_delete_pipeline

### DNS Stages (5)
- [x] scaleway_edge_services_list_dns_stages
- [x] scaleway_edge_services_get_dns_stage
- [x] scaleway_edge_services_create_dns_stage
- [x] scaleway_edge_services_update_dns_stage
- [x] scaleway_edge_services_delete_dns_stage

### TLS Stages (5)
- [x] scaleway_edge_services_list_tls_stages
- [x] scaleway_edge_services_get_tls_stage
- [x] scaleway_edge_services_create_tls_stage
- [x] scaleway_edge_services_update_tls_stage
- [x] scaleway_edge_services_delete_tls_stage

### Cache Stages (5)
- [x] scaleway_edge_services_list_cache_stages
- [x] scaleway_edge_services_get_cache_stage
- [x] scaleway_edge_services_create_cache_stage
- [x] scaleway_edge_services_update_cache_stage
- [x] scaleway_edge_services_delete_cache_stage

### Backend Stages (5)
- [x] scaleway_edge_services_list_backend_stages
- [x] scaleway_edge_services_get_backend_stage
- [x] scaleway_edge_services_create_backend_stage
- [x] scaleway_edge_services_update_backend_stage
- [x] scaleway_edge_services_delete_backend_stage

### Purge Requests (3)
- [x] scaleway_edge_services_purge_cache
- [x] scaleway_edge_services_list_purge_requests
- [x] scaleway_edge_services_get_purge_request

## Quality Gates

- [x] TypeScript strict mode - no errors
- [x] Biome lint - clean
- [x] Unit tests - 141 tests passing
- [x] Contract tests - 58 tests passing
- [x] Parity matrix - 28 operations mapped
- [x] SDK package: @scaleway/sdk-edge-services v2.7.0
