# Scaleway Instance Scaling Groups (Autoscaling) API Reference

- API slug: `autoscaling`
- Version: `v1alpha1`
- Scope: **zoned** (path segment `zones/{zone}`)
- Available zones (at time of writing): `fr-par-1`, `fr-par-2`
- Base URL: `https://api.scaleway.com/autoscaling/v1alpha1/zones/{zone}`
- Source: https://www.scaleway.com/en/developers/api/autoscaling/ and the official
  `scaleway-sdk-go` autoscaling v1alpha1 client.

## Authentication
- Header: `X-Auth-Token: <secret_key>`

## Pagination
- List endpoints accept `page` (int32) and `page_size` (uint32) query parameters.
- List responses return the resource array plus `total_count` (number).

## Instance Groups

An Instance group is the core resource that automatically adjusts the number of
Instances based on the attached scaling policies.

### List Instance Groups
`GET /instance-groups`
- Query: `page` (int), `page_size` (int), `order_by` (string)
- `order_by` values: `created_at_asc`, `created_at_desc` (default `created_at_desc`)
- Response: `{ instance_groups: InstanceGroup[], total_count: number }`

### Get Instance Group
`GET /instance-groups/{instance_group_id}`
- Response: `InstanceGroup` object

### Create Instance Group
`POST /instance-groups`
- Body: `{ project_id?, name, tags?, template_id, capacity, loadbalancer? }`
- Response: `InstanceGroup` object

### Update Instance Group
`PATCH /instance-groups/{instance_group_id}`
- Body: `{ name?, tags?, capacity?, loadbalancer? }`
- Response: `InstanceGroup` object

### Delete Instance Group
`DELETE /instance-groups/{instance_group_id}`
- Response: empty (204)

### List Instance Group Events
`GET /instance-groups/{instance_group_id}/events`
- Query: `page` (int), `page_size` (int), `order_by` (string)
- `order_by` values: `created_at_asc`, `created_at_desc` (default `created_at_desc`)
- Response: `{ instance_events: InstanceGroupEvent[], total_count: number }`

## Instance Templates

A reusable model describing the Instances created during a scale-up.

### List Instance Templates
`GET /instance-templates`
- Query: `page` (int), `page_size` (int), `order_by` (string)
- `order_by` values: `created_at_asc`, `created_at_desc` (default `created_at_desc`)
- Response: `{ instance_templates: InstanceTemplate[], total_count: number }`

### Get Instance Template
`GET /instance-templates/{instance_template_id}`
- Response: `InstanceTemplate` object

### Create Instance Template
`POST /instance-templates`
- Body: `{ name, commercial_type, image_id?, volumes?, tags?, security_group_id?,
  placement_group_id?, public_ips_v4_count?, public_ips_v6_count?, project_id?,
  private_network_ids?, cloud_init? }`
- Response: `InstanceTemplate` object

### Update Instance Template
`PATCH /instance-templates/{instance_template_id}`
- Body: `{ name?, commercial_type?, image_id?, volumes?, tags?, security_group_id?,
  placement_group_id?, public_ips_v4_count?, public_ips_v6_count?,
  private_network_ids?, cloud_init? }`
- Response: `InstanceTemplate` object

### Delete Instance Template
`DELETE /instance-templates/{instance_template_id}`
- Response: empty (204)

## Instance Policies (Scaling Policies)

A rule that defines a scaling action based on a metric threshold.

### List Instance Policies
`GET /instance-policies`
- Query: `page` (int), `page_size` (int), `order_by` (string), `instance_group_id` (string)
- `order_by` values: `created_at_asc`, `created_at_desc` (default `created_at_desc`)
- Response: `{ policies: InstancePolicy[], total_count: number }`

### Get Instance Policy
`GET /instance-policies/{instance_policy_id}`
- Response: `InstancePolicy` object

