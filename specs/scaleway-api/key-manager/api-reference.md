# Scaleway Key Manager API Reference (v1alpha1)

Base URL: `https://api.scaleway.com/key-manager/v1alpha1/regions/{region}`

Key Manager (KMS) manages cryptographic keys and performs encrypt/decrypt/data-key operations. Paths below are
authoritative from `@scaleway/sdk-key-manager` v1alpha1 (`KeyManagerv1alpha1.API`), which every tool uses.

## Authentication
- Header: `X-Auth-Token: <secret_key>`
- Project ID is supplied in request bodies where applicable (create/list).

## Key Lifecycle

### List Keys
`GET /keys`
- Query: `organization_id`, `project_id`, `order_by`, `tags` (repeatable), `name`, `usage`, `scheduled_for_deletion`
  (bool), `page` (int), `page_size` (int)
- `order_by` enum: `name_asc`, `name_desc`, `created_at_asc`, `created_at_desc`, `updated_at_asc`, `updated_at_desc`
- `usage` enum: `unknown_usage`, `symmetric_encryption`, `asymmetric_encryption`, `asymmetric_signing`
- Response 200: `{ keys: Key[], total_count: number }`
- Tool: `scaleway_key_manager_list_keys` → `handleListKeys`

### Get Key
`GET /keys/{key_id}`
- Response 200: `Key`
- Tool: `scaleway_key_manager_get_key`

### Create Key
`POST /keys`
- Body: `{ project_id?, name?, usage?, description?, tags?, rotation_policy?, unprotected?, origin? }`
- `rotation_policy`: `{ rotation_period?: string (e.g. "720h", min 24h max 876000h), next_rotation_at?: RFC3339 }`
- `origin` enum: `unknown_origin`, `scaleway_kms`, `external`
- Response 200: `Key`
- Tool: `scaleway_key_manager_create_key`

### Update Key
`PATCH /keys/{key_id}`
- Body: `{ name?, description?, tags?, rotation_policy? }`
- Response 200: `Key`
- Tool: `scaleway_key_manager_update_key`

### Delete Key
`DELETE /keys/{key_id}`
- Response 204: empty. Irreversible; encrypted data becomes undecipherable.
- Tool: `scaleway_key_manager_delete_key`

### Rotate Key
`POST /keys/{key_id}/rotate`
- Response 200: `Key` (new material generated; prior versions kept for decryption; `rotation_count` increments)
- Tool: `scaleway_key_manager_rotate_key`

### Protect Key
`POST /keys/{key_id}/protect`
- Response 200: `Key` (`protected: true`; cannot be deleted while protected)
- Tool: `scaleway_key_manager_protect_key`

### Unprotect Key
`POST /keys/{key_id}/unprotect`
- Response 200: `Key` (`protected: false`)
- Tool: `scaleway_key_manager_unprotect_key`

### Enable Key
`POST /keys/{key_id}/enable`
- Response 200: `Key` (`state: enabled`)
- Tool: `scaleway_key_manager_enable_key`

### Disable Key
`POST /keys/{key_id}/disable`
- Response 200: `Key` (`state: disabled`)
- Tool: `scaleway_key_manager_disable_key`

## Cryptographic Operations

### Encrypt
`POST /keys/{key_id}/encrypt`
- Body: `{ plaintext: string (base64, max 65535 bytes), associated_data?: string }`
- Response 200: `{ key_id, ciphertext, plaintext? }`
- Tool: `scaleway_key_manager_encrypt`

### Decrypt
`POST /keys/{key_id}/decrypt`
- Body: `{ ciphertext: string (base64), associated_data?: string }`
- Response 200: `{ key_id, plaintext, ciphertext? }`
- Tool: `scaleway_key_manager_decrypt`

### Generate Data Key
`POST /keys/{key_id}/generate-data-key`
- Body: `{ algorithm?: DataKeyAlgorithmSymmetricEncryption, without_plaintext?: bool }`
- Response 200: `DataKey` — `{ key_id, algorithm, ciphertext, plaintext?, created_at }`
- Tool: `scaleway_key_manager_generate_data_key`

> Note: the SDK/API also exposes `sign`, `verify`, `import-key-material`, `delete-key-material`, `restore`,
> `public-key`, and `/algorithms`. These are NOT surfaced as MCP tools and are out of scope for this server.

## Models

### Key
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "name": "string",
  "usage": { "symmetric_encryption": "aes_256_gcm" },
  "state": "unknown_state | enabled | disabled | pending_key_material | scheduled_for_deletion",
  "rotation_count": 0,
  "created_at": "RFC3339",
  "updated_at": "RFC3339",
  "protected": true,
  "locked": false,
  "description": "string",
  "tags": ["string"],
  "rotation_policy": { "rotation_period": "720h", "next_rotation_at": "RFC3339" },
  "rotated_at": "RFC3339",
  "origin": "unknown_origin | scaleway_kms | external",
  "region": "fr-par"
}
```
(SDK/tool layer uses camelCase: `projectId`, `rotationCount`, `createdAt`, `updatedAt`, `rotationPolicy`,
`rotatedAt`, etc.)

### KeyUsage (one-of)
Exactly one of:
- `symmetric_encryption`: `unknown_symmetric_encryption` | `aes_256_gcm`
- `asymmetric_encryption`: `unknown_asymmetric_encryption` | `rsa_oaep_2048_sha256` | `rsa_oaep_3072_sha256` |
  `rsa_oaep_4096_sha256`
- `asymmetric_signing`: `unknown_asymmetric_signing` | `ec_p256_sha256` | `ec_p384_sha384` | `rsa_pss_2048_sha256` |
  `rsa_pss_3072_sha256` | `rsa_pss_4096_sha256` | `rsa_pkcs1_2048_sha256` | `rsa_pkcs1_3072_sha256` |
  `rsa_pkcs1_4096_sha256`

## Pagination
`List Keys` uses `page`/`page_size` and returns `total_count`. Normalized via `buildPaginatedResponse()`.

## Error Codes
- 400 Bad Request (invalid input / plaintext too large)
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found (unknown key id)
- 409 Conflict (e.g. delete a protected key)
- 429 Too Many Requests

## References
- Key Manager API: https://www.scaleway.com/en/developers/api/key-manager/
- SDK: `@scaleway/sdk-key-manager` v1alpha1 (`KeyManagerv1alpha1.API`)
