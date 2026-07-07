import { z } from "zod";
import { PaginationParams, ScalewayZone } from "../../shared/types.js";

// --- Enums ---

export const InstanceTemplateStatus = z.enum(["unknown_status", "ready", "error"]);
export type InstanceTemplateStatus = z.infer<typeof InstanceTemplateStatus>;

export const VolumeType = z.enum(["unknown_volume_type", "l_ssd", "sbs"]);
export type VolumeType = z.infer<typeof VolumeType>;

export const InstancePolicyAction = z.enum(["unknown_instance_action", "scale_up", "scale_down"]);
export type InstancePolicyAction = z.infer<typeof InstancePolicyAction>;

export const InstancePolicyType = z.enum([
	"unknown_instance_type",
	"flat_count",
	"percent_of_total_group",
	"set_total_group",
]);
export type InstancePolicyType = z.infer<typeof InstancePolicyType>;

export const MetricManagedMetric = z.enum([
	"managed_metric_unknown",
	"managed_metric_instance_cpu",
	"managed_metric_instance_network_in",
	"managed_metric_instance_network_out",
	"managed_loadbalancer_backend_connections_rate",
	"managed_loadbalancer_backend_throughput",
]);
export type MetricManagedMetric = z.infer<typeof MetricManagedMetric>;

export const MetricOperator = z.enum([
	"operator_unknown",
	"operator_greater_than",
	"operator_less_than",
]);
export type MetricOperator = z.infer<typeof MetricOperator>;

export const MetricAggregate = z.enum([
	"aggregate_unknown",
	"aggregate_average",
	"aggregate_max",
	"aggregate_min",
	"aggregate_sum",
]);
export type MetricAggregate = z.infer<typeof MetricAggregate>;

export const InstanceGroupEventSource = z.enum([
	"unknown_source",
	"watcher",
	"scaler",
	"instance_manager",
	"supervisor",
]);
export type InstanceGroupEventSource = z.infer<typeof InstanceGroupEventSource>;

export const InstanceGroupEventLevel = z.enum(["unknown_level", "info", "success", "error"]);
export type InstanceGroupEventLevel = z.infer<typeof InstanceGroupEventLevel>;

export const ListOrderBy = z.enum(["created_at_asc", "created_at_desc"]);
export type ListOrderBy = z.infer<typeof ListOrderBy>;

// --- Nested value objects ---

export const Capacity = z.object({
	max_replicas: z.number().int().nonnegative(),
	min_replicas: z.number().int().nonnegative(),
	cooldown_delay: z.string().nullable().optional(),
});
export type Capacity = z.infer<typeof Capacity>;

export const Loadbalancer = z.object({
	id: z.string().uuid(),
	backend_ids: z.array(z.string()),
	private_network_id: z.string(),
});
export type Loadbalancer = z.infer<typeof Loadbalancer>;

export const VolumeInstanceTemplate = z.object({
	name: z.string(),
	perf_iops: z.number().int().nonnegative().nullable().optional(),
	from_empty: z.object({ size: z.number().int().nonnegative() }).optional(),
	from_snapshot: z
		.object({
			snapshot_id: z.string(),
			size: z.number().int().nonnegative().optional(),
		})
		.optional(),
	tags: z.array(z.string()).optional(),
	boot: z.boolean().optional(),
	volume_type: VolumeType,
});
export type VolumeInstanceTemplate = z.infer<typeof VolumeInstanceTemplate>;

export const Metric = z.object({
	name: z.string(),
	managed_metric: MetricManagedMetric.optional(),
	cockpit_metric_name: z.string().optional(),
	operator: MetricOperator,
	aggregate: MetricAggregate,
	sampling_range_min: z.number().int().nonnegative(),
	threshold: z.number(),
});
export type Metric = z.infer<typeof Metric>;

// --- Response entities ---

