import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerAutoscalingTools } from "../../../src/tools/autoscaling/index.js";

// Mock the shared modules
vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: () => ({
		accessKey: "SCW-ACCESS-KEY",
		secretKey: "SCW-SECRET-KEY",
		defaultProjectId: "00000000-0000-0000-0000-000000000001",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	}),
}));

const mockFetch = vi.fn();
vi.mock("../../../src/shared/client.js", () => ({
	createScalewayClient: () => ({ fetch: mockFetch }),
}));

interface ErrorResult {
	content: { type: "text"; text: string }[];
	isError?: boolean;
}

const ZONE = "fr-par-1";
const GROUP_ID = "00000000-0000-0000-0000-000000000010";
const TEMPLATE_ID = "00000000-0000-0000-0000-000000000020";
const POLICY_ID = "00000000-0000-0000-0000-000000000030";
const PROJECT_ID = "00000000-0000-0000-0000-000000000001";

function errorWith(status?: number): Error {
	const err = new Error("boom");
	if (status !== undefined) {
		(err as unknown as { statusCode: number }).statusCode = status;
	}
	return err;
}

describe("autoscaling module registration", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerAutoscalingTools(server)).not.toThrow();
	});

	it("registers all 16 autoscaling tools", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");
		registerAutoscalingTools(server);
		expect(toolSpy).toHaveBeenCalledTimes(16);

		const toolNames = toolSpy.mock.calls.map((call) => call[0]);
		expect(toolNames).toEqual([
			"scaleway_autoscaling_list_instance_groups",
			"scaleway_autoscaling_get_instance_group",
			"scaleway_autoscaling_create_instance_group",
			"scaleway_autoscaling_update_instance_group",
			"scaleway_autoscaling_delete_instance_group",
			"scaleway_autoscaling_list_instance_group_events",
			"scaleway_autoscaling_list_instance_templates",
			"scaleway_autoscaling_get_instance_template",
			"scaleway_autoscaling_create_instance_template",
			"scaleway_autoscaling_update_instance_template",
			"scaleway_autoscaling_delete_instance_template",
			"scaleway_autoscaling_list_instance_policies",
			"scaleway_autoscaling_get_instance_policy",
			"scaleway_autoscaling_create_instance_policy",
			"scaleway_autoscaling_update_instance_policy",
			"scaleway_autoscaling_delete_instance_policy",
		]);
	});

	it("wires tool handlers to their implementations", async () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const handlers: Record<string, (args: unknown) => Promise<unknown>> = {};
		vi.spyOn(server, "tool").mockImplementation(
			// biome-ignore lint/suspicious/noExplicitAny: test shim for MCP tool signature
			(name: string, _desc: string, _schema: unknown, cb: any) => {
				handlers[name] = cb;
				return undefined as never;
			},
		);
		registerAutoscalingTools(server);
		mockFetch.mockResolvedValue({ instance_groups: [], total_count: 0 });
		const result = (await handlers.scaleway_autoscaling_list_instance_groups({
			zone: ZONE,
			page: 1,
			pageSize: 50,
		})) as ErrorResult;
		expect(JSON.parse(result.content[0].text).totalCount).toBe(0);
	});
});

