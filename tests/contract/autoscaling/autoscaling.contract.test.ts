/**
 * Contract tests for Scaleway Instance Scaling Groups (Autoscaling) API
 *
 * Validates request/response shapes against
 * specs/scaleway-api/autoscaling/api-reference.md
 * Parity matrix: tests/parity-matrix.json
 *
 * API: autoscaling v1alpha1 (zoned) — GET/POST/PATCH/DELETE
 *   /autoscaling/v1alpha1/zones/{zone}/instance-groups
 *   /autoscaling/v1alpha1/zones/{zone}/instance-templates
 *   /autoscaling/v1alpha1/zones/{zone}/instance-policies
 */
import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
	CreateInstanceGroupParams,
	CreateInstancePolicyParams,
	CreateInstanceTemplateParams,
	DeleteInstanceGroupParams,
	DeleteInstancePolicyParams,
	DeleteInstanceTemplateParams,
	GetInstanceGroupParams,
	GetInstancePolicyParams,
	GetInstanceTemplateParams,
	InstanceGroup,
	InstanceGroupEvent,
	InstancePolicy,
	InstanceTemplate,
	ListInstanceGroupEventsParams,
	ListInstanceGroupEventsResponse,
	ListInstanceGroupsParams,
	ListInstanceGroupsResponse,
	ListInstancePoliciesParams,
	ListInstancePoliciesResponse,
	ListInstanceTemplatesParams,
	ListInstanceTemplatesResponse,
	Metric,
	UpdateInstanceGroupParams,
	UpdateInstancePolicyParams,
	UpdateInstanceTemplateParams,
} from "../../../src/tools/autoscaling/types.js";

const VALID_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const ZONE = "fr-par-1";

const validCapacity = { max_replicas: 5, min_replicas: 1, cooldown_delay: "300s" };
const validLoadbalancer = {
	id: VALID_UUID,
	backend_ids: ["backend-1"],
	private_network_id: "pn-1",
};

const validInstanceGroup = {
	id: VALID_UUID,
	project_id: VALID_UUID,
	name: "my-group",
	tags: ["prod"],
	instance_template_id: VALID_UUID,
	capacity: validCapacity,
	loadbalancer: validLoadbalancer,
	error_messages: [],
	created_at: "2025-06-01T12:00:00Z",
	updated_at: "2025-06-01T12:30:00Z",
	zone: ZONE,
};

const validVolume = {
	name: "root",
	perf_iops: 5000,
	from_empty: { size: 10000000000 },
	tags: [],
	boot: true,
	volume_type: "sbs" as const,
};

const validInstanceTemplate = {
	id: VALID_UUID,
	commercial_type: "DEV1-S",
	image_id: "ubuntu_jammy",
	volumes: { "0": validVolume },
	tags: ["web"],
	security_group_id: VALID_UUID,
	placement_group_id: null,
	public_ips_v4_count: 1,
	public_ips_v6_count: 0,
	project_id: VALID_UUID,
	name: "my-template",
	private_network_ids: ["pn-1"],
	status: "ready" as const,
	cloud_init: "",
	created_at: "2025-06-01T12:00:00Z",
	updated_at: "2025-06-01T12:30:00Z",
	zone: ZONE,
};

const validMetric = {
	name: "cpu-metric",
	managed_metric: "managed_metric_instance_cpu" as const,
	operator: "operator_greater_than" as const,
	aggregate: "aggregate_average" as const,
	sampling_range_min: 5,
	threshold: 70.5,
};

const validInstancePolicy = {
	id: VALID_UUID,
	name: "scale-up-cpu",
	metric: validMetric,
	action: "scale_up" as const,
	type: "flat_count" as const,
	value: 1,
	priority: 1,
	instance_group_id: VALID_UUID,
	zone: ZONE,
};

const validEvent = {
	id: VALID_UUID,
	source: "scaler" as const,
	level: "info" as const,
	name: "scale_up",
	details: "Scaled up by 1 instance",
	created_at: "2025-06-01T12:00:00Z",
};

