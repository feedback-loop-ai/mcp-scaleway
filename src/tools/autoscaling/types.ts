import { z } from "zod";
import { ScalewayZone } from "../../shared/types.js";

// Scaleway Instance Autoscaling Groups API v1alpha2 (zoned).
// Spec: specs/scaleway-api/autoscaling/api-reference.md
// Groups, logs, servers and alerts live under /autoscaling/v1alpha2/zones/{zone}/...
// Instance templates live under /instance/v2alpha1/zones/{zone}/templates (Instance API).

// --- Enums ---

export const GroupStatus = z.enum([
	"unknown_group_status",
	"active",
	"scaling_out",
	"scaling_in",
	"refreshing",
	"healing",
	"scaling_failure",
	"deleting",
]);
export type GroupStatus = z.infer<typeof GroupStatus>;

export const AlertType = z.enum([
	"unknown_alert_type",
	"quotas_exceeded",
	"out_of_stock",
	"invalid_template",
	"template_not_found",
	"invalid_instance",
	"template_permissions_denied",
	"load_balancer_not_found",
	"load_balancer_permissions_denied",
	"backend_not_found",
	"backend_permissions_denied",
]);
export type AlertType = z.infer<typeof AlertType>;

export const AddressFamily = z.enum(["unknown_address_family", "ipv4", "ipv6"]);
export type AddressFamily = z.infer<typeof AddressFamily>;

export const ScalingPolicyTargetType = z.enum([
	"unknown_scaling_policy_target_type",
	"fixed_size",
	"cpu_target",
	"memory_target",
]);
export type ScalingPolicyTargetType = z.infer<typeof ScalingPolicyTargetType>;

export const LogLevel = z.enum(["unknown_log_level", "info", "warning", "error"]);
export type LogLevel = z.infer<typeof LogLevel>;

export const ListGroupsOrderBy = z.enum(["created_at_desc", "created_at_asc"]);
export type ListGroupsOrderBy = z.infer<typeof ListGroupsOrderBy>;

export const ListTemplatesOrderBy = z.enum([
	"created_at_desc",
	"created_at_asc",
	"updated_at_desc",
	"updated_at_asc",
]);
export type ListTemplatesOrderBy = z.infer<typeof ListTemplatesOrderBy>;

export const TemplateVolumeType = z.enum(["unknown_volume_type", "l_ssd", "sbs", "scratch"]);
export type TemplateVolumeType = z.infer<typeof TemplateVolumeType>;

// --- Shared pagination (token based) ---

const TokenPaginationParams = z.object({
	pageSize: z
		.number()
		.int()
		.min(1)
		.max(100)
		.optional()
		.describe("Number of items to return per page (1-100)"),
	pageToken: z.string().optional().describe("Pagination cursor returned by a previous call"),
});

// --- Nested value objects (requests) ---

export const ScalingPolicySpec = z
	.object({
		minimum_size: z.number().int().nonnegative().optional().describe("Minimum group size"),
		maximum_size: z.number().int().nonnegative().optional().describe("Maximum group size"),
		scale_out_cooldown: z
			.string()
			.optional()
			.describe("Cooldown after a scale-out event, as a duration (e.g. '300s')"),
		scale_in_cooldown: z
			.string()
			.optional()
			.describe("Cooldown after a scale-in event, as a duration (e.g. '300s')"),
		scale_in_step: z
			.number()
			.int()
			.nonnegative()
			.optional()
			.describe("Number of Instances removed per scale-in event"),
		scale_out_step: z
			.number()
			.int()
			.nonnegative()
			.optional()
			.describe("Number of Instances added per scale-out event"),
		fixed_size: z
			.object({ size: z.number().int().nonnegative() })
			.optional()
			.describe("Fixed-size target (mutually exclusive with cpu_target/memory_target)"),
		cpu_target: z
			.object({ target_avg_percent: z.number().min(0).max(100) })
			.optional()
			.describe("Average CPU usage target in percent (mutually exclusive with other targets)"),
		memory_target: z
			.object({ target_avg_percent: z.number().min(0).max(100) })
			.optional()
			.describe("Average memory usage target in percent (mutually exclusive with other targets)"),
	})
	.refine(
		(spec) =>
			[spec.fixed_size, spec.cpu_target, spec.memory_target].filter((t) => t !== undefined)
				.length <= 1,
		{ message: "At most one of fixed_size, cpu_target or memory_target may be set" },
	);
export type ScalingPolicySpec = z.infer<typeof ScalingPolicySpec>;

