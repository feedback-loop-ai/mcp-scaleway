# Scaleway Instance Autoscaling Groups API Reference

- API slug: `autoscaling`
- Version: `v1alpha2` (**`v1alpha1` is dead**: every `v1alpha1` path now returns
  `404 {"message":"Not Found"}` — see "Migration from v1alpha1" below)
- Status: Public Beta since 2026-08-25
- Scope: **zoned** (path segment `zones/{zone}`)
- Availability: Paris, Amsterdam and Warsaw per the 2026-08-25 changelog. The generated schema still lists Paris only; consult live availability before provisioning.
- Base URL: `https://api.scaleway.com/autoscaling/v1alpha2/zones/{zone}`
- Sources:
  - https://www.scaleway.com/en/developers/api/autoscaling/ (OpenAPI 3.1 schema at
    `https://www.scaleway.com/en/developers/api/autoscaling/v1alpha2/schema.yml`)
  - Official JS SDK `@scaleway/sdk-autoscaling@2.11.1`, `dist/v1alpha2/{api,types,marshalling}.gen.*`
  - Instance templates: https://www.scaleway.com/en/developers/api/instance/v2alpha1/ and
    `@scaleway/sdk-instance@2.16.0`, `dist/v2alpha1/*` (see "Instance Templates" below)

Instance Autoscaling Groups dynamically adjust their number of Instances based on a
scaling policy (fixed size, CPU target, or memory target) evaluated against Cockpit
metrics. An optional Load Balancer configuration keeps backend server lists in sync and
can auto-heal unhealthy Instances. New Instances are created from an **Instance template**
managed by the **Instance API v2alpha1** (not by this API).

## Authentication
- Header: `X-Auth-Token: <secret_key>`
- Requests with a JSON body must send `Content-Type: application/json`.

## Pagination
- List endpoints use **token pagination**: query `page_size` (uint32, 1-100) and
  `page_token` (string).
- List responses return the resource array, `next_page_token` (string, nullable — absent
  or null on the last page) and `total_count` (uint32).
- There is no `page` parameter (unlike v1alpha1).

## Autoscaling Groups

### List Groups
`GET /groups`
- Query:
  - `project_id` (string, **required** by the API — this server defaults it to
    `SCW_DEFAULT_PROJECT_ID` when omitted)
  - `order_by` (enum: `created_at_desc` (default), `created_at_asc`)
  - `template_id` (string, filter by Instance template)
  - `load_balancer_id` (string, filter by Load Balancer)
  - `page_size` (uint32), `page_token` (string)
- Response: `{ group_summaries: GroupSummary[], next_page_token?: string|null, total_count: number }`

### Get Group
`GET /groups/{group_id}`
- Response: `Group`

### Create Group
`POST /groups`
- Body: `{ project_id?, name, tags?, template_id, scaling_policy_spec?, load_balancer_configuration_spec? }`
  - `project_id` defaults to `SCW_DEFAULT_PROJECT_ID` when omitted (this server).
  - `template_id` is an **Instance API v2alpha1 template ID**.
- Response: `Group`

### Update Group
`PATCH /groups/{group_id}`
- Body: `{ name?, tags?, template_id?, scaling_policy_spec?, load_balancer_configuration_spec? }`
  (all fields nullable/optional; only provided fields are changed)
- Response: `Group`

### Delete Group
`DELETE /groups/{group_id}`
- Deletes the group and all its associated resources (managed Instances, volumes, IPs).
- Response: **`200` with the `Group`** in its `deleting` status (NOT `204`).

## Group Logs

### List Logs
`GET /logs`
- Query:
  - `group_id` (string, **required**)
  - `start_time`, `end_time` (RFC 3339 timestamps)
  - `page_size` (uint32), `page_token` (string)
- Response: `{ logs: Log[], next_page_token?: string|null, total_count: number }`
- Replaces the v1alpha1 `GET /instance-groups/{id}/events` operation.

## Group Servers

### List Servers
`GET /servers`
- Query:
  - `group_id` (string, **required**)
  - `page_size` (uint32), `page_token` (string)
- Response: `{ servers: Server[], next_page_token?: string|null, total_count: number }`
- Lists the Instances currently managed by the group (`server_id` values are Instance IDs).

## Alerts

### List Alerts
`GET /alerts`
- Query:
  - one-of scope: `group_id` (string) **or** `project_id` (string). The official SDK sends
    `group_id` when given, otherwise `project_id` (defaulting to the configured project).
    This server mirrors that behaviour and defaults `project_id` to `SCW_DEFAULT_PROJECT_ID`.
  - `page_size` (uint32), `page_token` (string)