export const InstanceGroup = z.object({
	id: z.string().uuid(),
	project_id: z.string().uuid(),
	name: z.string(),
	tags: z.array(z.string()),
	instance_template_id: z.string().uuid(),
	capacity: Capacity,
	loadbalancer: Loadbalancer.nullable(),
	error_messages: z.array(z.string()),
	created_at: z.string(),
	updated_at: z.string(),
	zone: z.string(),
});
export type InstanceGroup = z.infer<typeof InstanceGroup>;

export const InstanceTemplate = z.object({
	id: z.string().uuid(),
	commercial_type: z.string(),
	image_id: z.string().nullable(),
	volumes: z.record(z.string(), VolumeInstanceTemplate),
	tags: z.array(z.string()),
	security_group_id: z.string().nullable(),
	placement_group_id: z.string().nullable(),
	public_ips_v4_count: z.number().int().nullable(),
	public_ips_v6_count: z.number().int().nullable(),
	project_id: z.string().uuid(),
	name: z.string(),
	private_network_ids: z.array(z.string()),
	status: InstanceTemplateStatus,
	cloud_init: z.string(),
	created_at: z.string(),
	updated_at: z.string(),
	zone: z.string(),
});
export type InstanceTemplate = z.infer<typeof InstanceTemplate>;

export const InstancePolicy = z.object({
	id: z.string().uuid(),
	name: z.string(),
	metric: Metric,
	action: InstancePolicyAction,
	type: InstancePolicyType,
	value: z.number().int().nonnegative(),
	priority: z.number().int().nonnegative(),
	instance_group_id: z.string().uuid(),
	zone: z.string(),
});
export type InstancePolicy = z.infer<typeof InstancePolicy>;

export const InstanceGroupEvent = z.object({
	id: z.string().uuid(),
	source: InstanceGroupEventSource,
	level: InstanceGroupEventLevel,
	name: z.string(),
	details: z.string().nullable(),
	created_at: z.string(),
});
export type InstanceGroupEvent = z.infer<typeof InstanceGroupEvent>;

// --- Instance Group tool params ---

export const ListInstanceGroupsParams = PaginationParams.extend({
	zone: ScalewayZone.describe("Zone to list instance groups in (e.g. fr-par-1)"),
	orderBy: ListOrderBy.optional().describe("Order results by field"),
});
export type ListInstanceGroupsParams = z.infer<typeof ListInstanceGroupsParams>;

export const GetInstanceGroupParams = z.object({
	zone: ScalewayZone.describe("Zone of the instance group"),
	instanceGroupId: z.string().uuid().describe("ID of the instance group"),
});
export type GetInstanceGroupParams = z.infer<typeof GetInstanceGroupParams>;

export const CreateInstanceGroupParams = z.object({
	zone: ScalewayZone.describe("Zone for the instance group"),
	name: z.string().min(1).describe("Name of the instance group"),
	templateId: z.string().uuid().describe("ID of the instance template to scale from"),
	capacity: Capacity.describe("Min/max replicas and cooldown configuration"),
	projectId: z.string().uuid().optional().describe("Project ID (uses default if omitted)"),
	tags: z.array(z.string()).optional().describe("Tags for the instance group"),
	loadbalancer: Loadbalancer.optional().describe("Load balancer configuration"),
});
export type CreateInstanceGroupParams = z.infer<typeof CreateInstanceGroupParams>;

export const UpdateInstanceGroupParams = z.object({
	zone: ScalewayZone.describe("Zone of the instance group"),
	instanceGroupId: z.string().uuid().describe("ID of the instance group to update"),
	name: z.string().min(1).optional().describe("New name"),
	tags: z.array(z.string()).optional().describe("New tags"),
	capacity: Capacity.optional().describe("New capacity configuration"),
	loadbalancer: Loadbalancer.optional().describe("New load balancer configuration"),
});
export type UpdateInstanceGroupParams = z.infer<typeof UpdateInstanceGroupParams>;

