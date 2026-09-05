/**
 * Contract tests for Scaleway Instance Autoscaling Groups API
 *
 * Validates request/response shapes against
 * specs/scaleway-api/autoscaling/api-reference.md
 * Parity matrix: tests/parity-matrix.json
 *
 * API: autoscaling v1alpha2 (zoned; v1alpha1 is dead and returns 404)
 *   GET/POST          /autoscaling/v1alpha2/zones/{zone}/groups
 *   GET/PATCH/DELETE  /autoscaling/v1alpha2/zones/{zone}/groups/{group_id}
 *   GET               /autoscaling/v1alpha2/zones/{zone}/logs?group_id=
 *   GET               /autoscaling/v1alpha2/zones/{zone}/servers?group_id=
 *   GET               /autoscaling/v1alpha2/zones/{zone}/alerts
 * Instance templates (referenced by groups) — Instance API v2alpha1:
 *   GET/POST          /instance/v2alpha1/zones/{zone}/templates
 *   GET/PATCH/DELETE  /instance/v2alpha1/zones/{zone}/templates/{template_id}
 *   GET/PUT           /instance/v2alpha1/zones/{zone}/templates/{template_id}/user-data/cloud-init
 */
import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
	Alert,
	AlertType,
	CreateInstanceGroupParams,
	CreateInstanceTemplateParams,
	DeleteInstanceGroupParams,
	DeleteInstanceTemplateParams,
	GetInstanceGroupParams,
	GetInstanceTemplateCloudInitParams,
	GetInstanceTemplateParams,
	Group,
	GroupStatus,
	GroupSummary,
	ListInstanceGroupAlertsParams,
	ListInstanceGroupAlertsResponse,
	ListInstanceGroupEventsParams,
	ListInstanceGroupEventsResponse,
	ListInstanceGroupServersParams,
	ListInstanceGroupServersResponse,
	ListInstanceGroupsParams,
	ListInstanceGroupsResponse,
	ListInstanceTemplatesParams,
	ListInstanceTemplatesResponse,
	LoadBalancerConfigurationSpec,
	Log,
	LogLevel,
	ScalingPolicySpec,
	SetInstanceTemplateCloudInitParams,
	Template,
	TemplateSummary,
	UpdateInstanceGroupParams,
	UpdateInstanceTemplateParams,
	UserData,
	VolumeTemplate,
} from "../../../src/tools/autoscaling/types.js";

const VALID_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const OTHER_UUID = "b2c3d4e5-f6a7-8901-bcde-f12345678901";
const ZONE = "fr-par-1";

const validAlert = {
	type: "quotas_exceeded" as const,
	opened_at: "2025-06-01T12:00:00Z",
	closed_at: null,
	group_id: VALID_UUID,
	failing_quotas: ["instances_count"],
};

const validScalingPolicy = {
	minimum_size: 2,
	maximum_size: 8,
	scale_out_cooldown: "300s",
	scale_in_cooldown: "600s",
	scale_in_step: 1,
	scale_out_step: 2,
	fixed_size: null,
	cpu_target: { target_avg_percent: 30 },
	memory_target: null,
};

const validLbConfiguration = {
	load_balancer_id: VALID_UUID,
	backends: [{ backend_id: OTHER_UUID, address_family: "ipv4" as const, private_network_id: null }],
	auto_healing: { enabled: true, grace_period: "300s" },
};

const validGroup = {
	id: VALID_UUID,
	project_id: VALID_UUID,
	name: "my-group",
	tags: ["prod"],
	created_at: "2025-06-01T12:00:00Z",
	updated_at: "2025-06-01T12:30:00Z",
	status: "active" as const,
	open_alerts: [validAlert],
	current_size: 3,
	target_size: 4,
	last_scale_out_at: "2025-06-01T12:20:00Z",
	last_scale_in_at: null,
	template_id: OTHER_UUID,
	scaling_policy: validScalingPolicy,
	load_balancer_configuration: validLbConfiguration,
};

const validGroupSummary = {
	project_id: VALID_UUID,
	id: VALID_UUID,
	name: "my-group",
	tags: [],
	status: "scaling_out" as const,
	created_at: "2025-06-01T12:00:00Z",
	updated_at: null,
	template_id: OTHER_UUID,
	load_balancer_id: VALID_UUID,
	current_size: 3,
	latest_open_alert: validAlert,
	minimum_size: 2,
	maximum_size: 8,
	scaling_policy_target_type: "cpu_target" as const,
	zone: ZONE,
};

