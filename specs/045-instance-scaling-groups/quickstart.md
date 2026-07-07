# Quickstart: Instance Scaling Groups (Autoscaling)

Prerequisites: Scaleway API credentials configured for the shared client
(`SCW_ACCESS_KEY`, `SCW_SECRET_KEY`, default project). Zone must be one where the
autoscaling beta is available (`fr-par-1`, `fr-par-2`).

## Typical flow

1. **Create an instance template** describing the Instances to spawn:
   `scaleway_autoscaling_create_instance_template`
   ```json
   { "zone": "fr-par-1", "name": "web-tmpl", "commercialType": "DEV1-S",
     "imageId": "ubuntu_jammy",
     "volumes": { "0": { "name": "root", "volume_type": "sbs", "boot": true,
                          "from_empty": { "size": 10000000000 } } } }
   ```

2. **Create an instance group** referencing the template and a capacity range:
   `scaleway_autoscaling_create_instance_group`
   ```json
   { "zone": "fr-par-1", "name": "web-group", "templateId": "<template-id>",
     "capacity": { "min_replicas": 1, "max_replicas": 5, "cooldown_delay": "300s" } }
   ```

3. **Attach a scaling policy** on a metric threshold:
   `scaleway_autoscaling_create_instance_policy`
   ```json
   { "zone": "fr-par-1", "name": "scale-up-cpu", "instanceGroupId": "<group-id>",
     "action": "scale_up", "type": "flat_count", "value": 1, "priority": 1,
     "metric": { "name": "cpu", "managed_metric": "managed_metric_instance_cpu",
                 "operator": "operator_greater_than", "aggregate": "aggregate_average",
                 "sampling_range_min": 5, "threshold": 70 } }
   ```

4. **Observe** activity with `scaleway_autoscaling_list_instance_group_events`.

## Tool inventory (16)
- Groups: `list_instance_groups`, `get_instance_group`, `create_instance_group`,
  `update_instance_group`, `delete_instance_group`, `list_instance_group_events`
- Templates: `list_instance_templates`, `get_instance_template`, `create_instance_template`,
  `update_instance_template`, `delete_instance_template`
- Policies: `list_instance_policies`, `get_instance_policy`, `create_instance_policy`,
  `update_instance_policy`, `delete_instance_policy`

(all prefixed with `scaleway_autoscaling_`)
