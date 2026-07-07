# Research: Scaleway RabbitMQ (MessageQ) MCP Tools

**Feature**: 050-rabbitmq | **Date**: 2026-07-07

## Product identification

Scaleway markets this product as **"Cloud Essentials for RabbitMQ"**. Searching the
Scaleway Developers API catalog under Integration Services, "RabbitMQ" maps to the
**MessageQ** API.

- API slug: `messageq`
- Version: `v1alpha1` (product is in Beta)
- Base URL: `https://api.scaleway.com/messageq/v1alpha1/regions/{region}`
- Source of truth: the auto-generated Go SDK
  `scaleway/scaleway-sdk-go` at `api/messageq/v1alpha1/messageq_sdk.go`, cross-checked
  against https://www.scaleway.com/en/developers/api/messageq/

## Locality

**Region-scoped.** The SDK's `Regions()` returns only `scw.RegionFrPar`, i.e. the
product is currently available in `fr-par` (Paris) only. All tools accept a `region`
parameter validated by the shared `ScalewayRegion` schema; the region is embedded in
every path segment.

## Authentication

Standard Scaleway auth: `X-Auth-Token: <secret_key>` header, handled by the shared
`createScalewayClient` / `loadAuthConfig` infrastructure.

## Resources and endpoints (verified)

### Deployments (`/deployments`)
- `GET  /deployments` — list (query: organization_id, project_id, order_by, page, page_size, tags, name)
- `POST /deployments` — create (body: project_id, name, tags, node_count, node_type, user_name?, password?, volume?, endpoints[], version)
- `GET  /deployments/{deployment_id}` — get
- `PATCH /deployments/{deployment_id}` — update (body: name?, tags?)
- `POST /deployments/{deployment_id}/upgrade` — upgrade (body: exactly one of node_count | volume_size_bytes)
- `DELETE /deployments/{deployment_id}` — delete
- `GET  /deployments/{deployment_id}/certificate-authority` — download CA (returns a file)

### Users (`/deployments/{deployment_id}/users`)
- `GET  /deployments/{deployment_id}/users` — list (query: page, page_size, order_by, name)
- `POST /deployments/{deployment_id}/users` — create (body: username, password)
- `PATCH /deployments/{deployment_id}/users/{username}` — update (body: password?)
- `DELETE /deployments/{deployment_id}/users/{username}` — delete

Users are keyed by **username**, not a UUID. There is no get-single-user endpoint.

### Endpoints (`/endpoints`)
- `POST /endpoints` — create (body: deployment_id, endpoint_spec: { public: {} } | { private_network: { private_network_id } })
- `DELETE /endpoints/{endpoint_id}` — delete

Note: endpoint create/delete operate on a region-root `/endpoints` collection, **not**
nested under the deployment path. The deployment is referenced by `deployment_id` in the
body. There is no list-endpoints endpoint — endpoints are read from the deployment object.

### Catalog
- `GET /node-types` — list (query: order_by, page, page_size)
- `GET /versions` — list (query: order_by, page, page_size, version)

## Key design decisions

### Endpoint spec ergonomics
The wire format for an endpoint spec is a oneof: `{ public: {} }` or
`{ private_network: { private_network_id } }`. To keep tool inputs simple for LLM
callers, both `create_deployment.endpoints[]` and `create_endpoint` accept flat fields
(`is_public`, `private_network_id`); the handler maps them to the oneof wire shape. If a
`private_network_id` is supplied, a Private Network endpoint spec is emitted, otherwise a
public one.

### Upgrade oneof validation
`upgrade_deployment` requires **exactly one** of `node_count` or `volume_size_bytes`
(mirrors the SDK's "precisely one of" constraint). This is enforced with a Zod `.refine`.
Because `.refine` yields a `ZodEffects` (which has no `.shape`), the raw field shape is
exported separately (`UpgradeDeploymentShape`) for MCP tool registration while the refined
schema is used for parsing.

### Delete responses
- `delete_deployment` returns the deleted Deployment object (status transitions to `deleting`).
- `delete_user` and `delete_endpoint` return HTTP 204; handlers synthesize a
  `{ deleted: true, ... }` confirmation object for a useful tool response.

### Certificate authority
`GET .../certificate-authority` returns a file (`scw.File` in the SDK). The handler
returns the raw response body verbatim via `jsonResponse`.

## Vhosts note

The assignment brief listed "vhosts" among expected resources. The authoritative
`messageq` API and Go SDK expose **no** vhost, queue, exchange, or permission endpoints.
RabbitMQ vhosts are runtime constructs managed via the RabbitMQ Management API / AMQP
against a live deployment — outside the Scaleway control-plane API. Vhost management is
therefore intentionally out of scope (see spec.md "Out of Scope").

## Pagination

Standard Scaleway pagination: `page` (1-indexed) + `page_size`; responses carry
`total_count`. The shared `buildPaginatedResponse` helper standardizes output as
`{ items, totalCount, page, pageSize }`.

## Error handling

All handlers wrap requests in try/catch and map errors through the shared
`mapScalewayError` + `formatErrorResponse`, producing structured `{ error: { type,
message, statusCode } }` responses (400 invalid_input, 401/403 permission_denied,
404 not_found, 429 rate_limited, else server_error).
