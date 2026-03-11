# SDD: SQS (Queues) API

**Spec**: 027-sqs | **Date**: 2026-03-11
**API Group**: AI & Managed Services | **Locality**: regional
**SDK Package**: `@scaleway/sdk`

## Overview

Scaleway SQS (Simple Queue Service) provides managed SQS-compatible message queues. The Scaleway management API handles activation/deactivation of the SQS service and CRUD operations on SQS credentials. Actual queue operations (send/receive messages) use the SQS-compatible endpoint returned by the management API.

## User Stories

### P1 - Activate/Deactivate SQS
As a cloud operator, I want to activate or deactivate SQS for my project so I can provision or tear down the messaging infrastructure.

### P1 - Credentials CRUD
As a cloud operator, I want to create, read, update, and delete SQS credentials so I can manage access to the SQS-compatible endpoint.

### P2 - Get SQS Info
As a cloud operator, I want to retrieve the current SQS service status and endpoint URL so I can verify the service state and configure clients.

## Tool Contracts

### scaleway_sqs_activate

```yaml
Tool: scaleway_sqs_activate
Title: Activate SQS
Description: Activate SQS (Queues) service for a project in a region
Scaleway API: POST /mnq/v1beta1/regions/{region}/activate-sqs
Locality: regional

Input Schema:
  region: z.string() - Scaleway region (e.g., fr-par) [optional, defaults to config]
  project_id: z.string().uuid() - Project ID [optional, defaults to config]

Output Schema:
  project_id: string - Project ID
  region: string - Region
  status: string - Service status (enabled, disabled, unknown_status)
  sqs_endpoint_url: string - SQS-compatible endpoint URL
  created_at: string - ISO 8601 creation timestamp
  updated_at: string - ISO 8601 update timestamp

Pagination: no

Error Codes:
  - 400: Invalid input -> invalid_input
  - 403: Forbidden -> permission_denied
  - 404: Not found -> not_found
  - 429: Rate limited -> rate_limited
```

### scaleway_sqs_deactivate

```yaml
Tool: scaleway_sqs_deactivate
Title: Deactivate SQS
Description: Deactivate SQS (Queues) service for a project in a region
Scaleway API: POST /mnq/v1beta1/regions/{region}/deactivate-sqs
Locality: regional

Input Schema:
  region: z.string() - Scaleway region [optional, defaults to config]
  project_id: z.string().uuid() - Project ID [optional, defaults to config]

Output Schema:
  project_id: string - Project ID
  region: string - Region
  status: string - Service status
  sqs_endpoint_url: string - SQS-compatible endpoint URL
  created_at: string - ISO 8601 creation timestamp
  updated_at: string - ISO 8601 update timestamp

Pagination: no

Error Codes:
  - 400: Invalid input -> invalid_input
  - 403: Forbidden -> permission_denied
  - 404: Not found -> not_found
  - 429: Rate limited -> rate_limited
```

### scaleway_sqs_get_info

```yaml
Tool: scaleway_sqs_get_info
Title: Get SQS Info
Description: Get SQS service info including status and endpoint URL
Scaleway API: GET /mnq/v1beta1/regions/{region}/sqs-info
Locality: regional

Input Schema:
  region: z.string() - Scaleway region [optional, defaults to config]
  project_id: z.string().uuid() - Project ID [optional, defaults to config]

Output Schema:
  project_id: string - Project ID
  region: string - Region
  status: string - Service status
  sqs_endpoint_url: string - SQS-compatible endpoint URL
  created_at: string - ISO 8601 creation timestamp
  updated_at: string - ISO 8601 update timestamp

Pagination: no

Error Codes:
  - 400: Invalid input -> invalid_input
  - 403: Forbidden -> permission_denied
  - 404: Not found -> not_found
  - 429: Rate limited -> rate_limited
```

### scaleway_sqs_create_credentials

```yaml
Tool: scaleway_sqs_create_credentials
Title: Create SQS Credentials
Description: Create new SQS credentials for accessing the SQS-compatible endpoint
Scaleway API: POST /mnq/v1beta1/regions/{region}/sqs-credentials
Locality: regional

Input Schema:
  region: z.string() - Scaleway region [optional, defaults to config]
  project_id: z.string().uuid() - Project ID [optional, defaults to config]
  name: z.string() - Credential name [required]
  permissions: z.object() - Permission set [optional]
    can_publish: z.boolean() - Allow publishing messages [optional, default false]
    can_receive: z.boolean() - Allow receiving messages [optional, default false]
    can_manage: z.boolean() - Allow managing queues [optional, default false]

Output Schema:
  id: string - Credential ID
  name: string - Credential name
  project_id: string - Project ID
  region: string - Region
  access_key: string - SQS access key
  secret_key: string - SQS secret key
  created_at: string - ISO 8601 creation timestamp
  updated_at: string - ISO 8601 update timestamp
  permissions: object - Permission set

Pagination: no

Error Codes:
  - 400: Invalid input -> invalid_input
  - 403: Forbidden -> permission_denied
  - 404: Not found -> not_found
  - 429: Rate limited -> rate_limited
```