const validLog = { timestamp: "2025-06-01T12:00:00Z", level: "info" as const, message: "ok" };

const validVolume = {
	volume_type: "sbs" as const,
	name: "boot",
	tags: [],
	size: 20_000_000_000,
	image_label: "ubuntu_noble",
	perf_iops: 5000,
};

const validTemplate = {
	project_id: VALID_UUID,
	id: OTHER_UUID,
	name: "my-template",
	tags: ["web"],
	server_tags: ["scaled"],
	server_type: "PLAY2-NANO",
	security_group_id: VALID_UUID,
	placement_group_id: null,
	public_ip_v4_count: 1,
	public_ip_v6_count: 0,
	volumes: [validVolume],
	private_networks: [{ private_network_id: VALID_UUID }],
	filesystem_ids: [],
	created_at: "2025-06-01T12:00:00Z",
	updated_at: "2025-06-01T12:30:00Z",
	windows_rdp_ssh_key_id: null,
	zone: ZONE,
};

// --- Autoscaling Group contracts ---

/**
 * API: GET /autoscaling/v1alpha2/zones/{zone}/groups
 * Spec: specs/scaleway-api/autoscaling/api-reference.md#list-groups
 */
describe("contract: ListGroups", () => {
	it("validates response shape (group_summaries + token pagination)", () => {
		const response = {
			group_summaries: [validGroupSummary],
			next_page_token: "tok",
			total_count: 1,
		};
		expect(() => ListInstanceGroupsResponse.parse(response)).not.toThrow();
	});

	it("validates last-page response without next_page_token", () => {
		expect(() =>
			ListInstanceGroupsResponse.parse({ group_summaries: [], total_count: 0 }),
		).not.toThrow();
	});

	it("rejects the v1alpha1 response key", () => {
		expect(() =>
			ListInstanceGroupsResponse.parse({ instance_groups: [], total_count: 0 }),
		).toThrow();
	});

	it("validates request with all filters", () => {
		expect(() =>
			ListInstanceGroupsParams.parse({
				zone: ZONE,
				projectId: VALID_UUID,
				orderBy: "created_at_asc",
				templateId: VALID_UUID,
				loadBalancerId: OTHER_UUID,
				pageSize: 100,
				pageToken: "tok",
			}),
		).not.toThrow();
	});

	it("rejects invalid order_by", () => {
		expect(() => ListInstanceGroupsParams.parse({ zone: ZONE, orderBy: "name_asc" })).toThrow();
	});

	it("validates every GroupSummary target type", () => {
		for (const t of [
			"unknown_scaling_policy_target_type",
			"fixed_size",
			"cpu_target",
			"memory_target",
		]) {
			expect(() =>
				GroupSummary.parse({ ...validGroupSummary, scaling_policy_target_type: t }),
			).not.toThrow();
		}
	});

	it("allows null latest_open_alert and load_balancer_id in a summary", () => {
		expect(() =>
			GroupSummary.parse({ ...validGroupSummary, latest_open_alert: null, load_balancer_id: null }),
		).not.toThrow();
	});
});

/**
 * API: GET /autoscaling/v1alpha2/zones/{zone}/groups/{group_id}
 * Spec: specs/scaleway-api/autoscaling/api-reference.md#get-group
 */
describe("contract: GetGroup / Group entity", () => {
	it("validates a full group", () => {
		expect(() => Group.parse(validGroup)).not.toThrow();
	});

	it("allows null scaling_policy and load_balancer_configuration", () => {
		expect(() =>
			Group.parse({ ...validGroup, scaling_policy: null, load_balancer_configuration: null }),
		).not.toThrow();
	});

	it("validates every group status", () => {
		for (const status of GroupStatus.options) {
			expect(() => Group.parse({ ...validGroup, status })).not.toThrow();
		}
		expect(GroupStatus.options).toContain("scaling_failure");
	});

	it("rejects an unknown status", () => {
		expect(() => Group.parse({ ...validGroup, status: "ready" })).toThrow();
	});

	it("validates request shape", () => {
		expect(() =>
			GetInstanceGroupParams.parse({ zone: ZONE, instanceGroupId: VALID_UUID }),
		).not.toThrow();
		expect(() => GetInstanceGroupParams.parse({ zone: ZONE, instanceGroupId: "x" })).toThrow();
	});
});

/**
 * API: POST /autoscaling/v1alpha2/zones/{zone}/groups
 * Spec: specs/scaleway-api/autoscaling/api-reference.md#create-group
 */