- Response: `{ alerts: Alert[], next_page_token?: string|null, total_count: number }`
- Lists active and historical alerts (quota exceeded, out of stock, invalid template, LB /
  backend not found or permission denied). Replaces the v1alpha1 `error_messages` field.

## Instance Templates (Instance API v2alpha1)

Templates are **not** part of the autoscaling API in v1alpha2. They are managed by the
Instance API `v2alpha1` and referenced from a group by `template_id`. Because a group cannot
be created without one, this server keeps its `scaleway_autoscaling_*_instance_template*`
tools and points them at the Instance API endpoints below.

- Base URL: `https://api.scaleway.com/instance/v2alpha1/zones/{zone}`
- Zones: `fr-par-1`, `fr-par-2`, `fr-par-3`, `nl-ams-1`, `nl-ams-2`, `nl-ams-3`, `pl-waw-1`,
  `pl-waw-2`, `pl-waw-3`, `it-mil-1`
- Pagination: `page_size` / `page_token` (token pagination, as above)

### List Templates
`GET /templates`
- Query: `project_id` (**required**, defaulted by this server), `order_by` (enum:
  `created_at_desc` (default), `created_at_asc`, `updated_at_desc`, `updated_at_asc`),
  `template_ids[]`, `name`, `tags[]`, `server_tags[]`, `security_group_ids[]`,
  `placement_group_ids[]`, `page_size`, `page_token`
- Response: `{ templates: TemplateSummary[], next_page_token?: string|null, total_count: number }`

### Get Template
`GET /templates/{template_id}`
- Response: `Template`

### Create Template
`POST /templates`
- Body: `{ project_id?, name, tags?, server_tags?, server_type, security_group_id?,
  placement_group_id?, volumes?: VolumeTemplate[], private_networks?: PrivateNetworkTemplate[],
  filesystem_ids?, public_ip_v4_count?, public_ip_v6_count?, windows_rdp_ssh_key_id? }`
- Response: `Template`

### Update Template
`PATCH /templates/{template_id}`
- Body: `{ name?, tags?, server_tags?, server_type?, security_group_id?, placement_group_id?,
  update_volumes?: { volumes: VolumeTemplate[] },
  update_private_networks?: { private_networks: PrivateNetworkTemplate[] },
  filesystem_ids?, public_ip_v4_count?, public_ip_v6_count?, windows_rdp_ssh_key_id? }`
- Response: `Template`
- Changes are not replicated to Instances already created from the template.

### Delete Template
`DELETE /templates/{template_id}`
- Body: `{}` (the endpoint declares a required, empty JSON body)
- Response: empty (`204`)

### Get Template Cloud-Init
`GET /templates/{template_id}/user-data/cloud-init`
- Response: `UserData` (`{ key: "cloud-init", content: string }`)

### Set Template Cloud-Init
`PUT /templates/{template_id}/user-data/cloud-init`
- Body: `{ content: string }` (cloud-init configuration content)
- Response: empty (`204`)
- Replaces the inline `cloud_init` field of v1alpha1 templates.

## Schemas

### Group
- `id` (string, UUID)
- `project_id` (string, UUID)
- `name` (string)
- `tags` (string[])
- `created_at` (string, RFC 3339, nullable)
- `updated_at` (string, RFC 3339, nullable)
- `status` (enum `GroupStatus`: `unknown_group_status`, `active`, `scaling_out`,
  `scaling_in`, `refreshing`, `healing`, `scaling_failure`, `deleting`)
- `open_alerts` (Alert[])
- `current_size` (uint32)
- `target_size` (uint32)
- `last_scale_out_at` (string, RFC 3339, nullable)
- `last_scale_in_at` (string, RFC 3339, nullable)
- `template_id` (string, UUID — Instance API v2alpha1 template)
- `scaling_policy` (GroupScalingPolicy, nullable)
- `load_balancer_configuration` (GroupLoadBalancerConfiguration, nullable)

### GroupSummary (list item)
- `project_id`, `id`, `name`, `tags`, `status`, `created_at`, `updated_at`, `template_id`
  as in `Group`
- `load_balancer_id` (string, nullable)
- `current_size` (uint32)
- `latest_open_alert` (Alert, nullable)
- `minimum_size` (uint32)
- `maximum_size` (uint32)
- `scaling_policy_target_type` (enum: `unknown_scaling_policy_target_type`, `fixed_size`,
  `cpu_target`, `memory_target`)
- `zone` (string)

