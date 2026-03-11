# Data Model: Scaleway Managed MongoDB MCP Tools

**Feature**: 015-mongodb | **Date**: 2026-03-11

## Entities

### Instance

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique instance identifier |
| name | string | yes | Instance name |
| status | enum | yes | unknown_status, ready, provisioning, configuring, deleting, error, initializing, locked, snapshotting |
| version | string | yes | MongoDB version (e.g., 7.0.12) |
| node_type | string | yes | Node type (e.g., MGDB-PLAY2-NANO) |
| node_number | number | yes | Number of nodes in the cluster |
| region | string | yes | Region (e.g., fr-par) |
| project_id | string (UUID) | yes | Project ID |
| tags | string[] | no | User-defined tags |
| volume | object | no | Volume configuration (volume_type, volume_size) |
| endpoints | array | no | Connection endpoints |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last modification timestamp |

### User

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Username (unique per instance) |
| password | string | yes (on create) | User password (write-only) |

### Snapshot

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique snapshot identifier |
| name | string | yes | Snapshot name |
| status | enum | yes | unknown_status, creating, ready, restoring, deleting, error, locked |
| instance_id | string (UUID) | yes | Source instance ID |
| instance_name | string | yes | Source instance name |
| size | number | yes | Snapshot size in bytes |
| expires_at | string (ISO 8601)/null | no | Expiration date |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last modification timestamp |
| region | string | yes | Region |

### NodeType

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Node type name (e.g., MGDB-PLAY2-NANO) |
| description | string | yes | Human-readable description |
| vcpus | number | yes | Number of virtual CPUs |
| memory | number | yes | Memory in bytes |
| available_volume_types | array | yes | Supported volume types and size constraints |
| disabled | boolean | yes | Whether this type is currently disabled |
| stock_status | string | yes | Availability stock status |

### Version

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| version | string | yes | MongoDB version string (e.g., 7.0.12) |
| available_settings | array | no | Configurable settings for this version |
| end_of_life_at | string (ISO 8601)/null | no | End-of-life date |

### Volume (embedded in Instance)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| volume_type | enum | yes | sbs_5k, sbs_15k (Scaleway Block Storage tiers) |
| volume_size | number | yes | Volume size in bytes |
