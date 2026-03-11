# Data Model: Scaleway Secret Manager MCP Tools

**Feature**: 024-secret-manager | **Date**: 2026-03-11

## Entities

### Secret

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique secret identifier |
| name | string | yes | Secret name |
| status | enum | yes | unknown_status, ready, locked |
| type | enum | yes | unknown_type, opaque, certificate, key_value, basic_credentials, database_credentials, ssh_key |
| path | string | yes | Location in the directory structure (default: /) |
| tags | string[] | no | User-defined tags |
| description | string | no | Human-readable description |
| protected | boolean | yes | Whether the secret is protected from deletion |
| versionCount | number | yes | Number of versions |
| region | string | yes | Region (e.g., fr-par) |
| projectId | string (UUID) | yes | Project ID |
| ephemeralPolicy | EphemeralPolicy/null | no | Policy for automatic version expiration |
| createdAt | string (ISO 8601) | yes | Creation timestamp |
| updatedAt | string (ISO 8601) | yes | Last modification timestamp |

### SecretVersion

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| secretId | string (UUID) | yes | Parent secret identifier |
| revision | number | yes | Version revision number (1-indexed) |
| status | enum | yes | unknown_status, enabled, disabled, deleted, scheduled_for_deletion |
| description | string | no | Version description |
| createdAt | string (ISO 8601) | yes | Creation timestamp |
| updatedAt | string (ISO 8601) | yes | Last modification timestamp |
| latestRevision | boolean | yes | Whether this is the latest revision |

### SecretVersionAccess (Access Response)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| secretId | string (UUID) | yes | Parent secret identifier |
| revision | number | yes | Version revision number |
| data | string (base64) | yes | Base64-encoded secret payload |
| dataCrc32 | number | yes | CRC32 checksum of the data |
| type | enum | yes | Secret type |

### EphemeralPolicy

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| timeToLive | string | no | Duration the version is valid (e.g., '3600s') |
| expiresOnceAccessed | boolean | no | If true, version expires after single access |
| action | enum | yes | unknown_action, delete, disable |

### Tag

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| key | string | yes | Tag key/value string |
| secretCount | number | yes | Number of secrets with this tag |

### Product (Owner)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| product | enum | yes | unknown_product, edge_services, s2s_vpn |

## Enums

### SecretType

- `unknown_type` - Unknown/default type
- `opaque` - Opaque binary data
- `certificate` - TLS/SSL certificate
- `key_value` - Key-value pairs (JSON)
- `basic_credentials` - Username/password pair
- `database_credentials` - Database connection credentials
- `ssh_key` - SSH key pair

### SecretStatus

- `unknown_status` - Unknown status
- `ready` - Secret is ready to use
- `locked` - Secret is locked

### SecretVersionStatus

- `unknown_status` - Unknown status
- `enabled` - Version is active and accessible
- `disabled` - Version is disabled (not accessible but not deleted)
- `deleted` - Version has been destroyed
- `scheduled_for_deletion` - Version is scheduled for deletion via ephemeral policy

### EphemeralPolicyAction

- `unknown_action` - Unknown action
- `delete` - Permanently delete the version when policy triggers
- `disable` - Disable the version when policy triggers

### ListSecretsOrderBy

- `name_asc` / `name_desc` - Order by name
- `created_at_asc` / `created_at_desc` - Order by creation date
- `updated_at_asc` / `updated_at_desc` - Order by last update date
