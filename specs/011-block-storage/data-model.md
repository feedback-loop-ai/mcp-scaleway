# Data Model: Scaleway Block Storage MCP Tools

**Feature**: 011-block-storage | **Date**: 2026-03-11

## Entities

### Volume

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique volume identifier |
| name | string | yes | Volume name |
| type | enum | yes | b_ssd, sbs_5k, sbs_15k, unknown_type |
| size | number | yes | Volume size in bytes |
| zone | string | yes | Availability zone (e.g., fr-par-1) |
| status | enum | yes | unknown_status, creating, available, in_use, deleting, deleted, resizing, error, snapshotting, locked |
| specs | object/null | no | Volume specifications (perfIops, class) |
| lastDetachedAt | string (ISO 8601)/null | no | Timestamp of last detach |
| projectId | string (UUID) | yes | Project ID |
| tags | string[] | yes | User-defined tags |
| parentSnapshotId | string (UUID)/null | no | Source snapshot ID if created from snapshot |
| createdAt | string (ISO 8601) | no | Creation timestamp |
| updatedAt | string (ISO 8601) | no | Last modification timestamp |

### VolumeSpecifications

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| perfIops | number | no | The maximum IO/s expected |
| class | string | no | The storage class of the volume |

### Snapshot

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique snapshot identifier |
| name | string | yes | Snapshot name |
| volumeId | string (UUID)/null | no | Source volume ID |
| size | number | yes | Snapshot size in bytes |
| zone | string | yes | Availability zone |
| status | enum | yes | unknown_status, creating, available, deleting, deleted, error, in_use, locked |
| projectId | string (UUID) | yes | Project ID |
| tags | string[] | yes | User-defined tags |
| class | enum | no | standard, instant, unknown_class |
| parentVolume | object/null | no | Parent volume info (id, name, type, status) |
| createdAt | string (ISO 8601) | no | Creation timestamp |
| updatedAt | string (ISO 8601) | no | Last modification timestamp |

### VolumeTypeInfo

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Volume type name (e.g., sbs_5k) |
| pricing | object | no | Pricing info (pricePerHour) |
| snapshotPricing | object | no | Snapshot pricing info (pricePerHour) |
| specs | object | no | Type specs (minSize, maxSize, minIops, maxIops) |

### VolumeTypeSpecs

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| minSize | number | no | Minimum volume size in bytes |
| maxSize | number | no | Maximum volume size in bytes |
| minIops | number | no | Minimum IOPS |
| maxIops | number | no | Maximum IOPS |

### VolumeTypePricing

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| pricePerHour | number | no | Price per hour in currency units |
