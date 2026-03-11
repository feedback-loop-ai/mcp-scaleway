# Data Model: Scaleway Instances MCP Tools

**Feature**: 002-instances | **Date**: 2026-03-11

## Entities

### Server

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique server identifier |
| name | string | yes | Server name |
| state | enum | yes | running, stopped, stopped_in_place, starting, stopping, locked |
| commercial_type | string | yes | Instance type (e.g., DEV1-S, GP1-XS) |
| zone | string | yes | Availability zone (e.g., fr-par-1) |
| project | string (UUID) | yes | Project ID |
| public_ip | object/null | no | Attached public IP |
| public_ips | array | no | All attached public IPs |
| private_ip | string/null | no | Private IP address |
| volumes | object | no | Attached volumes (map of index to volume) |
| tags | string[] | no | User-defined tags |
| image | object/null | no | Image used to create the server |
| creation_date | string (ISO 8601) | yes | Creation timestamp |
| modification_date | string (ISO 8601) | yes | Last modification timestamp |
| placement_group | object/null | no | Placement group |
| security_group | object | no | Security group |
| arch | string | yes | Architecture (x86_64, arm64) |

### Volume

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique volume identifier |
| name | string | yes | Volume name |
| size | number | yes | Volume size in bytes |
| volume_type | enum | yes | l_ssd, b_ssd, unified, scratch |
| zone | string | yes | Availability zone |
| state | string | yes | available, in_use, error |
| server | object/null | no | Server this volume is attached to |
| creation_date | string (ISO 8601) | yes | Creation timestamp |
| modification_date | string (ISO 8601) | yes | Last modification timestamp |
| organization | string (UUID) | yes | Organization ID |
| project | string (UUID) | yes | Project ID |
| tags | string[] | no | User-defined tags |

### Image

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique image identifier |
| name | string | yes | Image name |
| arch | string | yes | Architecture (x86_64, arm64) |
| creation_date | string (ISO 8601) | yes | Creation timestamp |
| modification_date | string (ISO 8601) | yes | Last modification timestamp |
| public | boolean | yes | Whether image is public |
| from_server | string/null | no | Server ID image was created from |
| organization | string (UUID) | yes | Organization ID |
| project | string (UUID) | yes | Project ID |

### Snapshot

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique snapshot identifier |
| name | string | yes | Snapshot name |
| size | number | yes | Snapshot size in bytes |
| state | string | yes | available, snapshotting, error |
| volume_id | string (UUID)/null | no | Source volume ID |
| volume_type | string | yes | Volume type |
| creation_date | string (ISO 8601) | yes | Creation timestamp |
| base_volume | object/null | no | Base volume information |
| organization | string (UUID) | yes | Organization ID |
| project | string (UUID) | yes | Project ID |
| tags | string[] | no | User-defined tags |

### SecurityGroup

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique security group identifier |
| name | string | yes | Security group name |
| description | string | no | Description |
| inbound_default_policy | enum | yes | accept, drop |
| outbound_default_policy | enum | yes | accept, drop |
| enable_default_security | boolean | yes | Whether default security rules apply |
| servers | array | no | Attached servers |
| creation_date | string (ISO 8601) | yes | Creation timestamp |
| modification_date | string (ISO 8601) | yes | Last modification timestamp |
| organization | string (UUID) | yes | Organization ID |
| project | string (UUID) | yes | Project ID |
| project_default | boolean | yes | Whether this is the project default |
| stateful | boolean | yes | Whether the group is stateful |
| organization_default | boolean | yes | Whether this is the org default |

### IP

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique IP identifier |
| address | string | yes | IP address |
| server | object/null | no | Server this IP is attached to |
| zone | string | yes | Availability zone |
| type | enum | yes | routed_ipv4, routed_ipv6, nat |
| project | string (UUID) | yes | Project ID |
| organization | string (UUID) | yes | Organization ID |
| tags | string[] | no | User-defined tags |
| reverse | string/null | no | Reverse DNS |

### Task (Server Action Response)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Task identifier |
| description | string | yes | Task description |
| status | string | yes | pending, started, success, failure, retry |
| progress | number | yes | Progress percentage |
| started_at | string (ISO 8601)/null | no | Start timestamp |
| terminated_at | string (ISO 8601)/null | no | End timestamp |