export const LoadBalancerBackendSpec = z.object({
	backend_id: z.string().uuid().describe("ID of the Load Balancer backend"),
	address_family: AddressFamily.describe("IP address family used to register Instances"),
	private_network_id: z
		.string()
		.uuid()
		.optional()
		.describe("Private Network ID to reach Instances through"),
});
export type LoadBalancerBackendSpec = z.infer<typeof LoadBalancerBackendSpec>;

export const LoadBalancerConfigurationSpec = z.object({
	load_balancer_id: z.string().uuid().optional().describe("Load Balancer ID (omit to disable)"),
	backends: z.array(LoadBalancerBackendSpec).describe("Backends to keep in sync with the group"),
	auto_healing: z
		.object({
			enabled: z.boolean().optional(),
			grace_period: z.string().optional().describe("Health-check grace period (e.g. '300s')"),
		})
		.optional()
		.describe("Auto-healing of Instances reported unhealthy by the Load Balancer"),
});
export type LoadBalancerConfigurationSpec = z.infer<typeof LoadBalancerConfigurationSpec>;

export const VolumeTemplate = z
	.object({
		volume_type: TemplateVolumeType.describe("Volume type"),
		name: z.string().describe("Volume name"),
		tags: z.array(z.string()).optional().describe("Volume tags"),
		size: z.number().int().nonnegative().optional().describe("Volume size in bytes"),
		base_snapshot_id: z
			.string()
			.uuid()
			.optional()
			.describe("Snapshot to create the volume from (mutually exclusive with image_label)"),
		image_label: z
			.string()
			.optional()
			.describe("Image label to create the volume from, e.g. 'ubuntu_noble'"),
		perf_iops: z.number().int().nonnegative().optional().describe("Provisioned IOPS"),
	})
	.refine((v) => !(v.base_snapshot_id !== undefined && v.image_label !== undefined), {
		message: "At most one of base_snapshot_id or image_label may be set",
	});
export type VolumeTemplate = z.infer<typeof VolumeTemplate>;

export const PrivateNetworkTemplate = z.object({
	private_network_id: z.string().uuid().describe("Private Network ID"),
});
export type PrivateNetworkTemplate = z.infer<typeof PrivateNetworkTemplate>;

// --- Response entities ---

export const Alert = z.object({
	type: AlertType,
	opened_at: z.string().nullable().optional(),
	closed_at: z.string().nullable().optional(),
	group_id: z.string().uuid(),
	failing_quotas: z.array(z.string()),
});
export type Alert = z.infer<typeof Alert>;

export const GroupScalingPolicy = z.object({
	minimum_size: z.number().int().nonnegative(),
	maximum_size: z.number().int().nonnegative(),
	scale_out_cooldown: z.string().nullable().optional(),
	scale_in_cooldown: z.string().nullable().optional(),
	scale_in_step: z.number().int().nonnegative(),
	scale_out_step: z.number().int().nonnegative(),
	fixed_size: z.object({ size: z.number().int().nonnegative() }).nullable().optional(),
	cpu_target: z.object({ target_avg_percent: z.number() }).nullable().optional(),
	memory_target: z.object({ target_avg_percent: z.number() }).nullable().optional(),
});
export type GroupScalingPolicy = z.infer<typeof GroupScalingPolicy>;

export const GroupLoadBalancerConfiguration = z.object({
	load_balancer_id: z.string(),
	backends: z.array(
		z.object({
			backend_id: z.string(),
			address_family: AddressFamily,
			private_network_id: z.string().nullable().optional(),
		}),
	),
	auto_healing: z
		.object({ enabled: z.boolean(), grace_period: z.string().nullable().optional() })
		.nullable()
		.optional(),
});
export type GroupLoadBalancerConfiguration = z.infer<typeof GroupLoadBalancerConfiguration>;

export const Group = z.object({
	id: z.string().uuid(),
	project_id: z.string().uuid(),
	name: z.string(),
	tags: z.array(z.string()),
	created_at: z.string().nullable().optional(),
	updated_at: z.string().nullable().optional(),
	status: GroupStatus,
	open_alerts: z.array(Alert),
	current_size: z.number().int().nonnegative(),
	target_size: z.number().int().nonnegative(),
	last_scale_out_at: z.string().nullable().optional(),
	last_scale_in_at: z.string().nullable().optional(),
	template_id: z.string().uuid(),
	scaling_policy: GroupScalingPolicy.nullable().optional(),
	load_balancer_configuration: GroupLoadBalancerConfiguration.nullable().optional(),
});
export type Group = z.infer<typeof Group>;

