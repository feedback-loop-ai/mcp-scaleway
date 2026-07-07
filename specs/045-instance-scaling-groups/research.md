# Research: Instance Scaling Groups (Autoscaling)

## Sources
- Official API reference: https://www.scaleway.com/en/developers/api/autoscaling/
- Schemas page: https://www.scaleway.com/en/developers/api/autoscaling/~schemas
- Official `scaleway-sdk-go` autoscaling `v1alpha1` client (enum values, request query
  parameters, and struct field names cross-checked here).

## Key decisions

| Decision | Value | Rationale |
|----------|-------|-----------|
| API slug | `autoscaling` | Confirmed from the developers portal URL. |
| Version | `v1alpha1` | Only published version; still in beta. |
| Scoping | **Zoned** (`zones/{zone}`) | Path uses `zones/{zone}`; available zones `fr-par-1`, `fr-par-2`. |
| Base path prefix | `autoscaling/v1alpha1/zones` | Matches the shared client's relative-path convention. |
| Resources | instance-groups, instance-templates, instance-policies | The three published resources; policies are the "scaling policies". |
| Pagination | `page` (int32), `page_size` (uint32) + `total_count` | Standard Scaleway pattern. |
| order_by | `created_at_asc`, `created_at_desc` | Only two values in the SDK (unlike name-based ordering elsewhere). |
| Policy list filter | `instance_group_id` | Only list endpoint with an extra filter. |
| Auth | `X-Auth-Token` header | Standard; handled by shared client. |

## Shape notes / ambiguities resolved
- **List response array keys differ per resource**: `instance_groups`, `instance_templates`,
  `policies` (NOT `instance_policies`), and `instance_events` (for group events). Verified
  against the schemas page (`ListInstancePoliciesResponse.policies`,
  `ListInstanceGroupEventsResponse.instance_events`).
- **Create instance group** body uses `template_id`, while the returned `InstanceGroup`
  object exposes `instance_template_id`. Both retained accordingly.
- **VolumeInstanceTemplate** is a one-of between `from_empty` (`{ size }`) and `from_snapshot`
  (`{ snapshot_id, size? }`); modelled as two optional sub-objects.
- **Metric.threshold** is a float (`float32`); `sampling_range_min` is an integer number of
  minutes. `managed_metric` may be omitted in favour of a custom `cockpit_metric_name`.
- **cooldown_delay** is a duration string (e.g. `"300s"`), nullable/optional.

## Handler design
- Request bodies are built as plain objects and serialized with `JSON.stringify`, which drops
  `undefined` optional fields — no per-field conditional branching needed, keeping handlers
  branch-free apart from the shared try/catch.
- List query params use `urlParams(...)` from `@scaleway/sdk-client`, which omits undefined
  entries.