describe("contract: CreateGroup request", () => {
	it("validates minimal create (name + template_id)", () => {
		expect(() =>
			CreateInstanceGroupParams.parse({ zone: ZONE, name: "g", templateId: VALID_UUID }),
		).not.toThrow();
	});

	it("validates full create with scaling policy and load balancer spec", () => {
		expect(() =>
			CreateInstanceGroupParams.parse({
				zone: ZONE,
				name: "g",
				templateId: VALID_UUID,
				projectId: VALID_UUID,
				tags: ["t"],
				scalingPolicySpec: {
					minimum_size: 1,
					maximum_size: 5,
					scale_out_cooldown: "300s",
					scale_in_cooldown: "300s",
					scale_in_step: 1,
					scale_out_step: 1,
					memory_target: { target_avg_percent: 70 },
				},
				loadBalancerConfigurationSpec: {
					load_balancer_id: VALID_UUID,
					backends: [
						{ backend_id: OTHER_UUID, address_family: "ipv6", private_network_id: VALID_UUID },
					],
					auto_healing: { enabled: true, grace_period: "120s" },
				},
			}),
		).not.toThrow();
	});

	it("rejects missing required fields", () => {
		expect(() => CreateInstanceGroupParams.parse({ zone: ZONE, name: "g" })).toThrow();
		expect(() => CreateInstanceGroupParams.parse({ zone: ZONE, templateId: VALID_UUID })).toThrow();
	});

	it("rejects the v1alpha1 capacity field", () => {
		const parsedResult = CreateInstanceGroupParams.parse({
			zone: ZONE,
			name: "g",
			templateId: VALID_UUID,
			capacity: { min_replicas: 1, max_replicas: 3 },
		});
		expect(parsedResult).not.toHaveProperty("capacity");
	});
});

/**
 * Schema: ScalingPolicySpec (one-of target)
 * Spec: specs/scaleway-api/autoscaling/api-reference.md#scalingpolicyspec-request
 */
describe("contract: ScalingPolicySpec", () => {
	it("accepts each target on its own", () => {
		expect(() => ScalingPolicySpec.parse({ fixed_size: { size: 3 } })).not.toThrow();
		expect(() => ScalingPolicySpec.parse({ cpu_target: { target_avg_percent: 50 } })).not.toThrow();
		expect(() =>
			ScalingPolicySpec.parse({ memory_target: { target_avg_percent: 0 } }),
		).not.toThrow();
		expect(() => ScalingPolicySpec.parse({})).not.toThrow();
	});

	it("rejects more than one target", () => {
		expect(() =>
			ScalingPolicySpec.parse({
				fixed_size: { size: 3 },
				cpu_target: { target_avg_percent: 50 },
			}),
		).toThrow(/At most one/);
	});

	it("rejects target percentages outside 0-100", () => {
		expect(() => ScalingPolicySpec.parse({ cpu_target: { target_avg_percent: 101 } })).toThrow();
		expect(() => ScalingPolicySpec.parse({ memory_target: { target_avg_percent: -1 } })).toThrow();
	});
});

/**
 * Schema: LoadBalancerConfigurationSpec
 * Spec: specs/scaleway-api/autoscaling/api-reference.md#loadbalancerconfigurationspec-request
 */
describe("contract: LoadBalancerConfigurationSpec", () => {
	it("requires backends and validates address families", () => {
		expect(() => LoadBalancerConfigurationSpec.parse({ load_balancer_id: VALID_UUID })).toThrow();
		for (const family of ["unknown_address_family", "ipv4", "ipv6"]) {
			expect(() =>
				LoadBalancerConfigurationSpec.parse({
					backends: [{ backend_id: VALID_UUID, address_family: family }],
				}),
			).not.toThrow();
		}
		expect(() =>
			LoadBalancerConfigurationSpec.parse({
				backends: [{ backend_id: VALID_UUID, address_family: "ipv5" }],
			}),
		).toThrow();
	});
});

/**
 * API: PATCH /autoscaling/v1alpha2/zones/{zone}/groups/{group_id}
 * Spec: specs/scaleway-api/autoscaling/api-reference.md#update-group
 */
