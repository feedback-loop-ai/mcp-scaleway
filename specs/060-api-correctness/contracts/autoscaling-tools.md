# Tool Contracts: Autoscaling (v1alpha2) and Instance Templates (v2alpha1)

Feature 060 migrated or relocated these tools. This file supersedes the corresponding entries in earlier feature contracts (see Superseded contracts below). Input schemas are the Zod shapes in `src/tools/autoscaling/types.ts`; the JSON projection is served by `scaleway_describe`. Descriptions below are generated from the live registry, so they match the shipped tool descriptions including usage examples.

Reference: `specs/scaleway-api/autoscaling/api-reference.md`. Errors return `{ error: { type, message, statusCode } }` with `isError: true`; `unsupported_operation` (501) marks combinations with no faithful upstream equivalent.

### `scaleway_autoscaling_create_instance_group`

- **Endpoint**: `POST /autoscaling/v1alpha2/zones/{zone}/groups`
- **Read-only**: no
- **Description**: Create an Instance autoscaling group from an Instance template, with an embedded scaling policy (fixed size, CPU or memory target) and optional Load Balancer backends. Example: {zone: 'fr-par-1', name: 'web', templateId: '11111111-1111-4111-8111-111111111111'}
- **Required**: `zone`, `name`, `templateId`
- **Optional**: `projectId`, `tags`, `scalingPolicySpec`, `loadBalancerConfigurationSpec`

### `scaleway_autoscaling_create_instance_template`

- **Endpoint**: `POST /instance/v2alpha1/zones/{zone}/templates`
- **Read-only**: no
- **Description**: Create an Instance template (Instance API v2alpha1) describing the Instances an autoscaling group starts. Example: {zone: 'fr-par-1', name: 'web-tpl', serverType: 'PLAY2-NANO'}
- **Required**: `zone`, `name`, `serverType`
- **Optional**: `projectId`, `tags`, `serverTags`, `securityGroupId`, `placementGroupId`, `volumes`, `privateNetworks`, `filesystemIds`, `publicIpV4Count`, `publicIpV6Count`, `windowsRdpSshKeyId`

### `scaleway_autoscaling_delete_instance_group`

- **Endpoint**: `DELETE /autoscaling/v1alpha2/zones/{zone}/groups/{group_id}`
- **Read-only**: no
- **Description**: Delete an Instance autoscaling group and its managed Instances; returns the group in 'deleting' status. Example: {zone: 'fr-par-1', instanceGroupId: '11111111-1111-4111-8111-111111111111'}
- **Required**: `zone`, `instanceGroupId`
- **Optional**: none

### `scaleway_autoscaling_delete_instance_template`

- **Endpoint**: `DELETE /instance/v2alpha1/zones/{zone}/templates/{template_id}`
- **Read-only**: no
- **Description**: Delete an Instance template by ID. Example: {zone: 'fr-par-1', instanceTemplateId: '11111111-1111-4111-8111-111111111111'}
- **Required**: `zone`, `instanceTemplateId`
- **Optional**: none

### `scaleway_autoscaling_get_instance_group`

- **Endpoint**: `GET /autoscaling/v1alpha2/zones/{zone}/groups/{group_id}`
- **Read-only**: yes
- **Description**: Get an Instance autoscaling group by ID (status, current/target size, scaling policy, Load Balancer configuration, open alerts). Example: {zone: 'fr-par-1', instanceGroupId: '11111111-1111-4111-8111-111111111111'}
- **Required**: `zone`, `instanceGroupId`
- **Optional**: none

### `scaleway_autoscaling_get_instance_template`

- **Endpoint**: `GET /instance/v2alpha1/zones/{zone}/templates/{template_id}`
- **Read-only**: yes
- **Description**: Get an Instance template by ID (server type, volumes, Private Networks, public IP counts). Example: {zone: 'fr-par-1', instanceTemplateId: '11111111-1111-4111-8111-111111111111'}
- **Required**: `zone`, `instanceTemplateId`
- **Optional**: none

### `scaleway_autoscaling_get_instance_template_cloud_init`

- **Endpoint**: `GET /instance/v2alpha1/zones/{zone}/templates/{template_id}/user-data/cloud-init`
- **Read-only**: yes
- **Description**: Get the cloud-init configuration of an Instance template. Example: {zone: 'fr-par-1', instanceTemplateId: '11111111-1111-4111-8111-111111111111'}
- **Required**: `zone`, `instanceTemplateId`
- **Optional**: none

