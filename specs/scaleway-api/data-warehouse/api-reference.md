# Scaleway Data Warehouse for ClickHouse® API Reference

Official reference: https://www.scaleway.com/en/developers/api/data-warehouse/
OpenAPI schema (source of truth): https://www.scaleway.com/en/developers/api/data-warehouse/v1beta1/schema.yml

Base URL: `https://api.scaleway.com/datawarehouse/v1beta1/regions/{region}`

- API slug: `datawarehouse`
- Version: `v1beta1`
- Scope: **region** (only `fr-par` is currently accepted by the API)

Tools live in `src/tools/data-warehouse/`. Each endpoint below is annotated with
the MCP tool that invokes it. Verified against the implementation in
`src/tools/data-warehouse/handlers.ts` and the OpenAPI schema above.

## Authentication
- Header: `X-Auth-Token: <secret_key>`

## Pagination
- Query: `page` (int32), `page_size` (uint32)
- List responses return a resource array plus `total_count`.

## Error codes
Standard Scaleway HTTP status codes: 400 invalid_input, 401/403 permission_denied,
404 not_found, 429 rate_limited, 5xx server_error (see `src/shared/errors.ts`).

## Deployments

### List Deployments — `scaleway_data_warehouse_list_deployments`
`GET /deployments`
- Query: `tags` (string[]), `name` (string), `order_by` (created_at_desc | created_at_asc | name_asc | name_desc; default created_at_desc), `organization_id` (string), `project_id` (string), `page` (int), `page_size` (int)
- Response: `{ deployments: Deployment[], total_count: number }`

### Get Deployment — `scaleway_data_warehouse_get_deployment`
`GET /deployments/{deployment_id}`
- Response: Deployment object

### Create Deployment — `scaleway_data_warehouse_create_deployment`
`POST /deployments`
- Body: `{ project_id?, name, tags?, version?, replica_count?, shard_count?, password?, cpu_min?, cpu_max?, endpoints?, ram_per_cpu?, move_factor? }`
- `endpoints`: array of EndpointSpec `{ public: {} } | { private_network: { private_network_id } }`
- Response: Deployment object

### Update Deployment — `scaleway_data_warehouse_update_deployment`
`PATCH /deployments/{deployment_id}`
- Body: `{ name?, tags?, cpu_min?, cpu_max?, replica_count?, move_factor? }`
- Response: Deployment object

### Delete Deployment — `scaleway_data_warehouse_delete_deployment`
`DELETE /deployments/{deployment_id}`
- Response: Deployment object (status transitions to `deleting`). Permanent — all data is lost.

### Start Deployment — `scaleway_data_warehouse_start_deployment`
`POST /deployments/{deployment_id}/start`
- Body: `{}` (empty JSON object, required)
- Response: Deployment object

### Stop Deployment — `scaleway_data_warehouse_stop_deployment`
`POST /deployments/{deployment_id}/stop`
- Body: `{}` (empty JSON object, required)
- Response: Deployment object

### Get Deployment TLS Certificate — `scaleway_data_warehouse_get_deployment_certificate`
`GET /deployments/{deployment_id}/certificate`
- Response: File object `{ name, content_type, content }`

### Deployment object
`{ id, name, organization_id, project_id, status, tags[], created_at?, updated_at?, version?, replica_count?, shard_count?, cpu_min?, cpu_max?, endpoints[]?, ram_per_cpu?, move_factor?, region }`
- `status` enum: `unknown_status`, `ready`, `creating`, `configuring`, `deleting`, `error`, `locked`, `locking`, `unlocking`, `deploying`, `stopping`, `starting`, `stopped`
- `move_factor`: double in [0,1] — tiered-storage threshold for moving data from hot (Block Storage) to cold (Object Storage) volume.

### Endpoint object
`{ id, dns_record, services: [{ protocol, port }], private_network?: { private_network_id } | null, public?: {} | null }`
- `protocol` enum: `unknown_protocol`, `tcp`, `https`, `mysql`

## Databases

### List Databases — `scaleway_data_warehouse_list_databases`
`GET /deployments/{deployment_id}/databases`
- Query: `name` (string), `order_by` (name_asc | name_desc | size_asc | size_desc; default name_asc), `page`, `page_size`
- Response: `{ databases: Database[], total_count: number }`
- Database: `{ name, size }` (size in bytes, uint64)

### Create Database — `scaleway_data_warehouse_create_database`
`POST /deployments/{deployment_id}/databases`
- Body: `{ name }`
- Response: Database object

### Delete Database — `scaleway_data_warehouse_delete_database`
`DELETE /deployments/{deployment_id}/databases/{name}`
- Response: empty (204)

## Users

### List Users — `scaleway_data_warehouse_list_users`
`GET /deployments/{deployment_id}/users`
- Query: `name` (string), `order_by` (name_asc | name_desc; default name_asc), `page`, `page_size`
- Response: `{ users: User[], total_count: number }`
- User: `{ name, is_admin }`

### Create User — `scaleway_data_warehouse_create_user`
`POST /deployments/{deployment_id}/users`
- Body: `{ name, password, is_admin? }`
- Response: User object

### Update User — `scaleway_data_warehouse_update_user`
`PATCH /deployments/{deployment_id}/users/{name}`
- Body: `{ password?, is_admin? }`
- Response: User object

### Delete User — `scaleway_data_warehouse_delete_user`
`DELETE /deployments/{deployment_id}/users/{name}`
- Body: `{}` (empty JSON object, required)
- Response: empty (204)

## Endpoints

### Create Endpoint — `scaleway_data_warehouse_create_endpoint`
`POST /endpoints`
- Body: `{ deployment_id, endpoint: { public: {} } | { private_network: { private_network_id } } }`
- Response: Endpoint object

### Delete Endpoint — `scaleway_data_warehouse_delete_endpoint`
`DELETE /endpoints/{endpoint_id}`
- Response: empty (204)

## Presets

### List Presets — `scaleway_data_warehouse_list_presets`
`GET /presets`
- Query: `page`, `page_size`
- Response: `{ presets: Preset[], total_count: number }`
- Preset: `{ name, category, cpu_min, cpu_max, ram_per_cpu, replica_count, shard_count }`

## Versions

### List Versions — `scaleway_data_warehouse_list_versions`
`GET /versions`
- Query: `version` (string), `page`, `page_size`
- Response: `{ versions: Version[], total_count: number }`
- Version: `{ version, end_of_life_at? }`