export const GroupSummary = z.object({
	project_id: z.string().uuid(),
	id: z.string().uuid(),
	name: z.string(),
	tags: z.array(z.string()),
	status: GroupStatus,
	created_at: z.string().nullable().optional(),
	updated_at: z.string().nullable().optional(),
	template_id: z.string().uuid(),
	load_balancer_id: z.string().nullable().optional(),
	current_size: z.number().int().nonnegative(),
	latest_open_alert: Alert.nullable().optional(),
	minimum_size: z.number().int().nonnegative(),
	maximum_size: z.number().int().nonnegative(),
	scaling_policy_target_type: ScalingPolicyTargetType,
	zone: z.string(),
});
export type GroupSummary = z.infer<typeof GroupSummary>;

export const Log = z.object({
	timestamp: z.string().nullable().optional(),
	level: LogLevel,
	message: z.string(),
});
export type Log = z.infer<typeof Log>;

export const Server = z.object({
	server_id: z.string().uuid(),
});
export type Server = z.infer<typeof Server>;

export const Template = z.object({
	project_id: z.string().uuid(),
	id: z.string().uuid(),
	name: z.string(),
	tags: z.array(z.string()),
	server_tags: z.array(z.string()),
	server_type: z.string(),
	security_group_id: z.string().nullable().optional(),
	placement_group_id: z.string().nullable().optional(),
	public_ip_v4_count: z.number().int().nonnegative(),
	public_ip_v6_count: z.number().int().nonnegative(),
	volumes: z.array(VolumeTemplate),
	private_networks: z.array(PrivateNetworkTemplate),
	filesystem_ids: z.array(z.string()),
	created_at: z.string().nullable().optional(),
	updated_at: z.string().nullable().optional(),
	windows_rdp_ssh_key_id: z.string().nullable().optional(),
	zone: z.string(),
});
export type Template = z.infer<typeof Template>;

export const TemplateSummary = Template.omit({
	volumes: true,
	private_networks: true,
	windows_rdp_ssh_key_id: true,
});
export type TemplateSummary = z.infer<typeof TemplateSummary>;

export const UserData = z.object({
	key: z.string(),
	content: z.string(),
});
export type UserData = z.infer<typeof UserData>;

// --- Group tool params ---

export const ListInstanceGroupsParams = TokenPaginationParams.extend({
	zone: ScalewayZone.describe(
		"Zone to list autoscaling groups in (e.g. fr-par-1, nl-ams-1, pl-waw-1)",
	),
	projectId: z
		.string()
		.uuid()
		.optional()
		.describe("Project ID to list groups for (defaults to SCW_DEFAULT_PROJECT_ID)"),
	orderBy: ListGroupsOrderBy.optional().describe("Order results by creation date"),
	templateId: z.string().uuid().optional().describe("Filter by Instance template ID"),
	loadBalancerId: z.string().uuid().optional().describe("Filter by Load Balancer ID"),
});
export type ListInstanceGroupsParams = z.infer<typeof ListInstanceGroupsParams>;

export const GetInstanceGroupParams = z.object({
	zone: ScalewayZone.describe("Zone of the autoscaling group"),
	instanceGroupId: z.string().uuid().describe("ID of the autoscaling group"),
});
export type GetInstanceGroupParams = z.infer<typeof GetInstanceGroupParams>;

export const CreateInstanceGroupParams = z.object({
	zone: ScalewayZone.describe("Zone for the autoscaling group (e.g. fr-par-1, nl-ams-1, pl-waw-1)"),
	name: z.string().min(1).describe("Name of the autoscaling group"),
	templateId: z
		.string()
		.uuid()
		.describe("Instance API v2alpha1 template ID used to create Instances"),
	projectId: z.string().uuid().optional().describe("Project ID (uses default if omitted)"),
	tags: z.array(z.string()).optional().describe("Tags for the autoscaling group"),
	scalingPolicySpec: ScalingPolicySpec.optional().describe(
		"Scaling policy: min/max size, cooldowns, steps and one target (fixed_size, cpu_target or memory_target)",
	),
	loadBalancerConfigurationSpec: LoadBalancerConfigurationSpec.optional().describe(
		"Load Balancer backends to keep in sync, with optional auto-healing",
	),
});
export type CreateInstanceGroupParams = z.infer<typeof CreateInstanceGroupParams>;

