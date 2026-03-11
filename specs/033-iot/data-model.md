# Data Model: Scaleway IoT Hub MCP Tools

**Feature**: 033-iot | **Date**: 2026-03-11

## Entities

### Hub

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique hub identifier |
| name | string | yes | Hub name |
| status | enum | yes | unknown, error, enabling, ready, disabling, disabled |
| product_plan | enum | yes | plan_shared, plan_dedicated, plan_ha |
| region | string | yes | Region (e.g., fr-par) |
| project_id | string (UUID) | yes | Project ID |
| organization_id | string (UUID) | yes | Organization ID |
| enabled | boolean | yes | Whether the hub is enabled |
| device_count | number | yes | Total number of devices |
| connected_device_count | number | yes | Number of currently connected devices |
| endpoint | string | yes | MQTT endpoint URL |
| disable_events | boolean | yes | Whether events are disabled |
| events_topic_prefix | string | no | Topic prefix for hub events |
| enable_device_auto_provisioning | boolean | yes | Whether auto-provisioning is enabled |
| has_custom_ca | boolean | yes | Whether a custom CA is set |
| twins_graphite_config | object/null | no | Graphite config with push_uri |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last update timestamp |

### Device

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique device identifier |
| name | string | yes | Device name |
| status | enum | yes | unknown, error, enabled, disabled |
| hub_id | string (UUID) | yes | Hub this device belongs to |
| allow_insecure | boolean | yes | Whether insecure connections are allowed |
| allow_multiple_connections | boolean | yes | Whether multiple connections are allowed |
| message_filters | object | no | Publish/subscribe message filters |
| description | string | no | Device description |
| is_connected | boolean | yes | Whether the device is currently connected |
| last_activity_at | string (ISO 8601)/null | no | Last activity timestamp |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last update timestamp |

### MessageFilter

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| publish | object/null | no | Publish filter with policy and topics |
| subscribe | object/null | no | Subscribe filter with policy and topics |

### MessageFilterRule

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| policy | enum | no | unknown, accept, reject |
| topics | string[] | no | List of MQTT topic patterns |

### Route

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique route identifier |
| name | string | yes | Route name |
| hub_id | string (UUID) | yes | Hub this route belongs to |
| topic | string | yes | MQTT topic filter |
| type | enum | yes | unknown, s3, database, rest |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last update timestamp |
| s3_config | S3RouteConfig/null | no | S3 backend configuration |
| db_config | DbRouteConfig/null | no | Database backend configuration |
| rest_config | RestRouteConfig/null | no | REST backend configuration |

### S3RouteConfig

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| bucket_region | string | yes | S3 bucket region |
| bucket_name | string | yes | S3 bucket name |
| object_prefix | string | no | Object key prefix |
| strategy | enum | yes | unknown, per_topic, per_message |

### DbRouteConfig

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| host | string | yes | Database host |
| port | number | yes | Database port |
| dbname | string | yes | Database name |
| username | string | yes | Database username |
| password | string | yes | Database password |
| query | string | yes | SQL query template |
| engine | enum | yes | unknown, postgresql, mysql |

### RestRouteConfig

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| verb | enum | yes | unknown, get, post, put, patch, delete |
| uri | string | yes | REST endpoint URI |
| headers | Record<string, string> | no | HTTP headers |

### Network

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique network identifier |
| name | string | yes | Network name |
| hub_id | string (UUID) | yes | Hub this network belongs to |
| type | enum | yes | unknown, sigfox, rest |
| topic_prefix | string | yes | MQTT topic prefix |
| endpoint | string | yes | Network endpoint URL |
| created_at | string (ISO 8601) | yes | Creation timestamp |

### DeviceCertificate

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| device_id | string (UUID) | yes | Device this certificate belongs to |
| certificate_pem | string | yes | Certificate in PEM format |

### Metrics

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| metrics | MetricEntry[] | yes | Array of metric entries |

### MetricEntry

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Metric name |
| values | number[] | yes | Metric values |
| timestamps | string[] | yes | Timestamps for each value |