export const DeleteInstanceGroupParams = z.object({
	zone: ScalewayZone.describe("Zone of the instance group"),
	instanceGroupId: z.string().uuid().describe("ID of the instance group to delete"),
});
export type DeleteInstanceGroupParams = z.infer<typeof DeleteInstanceGroupParams>;

export const ListInstanceGroupEventsParams = PaginationParams.extend({
	zone: ScalewayZone.describe("Zone of the instance group"),
	instanceGroupId: z.string().uuid().describe("ID of the instance group"),
	orderBy: ListOrderBy.optional().describe("Order results by field"),
});
export type ListInstanceGroupEventsParams = z.infer<typeof ListInstanceGroupEventsParams>;

// --- Instance Template tool params ---

export const ListInstanceTemplatesParams = PaginationParams.extend({
	zone: ScalewayZone.describe("Zone to list instance templates in (e.g. fr-par-1)"),
	orderBy: ListOrderBy.optional().describe("Order results by field"),
});
export type ListInstanceTemplatesParams = z.infer<typeof ListInstanceTemplatesParams>;

export const GetInstanceTemplateParams = z.object({
	zone: ScalewayZone.describe("Zone of the instance template"),
	instanceTemplateId: z.string().uuid().describe("ID of the instance template"),
});
export type GetInstanceTemplateParams = z.infer<typeof GetInstanceTemplateParams>;

export const CreateInstanceTemplateParams = z.object({
	zone: ScalewayZone.describe("Zone for the instance template"),
	name: z.string().min(1).describe("Name of the instance template"),
	commercialType: z.string().min(1).describe("Instance commercial type (e.g. DEV1-S)"),
	imageId: z.string().optional().describe("Image ID to boot from"),
	volumes: z
		.record(z.string(), VolumeInstanceTemplate)
		.optional()
		.describe("Map of volume key to volume configuration"),
	tags: z.array(z.string()).optional().describe("Tags for the template"),
	securityGroupId: z.string().uuid().optional().describe("Security group ID"),
	placementGroupId: z.string().uuid().optional().describe("Placement group ID"),
	publicIpsV4Count: z.number().int().nonnegative().optional().describe("Number of IPv4 addresses"),
	publicIpsV6Count: z.number().int().nonnegative().optional().describe("Number of IPv6 addresses"),
	projectId: z.string().uuid().optional().describe("Project ID (uses default if omitted)"),
	privateNetworkIds: z.array(z.string()).optional().describe("Private network IDs to attach"),
	cloudInit: z.string().optional().describe("Base64-encoded cloud-init configuration"),
});
export type CreateInstanceTemplateParams = z.infer<typeof CreateInstanceTemplateParams>;

export const UpdateInstanceTemplateParams = z.object({
	zone: ScalewayZone.describe("Zone of the instance template"),
	instanceTemplateId: z.string().uuid().describe("ID of the instance template to update"),
	name: z.string().min(1).optional().describe("New name"),
	commercialType: z.string().min(1).optional().describe("New commercial type"),
	imageId: z.string().optional().describe("New image ID"),
	volumes: z
		.record(z.string(), VolumeInstanceTemplate)
		.optional()
		.describe("New map of volume configurations"),
	tags: z.array(z.string()).optional().describe("New tags"),
	securityGroupId: z.string().uuid().optional().describe("New security group ID"),
	placementGroupId: z.string().uuid().optional().describe("New placement group ID"),
	publicIpsV4Count: z.number().int().nonnegative().optional().describe("Number of IPv4 addresses"),
	publicIpsV6Count: z.number().int().nonnegative().optional().describe("Number of IPv6 addresses"),
	privateNetworkIds: z.array(z.string()).optional().describe("Private network IDs to attach"),
	cloudInit: z.string().optional().describe("Base64-encoded cloud-init configuration"),
});
export type UpdateInstanceTemplateParams = z.infer<typeof UpdateInstanceTemplateParams>;