### Create Instance Policy
`POST /instance-policies`
- Body: `{ name, metric, action, type, value, priority, instance_group_id }`
- Response: `InstancePolicy` object

### Update Instance Policy
`PATCH /instance-policies/{instance_policy_id}`
- Body: `{ name?, metric?, action?, type?, value?, priority? }`
- Response: `InstancePolicy` object

### Delete Instance Policy
`DELETE /instance-policies/{instance_policy_id}`
- Response: empty (204)

## Schemas

### InstanceGroup
- `id` (string, UUID)
- `project_id` (string, UUID)
- `name` (string)
- `tags` (string[])
- `instance_template_id` (string, UUID)
- `capacity` (Capacity)
- `loadbalancer` (Loadbalancer, nullable)
- `error_messages` (string[])
- `created_at` (string, RFC 3339)
- `updated_at` (string, RFC 3339)
- `zone` (string)

### Capacity
- `max_replicas` (uint32)
- `min_replicas` (uint32)
- `cooldown_delay` (string, duration e.g. `"300s"`, nullable)

### Loadbalancer
- `id` (string, UUID)
- `backend_ids` (string[])
- `private_network_id` (string, UUID)

### InstanceTemplate
- `id` (string, UUID)
- `commercial_type` (string)
- `image_id` (string, nullable)
- `volumes` (map<string, VolumeInstanceTemplate>)
- `tags` (string[])
- `security_group_id` (string, nullable)
- `placement_group_id` (string, nullable)
- `public_ips_v4_count` (uint32, nullable)
- `public_ips_v6_count` (uint32, nullable)
- `project_id` (string, UUID)
- `name` (string)
- `private_network_ids` (string[])
- `status` (enum: `unknown_status`, `ready`, `error`)
- `cloud_init` (string, Base64)
- `created_at` (string, RFC 3339)
- `updated_at` (string, RFC 3339)
- `zone` (string)

### VolumeInstanceTemplate
- `name` (string)
- `perf_iops` (uint32, nullable)
- `from_empty` (`{ size: number (bytes) }`, one-of)
- `from_snapshot` (`{ snapshot_id: string, size?: number (bytes) }`, one-of)
- `tags` (string[])
- `boot` (boolean)
- `volume_type` (enum: `unknown_volume_type`, `l_ssd`, `sbs`)

### InstancePolicy
- `id` (string, UUID)
- `name` (string)
- `metric` (Metric)
- `action` (enum: `unknown_instance_action`, `scale_up`, `scale_down`)
- `type` (enum: `unknown_instance_type`, `flat_count`, `percent_of_total_group`, `set_total_group`)
- `value` (uint32)
- `priority` (uint32)
- `instance_group_id` (string, UUID)
- `zone` (string)

### Metric
- `name` (string)
- `managed_metric` (enum: `managed_metric_unknown`, `managed_metric_instance_cpu`,
  `managed_metric_instance_network_in`, `managed_metric_instance_network_out`,
  `managed_loadbalancer_backend_connections_rate`, `managed_loadbalancer_backend_throughput`)
- `cockpit_metric_name` (string, used when `managed_metric` is unknown/custom)
- `operator` (enum: `operator_unknown`, `operator_greater_than`, `operator_less_than`)
- `aggregate` (enum: `aggregate_unknown`, `aggregate_average`, `aggregate_max`,
  `aggregate_min`, `aggregate_sum`)
- `sampling_range_min` (uint32, minutes)
- `threshold` (float32)

### InstanceGroupEvent
- `id` (string, UUID)
- `source` (enum: `unknown_source`, `watcher`, `scaler`, `instance_manager`, `supervisor`)
- `level` (enum: `unknown_level`, `info`, `success`, `error`)
- `name` (string)
- `details` (string, nullable)
- `created_at` (string, RFC 3339)

## Error Codes
- 400: Invalid input
- 401/403: Permission denied
- 404: Not found
- 429: Rate limited
- 500: Server error