### ScalingPolicySpec (request)
- `minimum_size` (uint32, nullable)
- `maximum_size` (uint32, nullable)
- `scale_out_cooldown` (string duration, e.g. `"300s"`, nullable)
- `scale_in_cooldown` (string duration, nullable)
- `scale_in_step` (uint32, nullable)
- `scale_out_step` (uint32, nullable)
- one-of `target` (at most one):
  - `fixed_size` (`{ size: uint32 }`)
  - `cpu_target` (`{ target_avg_percent: number 0-100 }`)
  - `memory_target` (`{ target_avg_percent: number 0-100 }`)

### GroupScalingPolicy (response)
- Same fields as `ScalingPolicySpec`; `minimum_size`, `maximum_size`, `scale_in_step`,
  `scale_out_step` are always present; cooldowns nullable; the one-of target members are
  nullable.

### LoadBalancerConfigurationSpec (request)
- `load_balancer_id` (string, UUID; set to empty to disable)
- `backends` (Backend[]) where Backend = `{ backend_id: string, address_family: enum
  (`unknown_address_family`, `ipv4`, `ipv6`), private_network_id?: string }`
- `auto_healing` (`{ enabled?: boolean, grace_period?: string duration }`, optional)

### GroupLoadBalancerConfiguration (response)
- `load_balancer_id` (string)
- `backends` (Backend[], `private_network_id` nullable)
- `auto_healing` (`{ enabled: boolean, grace_period: string|null }`, nullable)

### Alert
- `type` (enum `AlertType`: `unknown_alert_type`, `quotas_exceeded`, `out_of_stock`,
  `invalid_template`, `template_not_found`, `invalid_instance`,
  `template_permissions_denied`, `load_balancer_not_found`,
  `load_balancer_permissions_denied`, `backend_not_found`, `backend_permissions_denied`)
- `opened_at` (string, RFC 3339, nullable)
- `closed_at` (string, RFC 3339, nullable — null while the alert is open)
- `group_id` (string, UUID)
- `failing_quotas` (string[] — only populated for `quotas_exceeded`)

### Log
- `timestamp` (string, RFC 3339, nullable)
- `level` (enum `LogLevel`: `unknown_log_level`, `info`, `warning`, `error`)
- `message` (string)

### Server
- `server_id` (string, UUID of the Instance)

### Template (Instance API v2alpha1)
- `project_id` (string, UUID)
- `id` (string, UUID)
- `name` (string)
- `tags` (string[])
- `server_tags` (string[] — applied to Instances created from the template)
- `server_type` (string, commercial type e.g. `PLAY2-NANO`)
- `security_group_id` (string, nullable)
- `placement_group_id` (string, nullable)
- `public_ip_v4_count` (uint32)
- `public_ip_v6_count` (uint32)
- `volumes` (VolumeTemplate[])
- `private_networks` (PrivateNetworkTemplate[])
- `filesystem_ids` (string[])
- `created_at` (string, RFC 3339, nullable)
- `updated_at` (string, RFC 3339, nullable)
- `windows_rdp_ssh_key_id` (string, nullable)
- `zone` (string)

### TemplateSummary (list item)
- `Template` without `volumes`, `private_networks` and `windows_rdp_ssh_key_id`.

### VolumeTemplate
- `volume_type` (enum: `unknown_volume_type`, `l_ssd`, `sbs`, `scratch`)
- `name` (string)
- `tags` (string[])
- `size` (uint64 bytes, nullable)
- one-of `from` (at most one): `base_snapshot_id` (string) | `image_label` (string, e.g.
  `ubuntu_noble`)
- `perf_iops` (uint32, nullable)

### PrivateNetworkTemplate
- `private_network_id` (string, UUID)

### UserData
- `key` (string)
- `content` (string)

## Error Codes
- 400: Invalid input (`invalid_arguments`)
- 401: Authentication denied (`denied_authentication`)
- 403: Permission denied
- 404: Not found (also returned for every `v1alpha1` path)
- 429: Rate limited
- 500: Server error

## Migration from v1alpha1

`v1alpha1` was removed from `api.scaleway.com`; all of its paths return `404 Not Found`.
The `v1alpha2` API is a redesign, not a rename:

