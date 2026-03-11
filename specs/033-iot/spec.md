# Feature Specification: Scaleway IoT Hub MCP Tools

**Feature Branch**: `033-iot`
**Created**: 2026-03-11
**Status**: Approved
**Input**: Implement MCP tools for the Scaleway IoT Hub API (regional MQTT hub management)

## User Scenarios & Testing

### User Story 1 - Hub CRUD & Lifecycle (Priority: P1)

As an AI agent, I need to list, get, create, update, delete, enable, and disable Scaleway IoT hubs, and manage their CA certificates, so that I can manage MQTT infrastructure programmatically.

**Why this priority**: Hubs are the core resource of the IoT API. Every other resource (devices, routes, networks) is scoped to a hub.

**Independent Test**: Can be fully tested by creating a hub, listing it, enabling/disabling it, managing its CA, and deleting it.

**Acceptance Scenarios**:

1. **Given** valid credentials and region, **When** I call `scaleway_iot_list_hubs`, **Then** I receive a paginated list of hubs with total_count
2. **Given** a valid hub_id and region, **When** I call `scaleway_iot_get_hub`, **Then** I receive the full hub object
3. **Given** valid parameters (name, product_plan, region), **When** I call `scaleway_iot_create_hub`, **Then** a new hub is created and returned
4. **Given** a valid hub_id and region, **When** I call `scaleway_iot_update_hub`, **Then** the hub is updated
5. **Given** a valid hub_id and region, **When** I call `scaleway_iot_delete_hub`, **Then** the hub is deleted
6. **Given** a valid hub_id and region, **When** I call `scaleway_iot_enable_hub`, **Then** the hub is enabled
7. **Given** a valid hub_id and region, **When** I call `scaleway_iot_disable_hub`, **Then** the hub is disabled
8. **Given** a valid hub_id and region, **When** I call `scaleway_iot_get_hub_ca`, **Then** I receive the hub's CA certificate
9. **Given** a valid hub_id, region, and PEM certificates, **When** I call `scaleway_iot_set_hub_ca`, **Then** a custom CA is set on the hub

---

### User Story 2 - Device Management (Priority: P1)

As an AI agent, I need to list, get, create, update, delete, enable, and disable IoT devices, and manage their certificates and metrics, so that I can manage the device fleet connected to a hub.

**Why this priority**: Devices are the primary consumers of a hub. Device lifecycle and certificate management are essential operations.

**Independent Test**: Can be tested by creating a device on a hub, listing it, managing certificates, and deleting it.

**Acceptance Scenarios**:

1. **Given** valid credentials and region, **When** I call `scaleway_iot_list_devices`, **Then** I receive a paginated list of devices with total_count
2. **Given** a valid device_id and region, **When** I call `scaleway_iot_get_device`, **Then** I receive the full device object
3. **Given** valid parameters (hub_id, name, region), **When** I call `scaleway_iot_create_device`, **Then** a new device is created
4. **Given** a valid device_id and region, **When** I call `scaleway_iot_update_device`, **Then** the device is updated
5. **Given** a valid device_id and region, **When** I call `scaleway_iot_delete_device`, **Then** the device is deleted
6. **Given** a valid device_id and region, **When** I call `scaleway_iot_enable_device`, **Then** the device is enabled
7. **Given** a valid device_id and region, **When** I call `scaleway_iot_disable_device`, **Then** the device is disabled
8. **Given** a valid device_id and region, **When** I call `scaleway_iot_get_device_certificate`, **Then** I receive the device certificate
9. **Given** a valid device_id and region, **When** I call `scaleway_iot_renew_device_certificate`, **Then** a new certificate is generated
10. **Given** a valid device_id, region, and PEM certificate, **When** I call `scaleway_iot_set_device_certificate`, **Then** a custom certificate is set
11. **Given** a valid device_id and region, **When** I call `scaleway_iot_get_device_metrics`, **Then** I receive the device metrics

---

### User Story 3 - Route Management (Priority: P2)

As an AI agent, I need to list, get, create, update, and delete IoT routes so that I can configure message forwarding from hub topics to S3, databases, or REST endpoints.

**Why this priority**: Routes provide the data pipeline from MQTT topics to external backends, critical for IoT data processing.

**Independent Test**: Can be tested by creating a route on a hub, listing it, updating it, and deleting it.

**Acceptance Scenarios**:

1. **Given** valid credentials and region, **When** I call `scaleway_iot_list_routes`, **Then** I receive a paginated list of routes with total_count
2. **Given** a valid route_id and region, **When** I call `scaleway_iot_get_route`, **Then** I receive the full route object
3. **Given** valid parameters (hub_id, name, topic, config), **When** I call `scaleway_iot_create_route`, **Then** a new route is created
4. **Given** a valid route_id and region, **When** I call `scaleway_iot_update_route`, **Then** the route is updated
5. **Given** a valid route_id and region, **When** I call `scaleway_iot_delete_route`, **Then** the route is deleted

---

### User Story 4 - Network Management (Priority: P3)

As an AI agent, I need to list, get, create, and delete IoT networks so that I can manage external network integrations (Sigfox, REST) for a hub.

