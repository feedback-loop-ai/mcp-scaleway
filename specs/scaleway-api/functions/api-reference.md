# Scaleway Serverless Functions API Reference

Base URL: `https://api.scaleway.com/functions/v1beta1/regions/{region}`

Official docs: https://www.scaleway.com/en/developers/api/serverless-functions/

## Authentication

- Header: `X-Auth-Token: <secret_key>`
- Region is part of the path.

## Pagination

List endpoints accept `page` (1-indexed) and `page_size` (1-100, default 20).
Responses include `total_count`. The MCP tools pass `page`/`page_size` through
and return the raw Scaleway envelope (`{ <collection>, total_count }`).

## Regions

`fr-par`, `nl-ams`, `pl-waw`.

## Namespaces

### List Namespaces
`GET /namespaces`
- Query: `page`, `page_size`, `project_id`, `name`, `order_by`
- Response: `{ namespaces: Namespace[], total_count: number }`

### Get Namespace
`GET /namespaces/{namespace_id}`
- Response: `Namespace`

### Create Namespace
`POST /namespaces`
- Body: `{ name, project_id?, description?, environment_variables?, secret_environment_variables? }`
- `secret_environment_variables`: `{ key, value }[]` (`value` is write-only, `null` in reads)
- Response: `Namespace`

### Update Namespace
`PATCH /namespaces/{namespace_id}`
- Body: `{ description?, environment_variables?, secret_environment_variables? }`
- Response: `Namespace`

### Delete Namespace
`DELETE /namespaces/{namespace_id}`
- Response: `Namespace` (status: `deleting`)

## Functions

### List Functions
`GET /functions`
- Query: `namespace_id` (required), `page`, `page_size`, `name`, `order_by`, `project_id`
- Response: `{ functions: Function[], total_count: number }`

### Get Function
`GET /functions/{function_id}`
- Response: `Function`

### Create Function
`POST /functions`
- Body: `{ namespace_id, name, runtime, handler, privacy, memory_limit?, timeout?, min_scale?, max_scale?, description?, environment_variables?, secret_environment_variables?, http_option? }`
- `runtime`: e.g. `node22`, `python312`, `go123`
- `privacy`: `public | private`
- `memory_limit`: MB (128-4096)
- `http_option`: `enabled | redirected`
- Response: `Function` (status: `created`)

### Update Function
`PATCH /functions/{function_id}`
- Body: same optional fields as create (excluding `namespace_id`/`name`)
- Response: `Function`

### Delete Function
`DELETE /functions/{function_id}`
- Response: `Function` (status: `deleting`)

### Deploy Function
`POST /functions/{function_id}/deploy`
- Body: `{}`
- Response: `Function` (status: `pending`)

## Crons

### List Crons
`GET /crons`
- Query: `function_id` (required), `page`, `page_size`, `order_by`
- Response: `{ crons: Cron[], total_count: number }`

### Create Cron
`POST /crons`
- Body: `{ function_id, schedule, name?, args? }`
- Response: `Cron`

### Update Cron
`PATCH /crons/{cron_id}`
- Body: `{ schedule?, name?, args?, function_id? }`
- Response: `Cron`

### Delete Cron
`DELETE /crons/{cron_id}`
- Response: `Cron` (status: `deleting`)

## Domains

### List Domains
`GET /domains`
- Query: `function_id` (required), `page`, `page_size`, `order_by`
- Response: `{ domains: Domain[], total_count: number }`

### Create Domain
`POST /domains`
- Body: `{ function_id, hostname }`
- Response: `Domain`

### Delete Domain
`DELETE /domains/{domain_id}`
- Response: `Domain` (status: `deleting`)

## Tokens

### Create Token
`POST /tokens`
- Body: `{ function_id, description?, expires_at? }`
- `expires_at`: ISO 8601 datetime
- Response: `Token` (plaintext `token` returned only on creation)

### Delete Token
`DELETE /tokens/{token_id}`
- Response: `Token` (status: `deleting`)

## Error Codes

- 400: Invalid input
- 401 / 403: Permission denied (403 also returned when calling a `private`
  function without authentication)
- 404: Not found
- 409: Conflict (e.g. duplicate namespace name)
- 429: Rate limited
- 500: Server error

## Notes

The public docs additionally expose `GET /functions/{id}/download-url`,
`GET /functions/{id}/upload-url`, `GET /functions/runtimes`, and `GET` variants
for crons/domains/tokens. These are not surfaced as MCP tools and are therefore
out of scope for this reference. All request paths used by the MCP tools match
the documented method + path exactly (flat `/crons`, `/domains`, `/tokens`).
