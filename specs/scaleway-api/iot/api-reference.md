# Scaleway IoT Hub API Reference

Base URL: `https://api.scaleway.com/iot/v1/regions/{region}`

Official docs: https://www.scaleway.com/en/developers/api/iot/

## Authentication
- Header: `X-Auth-Token: <secret_key>`

IoT Hub is a regional product. When `region` is omitted the MCP falls back to the
configured default region.

## Hubs

### List Hubs
`GET /hubs`
- Query: `page`, `page_size`, `order_by` (name/status/product_plan/created_at/updated_at _asc|_desc),
  `project_id?`, `name?`
- Response: `{ hubs: Hub[], total_count: number }`
- Hub: `{ id, name, status, product_plan, enabled, device_count, connected_device_count,
  endpoint, region, project_id, organization_id, created_at, updated_at, disable_events?,
  events_topic_prefix?, enable_device_auto_provisioning?, has_custom_ca? }`
- Tool: `scaleway_iot_list_hubs`

### Get Hub
`GET /hubs/{hub_id}` -> Hub. Tool: `scaleway_iot_get_hub`

### Create Hub
`POST /hubs`
- Body: `{ name, product_plan, project_id?, disable_events?, events_topic_prefix?, twins_graphite_config?: { push_uri } }`
- Tool: `scaleway_iot_create_hub`

### Update Hub
`PATCH /hubs/{hub_id}`
- Body: `{ name?, product_plan?, disable_events?, events_topic_prefix?, enable_device_auto_provisioning?, twins_graphite_config? }`
- Tool: `scaleway_iot_update_hub`

### Delete Hub
`DELETE /hubs/{hub_id}`
- Query: `delete_devices?`
- Tool: `scaleway_iot_delete_hub`

### Enable / Disable Hub
`POST /hubs/{hub_id}/enable`, `POST /hubs/{hub_id}/disable` -> Hub.
- Tools: `scaleway_iot_enable_hub`, `scaleway_iot_disable_hub`

### Get / Set Hub Certificate Authority
`GET /hubs/{hub_id}/ca` -> CA info. Tool: `scaleway_iot_get_hub_ca`
`POST /hubs/{hub_id}/ca`
- Body: `{ ca_cert_pem, challenge_cert_pem }`
- Tool: `scaleway_iot_set_hub_ca`

## Devices

### List Devices
`GET /devices`
- Query: `page`, `page_size`, `order_by`, `hub_id?`, `name?`, `allow_insecure?`, `status?`
- Response: `{ devices: Device[], total_count: number }`
- Device: `{ id, name, status, hub_id, allow_insecure, allow_multiple_connections,
  is_connected, created_at, updated_at, last_activity_at?, message_filters?, description?,
  has_custom_certificate? }`
- Tool: `scaleway_iot_list_devices`

### Get Device
`GET /devices/{device_id}` -> Device. Tool: `scaleway_iot_get_device`

### Create Device
`POST /devices`
- Body: `{ hub_id, name, allow_insecure?, allow_multiple_connections?, message_filters?, description? }`
- message_filters: `{ publish?: { policy, topics }, subscribe?: { policy, topics } }`
- Tool: `scaleway_iot_create_device`

### Update Device
`PATCH /devices/{device_id}`
- Body: `{ name?, allow_insecure?, allow_multiple_connections?, message_filters?, hub_id?, description? }`
- Tool: `scaleway_iot_update_device`

### Delete Device
`DELETE /devices/{device_id}`. Tool: `scaleway_iot_delete_device`

### Enable / Disable Device
`POST /devices/{device_id}/enable`, `POST /devices/{device_id}/disable`.
- Tools: `scaleway_iot_enable_device`, `scaleway_iot_disable_device`

### Get Device Certificate
`GET /devices/{device_id}/certificate` -> `{ crt, key, ... }`. Tool: `scaleway_iot_get_device_certificate`

### Set Device Certificate
`PUT /devices/{device_id}/certificate`
- Body: `{ certificate_pem }`
- Tool: `scaleway_iot_set_device_certificate`

### Renew Device Certificate
`POST /devices/{device_id}/renew-certificate`
- Tool: `scaleway_iot_renew_device_certificate`
- Verified against [`scaleway-sdk-go` `api/iot/v1`](https://github.com/scaleway/scaleway-sdk-go/blob/master/api/iot/v1/iot_sdk.go)
  (`RenewDeviceCertificate` → `POST .../devices/{device_id}/renew-certificate`).

### Get Device Metrics
`GET /devices/{device_id}/metrics`
- Query: `start_date?` (RFC 3339)
- Tool: `scaleway_iot_get_device_metrics`

## Routes

### List Routes
`GET /routes`
- Query: `page`, `page_size`, `order_by` (name/hub_id/type/created_at _asc|_desc), `hub_id?`, `name?`
- Response: `{ routes: Route[], total_count: number }`
- Route: `{ id, name, hub_id, topic, type, created_at, ... }`
- Tool: `scaleway_iot_list_routes`

### Get Route
`GET /routes/{route_id}` -> Route. Tool: `scaleway_iot_get_route`

### Create Route
`POST /routes`
- Body: `{ hub_id, name, topic, s3_config? | db_config? | rest_config? }`
  - s3_config: `{ bucket_region, bucket_name, object_prefix?, strategy }`
  - db_config: `{ host, port, dbname, username, password, query, engine }`
  - rest_config: `{ verb, uri, headers? }`
- Tool: `scaleway_iot_create_route`

### Update Route
`PATCH /routes/{route_id}`
- Body: `{ name?, topic?, s3_config? | db_config? | rest_config? }`
- Tool: `scaleway_iot_update_route`

### Delete Route
`DELETE /routes/{route_id}`. Tool: `scaleway_iot_delete_route`

## Networks

### List Networks
`GET /networks`
- Query: `page`, `page_size`, `order_by` (name/type/created_at _asc|_desc), `hub_id?`, `name?`, `topic_prefix?`
- Response: `{ networks: Network[], total_count: number }`
- Network: `{ id, name, type, hub_id, topic_prefix, created_at, ... }`
- Tool: `scaleway_iot_list_networks`

### Get Network
`GET /networks/{network_id}` -> Network. Tool: `scaleway_iot_get_network`

### Create Network
`POST /networks`
- Body: `{ hub_id, name, type, topic_prefix }`
- Tool: `scaleway_iot_create_network`

### Delete Network
`DELETE /networks/{network_id}`. Tool: `scaleway_iot_delete_network`

## Enums
- Hub product_plan: `plan_shared`, `plan_dedicated`, `plan_ha`
- Device status: `unknown`, `error`, `enabled`, `disabled`
- Message filter policy: `unknown`, `accept`, `reject`
- Route S3 strategy: `unknown`, `per_topic`, `per_message`
- Route DB engine: `unknown`, `postgresql`, `mysql`
- Route REST verb: `unknown`, `get`, `post`, `put`, `patch`, `delete`
- Network type: `unknown`, `sigfox`, `rest`

## Pagination
- Request: `page` (1-indexed), `page_size` (1-100)
- Response: `total_count` alongside the item array; list results wrapped via `buildPaginatedResponse()`.

## Error Codes
- 400: Invalid input
- 401/403: Permission denied
- 404: Not found
- 409: Conflict
- 429: Rate limited
- 500: Server error
