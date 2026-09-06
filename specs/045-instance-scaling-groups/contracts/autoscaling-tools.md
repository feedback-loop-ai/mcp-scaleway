> **Superseded (2026-09-05, feature 060 / release 0.4.0).** This contract describes a retired upstream API version. The current tool contract is `specs/060-api-correctness/contracts/autoscaling-tools.md` and the authoritative endpoint reference is under `specs/scaleway-api/`. Kept for history; do not implement against it.

# Tool Contracts: Instance Scaling Groups (Autoscaling)

All tools are zoned. `zone` is required and validated against `xx-xxx-N`. List tools
return `buildPaginatedResponse` output (`{ items, totalCount, page, pageSize }`).
Delete tools return `{ deleted: true, id }`. Errors return
`{ error: { type, message, statusCode } }` with `isError: true`.

Reference: `specs/scaleway-api/autoscaling/api-reference.md`.

## Instance Groups

### `scaleway_autoscaling_list_instance_groups`
- Params: `zone`, `page?`, `pageSize?`, `orderBy?` (`created_at_asc` | `created_at_desc`)
- API: `GET /instance-groups`

### `scaleway_autoscaling_get_instance_group`
- Params: `zone`, `instanceGroupId`
- API: `GET /instance-groups/{id}`

### `scaleway_autoscaling_create_instance_group`
- Params: `zone`, `name`, `templateId`, `capacity`, `projectId?`, `tags?`, `loadbalancer?`
- API: `POST /instance-groups`

### `scaleway_autoscaling_update_instance_group`
- Params: `zone`, `instanceGroupId`, `name?`, `tags?`, `capacity?`, `loadbalancer?`
- API: `PATCH /instance-groups/{id}`

### `scaleway_autoscaling_delete_instance_group`
- Params: `zone`, `instanceGroupId`
- API: `DELETE /instance-groups/{id}`

### `scaleway_autoscaling_list_instance_group_events`
- Params: `zone`, `instanceGroupId`, `page?`, `pageSize?`, `orderBy?`
- API: `GET /instance-groups/{id}/events`

## Instance Templates

### `scaleway_autoscaling_list_instance_templates`
- Params: `zone`, `page?`, `pageSize?`, `orderBy?`
- API: `GET /instance-templates`

### `scaleway_autoscaling_get_instance_template`
- Params: `zone`, `instanceTemplateId`
- API: `GET /instance-templates/{id}`

### `scaleway_autoscaling_create_instance_template`
- Params: `zone`, `name`, `commercialType`, `imageId?`, `volumes?`, `tags?`,
  `securityGroupId?`, `placementGroupId?`, `publicIpsV4Count?`, `publicIpsV6Count?`,
  `projectId?`, `privateNetworkIds?`, `cloudInit?`
- API: `POST /instance-templates`

### `scaleway_autoscaling_update_instance_template`
- Params: `zone`, `instanceTemplateId`, plus all create fields optional (except IDs)
- API: `PATCH /instance-templates/{id}`

### `scaleway_autoscaling_delete_instance_template`
- Params: `zone`, `instanceTemplateId`
- API: `DELETE /instance-templates/{id}`

## Instance Policies (Scaling Policies)

### `scaleway_autoscaling_list_instance_policies`
- Params: `zone`, `page?`, `pageSize?`, `orderBy?`, `instanceGroupId?`
- API: `GET /instance-policies`

### `scaleway_autoscaling_get_instance_policy`
- Params: `zone`, `instancePolicyId`
- API: `GET /instance-policies/{id}`

### `scaleway_autoscaling_create_instance_policy`
- Params: `zone`, `name`, `metric`, `action`, `type`, `value`, `priority`, `instanceGroupId`
- API: `POST /instance-policies`

### `scaleway_autoscaling_update_instance_policy`
- Params: `zone`, `instancePolicyId`, `name?`, `metric?`, `action?`, `type?`, `value?`, `priority?`
- API: `PATCH /instance-policies/{id}`

### `scaleway_autoscaling_delete_instance_policy`
- Params: `zone`, `instancePolicyId`
- API: `DELETE /instance-policies/{id}`