describe("contract: UpdateGroup request", () => {
	it("validates update with all optional fields", () => {
		expect(() =>
			UpdateInstanceGroupParams.parse({
				zone: ZONE,
				instanceGroupId: VALID_UUID,
				name: "n",
				tags: ["t"],
				templateId: OTHER_UUID,
				scalingPolicySpec: { fixed_size: { size: 2 } },
				loadBalancerConfigurationSpec: { backends: [] },
			}),
		).not.toThrow();
	});

	it("validates update with no optional fields", () => {
		expect(() =>
			UpdateInstanceGroupParams.parse({ zone: ZONE, instanceGroupId: VALID_UUID }),
		).not.toThrow();
	});
});

/**
 * API: DELETE /autoscaling/v1alpha2/zones/{zone}/groups/{group_id} -> 200 Group
 * Spec: specs/scaleway-api/autoscaling/api-reference.md#delete-group
 */
describe("contract: DeleteGroup request", () => {
	it("validates delete", () => {
		expect(() =>
			DeleteInstanceGroupParams.parse({ zone: ZONE, instanceGroupId: VALID_UUID }),
		).not.toThrow();
	});

	it("rejects missing id", () => {
		expect(() => DeleteInstanceGroupParams.parse({ zone: ZONE })).toThrow();
	});

	it("response is a Group in deleting status", () => {
		expect(() => Group.parse({ ...validGroup, status: "deleting" })).not.toThrow();
	});
});

/**
 * API: GET /autoscaling/v1alpha2/zones/{zone}/logs?group_id=
 * Spec: specs/scaleway-api/autoscaling/api-reference.md#list-logs
 */
describe("contract: ListLogs (instance group events)", () => {
	it("validates response shape", () => {
		expect(() =>
			ListInstanceGroupEventsResponse.parse({
				logs: [validLog],
				next_page_token: null,
				total_count: 1,
			}),
		).not.toThrow();
	});

	it("validates all log levels", () => {
		for (const level of LogLevel.options) {
			expect(() => Log.parse({ ...validLog, level })).not.toThrow();
		}
		expect(() => Log.parse({ ...validLog, level: "success" })).toThrow();
	});

	it("allows null timestamp", () => {
		expect(() => Log.parse({ ...validLog, timestamp: null })).not.toThrow();
	});

	it("validates request shape with RFC 3339 time window", () => {
		expect(() =>
			ListInstanceGroupEventsParams.parse({
				zone: ZONE,
				instanceGroupId: VALID_UUID,
				startTime: "2025-06-01T00:00:00Z",
				endTime: "2025-06-02T00:00:00+02:00",
				pageSize: 50,
				pageToken: "tok",
			}),
		).not.toThrow();
	});

	it("requires group id and rejects non-RFC 3339 times", () => {
		expect(() => ListInstanceGroupEventsParams.parse({ zone: ZONE })).toThrow();
		expect(() =>
			ListInstanceGroupEventsParams.parse({
				zone: ZONE,
				instanceGroupId: VALID_UUID,
				startTime: "yesterday",
			}),
		).toThrow();
	});
});

/**
 * API: GET /autoscaling/v1alpha2/zones/{zone}/servers?group_id=
 * Spec: specs/scaleway-api/autoscaling/api-reference.md#list-servers
 */
describe("contract: ListServers", () => {
	it("validates response shape", () => {
		expect(() =>
			ListInstanceGroupServersResponse.parse({
				servers: [{ server_id: VALID_UUID }],
				next_page_token: "tok",
				total_count: 1,
			}),
		).not.toThrow();
	});

	it("rejects a non-UUID server_id", () => {
		expect(() =>
			ListInstanceGroupServersResponse.parse({ servers: [{ server_id: "srv" }], total_count: 1 }),
		).toThrow();
	});

	it("validates request shape and requires group id", () => {
		expect(() =>
			ListInstanceGroupServersParams.parse({ zone: ZONE, instanceGroupId: VALID_UUID }),
		).not.toThrow();
		expect(() => ListInstanceGroupServersParams.parse({ zone: ZONE })).toThrow();
	});
});

/**
 * API: GET /autoscaling/v1alpha2/zones/{zone}/alerts
 * Spec: specs/scaleway-api/autoscaling/api-reference.md#list-alerts
 */