### `scaleway_autoscaling_list_instance_group_alerts`

- **Endpoint**: `GET /autoscaling/v1alpha2/zones/{zone}/alerts`
- **Read-only**: yes
- **Description**: List active and historical alerts (quota, stock, template or Load Balancer issues) for one autoscaling group or a whole project. Example: {zone: 'fr-par-1', instanceGroupId: '11111111-1111-4111-8111-111111111111'}
- **Required**: `zone`
- **Optional**: `pageSize`, `pageToken`, `instanceGroupId`, `projectId`

### `scaleway_autoscaling_list_instance_group_events`

- **Endpoint**: `GET /autoscaling/v1alpha2/zones/{zone}/logs`
- **Read-only**: yes
- **Description**: List scaling logs (events) of an Instance autoscaling group, optionally within a time window. Example: {zone: 'fr-par-1', instanceGroupId: '11111111-1111-4111-8111-111111111111'}
- **Required**: `zone`, `instanceGroupId`
- **Optional**: `pageSize`, `pageToken`, `startTime`, `endTime`

### `scaleway_autoscaling_list_instance_group_servers`

- **Endpoint**: `GET /autoscaling/v1alpha2/zones/{zone}/servers`
- **Read-only**: yes
- **Description**: List the Instances currently managed by an Instance autoscaling group. Example: {zone: 'fr-par-1', instanceGroupId: '11111111-1111-4111-8111-111111111111'}
- **Required**: `zone`, `instanceGroupId`
- **Optional**: `pageSize`, `pageToken`

### `scaleway_autoscaling_list_instance_groups`

- **Endpoint**: `GET /autoscaling/v1alpha2/zones/{zone}/groups`
- **Read-only**: yes
- **Description**: List Instance autoscaling groups in a Scaleway zone (autoscaling v1alpha2; token pagination; filter by template or Load Balancer). Example: {zone: 'fr-par-1'}
- **Required**: `zone`
- **Optional**: `pageSize`, `pageToken`, `projectId`, `orderBy`, `templateId`, `loadBalancerId`

### `scaleway_autoscaling_list_instance_templates`

- **Endpoint**: `GET /instance/v2alpha1/zones/{zone}/templates`
- **Read-only**: yes
- **Description**: List Instance templates (Instance API v2alpha1) usable by autoscaling groups in a zone. Example: {zone: 'fr-par-1'}
- **Required**: `zone`
- **Optional**: `pageSize`, `pageToken`, `projectId`, `orderBy`, `name`, `tags`, `templateIds`

### `scaleway_autoscaling_set_instance_template_cloud_init`

- **Endpoint**: `PUT /instance/v2alpha1/zones/{zone}/templates/{template_id}/user-data/cloud-init`
- **Read-only**: no
- **Description**: Set the cloud-init configuration of an Instance template. Example: {zone: 'fr-par-1', instanceTemplateId: '11111111-1111-4111-8111-111111111111', content: '#cloud-config'}
- **Required**: `zone`, `instanceTemplateId`, `content`
- **Optional**: none

### `scaleway_autoscaling_update_instance_group`

- **Endpoint**: `PATCH /autoscaling/v1alpha2/zones/{zone}/groups/{group_id}`
- **Read-only**: no
- **Description**: Update an Instance autoscaling group (name, tags, template, scaling policy, Load Balancer configuration). Example: {zone: 'fr-par-1', instanceGroupId: '11111111-1111-4111-8111-111111111111', name: 'web-v2'}
- **Required**: `zone`, `instanceGroupId`
- **Optional**: `name`, `tags`, `templateId`, `scalingPolicySpec`, `loadBalancerConfigurationSpec`

### `scaleway_autoscaling_update_instance_template`

- **Endpoint**: `PATCH /instance/v2alpha1/zones/{zone}/templates/{template_id}`
- **Read-only**: no
- **Description**: Update an Instance template (changes apply to new Instances only). Example: {zone: 'fr-par-1', instanceTemplateId: '11111111-1111-4111-8111-111111111111', tags: ['web']}
- **Required**: `zone`, `instanceTemplateId`
- **Optional**: `name`, `serverType`, `tags`, `serverTags`, `securityGroupId`, `placementGroupId`, `volumes`, `privateNetworks`, `filesystemIds`, `publicIpV4Count`, `publicIpV6Count`, `windowsRdpSshKeyId`

## Superseded contracts

- `specs/045-instance-scaling-groups/contracts/autoscaling-tools.md` (v1alpha1, instance policies)
