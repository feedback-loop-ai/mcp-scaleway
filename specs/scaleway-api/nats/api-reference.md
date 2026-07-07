# Scaleway Messaging and Queuing — NATS API Reference

Base URL: `https://api.scaleway.com/mnq/v1beta1/regions/{region}`

NATS is part of Scaleway Messaging and Queuing (MnQ). Regions: `fr-par`, `nl-ams`.

## Authentication
- Header: `X-Auth-Token: <secret_key>`

## NATS Accounts

### List NATS Accounts
`GET /nats-accounts`
- Query: `page` (int), `page_size` (int), `project_id` (string), `name` (string), `order_by` (string)
- `order_by` enum: `created_at_asc`, `created_at_desc`, `updated_at_asc`, `updated_at_desc`, `name_asc`, `name_desc` (default `created_at_asc`)
- Response 200: `{ nats_accounts: NatsAccount[], total_count: number }`
- Tool: `scaleway_nats_list_accounts` → `handleListNatsAccounts`

### Get NATS Account
`GET /nats-accounts/{nats_account_id}`
- Response 200: `NatsAccount`
- Tool: `scaleway_nats_get_account`

### Create NATS Account
`POST /nats-accounts`
- Body: `{ name: string, project_id?: string }`
- Response 200: `NatsAccount`
- Tool: `scaleway_nats_create_account`

### Update NATS Account
`PATCH /nats-accounts/{nats_account_id}`
- Body: `{ name?: string }`
- Response 200: `NatsAccount`
- Tool: `scaleway_nats_update_account`

### Delete NATS Account
`DELETE /nats-accounts/{nats_account_id}`
- Response 204: empty
- Tool: `scaleway_nats_delete_account`

## NATS Credentials

### List NATS Credentials
`GET /nats-credentials`
- Query: `nats_account_id` (string — filter by account), `page` (int), `page_size` (int), `order_by` (string)
- `order_by` enum: `created_at_asc`, `created_at_desc`, `updated_at_asc`, `updated_at_desc`, `name_asc`, `name_desc` (default `created_at_asc`)
- Response 200: `{ nats_credentials: NatsCredentials[], total_count: number }`
- Tool: `scaleway_nats_list_credentials`
- **Fixed (2026-07):** the handler now calls `GET /mnq/v1beta1/regions/{region}/nats-credentials?nats_account_id={id}`
  (account id passed as a query parameter), matching the official MnQ v1beta1 API. The previous nested form
  `/nats-accounts/{id}/nats-credentials` was not a documented endpoint. Verified against `@scaleway/sdk-mnq`
  (`v1beta1/api.gen.js`).

### Get NATS Credentials
`GET /nats-credentials/{nats_credentials_id}`
- Response 200: `NatsCredentials` (metadata only; the credentials file content is NOT returned)
- Tool: `scaleway_nats_get_credentials`

### Create NATS Credentials
`POST /nats-credentials`
- Body: `{ nats_account_id: string, name?: string }`
- Response 200: `NatsCredentialsContent` — `NatsCredentials` plus `credentials: { content: string }`. The credentials
  file content is only returned on creation.
- Tool: `scaleway_nats_create_credentials`

### Delete NATS Credentials
`DELETE /nats-credentials/{nats_credentials_id}`
- Response 204: empty
- Tool: `scaleway_nats_delete_credentials`

## Models

### NatsAccount
```json
{
  "id": "uuid",
  "name": "string",
  "endpoint": "nats://nats.mnq.fr-par.scaleway.com:4222",
  "project_id": "uuid",
  "region": "fr-par",
  "status": "unknown_status | ready | error | creating | deleting",
  "created_at": "2025-06-01T12:00:00+00:00",
  "updated_at": "2025-06-01T12:30:00+00:00"
}
```
Note: `status` is modelled in the zod schema (`NatsAccountStatus`) for contract validation; the field is present
in list/get responses.

### NatsCredentials (metadata)
```json
{
  "id": "uuid",
  "name": "string",
  "nats_account_id": "uuid",
  "created_at": "2025-06-01T12:00:00+00:00",
  "updated_at": "2025-06-01T12:30:00+00:00",
  "checksum": "sha256:..."
}
```

### NatsCredentialsContent (create response)
```json
{
  "id": "uuid",
  "name": "string",
  "nats_account_id": "uuid",
  "created_at": "...",
  "updated_at": "...",
  "checksum": "sha256:...",
  "credentials": { "content": "-----BEGIN NATS USER JWT-----\n..." }
}
```

## Pagination
List endpoints use standard MnQ pagination: `page` (1-indexed), `page_size`. Responses carry `total_count` and the
item array. The server normalizes results via `buildPaginatedResponse()`.

## Error Codes
- 400 Bad Request (invalid input / validation)
- 401 Unauthorized (missing/invalid `X-Auth-Token`)
- 403 Forbidden (insufficient permissions)
- 404 Not Found (unknown account/credentials id)
- 429 Too Many Requests

## References
- NATS API: https://www.scaleway.com/en/developers/api/messaging-and-queuing/nats-api/
- NATS credentials: https://www.scaleway.com/en/developers/api/messaging-and-queuing/nats/nats-credentials
- SDK: `@scaleway/sdk-mnq` v1beta1 (`Mnqv1beta1.NatsAPI`)
