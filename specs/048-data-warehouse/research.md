# Research: Data Warehouse for ClickHouse®

## Source discovery
- Product listing (https://www.scaleway.com/en/developers/api/) lists a single
  "Data Warehouse" product under Data & Analytics.
- Docs confirm it is **Data Warehouse for ClickHouse®**.
- Reference page: https://www.scaleway.com/en/developers/api/data-warehouse/
- **Machine-readable OpenAPI** (source of truth used for all shapes):
  https://www.scaleway.com/en/developers/api/data-warehouse/v1beta1/schema.yml

## Decisions
- **API slug / version**: `datawarehouse` / `v1beta1`. Path prefix
  `datawarehouse/v1beta1/regions/{region}` — mirrors the NATS/inference pattern.
- **Scope**: region-scoped. The OpenAPI `region` path param enum is `[fr-par]`
  only. We keep the shared `ScalewayRegion` string schema for consistency with
  every other tool area and forward compatibility with future regions.
- **Resources implemented**: deployments, databases, users, endpoints, presets,
  versions — the complete set of the reference.
- **Sub-resource key style**: databases and users are addressed by **name** in
  the path (not a UUID); endpoints by `endpoint_id`. Deployment sub-actions
  (`start`, `stop`) require an empty JSON body `{}`; `DeleteUser` also requires an
  empty JSON body per the schema, so we send one.
- **Endpoint spec is a one-of** (`public` vs `private_network`). Modeled with an
  optional `privateNetworkId`: when present a private endpoint is requested,
  otherwise a public endpoint. Applied both to `CreateEndpoint` and to the
  `endpoints[]` array on `CreateDeployment`.
- **DELETE deployment returns the Deployment object** (status `deleting`), so the
  handler surfaces the response instead of a synthesized confirmation. Database,
  user, and endpoint deletes return 204, so those handlers return a synthesized
  `{ deleted: true, ... }` confirmation.
- **move_factor**: a `double` in [0,1] controlling tiered-storage hot→cold data
  movement. Validated with `.min(0).max(1)`.

## Rejected / non-existent endpoints
- No get/update for a single database or endpoint (not in reference).
- No metrics, logs, backups, ACLs (not in reference) — deliberately excluded.

## Ambiguities resolved
- The rendered HTML docs summarized the certificate path as `/tls-certificate`
  and databases/users keyed by `-id`; the OpenAPI schema shows the real paths
  are `/certificate` and name-keyed. The OpenAPI schema was treated as
  authoritative.
