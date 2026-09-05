# Scaleway Secret Manager API Reference

Official reference: https://www.scaleway.com/en/developers/api/secret-manager/

Base URL: `https://api.scaleway.com/secret-manager/v1beta1/regions/{region}`

Tools live in `src/tools/secret-manager/`. Secret Manager is implemented via the
`@scaleway/sdk-secret` package (`Secretv1beta1.API`), so the MCP handlers call SDK
methods rather than raw `client.fetch`. The endpoints below are the underlying REST
operations invoked by those SDK methods, verified against the official reference and
`node_modules/@scaleway/sdk-secret/dist/v1beta1/types.gen.d.ts`.

## Authentication
- Header: `X-Auth-Token: <secret_key>`

## Regions
- `fr-par`, `nl-ams`, `pl-waw`
- `region` is optional on every MCP tool; when omitted the SDK falls back to the
  default region from the client config.

## Pagination
- List endpoints accept `page` (int, 1-indexed) and `page_size` (int, max 100).
- List responses return `{ <items>: [...], total_count: number }`.
- The MCP layer normalizes results via `buildPaginatedResponse`.

## Secrets

### List Secrets — `scaleway_secret_manager_list_secrets`
`GET /secrets`
- Query: `organization_id`, `project_id`, `order_by`, `page`, `page_size`, `tags` (string[]),
  `name`, `path`, `ephemeral` (bool), `type`, `scheduled_for_deletion` (bool; handler forces `false`).
- Response: `{ secrets: Secret[], total_count: number }`

### Get Secret — `scaleway_secret_manager_get_secret`
`GET /secrets/{secret_id}`
- Response: Secret object

### Create Secret — `scaleway_secret_manager_create_secret`
`POST /secrets`
- Body: `{ project_id?, name, tags?, description?, type?, path?, ephemeral_policy?, protected, key_id? }`
  (MCP `isProtected` maps to the API `protected` field; defaults to `false`.)
- Response: Secret object

### Update Secret — `scaleway_secret_manager_update_secret`
`PATCH /secrets/{secret_id}`
- Body: `{ name?, tags?, description?, path?, ephemeral_policy? }`
- Response: Secret object

### Delete Secret — `scaleway_secret_manager_delete_secret`
`DELETE /secrets/{secret_id}`
- Response: empty (204). Handler returns `{ success: true, secretId }`.

### Protect Secret — `scaleway_secret_manager_protect_secret`
`POST /secrets/{secret_id}/protect`
- Response: Secret object (`protected: true`)

### Unprotect Secret — `scaleway_secret_manager_unprotect_secret`
`POST /secrets/{secret_id}/unprotect`
- Response: Secret object (`protected: false`)

### Add Secret Owner — `scaleway_secret_manager_add_secret_owner`
`POST /secrets/{secret_id}/add-owner`
- Body: `{ product? }` (`edge_services`, `s2s_vpn`, `unknown_product`)
- Response: empty (204). Handler returns `{ success: true, secretId }`.

## Secret Versions

### List Secret Versions — `scaleway_secret_manager_list_secret_versions`
`GET /secrets/{secret_id}/versions`
- Query: `page`, `page_size`, `status` (SecretVersionStatus[])
- Response: `{ versions: SecretVersion[], total_count: number }`

### Get Secret Version — `scaleway_secret_manager_get_secret_version`
`GET /secrets/{secret_id}/versions/{revision}`
- `revision`: a decimal version number as a string, `"latest"`, or `"latest_enabled"`. Revision values must match `^(?:[0-9]+|latest|latest_enabled)$`; slashes, query/fragment delimiters and encoded path characters are rejected before dispatch so metadata reads cannot reach the access endpoint.
- Response: SecretVersion object

### Create Secret Version — `scaleway_secret_manager_create_secret_version`
`POST /secrets/{secret_id}/versions`
- Body: `{ data (base64), description?, disable_previous?, data_crc32? }`
- Response: SecretVersion object

### Access Secret Version — `scaleway_secret_manager_access_secret_version`
`GET /secrets/{secret_id}/versions/{revision}/access`
- Response: `{ secret_id, revision, data (base64), data_crc32?, type }`

### Disable Secret Version — `scaleway_secret_manager_disable_secret_version`
`POST /secrets/{secret_id}/versions/{revision}/disable`
- Response: SecretVersion object (`status: disabled`)

### Enable Secret Version — `scaleway_secret_manager_enable_secret_version`
`POST /secrets/{secret_id}/versions/{revision}/enable`
- Response: SecretVersion object (`status: enabled`)

### Destroy Secret Version — `scaleway_secret_manager_destroy_secret_version`
`DELETE /secrets/{secret_id}/versions/{revision}`
- Response: empty (204). Handler returns `{ success: true, secretId, revision }`.

## Tags

### List Tags — `scaleway_secret_manager_list_tags`
`GET /tags`
- Query: `project_id`, `page`, `page_size`
- Response: `{ tags: string[], total_count: number }`

## Entities

### Secret entity
```
{
  id: string,
  project_id: string,
  name: string,
  status: SecretStatus,               // unknown_status | ready | locked
  created_at?: string,                // RFC3339
  updated_at?: string,
  tags: string[],
  version_count: number,
  description?: string,
  managed: boolean,
  protected: boolean,
  type: SecretType,                   // unknown_type | opaque | certificate | key_value |
                                      //   basic_credentials | database_credentials | ssh_key
  path: string,
  ephemeral_policy?: EphemeralPolicy,
  used_by: Product[],                 // unknown_product | edge_services | s2s_vpn
  deletion_requested_at?: string,
  key_id?: string,
  region: string
}
```

### SecretVersion entity
```
{
  revision: number,
  secret_id: string,
  status: SecretVersionStatus,        // unknown_status | enabled | disabled |
                                      //   deleted | scheduled_for_deletion
  created_at?: string,
  updated_at?: string,
  deleted_at?: string,
  description?: string,
  latest: boolean,
  ephemeral_properties?: EphemeralProperties,
  deletion_requested_at?: string,
  region: string
}
```

### EphemeralPolicy
```
{ time_to_live?: string, expires_once_accessed?: boolean, action: EphemeralPolicyAction }
// EphemeralPolicyAction: unknown_action | delete | disable
```

## Error codes
Standard Scaleway REST errors, normalized by `mapScalewayError`:
- `400` invalid_arguments — malformed request/validation failure
- `401` / `403` permission_denied — missing/invalid `X-Auth-Token`
- `404` not_found — unknown secret / version / revision
- `409` conflict — e.g. deleting a protected secret
- `429` too_many_requests — rate limited
- `500` internal_server_error
