# Quickstart: Data Warehouse for ClickHouse® tools

Prerequisites: Scaleway credentials configured (see `.env.test.local.example`),
region `fr-par`.

## Create and connect to a deployment
1. `scaleway_data_warehouse_list_versions` — pick a ClickHouse® version.
2. `scaleway_data_warehouse_list_presets` — pick a sizing (cpu_min/max, ram_per_cpu).
3. `scaleway_data_warehouse_create_deployment` with `{ region: "fr-par", name, version, cpuMin, cpuMax, ramPerCpu, replicaCount, password }`.
4. Poll `scaleway_data_warehouse_get_deployment` until `status` is `ready`.
5. `scaleway_data_warehouse_get_deployment_certificate` — fetch the TLS cert for a secure client connection.

## Manage databases and users
- `scaleway_data_warehouse_create_database` `{ deploymentId, name: "analytics" }`
- `scaleway_data_warehouse_create_user` `{ deploymentId, name, password, isAdmin }`
- `scaleway_data_warehouse_update_user` to rotate a password.
- `scaleway_data_warehouse_list_databases` / `_list_users` to review state.

## Networking
- `scaleway_data_warehouse_create_endpoint` `{ deploymentId }` → public endpoint.
- `scaleway_data_warehouse_create_endpoint` `{ deploymentId, privateNetworkId }` → private endpoint.

## Lifecycle & cleanup
- `scaleway_data_warehouse_stop_deployment` / `_start_deployment` to pause/resume.
- `scaleway_data_warehouse_delete_deployment` — permanent, all data lost.
