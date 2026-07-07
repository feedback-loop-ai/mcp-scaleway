# Data Model: Instance Scaling Groups (Autoscaling)

All schemas are defined in `src/tools/autoscaling/types.ts`.

## Value objects

### Capacity
- `max_replicas` (int ≥ 0)
- `min_replicas` (int ≥ 0)
- `cooldown_delay` (string, nullable/optional; duration e.g. `"300s"`)

### Loadbalancer
- `id` (UUID)
- `backend_ids` (string[])
- `private_network_id` (string)

### VolumeInstanceTemplate
- `name` (string)
- `perf_iops` (int, nullable/optional)
- `from_empty` (`{ size: int }`, optional)  ─┐ one-of
- `from_snapshot` (`{ snapshot_id, size? }`, optional) ─┘
- `tags` (string[], optional)
- `boot` (boolean, optional)
- `volume_type` (enum: `unknown_volume_type`, `l_ssd`, `sbs`)

### Metric
- `name` (string)
- `managed_metric` (enum, optional): `managed_metric_unknown`,
  `managed_metric_instance_cpu`, `managed_metric_instance_network_in`,
  `managed_metric_instance_network_out`,
  `managed_loadbalancer_backend_connections_rate`,
  `managed_loadbalancer_backend_throughput`
- `cockpit_metric_name` (string, optional)
- `operator` (enum): `operator_unknown`, `operator_greater_than`, `operator_less_than`
- `aggregate` (enum): `aggregate_unknown`, `aggregate_average`, `aggregate_max`,
  `aggregate_min`, `aggregate_sum`
- `sampling_range_min` (int, minutes)
- `threshold` (number, float)

## Entities

### InstanceGroup
`id`, `project_id`, `name`, `tags[]`, `instance_template_id`, `capacity` (Capacity),
`loadbalancer` (Loadbalancer | null), `error_messages[]`, `created_at`, `updated_at`, `zone`.

### InstanceTemplate
`id`, `commercial_type`, `image_id` (nullable), `volumes` (map<string, VolumeInstanceTemplate>),
`tags[]`, `security_group_id` (nullable), `placement_group_id` (nullable),
`public_ips_v4_count` (nullable), `public_ips_v6_count` (nullable), `project_id`, `name`,
`private_network_ids[]`, `status` (`unknown_status` | `ready` | `error`), `cloud_init`,
`created_at`, `updated_at`, `zone`.

### InstancePolicy
`id`, `name`, `metric` (Metric), `action` (`unknown_instance_action` | `scale_up` |
`scale_down`), `type` (`unknown_instance_type` | `flat_count` | `percent_of_total_group` |
`set_total_group`), `value` (int), `priority` (int), `instance_group_id`, `zone`.

### InstanceGroupEvent
`id`, `source` (`unknown_source` | `watcher` | `scaler` | `instance_manager` | `supervisor`),
`level` (`unknown_level` | `info` | `success` | `error`), `name`, `details` (nullable),
`created_at`.

## List response envelopes
- `ListInstanceGroupsResponse`: `{ instance_groups[], total_count }`
- `ListInstanceTemplatesResponse`: `{ instance_templates[], total_count }`
- `ListInstancePoliciesResponse`: `{ policies[], total_count }`
- `ListInstanceGroupEventsResponse`: `{ instance_events[], total_count }`