export const UpdateInstanceGroupParams = z.object({
	zone: ScalewayZone.describe("Zone of the autoscaling group"),
	instanceGroupId: z.string().uuid().describe("ID of the autoscaling group to update"),
	name: z.string().min(1).optional().describe("New name"),
	tags: z.array(z.string()).optional().describe("New tags"),
	templateId: z.string().uuid().optional().describe("New Instance template ID"),
	scalingPolicySpec: ScalingPolicySpec.optional().describe("New scaling policy"),
	loadBalancerConfigurationSpec: LoadBalancerConfigurationSpec.optional().describe(
		"New Load Balancer configuration",
	),
});
export type UpdateInstanceGroupParams = z.infer<typeof UpdateInstanceGroupParams>;

export const DeleteInstanceGroupParams = z.object({
	zone: ScalewayZone.describe("Zone of the autoscaling group"),
	instanceGroupId: z.string().uuid().describe("ID of the autoscaling group to delete"),
});
export type DeleteInstanceGroupParams = z.infer<typeof DeleteInstanceGroupParams>;

export const ListInstanceGroupEventsParams = TokenPaginationParams.extend({
	zone: ScalewayZone.describe("Zone of the autoscaling group"),
	instanceGroupId: z.string().uuid().describe("ID of the autoscaling group"),
	startTime: z
		.string()
		.datetime({ offset: true })
		.optional()
		.describe("Only logs at or after this RFC 3339 timestamp"),
	endTime: z
		.string()
		.datetime({ offset: true })
		.optional()
		.describe("Only logs at or before this RFC 3339 timestamp"),
});
export type ListInstanceGroupEventsParams = z.infer<typeof ListInstanceGroupEventsParams>;

export const ListInstanceGroupServersParams = TokenPaginationParams.extend({
	zone: ScalewayZone.describe("Zone of the autoscaling group"),
	instanceGroupId: z.string().uuid().describe("ID of the autoscaling group"),
});
export type ListInstanceGroupServersParams = z.infer<typeof ListInstanceGroupServersParams>;

export const ListInstanceGroupAlertsParams = TokenPaginationParams.extend({
	zone: ScalewayZone.describe("Zone to list alerts in"),
	instanceGroupId: z
		.string()
		.uuid()
		.optional()
		.describe("Only alerts of this autoscaling group (takes precedence over projectId)"),
	projectId: z
		.string()
		.uuid()
		.optional()
		.describe("Alerts of every group in this project (defaults to SCW_DEFAULT_PROJECT_ID)"),
});
export type ListInstanceGroupAlertsParams = z.infer<typeof ListInstanceGroupAlertsParams>;

// --- Instance Template tool params (Instance API v2alpha1) ---

export const ListInstanceTemplatesParams = TokenPaginationParams.extend({
	zone: ScalewayZone.describe("Zone to list Instance templates in (e.g. fr-par-1)"),
	projectId: z
		.string()
		.uuid()
		.optional()
		.describe("Project ID to list templates for (defaults to SCW_DEFAULT_PROJECT_ID)"),
	orderBy: ListTemplatesOrderBy.optional().describe("Order results by field"),
	name: z.string().optional().describe("Filter by template name"),
	tags: z.array(z.string()).optional().describe("Filter by template tags"),
	templateIds: z.array(z.string().uuid()).optional().describe("Filter by template IDs"),
});
export type ListInstanceTemplatesParams = z.infer<typeof ListInstanceTemplatesParams>;

export const GetInstanceTemplateParams = z.object({
	zone: ScalewayZone.describe("Zone of the Instance template"),
	instanceTemplateId: z.string().uuid().describe("ID of the Instance template"),
});
export type GetInstanceTemplateParams = z.infer<typeof GetInstanceTemplateParams>;

