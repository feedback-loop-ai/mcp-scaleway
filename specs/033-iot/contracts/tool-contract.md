# Tool Contracts: Scaleway IoT Hub MCP Tools

**Feature**: 033-iot | **Date**: 2026-03-11

## Hub Tools

### scaleway_iot_list_hubs

**Scaleway API**: `GET /iot/v1/regions/{region}/hubs`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | default region | Region (e.g., fr-par) |
| page | number | no | 1 | Page number (1-indexed) |
| pageSize | number | no | 50 | Items per page (1-100) |
| orderBy | enum | no | - | Sort order |
| projectId | string | no | - | Filter by project ID |
| name | string | no | - | Filter by name |

**Output**: `{ items: Hub[], total_count: number, page: number, page_size: number, total_pages: number }`

---

### scaleway_iot_get_hub

**Scaleway API**: `GET /iot/v1/regions/{region}/hubs/{hub_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| hubId | string (UUID) | yes | Hub ID |

**Output**: `Hub`

---

### scaleway_iot_create_hub

**Scaleway API**: `POST /iot/v1/regions/{region}/hubs`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| name | string | yes | Hub name |
| projectId | string (UUID) | no | Project ID |
| productPlan | enum | no | plan_shared (default), plan_dedicated, plan_ha |
| disableEvents | boolean | no | Disable hub events |
| eventsTopicPrefix | string | no | Topic prefix for hub events |
| twinsGraphiteConfig | object | no | Graphite config with pushUri |

**Output**: `Hub`

---

### scaleway_iot_update_hub

**Scaleway API**: `PATCH /iot/v1/regions/{region}/hubs/{hub_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| hubId | string (UUID) | yes | Hub ID |
| name | string | no | New hub name |
| productPlan | enum | no | New product plan |
| disableEvents | boolean | no | Disable hub events |
| eventsTopicPrefix | string | no | Topic prefix for hub events |
| enableDeviceAutoProvisioning | boolean | no | Enable device auto-provisioning |
| twinsGraphiteConfig | object | no | Graphite config with pushUri |

**Output**: `Hub`

---

### scaleway_iot_delete_hub

**Scaleway API**: `DELETE /iot/v1/regions/{region}/hubs/{hub_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| hubId | string (UUID) | yes | Hub ID |
| deleteDevices | boolean | no | Also delete hub devices |

**Output**: `{}`

---

### scaleway_iot_enable_hub

**Scaleway API**: `POST /iot/v1/regions/{region}/hubs/{hub_id}/enable`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| hubId | string (UUID) | yes | Hub ID |

**Output**: `Hub`

---

### scaleway_iot_disable_hub

**Scaleway API**: `POST /iot/v1/regions/{region}/hubs/{hub_id}/disable`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| hubId | string (UUID) | yes | Hub ID |

**Output**: `Hub`

---

### scaleway_iot_get_hub_ca

**Scaleway API**: `GET /iot/v1/regions/{region}/hubs/{hub_id}/ca`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| hubId | string (UUID) | yes | Hub ID |

**Output**: `{ ca_cert_pem: string }`

---

### scaleway_iot_set_hub_ca

**Scaleway API**: `POST /iot/v1/regions/{region}/hubs/{hub_id}/ca`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| hubId | string (UUID) | yes | Hub ID |
| caCertPem | string | yes | CA certificate in PEM format |
| challengeCertPem | string | yes | Challenge certificate in PEM format |

**Output**: `{}`

---

## Device Tools

### scaleway_iot_list_devices

**Scaleway API**: `GET /iot/v1/regions/{region}/devices`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | default region | Region |
| page | number | no | 1 | Page number |
| pageSize | number | no | 50 | Items per page |
| orderBy | enum | no | - | Sort order |
| hubId | string (UUID) | no | - | Filter by hub ID |
| name | string | no | - | Filter by name |
| allowInsecure | boolean | no | - | Filter by allow_insecure flag |
| status | enum | no | - | Filter by status (unknown, error, enabled, disabled) |

**Output**: `{ items: Device[], total_count: number, page: number, page_size: number, total_pages: number }`

---

### scaleway_iot_get_device

**Scaleway API**: `GET /iot/v1/regions/{region}/devices/{device_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| deviceId | string (UUID) | yes | Device ID |

**Output**: `Device`

---

### scaleway_iot_create_device

**Scaleway API**: `POST /iot/v1/regions/{region}/devices`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| hubId | string (UUID) | yes | Hub ID to attach the device to |
| name | string | yes | Device name |
| allowInsecure | boolean | no | Allow insecure connections |
| allowMultipleConnections | boolean | no | Allow multiple connections |
| messageFilters | object | no | Publish/subscribe message filters |
| description | string | no | Device description |

**Output**: `{ device: Device, certificate: DeviceCertificate }`

---

### scaleway_iot_update_device

**Scaleway API**: `PATCH /iot/v1/regions/{region}/devices/{device_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| deviceId | string (UUID) | yes | Device ID |
| name | string | no | New device name |
| allowInsecure | boolean | no | Allow insecure connections |
| allowMultipleConnections | boolean | no | Allow multiple connections |
| messageFilters | object | no | Publish/subscribe message filters |
| hubId | string (UUID) | no | Move device to a different hub |
| description | string | no | Device description |

**Output**: `Device`

---

### scaleway_iot_delete_device

**Scaleway API**: `DELETE /iot/v1/regions/{region}/devices/{device_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| deviceId | string (UUID) | yes | Device ID |

**Output**: `{}`

---

### scaleway_iot_enable_device

**Scaleway API**: `POST /iot/v1/regions/{region}/devices/{device_id}/enable`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| deviceId | string (UUID) | yes | Device ID |

**Output**: `Device`

---

### scaleway_iot_disable_device

**Scaleway API**: `POST /iot/v1/regions/{region}/devices/{device_id}/disable`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| deviceId | string (UUID) | yes | Device ID |

**Output**: `Device`

---

### scaleway_iot_get_device_certificate

**Scaleway API**: `GET /iot/v1/regions/{region}/devices/{device_id}/certificate`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| deviceId | string (UUID) | yes | Device ID |

**Output**: `DeviceCertificate`

---

### scaleway_iot_renew_device_certificate

**Scaleway API**: `POST /iot/v1/regions/{region}/devices/{device_id}/certificate/renew`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| deviceId | string (UUID) | yes | Device ID |

**Output**: `DeviceCertificate`

---

### scaleway_iot_set_device_certificate

**Scaleway API**: `PUT /iot/v1/regions/{region}/devices/{device_id}/certificate`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| deviceId | string (UUID) | yes | Device ID |
| certificatePem | string | yes | Certificate in PEM format |

**Output**: `DeviceCertificate`

---

### scaleway_iot_get_device_metrics

**Scaleway API**: `GET /iot/v1/regions/{region}/devices/{device_id}/metrics`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| deviceId | string (UUID) | yes | Device ID |
| startDate | string | no | Start date for metrics (RFC 3339) |

**Output**: `Metrics`

---

## Route Tools

### scaleway_iot_list_routes

**Scaleway API**: `GET /iot/v1/regions/{region}/routes`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | default region | Region |
| page | number | no | 1 | Page number |
| pageSize | number | no | 50 | Items per page |
| orderBy | enum | no | - | Sort order |
| hubId | string (UUID) | no | - | Filter by hub ID |
| name | string | no | - | Filter by name |

**Output**: `{ items: Route[], total_count: number, page: number, page_size: number, total_pages: number }`

---

### scaleway_iot_get_route

**Scaleway API**: `GET /iot/v1/regions/{region}/routes/{route_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| routeId | string (UUID) | yes | Route ID |

**Output**: `Route`

---

### scaleway_iot_create_route

**Scaleway API**: `POST /iot/v1/regions/{region}/routes`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| hubId | string (UUID) | yes | Hub ID |
| name | string | yes | Route name |
| topic | string | yes | MQTT topic filter |
| s3Config | S3RouteConfig | no | S3 backend config |
| dbConfig | DbRouteConfig | no | Database backend config |
| restConfig | RestRouteConfig | no | REST backend config |

**Output**: `Route`

---

### scaleway_iot_update_route

**Scaleway API**: `PATCH /iot/v1/regions/{region}/routes/{route_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| routeId | string (UUID) | yes | Route ID |
| name | string | no | New route name |
| topic | string | no | New MQTT topic filter |
| s3Config | S3RouteConfig | no | S3 backend config |
| dbConfig | DbRouteConfig | no | Database backend config |
| restConfig | RestRouteConfig | no | REST backend config |

**Output**: `Route`

---

### scaleway_iot_delete_route

**Scaleway API**: `DELETE /iot/v1/regions/{region}/routes/{route_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| routeId | string (UUID) | yes | Route ID |

**Output**: `{}`

---

## Network Tools

### scaleway_iot_list_networks

**Scaleway API**: `GET /iot/v1/regions/{region}/networks`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | default region | Region |
| page | number | no | 1 | Page number |
| pageSize | number | no | 50 | Items per page |
| orderBy | enum | no | - | Sort order |
| hubId | string (UUID) | no | - | Filter by hub ID |
| name | string | no | - | Filter by name |
| topicPrefix | string | no | - | Filter by topic prefix |

**Output**: `{ items: Network[], total_count: number, page: number, page_size: number, total_pages: number }`

---

### scaleway_iot_get_network

**Scaleway API**: `GET /iot/v1/regions/{region}/networks/{network_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| networkId | string (UUID) | yes | Network ID |

**Output**: `Network`

---

### scaleway_iot_create_network

**Scaleway API**: `POST /iot/v1/regions/{region}/networks`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| hubId | string (UUID) | yes | Hub ID |
| name | string | yes | Network name |
| type | enum | yes | unknown, sigfox, rest |
| topicPrefix | string | yes | Topic prefix for the network |

**Output**: `Network`

---

### scaleway_iot_delete_network

**Scaleway API**: `DELETE /iot/v1/regions/{region}/networks/{network_id}`

**Input**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| region | string | no | Region |
| networkId | string (UUID) | yes | Network ID |

**Output**: `{}`