describe("contract: ListAlerts", () => {
	it("validates response shape", () => {
		expect(() =>
			ListInstanceGroupAlertsResponse.parse({ alerts: [validAlert], total_count: 1 }),
		).not.toThrow();
	});

	it("validates every alert type", () => {
		for (const type of AlertType.options) {
			expect(() => Alert.parse({ ...validAlert, type })).not.toThrow();
		}
		expect(AlertType.options).toHaveLength(11);
	});

	it("allows a closed alert", () => {
		expect(() =>
			Alert.parse({ ...validAlert, closed_at: "2025-06-01T13:00:00Z", failing_quotas: [] }),
		).not.toThrow();
	});

	it("validates request scoped by group or by project", () => {
		expect(() =>
			ListInstanceGroupAlertsParams.parse({ zone: ZONE, instanceGroupId: VALID_UUID }),
		).not.toThrow();
		expect(() =>
			ListInstanceGroupAlertsParams.parse({ zone: ZONE, projectId: VALID_UUID }),
		).not.toThrow();
		expect(() => ListInstanceGroupAlertsParams.parse({ zone: ZONE })).not.toThrow();
	});
});

// --- Instance Template contracts (Instance API v2alpha1) ---

/**
 * API: GET /instance/v2alpha1/zones/{zone}/templates
 * Spec: specs/scaleway-api/autoscaling/api-reference.md#list-templates
 */
describe("contract: ListTemplates", () => {
	it("validates response shape with template summaries", () => {
		const {
			volumes: _v,
			private_networks: _p,
			windows_rdp_ssh_key_id: _w,
			...summary
		} = validTemplate;
		expect(() =>
			ListInstanceTemplatesResponse.parse({
				templates: [summary],
				next_page_token: null,
				total_count: 1,
			}),
		).not.toThrow();
		expect(() => TemplateSummary.parse(summary)).not.toThrow();
	});

	it("rejects the v1alpha1 response key", () => {
		expect(() =>
			ListInstanceTemplatesResponse.parse({ instance_templates: [], total_count: 0 }),
		).toThrow();
	});

	it("validates request with all filters", () => {
		expect(() =>
			ListInstanceTemplatesParams.parse({
				zone: ZONE,
				projectId: VALID_UUID,
				orderBy: "updated_at_asc",
				name: "web",
				tags: ["a"],
				templateIds: [VALID_UUID],
				pageSize: 1,
				pageToken: "t",
			}),
		).not.toThrow();
	});

	it("rejects invalid order_by", () => {
		expect(() => ListInstanceTemplatesParams.parse({ zone: ZONE, orderBy: "name_asc" })).toThrow();
	});
});

/**
 * API: GET /instance/v2alpha1/zones/{zone}/templates/{template_id}
 * Spec: specs/scaleway-api/autoscaling/api-reference.md#get-template
 */
describe("contract: GetTemplate / Template entity", () => {
	it("validates a full template", () => {
		expect(() => Template.parse(validTemplate)).not.toThrow();
	});

	it("validates every volume type", () => {
		for (const volume_type of ["unknown_volume_type", "l_ssd", "sbs", "scratch"]) {
			expect(() => VolumeTemplate.parse({ ...validVolume, volume_type })).not.toThrow();
		}
	});

	it("rejects a volume with both base_snapshot_id and image_label", () => {
		expect(() => VolumeTemplate.parse({ ...validVolume, base_snapshot_id: VALID_UUID })).toThrow(
			/At most one/,
		);
	});

	it("accepts a volume from a snapshot", () => {
		expect(() =>
			VolumeTemplate.parse({ volume_type: "sbs", name: "data", base_snapshot_id: VALID_UUID }),
		).not.toThrow();
	});

	it("validates request shape", () => {
		expect(() =>
			GetInstanceTemplateParams.parse({ zone: ZONE, instanceTemplateId: VALID_UUID }),
		).not.toThrow();
	});
});

/**
 * API: POST /instance/v2alpha1/zones/{zone}/templates
 * Spec: specs/scaleway-api/autoscaling/api-reference.md#create-template
 */
describe("contract: CreateTemplate request", () => {
	it("validates minimal create (name + server_type)", () => {
		expect(() =>
			CreateInstanceTemplateParams.parse({ zone: ZONE, name: "t", serverType: "PLAY2-NANO" }),
		).not.toThrow();
	});

	it("validates full create", () => {
		expect(() =>
			CreateInstanceTemplateParams.parse({
				zone: ZONE,
				name: "t",
				serverType: "PLAY2-NANO",
				projectId: VALID_UUID,
				tags: ["a"],
				serverTags: ["b"],
				securityGroupId: VALID_UUID,
				placementGroupId: OTHER_UUID,
				volumes: [validVolume],
				privateNetworks: [{ private_network_id: VALID_UUID }],
				filesystemIds: [OTHER_UUID],
				publicIpV4Count: 1,
				publicIpV6Count: 1,
				windowsRdpSshKeyId: VALID_UUID,
			}),
		).not.toThrow();
	});

	it("rejects missing server_type and the v1alpha1 commercial_type name", () => {
		expect(() => CreateInstanceTemplateParams.parse({ zone: ZONE, name: "t" })).toThrow();
		expect(() =>
			CreateInstanceTemplateParams.parse({ zone: ZONE, name: "t", commercialType: "DEV1-S" }),
		).toThrow();
	});
});