// --- Instance Group contracts ---

/**
 * API: GET /autoscaling/v1alpha1/zones/{zone}/instance-groups
 * Spec: specs/scaleway-api/autoscaling/api-reference.md#list-instance-groups
 */
describe("contract: ListInstanceGroups", () => {
	it("validates response shape", () => {
		const response = { instance_groups: [validInstanceGroup], total_count: 1 };
		expect(() => ListInstanceGroupsResponse.parse(response)).not.toThrow();
	});

	it("validates empty response", () => {
		expect(() =>
			ListInstanceGroupsResponse.parse({ instance_groups: [], total_count: 0 }),
		).not.toThrow();
	});

	it("validates request with order_by", () => {
		expect(() =>
			ListInstanceGroupsParams.parse({ zone: ZONE, orderBy: "created_at_asc" }),
		).not.toThrow();
	});

	it("rejects invalid order_by", () => {
		expect(() => ListInstanceGroupsParams.parse({ zone: ZONE, orderBy: "name_asc" })).toThrow();
	});
});

/**
 * API: GET /autoscaling/v1alpha1/zones/{zone}/instance-groups/{id}
 * Spec: specs/scaleway-api/autoscaling/api-reference.md#get-instance-group
 */
describe("contract: GetInstanceGroup / InstanceGroup entity", () => {
	it("validates instance group", () => {
		expect(() => InstanceGroup.parse(validInstanceGroup)).not.toThrow();
	});

	it("allows null loadbalancer", () => {
		expect(() => InstanceGroup.parse({ ...validInstanceGroup, loadbalancer: null })).not.toThrow();
	});

	it("validates request shape", () => {
		expect(() =>
			GetInstanceGroupParams.parse({ zone: ZONE, instanceGroupId: VALID_UUID }),
		).not.toThrow();
	});
});

/**
 * API: POST /autoscaling/v1alpha1/zones/{zone}/instance-groups
 * Spec: specs/scaleway-api/autoscaling/api-reference.md#create-instance-group
 */
describe("contract: CreateInstanceGroup request", () => {
	it("validates minimal create", () => {
		expect(() =>
			CreateInstanceGroupParams.parse({
				zone: ZONE,
				name: "g",
				templateId: VALID_UUID,
				capacity: { min_replicas: 1, max_replicas: 3 },
			}),
		).not.toThrow();
	});

	it("validates full create", () => {
		expect(() =>
			CreateInstanceGroupParams.parse({
				zone: ZONE,
				name: "g",
				templateId: VALID_UUID,
				capacity: validCapacity,
				projectId: VALID_UUID,
				tags: ["t"],
				loadbalancer: validLoadbalancer,
			}),
		).not.toThrow();
	});

	it("rejects missing required fields", () => {
		expect(() => CreateInstanceGroupParams.parse({ zone: ZONE, name: "g" })).toThrow();
	});
});

/**
 * API: PATCH /autoscaling/v1alpha1/zones/{zone}/instance-groups/{id}
 * Spec: specs/scaleway-api/autoscaling/api-reference.md#update-instance-group
 */
