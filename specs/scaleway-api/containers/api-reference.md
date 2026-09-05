# Scaleway Serverless Containers v1 API Reference

Verified 2026-09-05 against the current official [OpenAPI](https://www.scaleway.com/en/developers/api/serverless-containers/v1/schema.yml), [API reference](https://www.scaleway.com/en/developers/api/serverless-containers/), and published `@scaleway/sdk-container@2.13.1` (`dist/v1/api.gen.js`, `types.gen.d.ts`, `marshalling.gen.js`). Downloaded reference files are inspection inputs, not runtime dependencies. This specification supersedes the previous deferred v1 migration and unsupported nested-path claims.

## Transport and common response contract

Base URL: `https://api.scaleway.com/containers/v1/regions/{region}`. SDK-relative paths start with `/containers/v1/regions/`. Supported regions: `fr-par`, `nl-ams`, `pl-waw`, `it-mil`; omission uses the configured default region. The real SDK receives `{method, path, urlParams?: URLSearchParams, body?: JSON.stringify(object), headers?}`; it supplies `X-Auth-Token`. JSON writes use `Content-Type: application/json`. GET/DELETE carry no body. SDK fetch resolves parsed JSON, not a Response; an empty/204 response is normalized to `{}`.

All documented resource operations below return a resource object (200); deletion normally returns its `deleting` state, not a client-fabricated success flag. Lists accept `page` (1-based) and `page_size` (1–100), return `{<resource_plural>: [...], total_count}`, and retain the MCP envelope `{items, totalCount, page, pageSize}`. Items and resource outputs use **native v1 snake_case fields**, not lossy legacy aliases.

HTTP errors preserve numeric SDK `.status`: 400 → invalid_input; 401/403 → permission_denied; 404 → not_found; 429 → rate_limited; 409 and other statuses → server_error with original status. Network/untyped failures → server_error/500. Locally unsupported parameter combinations return invalid_input/400 **before any request**.

## Namespaces

| Operation | Path relative to base | Query/body | Response |
|---|---|---|---|
| List | `GET /namespaces` | Query: page, page_size, name?, project_id?, organization_id? | namespaces + total_count |
| Get | `GET /namespaces/{namespace_id}` | None | Namespace |
| Create | `POST /namespaces` | name, project_id, description?, environment_variables?, secret_environment_variables? | Namespace |
| Update | `PATCH /namespaces/{namespace_id}` | description?, environment_variables?, secret_environment_variables? | Namespace |
| Delete | `DELETE /namespaces/{namespace_id}` | None | Namespace |

`projectId` falls back to the configured default project on create, matching official SDK marshalling. Both environment fields are string maps on the wire. Legacy `secretEnvironmentVariables: [{key,value}]` inputs are converted to a map; duplicate keys are rejected rather than silently discarded. An explicit empty array becomes `{}`; omitted fields stay omitted. Ordinary environment-map keys are never snake-cased. Native Namespace fields include id, name, description, project_id, organization_id, environment_variables, secret_environment_variables, tags, status, error_message, created_at, updated_at, region. Do not assume beta `pending` statuses or beta registry metadata.

## Containers

| Operation | Path relative to base | Query/body | Response |
|---|---|---|---|
| List | `GET /containers` | Query: page, page_size, namespace_id, name? | containers + total_count |
| Get | `GET /containers/{container_id}` | None | Container |
| Create | `POST /containers` | namespace_id, name, image; optional fields below | Container |
| Update | `PATCH /containers/{container_id}` | Only supplied mutable fields below | Container |
| Delete | `DELETE /containers/{container_id}` | None | Container |

Public parameters retain established names/units where translation is faithful:

| Tool parameter | v1 wire field/semantics |
|---|---|
| registryImage | image |
| memoryLimit | memory_limit_bytes = MiB × 1,048,576 (positive safe integer bytes) |
| cpuLimit | mvcpu_limit (unchanged numeric millicores/mvCPU; **not** micro-CPU) |
| minScale, maxScale | min_scale, max_scale |
| port, timeout, privacy, protocol, description | Unchanged; privacy public/private, protocol http1/h2c |
| environmentVariables | environment_variables (string map) |
| secretEnvironmentVariables | secret_environment_variables (array input converted to string map, duplicate keys rejected) |
| httpsConnectionsOnly | **Create: https_connections_only; PATCH: https_connection_only** (singular is the official v1 update schema) |
| httpOption: enabled | HTTPS-only false; cannot combine with httpsConnectionsOnly |
| httpOption: redirected | Rejected without I/O: v1 documents HTTPS-only enforcement, not HTTP redirection. Choose httpsConnectionsOnly explicitly, or implement redirect handling separately. |
| httpOption: doNotForce | Rejected without I/O: not an official beta enum and no faithful v1 mapping. Choose httpsConnectionsOnly explicitly. |

Optional fields are omitted, not replaced with presumed service defaults. In particular an empty PATCH is `{}` and false/zero/empty strings/maps are retained when valid. No memory_limit, cpu_limit, registry_image, or http_option reaches v1.

Native Container output fields include id, name, namespace_id, description, status, error_message, created_at, updated_at, environment_variables, secret_environment_variables, min_scale, max_scale, memory_limit_bytes, mvcpu_limit, local_storage_limit_bytes, timeout, privacy, image, protocol, port, **https_connections_only**, sandbox, scaling_option, liveness_probe, startup_probe, tags, private_network_id, command, args, **public_endpoint**, region. Consumers must migrate `domain_name` to `public_endpoint`, `registry_image` to `image`, `memory_limit` to `memory_limit_bytes` (divide by 1,048,576 for MiB), and `cpu_limit` to `mvcpu_limit`. Extra returned fields are preserved.

## Cron tools backed by v1 triggers

Public cron tool names stay unchanged; `cronId` is now a **v1 trigger ID**. Lists filter server-side with `trigger_type=cron`; other trigger types must not contaminate pagination.

| Tool operation | Path relative to base | Query/body | Response |
|---|---|---|---|
| list_crons | `GET /triggers` | page, page_size, container_id, trigger_type=cron | triggers + total_count |
| create_cron | `POST /triggers` | container_id, name, destination_config, cron_config | Trigger |
| update_cron | `PATCH /triggers/{trigger_id}` | name?, cron_config? | Trigger |
| delete_cron | `DELETE /triggers/{trigger_id}` | None | Trigger |

Create body is exactly:

```json
{
  "container_id": "<container UUID>",
  "name": "<provided name or generated cron-UUID>",
  "destination_config": {"http_path": "/", "http_method": "post"},
  "cron_config": {
    "schedule": "0 * * * *",
    "timezone": "UTC",
    "body": "{\"key\":\"value\"}",
    "headers": {"Content-Type": "application/json"}
  }
}
```

`args` is serialized once **inside** `cron_config.body` (which is a string), then the outer request is JSON-encoded. Omitted create args means `{}`. `timezone` is optional publicly; create defaults to UTC, matching historical cron scheduling. A supplied timezone is forwarded unchanged. V1 requires name; an omitted legacy name is generated with a UUID. PATCH only includes explicitly supplied name/schedule/timezone/args, emits cron_config only if a cron field is supplied, and does not reset destination or timezone on partial updates. Updating args also supplies the JSON Content-Type header. `containerId` on update is rejected without I/O because v1 cannot retarget an existing trigger; create a replacement explicitly, then delete the old trigger. No automatic delete/recreate occurs.

Native Trigger fields include id, name, description, tags, namespace_id, container_id, destination_config, source_type (`cron`), cron_config, status, error_message, created_at, updated_at, region. `cron_config.schedule`, `cron_config.timezone`, and string `cron_config.body` replace beta top-level schedule/args. No fabricated top-level aliases are returned.

## Domains

| Operation | Path relative to base | Query/body | Response |
|---|---|---|---|
| List | `GET /domains` | Query: page, page_size, container_id | domains + total_count |
| Create | `POST /domains` | container_id, hostname | Domain |
| Delete | `DELETE /domains/{domain_id}` | None | Domain |

Native Domain fields include id, hostname, container_id, namespace_id, status, error_message, created_at, updated_at, url, tags, region. Creation stays flat `/domains`, not a made-up nested resource route.

## Removed operations

The obsolete v1beta1 deploy and token operations are removed end-to-end, including registrations, handlers, parameter schemas, and parity entries. They are not compatibility stubs: they do not appear in MCP `tools/list`, and `tools/call` rejects their names as unknown tools without reading credentials or sending HTTP.

- `scaleway_containers_deploy_container`: v1 automatically deploys configuration on create/update; there is no staged `/deploy` endpoint. Remove the separate deploy step from workflows and use `scaleway_containers_create_container` or `scaleway_containers_update_container` only for the desired configuration change. No redeploy tool, alias, or substitute mutation is introduced.
- `scaleway_containers_create_token` and `scaleway_containers_delete_token`: the v1 API and official SDK have no container token resource or token creation/deletion endpoints. The previous beta token creation and revocation promises no longer apply. There is no invented `/tokens` replacement, fallback to retired beta endpoints, or automatic IAM credential creation/revocation. Review current private-container authentication/IAM migration guidance separately; old container-token IDs cannot be reused as IAM key IDs.
- Supported registrations: **17** (20 minus the three removed operations), covering 5 namespace, 5 container, 4 cron/trigger, and 3 domain tools. Every registration maps exactly once to a real v1 endpoint and contract case in `tests/parity-matrix.json#containers`. No `api: null` entries or unsupported registered stubs remain.
- The supported `scaleway_containers_update_cron` operation still rejects a supplied `containerId` locally as `unsupported_operation`/501 without authentication or HTTP. That parameter-level guard is retained; it does not remove the real trigger PATCH endpoint.

Contract tests: `tests/contract/containers/containers.contract.test.ts` use the actual installed SDK client with a fake HTTP transport to validate final URL, auth headers, body bytes, response decoding, pagination, and HTTP errors. No live cloud writes or credentials are used.