/**
 * API: PATCH /instance/v2alpha1/zones/{zone}/templates/{template_id}
 * Spec: specs/scaleway-api/autoscaling/api-reference.md#update-template
 */
describe("contract: UpdateTemplate request", () => {
	it("validates update with all optional fields", () => {
		expect(() =>
			UpdateInstanceTemplateParams.parse({
				zone: ZONE,
				instanceTemplateId: VALID_UUID,
				name: "n",
				serverType: "PLAY2-MICRO",
				tags: [],
				serverTags: [],
				securityGroupId: VALID_UUID,
				placementGroupId: VALID_UUID,
				volumes: [validVolume],
				privateNetworks: [],
				filesystemIds: [],
				publicIpV4Count: 0,
				publicIpV6Count: 0,
				windowsRdpSshKeyId: VALID_UUID,
			}),
		).not.toThrow();
	});

	it("validates update with no optional fields", () => {
		expect(() =>
			UpdateInstanceTemplateParams.parse({ zone: ZONE, instanceTemplateId: VALID_UUID }),
		).not.toThrow();
	});
});

/**
 * API: DELETE /instance/v2alpha1/zones/{zone}/templates/{template_id} -> 204
 * Spec: specs/scaleway-api/autoscaling/api-reference.md#delete-template
 */
describe("contract: DeleteTemplate request", () => {
	it("validates delete", () => {
		expect(() =>
			DeleteInstanceTemplateParams.parse({ zone: ZONE, instanceTemplateId: VALID_UUID }),
		).not.toThrow();
	});

	it("rejects missing id", () => {
		expect(() => DeleteInstanceTemplateParams.parse({ zone: ZONE })).toThrow();
	});
});

/**
 * API: GET/PUT /instance/v2alpha1/zones/{zone}/templates/{template_id}/user-data/cloud-init
 * Spec: specs/scaleway-api/autoscaling/api-reference.md#get-template-cloud-init
 */
describe("contract: Template cloud-init", () => {
	it("validates GET request and UserData response", () => {
		expect(() =>
			GetInstanceTemplateCloudInitParams.parse({ zone: ZONE, instanceTemplateId: VALID_UUID }),
		).not.toThrow();
		expect(() => UserData.parse({ key: "cloud-init", content: "#cloud-config" })).not.toThrow();
		expect(() => UserData.parse({ key: "cloud-init" })).toThrow();
	});

	it("validates PUT request and requires content", () => {
		expect(() =>
			SetInstanceTemplateCloudInitParams.parse({
				zone: ZONE,
				instanceTemplateId: VALID_UUID,
				content: "#cloud-config",
			}),
		).not.toThrow();
		expect(() =>
			SetInstanceTemplateCloudInitParams.parse({ zone: ZONE, instanceTemplateId: VALID_UUID }),
		).toThrow();
	});
});

// --- Pagination & zone contracts ---

describe("contract: token pagination & zone", () => {
	it("has no default page/pageSize (token pagination)", () => {
		const result = ListInstanceGroupsParams.parse({ zone: ZONE });
		expect(result).not.toHaveProperty("page");
		expect(result.pageSize).toBeUndefined();
		expect(result.pageToken).toBeUndefined();
	});

	it("rejects page size outside 1-100", () => {
		expect(() => ListInstanceGroupsParams.parse({ zone: ZONE, pageSize: 101 })).toThrow();
		expect(() => ListInstanceGroupsParams.parse({ zone: ZONE, pageSize: 0 })).toThrow();
		expect(() => ListInstanceTemplatesParams.parse({ zone: ZONE, pageSize: 101 })).toThrow();
	});

	it("rejects invalid zone format", () => {
		expect(() => ListInstanceGroupsParams.parse({ zone: "fr-par" })).toThrow();
		expect(() => ListInstanceGroupsParams.parse({ zone: "fr-par-3" })).not.toThrow();
	});

	it("requires zone for all operations", () => {
		const schema = z.object({ zone: ListInstanceGroupsParams.shape.zone });
		expect(() => schema.parse({})).toThrow();
	});
});
