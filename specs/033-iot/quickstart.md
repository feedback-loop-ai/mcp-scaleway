# Quickstart: Scaleway IoT Hub MCP Tools

**Feature**: 033-iot | **Date**: 2026-03-11

## Prerequisites

1. Set environment variables:
   ```bash
   export SCW_ACCESS_KEY="your-access-key"
   export SCW_SECRET_KEY="your-secret-key"
   export SCW_DEFAULT_PROJECT_ID="your-project-id"
   export SCW_DEFAULT_REGION="fr-par"
   ```

2. Start the MCP server:
   ```bash
   bun run start
   ```

## Usage Examples

### List Hubs

```json
{
  "tool": "scaleway_iot_list_hubs",
  "arguments": {
    "region": "fr-par",
    "page": 1,
    "pageSize": 10
  }
}
```

### Create a Hub

```json
{
  "tool": "scaleway_iot_create_hub",
  "arguments": {
    "region": "fr-par",
    "name": "my-iot-hub",
    "productPlan": "plan_shared"
  }
}
```

### Enable a Hub

```json
{
  "tool": "scaleway_iot_enable_hub",
  "arguments": {
    "region": "fr-par",
    "hubId": "hub-uuid"
  }
}
```

### Create a Device

```json
{
  "tool": "scaleway_iot_create_device",
  "arguments": {
    "region": "fr-par",
    "hubId": "hub-uuid",
    "name": "temperature-sensor",
    "allowInsecure": false,
    "description": "Office temperature sensor"
  }
}
```

### Get Device Certificate

```json
{
  "tool": "scaleway_iot_get_device_certificate",
  "arguments": {
    "region": "fr-par",
    "deviceId": "device-uuid"
  }
}
```

### Get Device Metrics

```json
{
  "tool": "scaleway_iot_get_device_metrics",
  "arguments": {
    "region": "fr-par",
    "deviceId": "device-uuid",
    "startDate": "2026-03-01T00:00:00Z"
  }
}
```

### Create an S3 Route

```json
{
  "tool": "scaleway_iot_create_route",
  "arguments": {
    "region": "fr-par",
    "hubId": "hub-uuid",
    "name": "sensor-data-to-s3",
    "topic": "sensors/#",
    "s3Config": {
      "bucketRegion": "fr-par",
      "bucketName": "iot-data",
      "objectPrefix": "sensors/",
      "strategy": "per_topic"
    }
  }
}
```

### Create a Database Route

```json
{
  "tool": "scaleway_iot_create_route",
  "arguments": {
    "region": "fr-par",
    "hubId": "hub-uuid",
    "name": "sensor-data-to-db",
    "topic": "sensors/temperature",
    "dbConfig": {
      "host": "db-host.example.com",
      "port": 5432,
      "dbname": "iot_data",
      "username": "iot_writer",
      "password": "secret",
      "query": "INSERT INTO readings (payload) VALUES ($PAYLOAD)",
      "engine": "postgresql"
    }
  }
}
```

### Create a Network

```json
{
  "tool": "scaleway_iot_create_network",
  "arguments": {
    "region": "fr-par",
    "hubId": "hub-uuid",
    "name": "sigfox-network",
    "type": "sigfox",
    "topicPrefix": "sigfox/"
  }
}
```

### Delete a Hub (with Devices)

```json
{
  "tool": "scaleway_iot_delete_hub",
  "arguments": {
    "region": "fr-par",
    "hubId": "hub-uuid",
    "deleteDevices": true
  }
}
```
