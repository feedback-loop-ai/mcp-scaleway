# Scaleway Serverless Containers API Reference

Base URL: `https://api.scaleway.com/containers/v1beta1/regions/{region}`

Official docs: https://www.scaleway.com/en/developers/api/serverless-containers/

> Implementation note: the MCP tools target API version `v1beta1` and use the
> flat resource paths exposed by the Scaleway SDK (e.g. `POST /containers` with
> `namespace_id` in the body). The public documentation page currently renders
> the newer `v1` surface with nested paths (e.g. `POST /namespaces/{id}/containers`)
> and labels cron triggers as "triggers". See "Deviations" at the bottom.

## Authentication

- Header: `X-Auth-Token: <secret_key>`
- Region is part of the path. Defaults to the account default region when omitted.

## Pagination

List endpoints accept `page` (1-indexed) and `page_size` (1-100). Responses
include `total_count`. The MCP layer normalizes these into
`{ items, totalCount, page, pageSize }` via `buildPaginatedResponse`.

## Regions

`fr-par`, `nl-ams`, `pl-waw`.

## Namespaces

### List Namespaces
`GET /namespaces`
- Query: `page`, `page_size`, `name`, `project_id`, `organization_id`
- Response: `{ namespaces: Namespace[], total_count: number }`

### Get Namespace
`GET /namespaces/{namespace_id}`
- Response: `Namespace`

### Create Namespace
`POST /namespaces`
- Body: `{ name, project_id?, description?, environment_variables?, secret_environment_variables? }`
- `secret_environment_variables`: `{ key, value }[]` (write-only)
- Response: `Namespace` (status: `pending`)

### Update Namespace
`PATCH /namespaces/{namespace_id}`
- Body: `{ description?, environment_variables?, secret_environment_variables? }`
- Response: `Namespace`

### Delete Namespace
`DELETE /namespaces/{namespace_id}`
- Response: `Namespace` (status: `deleting`)

## Containers

### List Containers
`GET /containers`
- Query: `page`, `page_size`, `namespace_id` (required), `name`
- Response: `{ containers: Container[], total_count: number }`

### Get Container
`GET /containers/{container_id}`
- Response: `Container`

### Create Container
`POST /containers`
- Body: `{ namespace_id, name, registry_image, port?, min_scale?, max_scale?, memory_limit?, cpu_limit?, timeout?, privacy?, protocol?, http_option?, description?, environment_variables?, secret_environment_variables? }`
- `privacy`: `public | private`
- `protocol`: `http1 | h2c`
- `http_option`: `enabled | redirected | doNotForce`
- Response: `Container` (status: `created`)

### Update Container
`PATCH /containers/{container_id}`
- Body: same optional fields as create (excluding `namespace_id`/`name`)
- Response: `Container`

### Delete Container
`DELETE /containers/{container_id}`
- Response: `Container` (status: `deleting`)

### Deploy Container
`POST /containers/{container_id}/deploy`
- Body: `{}`
- Response: `Container` (status: `pending`)

## Crons

### List Crons
`GET /crons`
- Query: `page`, `page_size`, `container_id` (required)
- Response: `{ crons: Cron[], total_count: number }`

### Create Cron
`POST /crons`
- Body: `{ container_id, schedule, args?, name? }`
- `schedule`: cron expression (e.g. `0 * * * *`)
- `args`: arbitrary JSON passed to the container
- Response: `Cron`

### Update Cron
`PATCH /crons/{cron_id}`
- Body: `{ container_id?, schedule?, args?, name? }`
- Response: `Cron`

### Delete Cron
`DELETE /crons/{cron_id}`
- Response: `Cron` (status: `deleting`)

## Domains

### List Domains
`GET /domains`
- Query: `page`, `page_size`, `container_id` (required)
- Response: `{ domains: Domain[], total_count: number }`

### Create Domain
`POST /domains`
- Body: `{ container_id, hostname }`
- Response: `Domain`

### Delete Domain
`DELETE /domains/{domain_id}`
- Response: `Domain` (status: `deleting`)

## Tokens

### Create Token
`POST /tokens`
- Body: `{ container_id?, namespace_id?, description?, expires_at? }` (provide either
  `container_id` or `namespace_id`)
- `expires_at`: ISO 8601 datetime
- Response: `Token` (includes the plaintext `token` only on creation)

### Delete Token
`DELETE /tokens/{token_id}`
- Response: `Token` (status: `deleting`)

## Error Codes

- 400: Invalid input
- 401 / 403: Permission denied (403 also returned when calling a `private`
  container without authentication)
- 404: Not found
- 409: Conflict (e.g. duplicate namespace name)
- 429: Rate limited
- 500: Server error

## Deviations (implementation vs. public docs)

The implementation follows the Scaleway SDK convention. The public API reference
page currently documents a different surface for some operations:

| Operation | Implementation | Public docs page |
|-----------|----------------|------------------|
| API version | `v1beta1` | `v1` |
| Create Container | `POST /containers` (`namespace_id` in body) | `POST /namespaces/{namespace_id}/containers` |
| Create Domain | `POST /domains` (`container_id` in body) | `POST /containers/{container_id}/domains` |
| Cron resource | `/crons` | rendered as `/triggers` |

Both the flat (SDK) and nested (doc) forms are accepted by the Scaleway API for
these operations.