**Why this priority**: Networks are supplementary integrations that extend hub connectivity beyond MQTT.

**Independent Test**: Can be tested by creating a network on a hub, listing it, getting it, and deleting it.

**Acceptance Scenarios**:

1. **Given** valid credentials and region, **When** I call `scaleway_iot_list_networks`, **Then** I receive a paginated list of networks with total_count
2. **Given** a valid network_id and region, **When** I call `scaleway_iot_get_network`, **Then** I receive the full network object
3. **Given** valid parameters (hub_id, name, type, topic_prefix), **When** I call `scaleway_iot_create_network`, **Then** a new network is created
4. **Given** a valid network_id and region, **When** I call `scaleway_iot_delete_network`, **Then** the network is deleted

---

### Edge Cases

- Invalid region format returns a structured validation error
- Hub/device/route/network not found (404) returns a `not_found` error type
- Missing required fields (e.g., no name on create) returns `invalid_input` error
- Enabling an already-enabled hub/device returns appropriate error
- Pagination with page > total pages returns empty items array
- Creating a device on a non-existent hub returns a structured error
- Setting an invalid PEM certificate returns a validation error
- Deleting a hub with `deleteDevices=false` while devices exist returns an error

## Requirements

### Functional Requirements

- **FR-001**: System MUST list hubs with pagination (page, page_size) and filtering (name, project, order_by)
- **FR-002**: System MUST get a single hub by ID and region
- **FR-003**: System MUST create a hub with name, product_plan, project, and optional configuration
- **FR-004**: System MUST update a hub's name, plan, events, and auto-provisioning settings
- **FR-005**: System MUST delete a hub by ID and region, with optional device cascade
- **FR-006**: System MUST enable and disable a hub
- **FR-007**: System MUST get and set a hub's CA certificate
- **FR-008**: System MUST list devices with pagination and filtering (hub, name, status, allow_insecure)
- **FR-009**: System MUST get a single device by ID and region
- **FR-010**: System MUST create a device with hub_id, name, and optional message filters
- **FR-011**: System MUST update a device's name, filters, hub assignment, and connection settings
- **FR-012**: System MUST delete a device by ID and region
- **FR-013**: System MUST enable and disable a device
- **FR-014**: System MUST get, renew, and set device certificates
- **FR-015**: System MUST get device metrics with optional start_date filter
- **FR-016**: System MUST list, get, create, update, and delete routes with S3/DB/REST configs
- **FR-017**: System MUST list, get, create, and delete networks with type and topic_prefix
- **FR-018**: All tools MUST validate inputs using Zod schemas
- **FR-019**: All Scaleway API errors MUST be mapped to structured MCP error responses
- **FR-020**: All list operations MUST support standard pagination (page, page_size, total_count)
- **FR-021**: All tools MUST accept a region parameter (regional API locality)

### Key Entities

- **Hub**: IoT MQTT hub with id, name, status, product_plan, region, project, endpoint, enabled, device_count, connected_device_count, created_at, updated_at, events_enabled, disable_events, events_topic_prefix, enable_device_auto_provisioning, twins_graphite_config
- **Device**: IoT device with id, name, status, hub_id, allow_insecure, allow_multiple_connections, message_filters, description, is_connected, last_activity_at, created_at, updated_at
- **Route**: Message route with id, name, hub_id, topic, type, created_at, s3_config, db_config, rest_config
- **Network**: External network with id, name, hub_id, type, topic_prefix, endpoint, created_at
- **DeviceCertificate**: Device certificate with device_id, certificate_pem
- **Metrics**: Device metrics with metrics array containing name, values, timestamps

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 28 MCP tools are registered and callable via the MCP protocol
- **SC-002**: 100% line and branch code coverage across all IoT tool files
- **SC-003**: All tools map to documented Scaleway API endpoints
- **SC-004**: Contract tests validate request/response shapes for every tool
- **SC-005**: Parity matrix includes all IoT Hub API operations

## Clarifications

**Resolved decisions from self-clarification:**

- **Locality**: Regional API. Supported regions: fr-par, nl-ams, pl-waw
- **Pagination**: Standard Scaleway page/page_size with total_count in responses
- **Auth**: SCW_ACCESS_KEY + SCW_SECRET_KEY + SCW_DEFAULT_PROJECT_ID (via shared auth module)
- **Tool naming**: `scaleway_iot_{action}_{resource}` pattern (e.g., `scaleway_iot_list_hubs`)
- **Error handling**: Use shared `mapScalewayError` + `formatErrorResponse` from `src/shared/errors.ts`
- **Client**: Direct HTTP via `scalewayFetch` helper with `X-Auth-Token` header, using `loadAuthConfig` from `src/shared/auth.ts`
- **Hub plans**: plan_shared, plan_dedicated, plan_ha
- **Device statuses**: unknown, error, enabled, disabled
- **Route types**: S3 (per_topic/per_message strategy), Database (postgresql/mysql engine), REST (get/post/put/patch/delete verb)
- **Network types**: unknown, sigfox, rest
