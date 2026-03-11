# Data Model: Scaleway NATS Messaging MCP Tools

**Feature**: 026-nats | **Date**: 2026-03-11

## Entities

### NatsAccount

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique NATS account identifier |
| name | string | yes | Account name |
| endpoint | string | yes | NATS endpoint URL for client connections |
| project_id | string (UUID) | yes | Project ID owning this account |
| region | string | yes | Region (e.g., fr-par, nl-ams, pl-waw) |
| status | enum | yes | unknown_status, ready, error, creating, deleting |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last modification timestamp |

### NatsCredentials

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique credentials identifier |
| name | string | yes | Credentials name |
| nats_account_id | string (UUID) | yes | Parent NATS account ID |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last modification timestamp |
| checksum | string | yes | Checksum of the credentials content |

### NatsCredentialsContent (Create Response)

Extends NatsCredentials with the credential content. Only returned at creation time.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique credentials identifier |
| name | string | yes | Credentials name |
| nats_account_id | string (UUID) | yes | Parent NATS account ID |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last modification timestamp |
| checksum | string | yes | Checksum of the credentials content |
| credentials.content | string | yes | NKey-based credential content (only available on create) |

## Relationships

```
NatsAccount (1) --< (N) NatsCredentials
```

- A NATS account can have multiple credentials
- Credentials are scoped to a single NATS account
- Deleting a NATS account removes all associated credentials

## Enumerations

### NatsAccountStatus

| Value | Description |
|-------|-------------|
| unknown_status | Status is unknown |
| ready | Account is ready for use |
| error | Account is in error state |
| creating | Account is being created |
| deleting | Account is being deleted |

### OrderBy (shared by accounts and credentials)

| Value | Description |
|-------|-------------|
| created_at_asc | Oldest first |
| created_at_desc | Newest first |
| updated_at_asc | Least recently updated first |
| updated_at_desc | Most recently updated first |
| name_asc | Alphabetical A-Z |
| name_desc | Alphabetical Z-A |