export const DeleteInstanceTemplateParams = z.object({
	zone: ScalewayZone.describe("Zone of the instance template"),
	instanceTemplateId: z.string().uuid().describe("ID of the instance template to delete"),
});
export type DeleteInstanceTemplateParams = z.infer<typeof DeleteInstanceTemplateParams>;

// --- Instance Policy tool params ---

export const ListInstancePoliciesParams = PaginationParams.extend({
	zone: ScalewayZone.describe("Zone to list scaling policies in (e.g. fr-par-1)"),
	instanceGroupId: z.string().uuid().optional().describe("Filter by instance group ID"),
	orderBy: ListOrderBy.optional().describe("Order results by field"),
});
export type ListInstancePoliciesParams = z.infer<typeof ListInstancePoliciesParams>;

export const GetInstancePolicyParams = z.object({
	zone: ScalewayZone.describe("Zone of the scaling policy"),
	instancePolicyId: z.string().uuid().describe("ID of the scaling policy"),
});
export type GetInstancePolicyParams = z.infer<typeof GetInstancePolicyParams>;

export const CreateInstancePolicyParams = z.object({
	zone: ScalewayZone.describe("Zone for the scaling policy"),
	name: z.string().min(1).describe("Name of the scaling policy"),
	metric: Metric.describe("Metric definition that triggers the scaling action"),
	action: InstancePolicyAction.describe("Scaling action to perform"),
	type: InstancePolicyType.describe("How the value is interpreted"),
	value: z.number().int().nonnegative().describe("Scaling amount"),
	priority: z.number().int().nonnegative().describe("Policy priority (lower runs first)"),
	instanceGroupId: z.string().uuid().describe("ID of the instance group this policy applies to"),
});
export type CreateInstancePolicyParams = z.infer<typeof CreateInstancePolicyParams>;

export const UpdateInstancePolicyParams = z.object({
	zone: ScalewayZone.describe("Zone of the scaling policy"),
	instancePolicyId: z.string().uuid().describe("ID of the scaling policy to update"),
	name: z.string().min(1).optional().describe("New name"),
	metric: Metric.optional().describe("New metric definition"),
	action: InstancePolicyAction.optional().describe("New scaling action"),
	type: InstancePolicyType.optional().describe("New value interpretation"),
	value: z.number().int().nonnegative().optional().describe("New scaling amount"),
	priority: z.number().int().nonnegative().optional().describe("New priority"),
});
export type UpdateInstancePolicyParams = z.infer<typeof UpdateInstancePolicyParams>;

export const DeleteInstancePolicyParams = z.object({
	zone: ScalewayZone.describe("Zone of the scaling policy"),
	instancePolicyId: z.string().uuid().describe("ID of the scaling policy to delete"),
});
export type DeleteInstancePolicyParams = z.infer<typeof DeleteInstancePolicyParams>;

// --- List response shapes ---

export const ListInstanceGroupsResponse = z.object({
	instance_groups: z.array(InstanceGroup),
	total_count: z.number().int().nonnegative(),
});
export type ListInstanceGroupsResponse = z.infer<typeof ListInstanceGroupsResponse>;

export const ListInstanceTemplatesResponse = z.object({
	instance_templates: z.array(InstanceTemplate),
	total_count: z.number().int().nonnegative(),
});
export type ListInstanceTemplatesResponse = z.infer<typeof ListInstanceTemplatesResponse>;

export const ListInstancePoliciesResponse = z.object({
	policies: z.array(InstancePolicy),
	total_count: z.number().int().nonnegative(),
});
export type ListInstancePoliciesResponse = z.infer<typeof ListInstancePoliciesResponse>;

export const ListInstanceGroupEventsResponse = z.object({
	instance_events: z.array(InstanceGroupEvent),
	total_count: z.number().int().nonnegative(),
});
export type ListInstanceGroupEventsResponse = z.infer<typeof ListInstanceGroupEventsResponse>;
