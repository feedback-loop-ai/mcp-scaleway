# Scaleway SQS (Queues) Management API Reference

**Base URL**: `https://api.scaleway.com/mnq/v1beta1/regions/{region}`

## Endpoints

### Activate SQS
- **POST** `/activate-sqs`
- Body: `{ "project_id": "uuid" }`
- Response 200: `SqsInfo`

### Deactivate SQS
- **POST** `/deactivate-sqs`
- Body: `{ "project_id": "uuid" }`
- Response 200: `SqsInfo`

### Get SQS Info
- **GET** `/sqs-info?project_id={uuid}`
- Response 200: `SqsInfo`

### Create SQS Credentials
- **POST** `/sqs-credentials`
- Body: `{ "project_id": "uuid", "name": "string", "permissions": { "can_publish": bool, "can_receive": bool, "can_manage": bool } }`
- Response 200: `SqsCredentials`

### Delete SQS Credentials
- **DELETE** `/sqs-credentials/{credential_id}`
- Response 204: (empty)

### Get SQS Credentials
- **GET** `/sqs-credentials/{credential_id}`
- Response 200: `SqsCredentials`

### List SQS Credentials
- **GET** `/sqs-credentials?project_id={uuid}&page={int}&page_size={int}&order_by={string}`
- Response 200: `{ "sqs_credentials": [SqsCredentials], "total_count": int }`

### Update SQS Credentials
- **PATCH** `/sqs-credentials/{credential_id}`
- Body: `{ "name": "string", "permissions": { "can_publish": bool, "can_receive": bool, "can_manage": bool } }`
- Response 200: `SqsCredentials`

## Models

### SqsInfo
```json
{
  "project_id": "uuid",
  "region": "string",
  "status": "unknown_status | enabled | disabled",
  "sqs_endpoint_url": "string",
  "created_at": "2026-01-01T00:00:00.000Z",
  "updated_at": "2026-01-01T00:00:00.000Z"
}
```

### SqsCredentials
```json
{
  "id": "uuid",
  "name": "string",
  "project_id": "uuid",
  "region": "string",
  "access_key": "string",
  "secret_key": "string",
  "created_at": "2026-01-01T00:00:00.000Z",
  "updated_at": "2026-01-01T00:00:00.000Z",
  "permissions": {
    "can_publish": true,
    "can_receive": true,
    "can_manage": false
  }
}
```

### SqsPermissions
```json
{
  "can_publish": true,
  "can_receive": true,
  "can_manage": false
}
```

## Error Codes
- 400: Bad Request (invalid input)
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests

## Pagination
Only the List SQS Credentials endpoint supports pagination via `page` and `page_size` query parameters.
Order by: `created_at_asc`, `created_at_desc`, `name_asc`, `name_desc`, `updated_at_asc`, `updated_at_desc`.
