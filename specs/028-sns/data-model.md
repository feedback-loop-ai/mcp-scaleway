# Data Model: Scaleway SNS (Topics & Events) MCP Tools

**Feature**: 028-sns | **Date**: 2026-03-11

## Entities

### SnsInfo

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| projectId | string (UUID) | yes | Project ID of the project containing the service |
| region | string | yes | Region of the service (e.g., fr-par, nl-ams, pl-waw) |
| createdAt | string (ISO 8601) | no | Topics and Events creation date |
| updatedAt | string (ISO 8601) | no | Topics and Events last modification date |
| status | enum | yes | unknown_status, enabled, disabled |
| snsEndpointUrl | string (URL) | yes | Endpoint of the Topics and Events service for this region and project |

### SnsCredentials

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique credentials identifier |
| name | string | yes | Credentials name |
| projectId | string (UUID) | yes | Project ID of the project containing the credentials |
| region | string | yes | Region where the credentials exist |
| createdAt | string (ISO 8601) | no | Credentials creation date |
| updatedAt | string (ISO 8601) | no | Credentials last modification date |
| accessKey | string | yes | Access key ID |
| secretKey | string | yes | Secret key (only returned on create) |
| secretChecksum | string | yes | Checksum of the secret key |
| permissions | SnsPermissions | no | Permissions associated with these credentials |

### SnsPermissions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| canPublish | boolean | no | Whether the credentials bearer can publish messages to topics |
| canReceive | boolean | no | Whether the credentials bearer can receive messages (configure subscriptions) |
| canManage | boolean | no | Whether the credentials bearer can manage topics or subscriptions |

## Enums

### SnsInfoStatus

| Value | Description |
|-------|-------------|
| unknown_status | Status is not known |
| enabled | SNS is activated and ready for use |
| disabled | SNS is deactivated |

### ListSnsCredentialsOrderBy

| Value | Description |
|-------|-------------|
| created_at_asc | Sort by creation date ascending |
| created_at_desc | Sort by creation date descending |
| updated_at_asc | Sort by last update ascending |
| updated_at_desc | Sort by last update descending |
| name_asc | Sort by name ascending |
| name_desc | Sort by name descending |