describe("autoscaling instance group handlers", () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	describe("handleListInstanceGroups", () => {
		it("returns paginated list", async () => {
			const { handleListInstanceGroups } = await import(
				"../../../src/tools/autoscaling/handlers.js"
			);
			mockFetch.mockResolvedValue({ instance_groups: [{ id: GROUP_ID }], total_count: 1 });
			const result = await handleListInstanceGroups({ zone: ZONE, page: 1, pageSize: 50 });
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: `autoscaling/v1alpha1/zones/${ZONE}/instance-groups`,
					urlParams: expect.any(URLSearchParams),
				}),
			);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.totalCount).toBe(1);
			expect(parsed.items).toHaveLength(1);
		});

		it("passes orderBy filter", async () => {
			const { handleListInstanceGroups } = await import(
				"../../../src/tools/autoscaling/handlers.js"
			);
			mockFetch.mockResolvedValue({ instance_groups: [], total_count: 0 });
			await handleListInstanceGroups({
				zone: ZONE,
				page: 2,
				pageSize: 10,
				orderBy: "created_at_asc",
			});
			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.urlParams.get("page")).toBe("2");
			expect(callArgs.urlParams.get("page_size")).toBe("10");
			expect(callArgs.urlParams.get("order_by")).toBe("created_at_asc");
		});

		it("returns error on failure", async () => {
			const { handleListInstanceGroups } = await import(
				"../../../src/tools/autoscaling/handlers.js"
			);
			mockFetch.mockRejectedValue(errorWith(401));
			const result: ErrorResult = await handleListInstanceGroups({
				zone: ZONE,
				page: 1,
				pageSize: 50,
			});
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("permission_denied");
		});
	});

	describe("handleGetInstanceGroup", () => {
		it("returns instance group details", async () => {
			const { handleGetInstanceGroup } = await import("../../../src/tools/autoscaling/handlers.js");
			mockFetch.mockResolvedValue({ id: GROUP_ID, name: "grp" });
			const result = await handleGetInstanceGroup({ zone: ZONE, instanceGroupId: GROUP_ID });
			expect(mockFetch).toHaveBeenCalledWith({
				method: "GET",
				path: `autoscaling/v1alpha1/zones/${ZONE}/instance-groups/${GROUP_ID}`,
			});
			expect(JSON.parse(result.content[0].text).name).toBe("grp");
		});

		it("returns error on 404", async () => {
			const { handleGetInstanceGroup } = await import("../../../src/tools/autoscaling/handlers.js");
			mockFetch.mockRejectedValue(errorWith(404));
			const result: ErrorResult = await handleGetInstanceGroup({
				zone: ZONE,
				instanceGroupId: GROUP_ID,
			});
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("not_found");
		});
	});

	describe("handleCreateInstanceGroup", () => {
		it("creates with full body", async () => {
			const { handleCreateInstanceGroup } = await import(
				"../../../src/tools/autoscaling/handlers.js"
			);
			mockFetch.mockResolvedValue({ id: GROUP_ID });
			await handleCreateInstanceGroup({
				zone: ZONE,
				name: "grp",
				templateId: TEMPLATE_ID,
				capacity: { min_replicas: 1, max_replicas: 5, cooldown_delay: "300s" },
				projectId: PROJECT_ID,
				tags: ["prod"],
				loadbalancer: {
					id: "00000000-0000-0000-0000-000000000040",
					backend_ids: ["b1"],
					private_network_id: "pn1",
				},
			});
			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: `autoscaling/v1alpha1/zones/${ZONE}/instance-groups`,
				body: JSON.stringify({
					name: "grp",
					template_id: TEMPLATE_ID,
					capacity: { min_replicas: 1, max_replicas: 5, cooldown_delay: "300s" },
					project_id: PROJECT_ID,
					tags: ["prod"],
					loadbalancer: {
						id: "00000000-0000-0000-0000-000000000040",
						backend_ids: ["b1"],
						private_network_id: "pn1",
					},
				}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("creates with minimal body (optionals omitted)", async () => {
			const { handleCreateInstanceGroup } = await import(
				"../../../src/tools/autoscaling/handlers.js"
			);
			mockFetch.mockResolvedValue({ id: GROUP_ID });
			await handleCreateInstanceGroup({
				zone: ZONE,
				name: "grp",
				templateId: TEMPLATE_ID,
				capacity: { min_replicas: 1, max_replicas: 3 },
			});
			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: `autoscaling/v1alpha1/zones/${ZONE}/instance-groups`,
				body: JSON.stringify({
					name: "grp",
					template_id: TEMPLATE_ID,
					capacity: { min_replicas: 1, max_replicas: 3 },
				}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on 400", async () => {
			const { handleCreateInstanceGroup } = await import(
				"../../../src/tools/autoscaling/handlers.js"
			);
			mockFetch.mockRejectedValue(errorWith(400));
			const result: ErrorResult = await handleCreateInstanceGroup({
				zone: ZONE,
				name: "grp",
				templateId: TEMPLATE_ID,
				capacity: { min_replicas: 1, max_replicas: 3 },
			});
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("invalid_input");
		});
	});

	describe("handleUpdateInstanceGroup", () => {
		it("updates fields", async () => {
			const { handleUpdateInstanceGroup } = await import(
				"../../../src/tools/autoscaling/handlers.js"
			);
			mockFetch.mockResolvedValue({ id: GROUP_ID });
			await handleUpdateInstanceGroup({
				zone: ZONE,
				instanceGroupId: GROUP_ID,
				name: "new",
				capacity: { min_replicas: 2, max_replicas: 8 },
			});
			expect(mockFetch).toHaveBeenCalledWith({
				method: "PATCH",
				path: `autoscaling/v1alpha1/zones/${ZONE}/instance-groups/${GROUP_ID}`,
				body: JSON.stringify({ name: "new", capacity: { min_replicas: 2, max_replicas: 8 } }),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("sends empty body when no fields provided", async () => {
			const { handleUpdateInstanceGroup } = await import(
				"../../../src/tools/autoscaling/handlers.js"
			);
			mockFetch.mockResolvedValue({ id: GROUP_ID });
			await handleUpdateInstanceGroup({ zone: ZONE, instanceGroupId: GROUP_ID });
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({ method: "PATCH", body: JSON.stringify({}) }),
			);
		});

		it("returns error on server failure", async () => {
			const { handleUpdateInstanceGroup } = await import(
				"../../../src/tools/autoscaling/handlers.js"
			);
			mockFetch.mockRejectedValue(errorWith());
			const result: ErrorResult = await handleUpdateInstanceGroup({
				zone: ZONE,
				instanceGroupId: GROUP_ID,
			});
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("server_error");
		});
	});

	describe("handleDeleteInstanceGroup", () => {
		it("deletes and confirms", async () => {
			const { handleDeleteInstanceGroup } = await import(
				"../../../src/tools/autoscaling/handlers.js"
			);
			mockFetch.mockResolvedValue(undefined);
			const result = await handleDeleteInstanceGroup({ zone: ZONE, instanceGroupId: GROUP_ID });
			expect(mockFetch).toHaveBeenCalledWith({
				method: "DELETE",
				path: `autoscaling/v1alpha1/zones/${ZONE}/instance-groups/${GROUP_ID}`,
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.deleted).toBe(true);
			expect(parsed.id).toBe(GROUP_ID);
		});

		it("returns error on 403", async () => {
			const { handleDeleteInstanceGroup } = await import(
				"../../../src/tools/autoscaling/handlers.js"
			);
			mockFetch.mockRejectedValue(errorWith(403));
			const result: ErrorResult = await handleDeleteInstanceGroup({
				zone: ZONE,
				instanceGroupId: GROUP_ID,
			});
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("permission_denied");
		});
	});

	describe("handleListInstanceGroupEvents", () => {
		it("returns paginated events", async () => {
			const { handleListInstanceGroupEvents } = await import(
				"../../../src/tools/autoscaling/handlers.js"
			);
			mockFetch.mockResolvedValue({ instance_events: [{ id: "e1" }], total_count: 1 });
			const result = await handleListInstanceGroupEvents({
				zone: ZONE,
				instanceGroupId: GROUP_ID,
				page: 1,
				pageSize: 50,
				orderBy: "created_at_desc",
			});
			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.path).toBe(
				`autoscaling/v1alpha1/zones/${ZONE}/instance-groups/${GROUP_ID}/events`,
			);
			expect(callArgs.urlParams.get("order_by")).toBe("created_at_desc");
			expect(JSON.parse(result.content[0].text).totalCount).toBe(1);
		});

		it("returns error on 429", async () => {
			const { handleListInstanceGroupEvents } = await import(
				"../../../src/tools/autoscaling/handlers.js"
			);
			mockFetch.mockRejectedValue(errorWith(429));
			const result: ErrorResult = await handleListInstanceGroupEvents({
				zone: ZONE,
				instanceGroupId: GROUP_ID,
				page: 1,
				pageSize: 50,
			});
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("rate_limited");
		});
	});
});

describe("autoscaling instance template handlers", () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	describe("handleListInstanceTemplates", () => {
		it("returns paginated list", async () => {
			const { handleListInstanceTemplates } = await import(
				"../../../src/tools/autoscaling/handlers.js"
			);
			mockFetch.mockResolvedValue({ instance_templates: [{ id: TEMPLATE_ID }], total_count: 1 });
			const result = await handleListInstanceTemplates({ zone: ZONE, page: 1, pageSize: 50 });
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: `autoscaling/v1alpha1/zones/${ZONE}/instance-templates`,
				}),
			);
			expect(JSON.parse(result.content[0].text).items).toHaveLength(1);
		});

		it("returns error on failure", async () => {
			const { handleListInstanceTemplates } = await import(
				"../../../src/tools/autoscaling/handlers.js"
			);
			mockFetch.mockRejectedValue(errorWith(500));
			const result: ErrorResult = await handleListInstanceTemplates({
				zone: ZONE,
				page: 1,
				pageSize: 50,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleGetInstanceTemplate", () => {
		it("returns template details", async () => {
			const { handleGetInstanceTemplate } = await import(
				"../../../src/tools/autoscaling/handlers.js"
			);
			mockFetch.mockResolvedValue({ id: TEMPLATE_ID, name: "tmpl" });
			const result = await handleGetInstanceTemplate({
				zone: ZONE,
				instanceTemplateId: TEMPLATE_ID,
			});
			expect(mockFetch).toHaveBeenCalledWith({
				method: "GET",
				path: `autoscaling/v1alpha1/zones/${ZONE}/instance-templates/${TEMPLATE_ID}`,
			});
			expect(JSON.parse(result.content[0].text).name).toBe("tmpl");
		});

		it("returns error on 404", async () => {
			const { handleGetInstanceTemplate } = await import(
				"../../../src/tools/autoscaling/handlers.js"
			);
			mockFetch.mockRejectedValue(errorWith(404));
			const result: ErrorResult = await handleGetInstanceTemplate({
				zone: ZONE,
				instanceTemplateId: TEMPLATE_ID,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleCreateInstanceTemplate", () => {
		it("creates with full body", async () => {
			const { handleCreateInstanceTemplate } = await import(
				"../../../src/tools/autoscaling/handlers.js"
			);
			mockFetch.mockResolvedValue({ id: TEMPLATE_ID });
			await handleCreateInstanceTemplate({
				zone: ZONE,
				name: "tmpl",
				commercialType: "DEV1-S",
				imageId: "img",
				volumes: {
					"0": { name: "root", volume_type: "sbs", boot: true, from_empty: { size: 10000000000 } },
				},
				tags: ["t"],
				securityGroupId: "00000000-0000-0000-0000-000000000050",
				placementGroupId: "00000000-0000-0000-0000-000000000060",
				publicIpsV4Count: 1,
				publicIpsV6Count: 0,
				projectId: PROJECT_ID,
				privateNetworkIds: ["pn1"],
				cloudInit: "base64data",
			});
			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: `autoscaling/v1alpha1/zones/${ZONE}/instance-templates`,
				body: JSON.stringify({
					name: "tmpl",
					commercial_type: "DEV1-S",
					image_id: "img",
					volumes: {
						"0": {
							name: "root",
							volume_type: "sbs",
							boot: true,
							from_empty: { size: 10000000000 },
						},
					},
					tags: ["t"],
					security_group_id: "00000000-0000-0000-0000-000000000050",
					placement_group_id: "00000000-0000-0000-0000-000000000060",
					public_ips_v4_count: 1,
					public_ips_v6_count: 0,
					project_id: PROJECT_ID,
					private_network_ids: ["pn1"],
					cloud_init: "base64data",
				}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("creates with minimal body", async () => {
			const { handleCreateInstanceTemplate } = await import(
				"../../../src/tools/autoscaling/handlers.js"
			);
			mockFetch.mockResolvedValue({ id: TEMPLATE_ID });
			await handleCreateInstanceTemplate({ zone: ZONE, name: "tmpl", commercialType: "DEV1-S" });
			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: `autoscaling/v1alpha1/zones/${ZONE}/instance-templates`,
				body: JSON.stringify({ name: "tmpl", commercial_type: "DEV1-S" }),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleCreateInstanceTemplate } = await import(
				"../../../src/tools/autoscaling/handlers.js"
			);
			mockFetch.mockRejectedValue(errorWith(400));
			const result: ErrorResult = await handleCreateInstanceTemplate({
				zone: ZONE,
				name: "tmpl",
				commercialType: "DEV1-S",
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleUpdateInstanceTemplate", () => {
		it("updates fields", async () => {
			const { handleUpdateInstanceTemplate } = await import(
				"../../../src/tools/autoscaling/handlers.js"
			);
			mockFetch.mockResolvedValue({ id: TEMPLATE_ID });
			await handleUpdateInstanceTemplate({
				zone: ZONE,
				instanceTemplateId: TEMPLATE_ID,
				commercialType: "DEV1-M",
				tags: ["x"],
			});
			expect(mockFetch).toHaveBeenCalledWith({
				method: "PATCH",
				path: `autoscaling/v1alpha1/zones/${ZONE}/instance-templates/${TEMPLATE_ID}`,
				body: JSON.stringify({ commercial_type: "DEV1-M", tags: ["x"] }),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("sends empty body when no fields provided", async () => {
			const { handleUpdateInstanceTemplate } = await import(
				"../../../src/tools/autoscaling/handlers.js"
			);
			mockFetch.mockResolvedValue({ id: TEMPLATE_ID });
			await handleUpdateInstanceTemplate({ zone: ZONE, instanceTemplateId: TEMPLATE_ID });
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({ method: "PATCH", body: JSON.stringify({}) }),
			);
		});

		it("returns error on failure", async () => {
			const { handleUpdateInstanceTemplate } = await import(
				"../../../src/tools/autoscaling/handlers.js"
			);
			mockFetch.mockRejectedValue(errorWith());
			const result: ErrorResult = await handleUpdateInstanceTemplate({
				zone: ZONE,
				instanceTemplateId: TEMPLATE_ID,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleDeleteInstanceTemplate", () => {
		it("deletes and confirms", async () => {
			const { handleDeleteInstanceTemplate } = await import(
				"../../../src/tools/autoscaling/handlers.js"
			);
			mockFetch.mockResolvedValue(undefined);
			const result = await handleDeleteInstanceTemplate({
				zone: ZONE,
				instanceTemplateId: TEMPLATE_ID,
			});
			expect(mockFetch).toHaveBeenCalledWith({
				method: "DELETE",
				path: `autoscaling/v1alpha1/zones/${ZONE}/instance-templates/${TEMPLATE_ID}`,
			});
			expect(JSON.parse(result.content[0].text).id).toBe(TEMPLATE_ID);
		});

		it("returns error on failure", async () => {
			const { handleDeleteInstanceTemplate } = await import(
				"../../../src/tools/autoscaling/handlers.js"
			);
			mockFetch.mockRejectedValue(errorWith(403));
			const result: ErrorResult = await handleDeleteInstanceTemplate({
				zone: ZONE,
				instanceTemplateId: TEMPLATE_ID,
			});
			expect(result.isError).toBe(true);
		});
	});
});

describe("autoscaling instance policy handlers", () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	describe("handleListInstancePolicies", () => {
		it("returns paginated list with instance_group_id filter", async () => {
			const { handleListInstancePolicies } = await import(
				"../../../src/tools/autoscaling/handlers.js"
			);
			mockFetch.mockResolvedValue({ policies: [{ id: POLICY_ID }], total_count: 1 });
			const result = await handleListInstancePolicies({
				zone: ZONE,
				page: 1,
				pageSize: 50,
				instanceGroupId: GROUP_ID,
			});
			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.path).toBe(`autoscaling/v1alpha1/zones/${ZONE}/instance-policies`);
			expect(callArgs.urlParams.get("instance_group_id")).toBe(GROUP_ID);
			expect(JSON.parse(result.content[0].text).items).toHaveLength(1);
		});

		it("returns error on failure", async () => {
			const { handleListInstancePolicies } = await import(
				"../../../src/tools/autoscaling/handlers.js"
			);
			mockFetch.mockRejectedValue(errorWith(500));
			const result: ErrorResult = await handleListInstancePolicies({
				zone: ZONE,
				page: 1,
				pageSize: 50,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleGetInstancePolicy", () => {
		it("returns policy details", async () => {
			const { handleGetInstancePolicy } = await import(
				"../../../src/tools/autoscaling/handlers.js"
			);
			mockFetch.mockResolvedValue({ id: POLICY_ID, name: "pol" });
			const result = await handleGetInstancePolicy({ zone: ZONE, instancePolicyId: POLICY_ID });
			expect(mockFetch).toHaveBeenCalledWith({
				method: "GET",
				path: `autoscaling/v1alpha1/zones/${ZONE}/instance-policies/${POLICY_ID}`,
			});
			expect(JSON.parse(result.content[0].text).name).toBe("pol");
		});

		it("returns error on 404", async () => {
			const { handleGetInstancePolicy } = await import(
				"../../../src/tools/autoscaling/handlers.js"
			);
			mockFetch.mockRejectedValue(errorWith(404));
			const result: ErrorResult = await handleGetInstancePolicy({
				zone: ZONE,
				instancePolicyId: POLICY_ID,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleCreateInstancePolicy", () => {
		it("creates policy", async () => {
			const { handleCreateInstancePolicy } = await import(
				"../../../src/tools/autoscaling/handlers.js"
			);
			mockFetch.mockResolvedValue({ id: POLICY_ID });
			const metric = {
				name: "cpu",
				managed_metric: "managed_metric_instance_cpu" as const,
				operator: "operator_greater_than" as const,
				aggregate: "aggregate_average" as const,
				sampling_range_min: 5,
				threshold: 70,
			};
			await handleCreateInstancePolicy({
				zone: ZONE,
				name: "pol",
				metric,
				action: "scale_up",
				type: "flat_count",
				value: 1,
				priority: 1,
				instanceGroupId: GROUP_ID,
			});
			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: `autoscaling/v1alpha1/zones/${ZONE}/instance-policies`,
				body: JSON.stringify({
					name: "pol",
					metric,
					action: "scale_up",
					type: "flat_count",
					value: 1,
					priority: 1,
					instance_group_id: GROUP_ID,
				}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleCreateInstancePolicy } = await import(
				"../../../src/tools/autoscaling/handlers.js"
			);
			mockFetch.mockRejectedValue(errorWith(400));
			const result: ErrorResult = await handleCreateInstancePolicy({
				zone: ZONE,
				name: "pol",
				metric: {
					name: "cpu",
					operator: "operator_greater_than",
					aggregate: "aggregate_average",
					sampling_range_min: 5,
					threshold: 70,
				},
				action: "scale_up",
				type: "flat_count",
				value: 1,
				priority: 1,
				instanceGroupId: GROUP_ID,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleUpdateInstancePolicy", () => {
		it("updates fields", async () => {
			const { handleUpdateInstancePolicy } = await import(
				"../../../src/tools/autoscaling/handlers.js"
			);
			mockFetch.mockResolvedValue({ id: POLICY_ID });
			await handleUpdateInstancePolicy({
				zone: ZONE,
				instancePolicyId: POLICY_ID,
				action: "scale_down",
				value: 2,
			});
			expect(mockFetch).toHaveBeenCalledWith({
				method: "PATCH",
				path: `autoscaling/v1alpha1/zones/${ZONE}/instance-policies/${POLICY_ID}`,
				body: JSON.stringify({ action: "scale_down", value: 2 }),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("sends empty body when no fields provided", async () => {
			const { handleUpdateInstancePolicy } = await import(
				"../../../src/tools/autoscaling/handlers.js"
			);
			mockFetch.mockResolvedValue({ id: POLICY_ID });
			await handleUpdateInstancePolicy({ zone: ZONE, instancePolicyId: POLICY_ID });
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({ method: "PATCH", body: JSON.stringify({}) }),
			);
		});

		it("returns error on failure", async () => {
			const { handleUpdateInstancePolicy } = await import(
				"../../../src/tools/autoscaling/handlers.js"
			);
			mockFetch.mockRejectedValue(errorWith());
			const result: ErrorResult = await handleUpdateInstancePolicy({
				zone: ZONE,
				instancePolicyId: POLICY_ID,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleDeleteInstancePolicy", () => {
		it("deletes and confirms", async () => {
			const { handleDeleteInstancePolicy } = await import(
				"../../../src/tools/autoscaling/handlers.js"
			);
			mockFetch.mockResolvedValue(undefined);
			const result = await handleDeleteInstancePolicy({
				zone: ZONE,
				instancePolicyId: POLICY_ID,
			});
			expect(mockFetch).toHaveBeenCalledWith({
				method: "DELETE",
				path: `autoscaling/v1alpha1/zones/${ZONE}/instance-policies/${POLICY_ID}`,
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.deleted).toBe(true);
			expect(parsed.id).toBe(POLICY_ID);
		});

		it("returns error on failure", async () => {
			const { handleDeleteInstancePolicy } = await import(
				"../../../src/tools/autoscaling/handlers.js"
			);
			mockFetch.mockRejectedValue(errorWith(403));
			const result: ErrorResult = await handleDeleteInstancePolicy({
				zone: ZONE,
				instancePolicyId: POLICY_ID,
			});
			expect(result.isError).toBe(true);
		});
	});
});