| v1alpha1 | v1alpha2 |
|----------|----------|
| `GET/POST /instance-groups`, `GET/PATCH/DELETE /instance-groups/{id}` | `GET/POST /groups`, `GET/PATCH/DELETE /groups/{group_id}` |
| `DELETE /instance-groups/{id}` -> `204` | `DELETE /groups/{group_id}` -> `200 Group` |
| `GET /instance-groups/{id}/events` | `GET /logs?group_id={group_id}` (free-text `Log` entries) |
| `InstanceGroup.error_messages` | `Group.open_alerts` + `GET /alerts` |
| (no equivalent) | `GET /servers?group_id={group_id}` |
| `capacity { min_replicas, max_replicas, cooldown_delay }` | `scaling_policy_spec { minimum_size, maximum_size, scale_in_cooldown, scale_out_cooldown, scale_in_step, scale_out_step, target }` |
| `loadbalancer { id, backend_ids[], private_network_id }` | `load_balancer_configuration_spec { load_balancer_id, backends[] { backend_id, address_family, private_network_id }, auto_healing }` |
| `GET/POST /instance-policies`, `GET/PATCH/DELETE /instance-policies/{id}` (metric / operator / threshold rules) | **removed** — exactly one policy per group, embedded as `scaling_policy_spec` with one-of `fixed_size` / `cpu_target` / `memory_target`. Custom Cockpit metrics are not supported yet. |
| `GET/POST /instance-templates`, `GET/PATCH/DELETE /instance-templates/{id}` | **moved to the Instance API**: `instance/v2alpha1/zones/{zone}/templates[...]` |
| `InstanceTemplate.commercial_type` | `Template.server_type` |
| `InstanceTemplate.image_id` | per-volume `image_label` (or `base_snapshot_id`) |
| `InstanceTemplate.volumes` (map keyed by index) | `Template.volumes` (array) |
| `InstanceTemplate.private_network_ids[]` | `Template.private_networks[] { private_network_id }` |
| `InstanceTemplate.public_ips_v4_count` / `public_ips_v6_count` | `public_ip_v4_count` / `public_ip_v6_count` |
| `InstanceTemplate.cloud_init` (inline, Base64) | `GET/PUT /templates/{template_id}/user-data/cloud-init` (`{ content }`) |
| `InstanceTemplate.status` | removed (use `GET /templates/{template_id}/check`) |
| `page` / `page_size` pagination | `page_token` / `page_size` + `next_page_token` |
| `instance_template_id` on the group | `template_id` |

Tool mapping applied by this server:

| Tool | v1alpha1 operation | v1alpha2 operation |
|------|--------------------|--------------------|
| `scaleway_autoscaling_list_instance_groups` | `GET /instance-groups` | `GET /groups` |
| `scaleway_autoscaling_get_instance_group` | `GET /instance-groups/{id}` | `GET /groups/{group_id}` |
| `scaleway_autoscaling_create_instance_group` | `POST /instance-groups` | `POST /groups` |
| `scaleway_autoscaling_update_instance_group` | `PATCH /instance-groups/{id}` | `PATCH /groups/{group_id}` |
| `scaleway_autoscaling_delete_instance_group` | `DELETE /instance-groups/{id}` | `DELETE /groups/{group_id}` |
| `scaleway_autoscaling_list_instance_group_events` | `GET /instance-groups/{id}/events` | `GET /logs?group_id=` |
| `scaleway_autoscaling_list_instance_group_servers` (new) | — | `GET /servers?group_id=` |
| `scaleway_autoscaling_list_instance_group_alerts` (new) | `InstanceGroup.error_messages` | `GET /alerts` |
| `scaleway_autoscaling_list_instance_templates` | `GET /instance-templates` | `GET /instance/v2alpha1/.../templates` |
| `scaleway_autoscaling_get_instance_template` | `GET /instance-templates/{id}` | `GET /instance/v2alpha1/.../templates/{template_id}` |
| `scaleway_autoscaling_create_instance_template` | `POST /instance-templates` | `POST /instance/v2alpha1/.../templates` |
| `scaleway_autoscaling_update_instance_template` | `PATCH /instance-templates/{id}` | `PATCH /instance/v2alpha1/.../templates/{template_id}` |
| `scaleway_autoscaling_delete_instance_template` | `DELETE /instance-templates/{id}` | `DELETE /instance/v2alpha1/.../templates/{template_id}` |
| `scaleway_autoscaling_get_instance_template_cloud_init` (new) | `InstanceTemplate.cloud_init` | `GET /instance/v2alpha1/.../templates/{template_id}/user-data/cloud-init` |
| `scaleway_autoscaling_set_instance_template_cloud_init` (new) | `cloud_init` on create/update template | `PUT /instance/v2alpha1/.../templates/{template_id}/user-data/cloud-init` |
| `scaleway_autoscaling_list_instance_policies` | `GET /instance-policies` | removed |
| `scaleway_autoscaling_get_instance_policy` | `GET /instance-policies/{id}` | removed |
| `scaleway_autoscaling_create_instance_policy` | `POST /instance-policies` | removed (use `scalingPolicySpec` on create/update group) |
| `scaleway_autoscaling_update_instance_policy` | `PATCH /instance-policies/{id}` | removed (use `scalingPolicySpec` on update group) |
| `scaleway_autoscaling_delete_instance_policy` | `DELETE /instance-policies/{id}` | removed |