describe("contract: UpdateInstanceGroup request", () => {
	it("validates update with all optional fields", () => {
		expect(() =>
			UpdateInstanceGroupParams.parse({
				zone: ZONE,
				instanceGroupId: VALID_UUID,
				name: "n",
				tags: ["t"],
				capacity: validCapacity,
				loadbalancer: validLoadbalancer,
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
 * API: DELETE /autoscaling/v1alpha1/zones/{zone}/instance-groups/{id}
 * Spec: specs/scaleway-api/autoscaling/api-reference.md#delete-instance-group
 */
describe("contract: DeleteInstanceGroup request", () => {
	it("validates delete", () => {
		expect(() =>
			DeleteInstanceGroupParams.parse({ zone: ZONE, instanceGroupId: VALID_UUID }),
		).not.toThrow();
	});

	it("rejects missing id", () => {
		expect(() => DeleteInstanceGroupParams.parse({ zone: ZONE })).toThrow();
	});
});

/**
 * API: GET /autoscaling/v1alpha1/zones/{zone}/instance-groups/{id}/events
 * Spec: specs/scaleway-api/autoscaling/api-reference.md#list-instance-group-events
 */
describe("contract: ListInstanceGroupEvents", () => {
	it("validates response shape", () => {
		expect(() =>
			ListInstanceGroupEventsResponse.parse({ instance_events: [validEvent], total_count: 1 }),
		).not.toThrow();
	});

	it("validates all event sources and levels", () => {
		for (const source of [
			"unknown_source",
			"watcher",
			"scaler",
			"instance_manager",
			"supervisor",
		]) {
			expect(() => InstanceGroupEvent.parse({ ...validEvent, source })).not.toThrow();
		}
		for (const level of ["unknown_level", "info", "success", "error"]) {
			expect(() => InstanceGroupEvent.parse({ ...validEvent, level })).not.toThrow();
		}
	});

	it("allows null details", () => {
		expect(() => InstanceGroupEvent.parse({ ...validEvent, details: null })).not.toThrow();
	});

	it("validates request shape", () => {
		expect(() =>
			ListInstanceGroupEventsParams.parse({ zone: ZONE, instanceGroupId: VALID_UUID }),
		).not.toThrow();
	});
});

// --- Instance Template contracts ---

/**
 * API: GET /autoscaling/v1alpha1/zones/{zone}/instance-templates
 * Spec: specs/scaleway-api/autoscaling/api-reference.md#list-instance-templates
 */
describe("contract: ListInstanceTemplates", () => {
	it("validates response shape", () => {
		expect(() =>
			ListInstanceTemplatesResponse.parse({
				instance_templates: [validInstanceTemplate],
				total_count: 1,
			}),
		).not.toThrow();
	});

	it("validates request shape", () => {
		expect(() => ListInstanceTemplatesParams.parse({ zone: ZONE })).not.toThrow();
	});
});

/**
 * API: GET /autoscaling/v1alpha1/zones/{zone}/instance-templates/{id}
 * Spec: specs/scaleway-api/autoscaling/api-reference.md#get-instance-template
 */
describe("contract: GetInstanceTemplate / InstanceTemplate entity", () => {
	it("validates instance template", () => {
		expect(() => InstanceTemplate.parse(validInstanceTemplate)).not.toThrow();
	});

	it("validates all statuses", () => {
		for (const status of ["unknown_status", "ready", "error"]) {
			expect(() => InstanceTemplate.parse({ ...validInstanceTemplate, status })).not.toThrow();
		}
	});

	it("rejects invalid status", () => {
		expect(() =>
			InstanceTemplate.parse({ ...validInstanceTemplate, status: "deleting" }),
		).toThrow();
	});

	it("validates volume from_snapshot variant and volume types", () => {
		for (const volume_type of ["unknown_volume_type", "l_ssd", "sbs"]) {
			expect(() =>
				InstanceTemplate.parse({
					...validInstanceTemplate,
					volumes: {
						"0": {
							name: "root",
							from_snapshot: { snapshot_id: VALID_UUID, size: 20000000000 },
							volume_type,
						},
					},
				}),
			).not.toThrow();
		}
	});

	it("validates request shape", () => {
		expect(() =>
			GetInstanceTemplateParams.parse({ zone: ZONE, instanceTemplateId: VALID_UUID }),
		).not.toThrow();
	});
});

/**
 * API: POST /autoscaling/v1alpha1/zones/{zone}/instance-templates
 * Spec: specs/scaleway-api/autoscaling/api-reference.md#create-instance-template
 */
describe("contract: CreateInstanceTemplate request", () => {
	it("validates minimal create", () => {
		expect(() =>
			CreateInstanceTemplateParams.parse({ zone: ZONE, name: "t", commercialType: "DEV1-S" }),
		).not.toThrow();
	});

	it("validates full create", () => {
		expect(() =>
			CreateInstanceTemplateParams.parse({
				zone: ZONE,
				name: "t",
				commercialType: "DEV1-S",
				imageId: "ubuntu_jammy",
				volumes: { "0": validVolume },
				tags: ["t"],
				securityGroupId: VALID_UUID,
				placementGroupId: VALID_UUID,
				publicIpsV4Count: 1,
				publicIpsV6Count: 0,
				projectId: VALID_UUID,
				privateNetworkIds: ["pn-1"],
				cloudInit: "base64",
			}),
		).not.toThrow();
	});

	it("rejects missing commercial type", () => {
		expect(() => CreateInstanceTemplateParams.parse({ zone: ZONE, name: "t" })).toThrow();
	});
});

/**
 * API: PATCH /autoscaling/v1alpha1/zones/{zone}/instance-templates/{id}
 * Spec: specs/scaleway-api/autoscaling/api-reference.md#update-instance-template
 */
describe("contract: UpdateInstanceTemplate request", () => {
	it("validates update with optional fields", () => {
		expect(() =>
			UpdateInstanceTemplateParams.parse({
				zone: ZONE,
				instanceTemplateId: VALID_UUID,
				name: "n",
				commercialType: "DEV1-M",
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
 * API: DELETE /autoscaling/v1alpha1/zones/{zone}/instance-templates/{id}
 * Spec: specs/scaleway-api/autoscaling/api-reference.md#delete-instance-template
 */
describe("contract: DeleteInstanceTemplate request", () => {
	it("validates delete", () => {
		expect(() =>
			DeleteInstanceTemplateParams.parse({ zone: ZONE, instanceTemplateId: VALID_UUID }),
		).not.toThrow();
	});
});

// --- Instance Policy contracts ---

/**
 * API: GET /autoscaling/v1alpha1/zones/{zone}/instance-policies
 * Spec: specs/scaleway-api/autoscaling/api-reference.md#list-instance-policies
 */
describe("contract: ListInstancePolicies", () => {
	it("validates response shape", () => {
		expect(() =>
			ListInstancePoliciesResponse.parse({ policies: [validInstancePolicy], total_count: 1 }),
		).not.toThrow();
	});

	it("validates request with instance_group_id filter", () => {
		expect(() =>
			ListInstancePoliciesParams.parse({ zone: ZONE, instanceGroupId: VALID_UUID }),
		).not.toThrow();
	});
});

/**
 * API: GET /autoscaling/v1alpha1/zones/{zone}/instance-policies/{id}
 * Spec: specs/scaleway-api/autoscaling/api-reference.md#get-instance-policy
 */
describe("contract: GetInstancePolicy / InstancePolicy entity", () => {
	it("validates instance policy", () => {
		expect(() => InstancePolicy.parse(validInstancePolicy)).not.toThrow();
	});

	it("validates all actions and types", () => {
		for (const action of ["unknown_instance_action", "scale_up", "scale_down"]) {
			expect(() => InstancePolicy.parse({ ...validInstancePolicy, action })).not.toThrow();
		}
		for (const type of [
			"unknown_instance_type",
			"flat_count",
			"percent_of_total_group",
			"set_total_group",
		]) {
			expect(() => InstancePolicy.parse({ ...validInstancePolicy, type })).not.toThrow();
		}
	});

	it("validates Metric enums", () => {
		for (const managed_metric of [
			"managed_metric_unknown",
			"managed_metric_instance_cpu",
			"managed_metric_instance_network_in",
			"managed_metric_instance_network_out",
			"managed_loadbalancer_backend_connections_rate",
			"managed_loadbalancer_backend_throughput",
		]) {
			expect(() => Metric.parse({ ...validMetric, managed_metric })).not.toThrow();
		}
		for (const operator of ["operator_unknown", "operator_greater_than", "operator_less_than"]) {
			expect(() => Metric.parse({ ...validMetric, operator })).not.toThrow();
		}
		for (const aggregate of [
			"aggregate_unknown",
			"aggregate_average",
			"aggregate_max",
			"aggregate_min",
			"aggregate_sum",
		]) {
			expect(() => Metric.parse({ ...validMetric, aggregate })).not.toThrow();
		}
	});

	it("allows cockpit_metric_name based custom metric", () => {
		expect(() =>
			Metric.parse({
				name: "custom",
				cockpit_metric_name: "my_custom_metric",
				operator: "operator_less_than",
				aggregate: "aggregate_max",
				sampling_range_min: 10,
				threshold: 0.5,
			}),
		).not.toThrow();
	});

	it("validates request shape", () => {
		expect(() =>
			GetInstancePolicyParams.parse({ zone: ZONE, instancePolicyId: VALID_UUID }),
		).not.toThrow();
	});
});

/**
 * API: POST /autoscaling/v1alpha1/zones/{zone}/instance-policies
 * Spec: specs/scaleway-api/autoscaling/api-reference.md#create-instance-policy
 */
describe("contract: CreateInstancePolicy request", () => {
	it("validates create", () => {
		expect(() =>
			CreateInstancePolicyParams.parse({
				zone: ZONE,
				name: "p",
				metric: validMetric,
				action: "scale_up",
				type: "flat_count",
				value: 1,
				priority: 1,
				instanceGroupId: VALID_UUID,
			}),
		).not.toThrow();
	});

	it("rejects missing metric", () => {
		expect(() =>
			CreateInstancePolicyParams.parse({
				zone: ZONE,
				name: "p",
				action: "scale_up",
				type: "flat_count",
				value: 1,
				priority: 1,
				instanceGroupId: VALID_UUID,
			}),
		).toThrow();
	});
});

/**
 * API: PATCH /autoscaling/v1alpha1/zones/{zone}/instance-policies/{id}
 * Spec: specs/scaleway-api/autoscaling/api-reference.md#update-instance-policy
 */
describe("contract: UpdateInstancePolicy request", () => {
	it("validates update with optional fields", () => {
		expect(() =>
			UpdateInstancePolicyParams.parse({
				zone: ZONE,
				instancePolicyId: VALID_UUID,
				action: "scale_down",
				value: 2,
			}),
		).not.toThrow();
	});

	it("validates update with no optional fields", () => {
		expect(() =>
			UpdateInstancePolicyParams.parse({ zone: ZONE, instancePolicyId: VALID_UUID }),
		).not.toThrow();
	});
});

/**
 * API: DELETE /autoscaling/v1alpha1/zones/{zone}/instance-policies/{id}
 * Spec: specs/scaleway-api/autoscaling/api-reference.md#delete-instance-policy
 */
describe("contract: DeleteInstancePolicy request", () => {
	it("validates delete", () => {
		expect(() =>
			DeleteInstancePolicyParams.parse({ zone: ZONE, instancePolicyId: VALID_UUID }),
		).not.toThrow();
	});
});

// --- Pagination & zone contracts ---

describe("contract: pagination & zone", () => {
	it("applies default pagination", () => {
		const result = ListInstanceGroupsParams.parse({ zone: ZONE });
		expect(result.page).toBe(1);
		expect(result.pageSize).toBe(50);
	});

	it("rejects page size over 100", () => {
		expect(() => ListInstanceGroupsParams.parse({ zone: ZONE, pageSize: 101 })).toThrow();
	});

	it("rejects invalid zone format", () => {
		expect(() => ListInstanceGroupsParams.parse({ zone: "fr-par" })).toThrow();
		expect(() => ListInstanceGroupsParams.parse({ zone: "fr-par-1" })).not.toThrow();
	});

	it("requires zone for all operations", () => {
		const schema = z.object({ zone: ListInstanceGroupsParams.shape.zone });
		expect(() => schema.parse({})).toThrow();
	});
});
