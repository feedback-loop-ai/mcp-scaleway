# Scaleway Managed Database for Redis™ API Reference

Official base URL: `https://api.scaleway.com/redis/v1/zones/{zone}`

Zones: `fr-par-1`, `fr-par-2`, `nl-ams-1`, `pl-waw-1`, ...

Official reference: https://www.scaleway.com/en/developers/api/managed-database-redis/

> **Location model:** the Scaleway Redis API is **zonal**. The MCP tools accept a
> `zone` parameter (e.g. `fr-par-1`), defaulting to `SCW_DEFAULT_ZONE` or `fr-par-1`,
> and build paths as `redis/v1/zones/{zone}/...`. Verified against
> [`scaleway-sdk-go` `api/redis/v1`](https://github.com/scaleway/scaleway-sdk-go/blob/master/api/redis/v1/redis_sdk.go),
> whose request paths are all `/redis/v1/zones/{zone}/...` and whose `Cluster` object
> carries a `zone` field.

## Authentication

- Header: `X-Auth-Token: <secret_key>`

## Pagination

List operations accept `page` (int, 1-based) and `page_size` (int, max 100) and
return `{ <collection>: T[], total_count: number }`.

## Clusters

### List Clusters
`GET /clusters`
- Query: `page`, `page_size`, `project_id`, `organization_id`, `name`, `order_by`
  (`created_at_asc|created_at_desc|name_asc|name_desc`), `tags` (repeatable)
- Response: `{ clusters: Cluster[], total_count: number }`

### Get Cluster
`GET /clusters/{cluster_id}`
- Response: Cluster object
- Cluster: `{ id, name, version, status, zone, project_id, node_type,
  cluster_size, endpoints[], acl_rules[], tags[], tls_enabled, cluster_settings[],
  created_at, updated_at?, user_name }`

### Create Cluster
`POST /clusters`
- Body: `{ project_id, name, version, node_type, cluster_size, user_name, password,
  tags?, tls_enabled?, cluster_settings?, acl_rules?, endpoints? }`
- Response: Cluster object (status: `provisioning`)

### Update Cluster
`PATCH /clusters/{cluster_id}`
- Body: `{ name?, tags?, user_name?, password? }`
- Response: Cluster object

### Delete Cluster
`DELETE /clusters/{cluster_id}`
- Response: Cluster object (status: `deleting`)

## Metrics & Certificate

### Get Cluster Metrics
`GET /clusters/{cluster_id}/metrics`
- Query: `start_at`, `end_at`, `metric_name`
- Response: `{ timeseries: [{ name, points: [{ timestamp, value }] }] }`

### Get Cluster Certificate
`GET /clusters/{cluster_id}/certificate`
- Response: TLS certificate (PEM content)

### Renew Cluster Certificate
`POST /clusters/{cluster_id}/renew-certificate`
- Body: `{}`
- Response: Cluster / certificate object

## ACL Rules

- ACLRule (response): `{ id, ip_cidr, description }`
- ACLRuleSpec (input): `{ ip_cidr, description }`

### Add ACL Rules
`POST /clusters/{cluster_id}/acls`
- Body: `{ acl_rules: ACLRuleSpec[] }`
- Response: `{ acl_rules: ACLRule[] }`

### Set ACL Rules (replace all)
`PUT /clusters/{cluster_id}/acls`
- Body: `{ acl_rules: ACLRuleSpec[] }`
- Response: `{ acl_rules: ACLRule[] }`

### Delete ACL Rule
`DELETE /acls/{acl_id}`
- Deletes a single ACL rule by its ID (no cluster_id, no body). Verified against
  `scaleway-sdk-go` `DeleteACLRule` (`DELETE /redis/v1/zones/{zone}/acls/{acl_id}`).
- Response: Cluster object

## Endpoints

- Endpoint (response): `{ id, ips: string[], port }`
- EndpointSpec (input): `{ private_network?: { id, service_ips: string[] },
  public?: {} }`

### Add Endpoints
`POST /clusters/{cluster_id}/endpoints`
- Body: `{ endpoints: EndpointSpec[] }`
- Response: Cluster / endpoints object

### Delete Endpoint
`DELETE /endpoints/{endpoint_id}`
- Deletes a single endpoint by its ID (no cluster_id, no body). Verified against
  `scaleway-sdk-go` `DeleteEndpoint` (`DELETE /redis/v1/zones/{zone}/endpoints/{endpoint_id}`).
- Response: empty

### Set Endpoints (replace all)
`PUT /clusters/{cluster_id}/endpoints`
- Body: `{ endpoints: EndpointSpec[] }`
- Response: Cluster / endpoints object

## Reference Data

### List Node Types
`GET /node-types`
- Query: `page`, `page_size`, `include_disabled_types`
- Response: `{ node_types: NodeType[], total_count: number }`
- NodeType: `{ name, description, memory, available_cluster_sizes: number[],
  disabled, beta }`

### List Cluster Versions
`GET /cluster-versions`
- Query: `page`, `page_size`, `include_disabled`, `include_beta`,
  `include_deprecated`, `version`
- Response: `{ versions: Version[], total_count: number }`
- Version: `{ version, available_settings[], end_of_life_at?, logo_url? }`

## Enums

- **Cluster status**: unknown, ready, provisioning, configuring, deleting, error,
  autohealing, locked, suspended, initializing

## Error Codes

- 400: Invalid input
- 401: Missing/invalid auth token
- 403: Permission denied
- 404: Not found
- 409: Conflict
- 429: Too many requests
- 500: Internal server error
