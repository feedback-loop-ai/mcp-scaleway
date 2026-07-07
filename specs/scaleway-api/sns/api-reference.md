# Scaleway Messaging and Queuing — Topics and Events (SNS) API Reference

Base URL: `https://api.scaleway.com/mnq/v1beta1/regions/{region}`

Topics and Events (branded "SNS" in the API) is part of Scaleway Messaging and Queuing (MnQ). It exposes an
Amazon SNS-compatible protocol endpoint. Regions: `fr-par`, `nl-ams`.

## Authentication
- Header: `X-Auth-Token: <secret_key>` (Scaleway management API)
- The protocol endpoint (`sns_endpoint_url`) is accessed with the access/secret key pair returned by the
  credentials endpoints.

Implementation note: all SNS tools call the Scaleway SDK (`@scaleway/sdk-mnq` `Mnqv1beta1.SnsAPI`). Request/response
field names in the tool layer are camelCase (SDK-marshalled); the wire API uses snake_case.

## Service Management

### Activate SNS
`POST /activate-sns`
- Body: `{ project_id?: string }`
- Response 200: `SnsInfo`
- Tool: `scaleway_sns_activate` → `handleActivateSns` (SDK `activateSns`)

### Deactivate SNS
`POST /deactivate-sns`
- Body: `{ project_id?: string }`. All topics and credentials must be deleted first.
- Response 200: `SnsInfo`
- Tool: `scaleway_sns_deactivate` (SDK `deactivateSns`)

### Get SNS Info
`GET /sns-info`
- Query: `project_id` (string)
- Response 200: `SnsInfo` (activation status + protocol endpoint URL)
- Tool: `scaleway_sns_get_info` (SDK `getSnsInfo`)

## Credentials

### List SNS Credentials
`GET /sns-credentials`
- Query: `project_id` (string), `page` (int), `page_size` (int), `order_by` (string)
- `order_by` enum: `created_at_asc`, `created_at_desc`, `updated_at_asc`, `updated_at_desc`, `name_asc`, `name_desc`
- Response 200: `{ sns_credentials: SnsCredentials[], total_count: number }` (metadata only, no secret keys)
- Tool: `scaleway_sns_list_credentials` (SDK `listSnsCredentials`)

### Get SNS Credentials
`GET /sns-credentials/{sns_credentials_id}`
- Response 200: `SnsCredentials` (no secret key)
- Tool: `scaleway_sns_get_credentials` (SDK `getSnsCredentials`)

### Create SNS Credentials
`POST /sns-credentials`
- Body: `{ project_id?: string, name?: string, permissions?: SnsPermissions }`
- Response 200: `SnsCredentials` including `secret_key` (returned only on creation)
- Tool: `scaleway_sns_create_credentials` (SDK `createSnsCredentials`)

### Update SNS Credentials
`PATCH /sns-credentials/{sns_credentials_id}`
- Body: `{ name?: string, permissions?: SnsPermissions }`
- Response 200: `SnsCredentials`
- Tool: `scaleway_sns_update_credentials` (SDK `updateSnsCredentials`)

### Delete SNS Credentials
`DELETE /sns-credentials/{sns_credentials_id}`
- Response 204: empty. Irreversible; active connections using the credentials are closed.
- Tool: `scaleway_sns_delete_credentials` (SDK `deleteSnsCredentials`)

## Models

### SnsInfo
```json
{
  "project_id": "uuid",
  "region": "fr-par",
  "created_at": "2025-01-01T00:00:00.000Z",
  "updated_at": "2025-01-02T00:00:00.000Z",
  "status": "unknown_status | enabled | disabled",
  "sns_endpoint_url": "https://sns.mnq.fr-par.scaleway.com"
}
```
(SDK/tool layer uses camelCase: `projectId`, `createdAt`, `updatedAt`, `snsEndpointUrl`.)

### SnsCredentials
```json
{
  "id": "uuid",
  "name": "string",
  "project_id": "uuid",
  "region": "fr-par",
  "created_at": "...",
  "updated_at": "...",
  "access_key": "string",
  "secret_key": "string (create only)",
  "secret_checksum": "string",
  "permissions": { "can_publish": true, "can_receive": false, "can_manage": true }
}
```
(SDK/tool layer camelCase: `projectId`, `accessKey`, `secretKey`, `secretChecksum`, and permissions
`canPublish`/`canReceive`/`canManage`.)

### SnsPermissions
```json
{ "can_publish": true, "can_receive": true, "can_manage": false }
```
- `can_publish` — publish messages to topics
- `can_receive` — receive messages / configure subscriptions
- `can_manage` — manage topics or subscriptions

## Pagination
Only `List SNS Credentials` is paginated (`page`, `page_size`); the response carries `total_count`. Normalized via
`buildPaginatedResponse()`.

## Error Codes
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 429 Too Many Requests

## References
- Topics and Events API: https://www.scaleway.com/en/developers/api/topics-and-events/sns-api/
- Messaging and Queuing (SNS): https://www.scaleway.com/en/developers/api/messaging-and-queuing/sns-api/
- SDK: `@scaleway/sdk-mnq` v1beta1 (`Mnqv1beta1.SnsAPI`)