### scaleway_sqs_delete_credentials

```yaml
Tool: scaleway_sqs_delete_credentials
Title: Delete SQS Credentials
Description: Delete SQS credentials by ID
Scaleway API: DELETE /mnq/v1beta1/regions/{region}/sqs-credentials/{credential_id}
Locality: regional

Input Schema:
  region: z.string() - Scaleway region [optional, defaults to config]
  credential_id: z.string().uuid() - Credential ID to delete [required]

Output Schema: (empty - 204 No Content)

Pagination: no

Error Codes:
  - 400: Invalid input -> invalid_input
  - 403: Forbidden -> permission_denied
  - 404: Not found -> not_found
  - 429: Rate limited -> rate_limited
```

### scaleway_sqs_get_credentials

```yaml
Tool: scaleway_sqs_get_credentials
Title: Get SQS Credentials
Description: Get SQS credentials details by ID
Scaleway API: GET /mnq/v1beta1/regions/{region}/sqs-credentials/{credential_id}
Locality: regional

Input Schema:
  region: z.string() - Scaleway region [optional, defaults to config]
  credential_id: z.string().uuid() - Credential ID [required]

Output Schema:
  id: string - Credential ID
  name: string - Credential name
  project_id: string - Project ID
  region: string - Region
  access_key: string - SQS access key
  secret_key: string - SQS secret key
  created_at: string - ISO 8601 creation timestamp
  updated_at: string - ISO 8601 update timestamp
  permissions: object - Permission set

Pagination: no

Error Codes:
  - 400: Invalid input -> invalid_input
  - 403: Forbidden -> permission_denied
  - 404: Not found -> not_found
  - 429: Rate limited -> rate_limited
```

### scaleway_sqs_list_credentials

```yaml
Tool: scaleway_sqs_list_credentials
Title: List SQS Credentials
Description: List all SQS credentials for a project in a region
Scaleway API: GET /mnq/v1beta1/regions/{region}/sqs-credentials
Locality: regional

Input Schema:
  region: z.string() - Scaleway region [optional, defaults to config]
  project_id: z.string().uuid() - Project ID [optional, defaults to config]
  page: z.number().int().positive() - Page number [optional, default 1]
  page_size: z.number().int().min(1).max(100) - Items per page [optional, default 50]
  order_by: z.enum() - Order by field [optional, default "created_at_asc"]

Output Schema:
  sqs_credentials: array - List of SQS credentials
  total_count: number - Total number of credentials

Pagination: yes

Error Codes:
  - 400: Invalid input -> invalid_input
  - 403: Forbidden -> permission_denied
  - 404: Not found -> not_found
  - 429: Rate limited -> rate_limited
```

### scaleway_sqs_update_credentials

```yaml
Tool: scaleway_sqs_update_credentials
Title: Update SQS Credentials
Description: Update SQS credentials name or permissions
Scaleway API: PATCH /mnq/v1beta1/regions/{region}/sqs-credentials/{credential_id}
Locality: regional

Input Schema:
  region: z.string() - Scaleway region [optional, defaults to config]
  credential_id: z.string().uuid() - Credential ID [required]
  name: z.string() - New credential name [optional]
  permissions: z.object() - Updated permission set [optional]
    can_publish: z.boolean() - Allow publishing messages [optional]
    can_receive: z.boolean() - Allow receiving messages [optional]
    can_manage: z.boolean() - Allow managing queues [optional]

Output Schema:
  id: string - Credential ID
  name: string - Credential name
  project_id: string - Project ID
  region: string - Region
  access_key: string - SQS access key
  secret_key: string - SQS secret key
  created_at: string - ISO 8601 creation timestamp
  updated_at: string - ISO 8601 update timestamp
  permissions: object - Permission set

Pagination: no

Error Codes:
  - 400: Invalid input -> invalid_input
  - 403: Forbidden -> permission_denied
  - 404: Not found -> not_found
  - 429: Rate limited -> rate_limited
```

## Scaleway API Reference

See `specs/scaleway-api/sqs/` for the full API reference.

## Implementation Notes

- SQS is a **regional** API (fr-par, nl-ams, pl-waw)
- The management API handles service activation and credential management only
- Actual queue operations (CreateQueue, SendMessage, ReceiveMessage, etc.) use the AWS SQS-compatible endpoint URL returned by the management API
- Credentials have three permission flags: can_publish, can_receive, can_manage
- The service must be activated before credentials can be created
- secret_key is only returned at creation time for security