export const CreateInstanceTemplateParams = z.object({
	zone: ScalewayZone.describe("Zone for the Instance template"),
	name: z.string().min(1).describe("Name of the Instance template"),
	serverType: z.string().min(1).describe("Instance commercial type (e.g. PLAY2-NANO)"),
	projectId: z.string().uuid().optional().describe("Project ID (uses default if omitted)"),
	tags: z.array(z.string()).optional().describe("Tags for the template"),
	serverTags: z.array(z.string()).optional().describe("Tags applied to created Instances"),
	securityGroupId: z.string().uuid().optional().describe("Security group ID"),
	placementGroupId: z.string().uuid().optional().describe("Placement group ID"),
	volumes: z
		.array(VolumeTemplate)
		.optional()
		.describe("Volumes to create for each Instance (first one boots from image_label)"),
	privateNetworks: z
		.array(PrivateNetworkTemplate)
		.optional()
		.describe("Private Networks to attach"),
	filesystemIds: z.array(z.string().uuid()).optional().describe("Filesystem IDs to attach"),
	publicIpV4Count: z.number().int().nonnegative().optional().describe("Number of IPv4 addresses"),
	publicIpV6Count: z.number().int().nonnegative().optional().describe("Number of IPv6 addresses"),
	windowsRdpSshKeyId: z
		.string()
		.uuid()
		.optional()
		.describe("IAM SSH key ID used to encrypt the Windows Administrator password"),
});
export type CreateInstanceTemplateParams = z.infer<typeof CreateInstanceTemplateParams>;

export const UpdateInstanceTemplateParams = z.object({
	zone: ScalewayZone.describe("Zone of the Instance template"),
	instanceTemplateId: z.string().uuid().describe("ID of the Instance template to update"),
	name: z.string().min(1).optional().describe("New name"),
	serverType: z.string().min(1).optional().describe("New commercial type"),
	tags: z.array(z.string()).optional().describe("New tags"),
	serverTags: z.array(z.string()).optional().describe("New tags applied to created Instances"),
	securityGroupId: z.string().uuid().optional().describe("New security group ID"),
	placementGroupId: z.string().uuid().optional().describe("New placement group ID"),
	volumes: z.array(VolumeTemplate).optional().describe("Replacement volume list"),
	privateNetworks: z
		.array(PrivateNetworkTemplate)
		.optional()
		.describe("Replacement Private Network list"),
	filesystemIds: z.array(z.string().uuid()).optional().describe("New filesystem IDs"),
	publicIpV4Count: z.number().int().nonnegative().optional().describe("Number of IPv4 addresses"),
	publicIpV6Count: z.number().int().nonnegative().optional().describe("Number of IPv6 addresses"),
	windowsRdpSshKeyId: z.string().uuid().optional().describe("New Windows RDP SSH key ID"),
});
export type UpdateInstanceTemplateParams = z.infer<typeof UpdateInstanceTemplateParams>;

export const DeleteInstanceTemplateParams = z.object({
	zone: ScalewayZone.describe("Zone of the Instance template"),
	instanceTemplateId: z.string().uuid().describe("ID of the Instance template to delete"),
});
export type DeleteInstanceTemplateParams = z.infer<typeof DeleteInstanceTemplateParams>;

export const GetInstanceTemplateCloudInitParams = z.object({
	zone: ScalewayZone.describe("Zone of the Instance template"),
	instanceTemplateId: z.string().uuid().describe("ID of the Instance template"),
});
export type GetInstanceTemplateCloudInitParams = z.infer<typeof GetInstanceTemplateCloudInitParams>;

export const SetInstanceTemplateCloudInitParams = z.object({
	zone: ScalewayZone.describe("Zone of the Instance template"),
	instanceTemplateId: z.string().uuid().describe("ID of the Instance template"),
	content: z.string().describe("Cloud-init configuration content"),
});
export type SetInstanceTemplateCloudInitParams = z.infer<typeof SetInstanceTemplateCloudInitParams>;

// --- List response shapes ---

const TokenPage = z.object({
	next_page_token: z.string().nullable().optional(),
	total_count: z.number().int().nonnegative(),
});

export const ListInstanceGroupsResponse = TokenPage.extend({
	group_summaries: z.array(GroupSummary),
});
export type ListInstanceGroupsResponse = z.infer<typeof ListInstanceGroupsResponse>;

export const ListInstanceGroupEventsResponse = TokenPage.extend({ logs: z.array(Log) });
export type ListInstanceGroupEventsResponse = z.infer<typeof ListInstanceGroupEventsResponse>;

export const ListInstanceGroupServersResponse = TokenPage.extend({ servers: z.array(Server) });
export type ListInstanceGroupServersResponse = z.infer<typeof ListInstanceGroupServersResponse>;

export const ListInstanceGroupAlertsResponse = TokenPage.extend({ alerts: z.array(Alert) });
export type ListInstanceGroupAlertsResponse = z.infer<typeof ListInstanceGroupAlertsResponse>;

export const ListInstanceTemplatesResponse = TokenPage.extend({
	templates: z.array(TemplateSummary),
});
export type ListInstanceTemplatesResponse = z.infer<typeof ListInstanceTemplatesResponse>;
