import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as handlers from "../../../src/tools/autoscaling/handlers.js";
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

interface ToolResult {
	content: { type: "text"; text: string }[];
	isError?: boolean;
}

const ZONE = "fr-par-1";
const GROUP_ID = "00000000-0000-0000-0000-000000000010";
const TEMPLATE_ID = "00000000-0000-0000-0000-000000000020";
const LB_ID = "00000000-0000-0000-0000-000000000040";
const BACKEND_ID = "00000000-0000-0000-0000-000000000041";
const PN_ID = "00000000-0000-0000-0000-000000000042";
const SNAPSHOT_ID = "00000000-0000-0000-0000-000000000043";
const PROJECT_ID = "00000000-0000-0000-0000-000000000001";
const OTHER_PROJECT_ID = "00000000-0000-0000-0000-000000000002";

const GROUPS_PATH = `/autoscaling/v1alpha2/zones/${ZONE}/groups`;
const LOGS_PATH = `/autoscaling/v1alpha2/zones/${ZONE}/logs`;
const SERVERS_PATH = `/autoscaling/v1alpha2/zones/${ZONE}/servers`;
const ALERTS_PATH = `/autoscaling/v1alpha2/zones/${ZONE}/alerts`;
const TEMPLATES_PATH = `/instance/v2alpha1/zones/${ZONE}/templates`;
const JSON_HEADERS = { "Content-Type": "application/json" };

/** Mimic @scaleway/sdk-client ScalewayError: numeric `.status`, no `.statusCode`. */
function scalewayError(status?: number): Error {
	const err = new Error("boom");
	if (status !== undefined) {
		(err as unknown as { status: number }).status = status;
	}
	return err;
}

function lastCall() {
	return mockFetch.mock.calls[mockFetch.mock.calls.length - 1][0] as {
		method: string;
		path: string;
		urlParams?: URLSearchParams;
		body?: string;
		headers?: Record<string, string>;
	};
}

function parsed(result: ToolResult) {
	return JSON.parse(result.content[0].text);
}

describe("autoscaling module registration", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerAutoscalingTools(server)).not.toThrow();
	});

	it("registers all 15 autoscaling tools in order", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");
		registerAutoscalingTools(server);
		expect(toolSpy).toHaveBeenCalledTimes(15);

		const toolNames = toolSpy.mock.calls.map((call) => call[0]);
		expect(toolNames).toEqual([
			"scaleway_autoscaling_list_instance_groups",
			"scaleway_autoscaling_get_instance_group",
			"scaleway_autoscaling_create_instance_group",
			"scaleway_autoscaling_update_instance_group",
			"scaleway_autoscaling_delete_instance_group",
			"scaleway_autoscaling_list_instance_group_events",
			"scaleway_autoscaling_list_instance_group_servers",
			"scaleway_autoscaling_list_instance_group_alerts",
			"scaleway_autoscaling_list_instance_templates",
			"scaleway_autoscaling_get_instance_template",
			"scaleway_autoscaling_create_instance_template",
			"scaleway_autoscaling_update_instance_template",
			"scaleway_autoscaling_delete_instance_template",
			"scaleway_autoscaling_get_instance_template_cloud_init",
			"scaleway_autoscaling_set_instance_template_cloud_init",
		]);
	});

	it("does not register the removed v1alpha1 instance-policy tools", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");
		registerAutoscalingTools(server);
		const toolNames = toolSpy.mock.calls.map((call) => call[0] as string);
		expect(toolNames.filter((n) => n.includes("instance_polic"))).toEqual([]);
	});

	describe("tool wiring", () => {
		const registered: Record<string, (args: unknown) => Promise<unknown>> = {};

		beforeEach(() => {
			mockFetch.mockReset();
			const server = new McpServer({ name: "test", version: "0.0.1" });
			vi.spyOn(server, "tool").mockImplementation(
				// biome-ignore lint/suspicious/noExplicitAny: test shim for MCP tool signature
				(name: string, _desc: string, _schema: unknown, cb: any) => {
					registered[name] = cb;
					return undefined as never;
				},
			);
			registerAutoscalingTools(server);
		});

		const cases: [string, Record<string, unknown>, string, string][] = [
			["scaleway_autoscaling_list_instance_groups", { zone: ZONE }, "GET", GROUPS_PATH],
			[
				"scaleway_autoscaling_get_instance_group",
				{ zone: ZONE, instanceGroupId: GROUP_ID },
				"GET",
				`${GROUPS_PATH}/${GROUP_ID}`,
			],
			[
				"scaleway_autoscaling_create_instance_group",
				{ zone: ZONE, name: "g", templateId: TEMPLATE_ID },
				"POST",
				GROUPS_PATH,
			],
			[
				"scaleway_autoscaling_update_instance_group",
				{ zone: ZONE, instanceGroupId: GROUP_ID, name: "n" },
				"PATCH",
				`${GROUPS_PATH}/${GROUP_ID}`,
			],
			[
				"scaleway_autoscaling_delete_instance_group",
				{ zone: ZONE, instanceGroupId: GROUP_ID },
				"DELETE",
				`${GROUPS_PATH}/${GROUP_ID}`,
			],
			[
				"scaleway_autoscaling_list_instance_group_events",
				{ zone: ZONE, instanceGroupId: GROUP_ID },
				"GET",
				LOGS_PATH,
			],
			[
				"scaleway_autoscaling_list_instance_group_servers",
				{ zone: ZONE, instanceGroupId: GROUP_ID },
				"GET",
				SERVERS_PATH,
			],
			["scaleway_autoscaling_list_instance_group_alerts", { zone: ZONE }, "GET", ALERTS_PATH],
			["scaleway_autoscaling_list_instance_templates", { zone: ZONE }, "GET", TEMPLATES_PATH],
			[
				"scaleway_autoscaling_get_instance_template",
				{ zone: ZONE, instanceTemplateId: TEMPLATE_ID },
				"GET",
				`${TEMPLATES_PATH}/${TEMPLATE_ID}`,
			],
			[
				"scaleway_autoscaling_create_instance_template",
				{ zone: ZONE, name: "t", serverType: "PLAY2-NANO" },
				"POST",
				TEMPLATES_PATH,
			],
			[
				"scaleway_autoscaling_update_instance_template",
				{ zone: ZONE, instanceTemplateId: TEMPLATE_ID, name: "n" },
				"PATCH",
				`${TEMPLATES_PATH}/${TEMPLATE_ID}`,
			],
			[
				"scaleway_autoscaling_delete_instance_template",
				{ zone: ZONE, instanceTemplateId: TEMPLATE_ID },
				"DELETE",
				`${TEMPLATES_PATH}/${TEMPLATE_ID}`,
			],
			[
				"scaleway_autoscaling_get_instance_template_cloud_init",
				{ zone: ZONE, instanceTemplateId: TEMPLATE_ID },
				"GET",
				`${TEMPLATES_PATH}/${TEMPLATE_ID}/user-data/cloud-init`,
			],
			[
				"scaleway_autoscaling_set_instance_template_cloud_init",
				{ zone: ZONE, instanceTemplateId: TEMPLATE_ID, content: "#cloud-config" },
				"PUT",
				`${TEMPLATES_PATH}/${TEMPLATE_ID}/user-data/cloud-init`,
			],
		];

		it.each(cases)("%s parses input and calls %s %s", async (name, args, method, path) => {
			mockFetch.mockResolvedValue({ ok: "yes" });
			const result = (await registered[name](args)) as ToolResult;
			expect(result.isError).toBeUndefined();
			expect(mockFetch).toHaveBeenCalledTimes(1);
			expect(mockFetch).toHaveBeenCalledWith(expect.objectContaining({ method, path }));
		});

		it("rejects invalid input before calling the API", async () => {
			await expect(
				registered.scaleway_autoscaling_get_instance_group({
					zone: ZONE,
					instanceGroupId: "not-a-uuid",
				}),
			).rejects.toThrow();
			expect(mockFetch).not.toHaveBeenCalled();
		});
	});
});

describe("autoscaling group handlers", () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	describe("handleListInstanceGroups", () => {
		it("lists groups with the default project and returns the raw page", async () => {
			const page = {
				group_summaries: [{ id: GROUP_ID, name: "grp" }],
				next_page_token: "tok-2",
				total_count: 7,
			};
			mockFetch.mockResolvedValue(page);
			const result = await handlers.handleListInstanceGroups({ zone: ZONE });
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({ method: "GET", path: GROUPS_PATH }),
			);
			const call = lastCall();
			expect(call.urlParams).toBeInstanceOf(URLSearchParams);
			expect(call.urlParams?.toString()).toBe(`project_id=${PROJECT_ID}`);
			expect(call.body).toBeUndefined();
			expect(parsed(result)).toEqual(page);
		});

		it("passes every filter and token pagination as query params", async () => {
			mockFetch.mockResolvedValue({ group_summaries: [], total_count: 0 });
			await handlers.handleListInstanceGroups({
				zone: ZONE,
				projectId: OTHER_PROJECT_ID,
				orderBy: "created_at_asc",
				templateId: TEMPLATE_ID,
				loadBalancerId: LB_ID,
				pageSize: 10,
				pageToken: "tok-1",
			});
			const q = lastCall().urlParams as URLSearchParams;
			expect(q.get("project_id")).toBe(OTHER_PROJECT_ID);
			expect(q.get("order_by")).toBe("created_at_asc");
			expect(q.get("template_id")).toBe(TEMPLATE_ID);
			expect(q.get("load_balancer_id")).toBe(LB_ID);
			expect(q.get("page_size")).toBe("10");
			expect(q.get("page_token")).toBe("tok-1");
			expect(q.has("page")).toBe(false);
		});

		it("maps a ScalewayError 401 to permission_denied", async () => {
			mockFetch.mockRejectedValue(scalewayError(401));
			const result: ToolResult = await handlers.handleListInstanceGroups({ zone: ZONE });
			expect(result.isError).toBe(true);
			expect(parsed(result).error.type).toBe("permission_denied");
			expect(parsed(result).error.statusCode).toBe(401);
		});
	});

	describe("handleGetInstanceGroup", () => {
		it("returns group details", async () => {
			mockFetch.mockResolvedValue({ id: GROUP_ID, name: "grp", status: "active" });
			const result = await handlers.handleGetInstanceGroup({
				zone: ZONE,
				instanceGroupId: GROUP_ID,
			});
			expect(mockFetch).toHaveBeenCalledWith({
				method: "GET",
				path: `${GROUPS_PATH}/${GROUP_ID}`,
			});
			expect(parsed(result).name).toBe("grp");
			expect(parsed(result).status).toBe("active");
		});

		it("maps 404 to not_found", async () => {
			mockFetch.mockRejectedValue(scalewayError(404));
			const result: ToolResult = await handlers.handleGetInstanceGroup({
				zone: ZONE,
				instanceGroupId: GROUP_ID,
			});
			expect(result.isError).toBe(true);
			expect(parsed(result).error.type).toBe("not_found");
		});
	});

	describe("handleCreateInstanceGroup", () => {
		it("creates with full v1alpha2 body", async () => {
			mockFetch.mockResolvedValue({ id: GROUP_ID });
			const scalingPolicySpec = {
				minimum_size: 2,
				maximum_size: 8,
				scale_out_cooldown: "300s",
				scale_in_cooldown: "600s",
				scale_in_step: 1,
				scale_out_step: 2,
				cpu_target: { target_avg_percent: 30 },
			};
			const loadBalancerConfigurationSpec = {
				load_balancer_id: LB_ID,
				backends: [
					{ backend_id: BACKEND_ID, address_family: "ipv4" as const, private_network_id: PN_ID },
				],
				auto_healing: { enabled: true, grace_period: "300s" },
			};
			const result = await handlers.handleCreateInstanceGroup({
				zone: ZONE,
				name: "grp",
				templateId: TEMPLATE_ID,
				projectId: OTHER_PROJECT_ID,
				tags: ["prod"],
				scalingPolicySpec,
				loadBalancerConfigurationSpec,
			});
			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: GROUPS_PATH,
				body: JSON.stringify({
					project_id: OTHER_PROJECT_ID,
					name: "grp",
					tags: ["prod"],
					template_id: TEMPLATE_ID,
					scaling_policy_spec: scalingPolicySpec,
					load_balancer_configuration_spec: loadBalancerConfigurationSpec,
				}),
				headers: JSON_HEADERS,
			});
			expect(parsed(result).id).toBe(GROUP_ID);
		});

		it("creates with minimal body and defaults project_id", async () => {
			mockFetch.mockResolvedValue({ id: GROUP_ID });
			await handlers.handleCreateInstanceGroup({
				zone: ZONE,
				name: "grp",
				templateId: TEMPLATE_ID,
			});
			const call = lastCall();
			expect(call.method).toBe("POST");
			expect(JSON.parse(call.body as string)).toEqual({
				project_id: PROJECT_ID,
				name: "grp",
				template_id: TEMPLATE_ID,
			});
			expect(call.headers).toEqual(JSON_HEADERS);
		});

		it("maps 400 to invalid_input", async () => {
			mockFetch.mockRejectedValue(scalewayError(400));
			const result: ToolResult = await handlers.handleCreateInstanceGroup({
				zone: ZONE,
				name: "grp",
				templateId: TEMPLATE_ID,
			});
			expect(result.isError).toBe(true);
			expect(parsed(result).error.type).toBe("invalid_input");
		});
	});

	describe("handleUpdateInstanceGroup", () => {
		it("patches provided fields only", async () => {
			mockFetch.mockResolvedValue({ id: GROUP_ID });
			await handlers.handleUpdateInstanceGroup({
				zone: ZONE,
				instanceGroupId: GROUP_ID,
				name: "new",
				templateId: TEMPLATE_ID,
				scalingPolicySpec: { minimum_size: 1, maximum_size: 4, fixed_size: { size: 3 } },
			});
			expect(mockFetch).toHaveBeenCalledWith({
				method: "PATCH",
				path: `${GROUPS_PATH}/${GROUP_ID}`,
				body: JSON.stringify({
					name: "new",
					template_id: TEMPLATE_ID,
					scaling_policy_spec: { minimum_size: 1, maximum_size: 4, fixed_size: { size: 3 } },
				}),
				headers: JSON_HEADERS,
			});
		});

		it("sends an empty body when no fields are provided", async () => {
			mockFetch.mockResolvedValue({ id: GROUP_ID });
			await handlers.handleUpdateInstanceGroup({ zone: ZONE, instanceGroupId: GROUP_ID });
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({ method: "PATCH", body: JSON.stringify({}) }),
			);
		});

		it("maps an error without status to server_error", async () => {
			mockFetch.mockRejectedValue(scalewayError());
			const result: ToolResult = await handlers.handleUpdateInstanceGroup({
				zone: ZONE,
				instanceGroupId: GROUP_ID,
			});
			expect(result.isError).toBe(true);
			expect(parsed(result).error.type).toBe("server_error");
			expect(parsed(result).error.statusCode).toBe(500);
		});
	});

	describe("handleDeleteInstanceGroup", () => {
		it("deletes and returns the group in deleting status (200, not 204)", async () => {
			mockFetch.mockResolvedValue({ id: GROUP_ID, status: "deleting" });
			const result = await handlers.handleDeleteInstanceGroup({
				zone: ZONE,
				instanceGroupId: GROUP_ID,
			});
			expect(mockFetch).toHaveBeenCalledWith({
				method: "DELETE",
				path: `${GROUPS_PATH}/${GROUP_ID}`,
			});
			expect(parsed(result)).toEqual({ id: GROUP_ID, status: "deleting" });
		});

		it("maps 403 to permission_denied", async () => {
			mockFetch.mockRejectedValue(scalewayError(403));
			const result: ToolResult = await handlers.handleDeleteInstanceGroup({
				zone: ZONE,
				instanceGroupId: GROUP_ID,
			});
			expect(result.isError).toBe(true);
			expect(parsed(result).error.type).toBe("permission_denied");
		});
	});

	describe("handleListInstanceGroupEvents (logs)", () => {
		it("lists logs via /logs?group_id=", async () => {
			const page = {
				logs: [{ level: "info", message: "scaled out", timestamp: "2025-06-01T12:00:00Z" }],
				total_count: 1,
			};
			mockFetch.mockResolvedValue(page);
			const result = await handlers.handleListInstanceGroupEvents({
				zone: ZONE,
				instanceGroupId: GROUP_ID,
			});
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({ method: "GET", path: LOGS_PATH }),
			);
			expect(lastCall().urlParams?.toString()).toBe(`group_id=${GROUP_ID}`);
			expect(parsed(result)).toEqual(page);
		});

		it("passes time window and pagination", async () => {
			mockFetch.mockResolvedValue({ logs: [], total_count: 0 });
			await handlers.handleListInstanceGroupEvents({
				zone: ZONE,
				instanceGroupId: GROUP_ID,
				startTime: "2025-06-01T00:00:00Z",
				endTime: "2025-06-02T00:00:00Z",
				pageSize: 25,
				pageToken: "tok",
			});
			const q = lastCall().urlParams as URLSearchParams;
			expect(q.get("group_id")).toBe(GROUP_ID);
			expect(q.get("start_time")).toBe("2025-06-01T00:00:00Z");
			expect(q.get("end_time")).toBe("2025-06-02T00:00:00Z");
			expect(q.get("page_size")).toBe("25");
			expect(q.get("page_token")).toBe("tok");
		});

		it("maps 429 to rate_limited", async () => {
			mockFetch.mockRejectedValue(scalewayError(429));
			const result: ToolResult = await handlers.handleListInstanceGroupEvents({
				zone: ZONE,
				instanceGroupId: GROUP_ID,
			});
			expect(result.isError).toBe(true);
			expect(parsed(result).error.type).toBe("rate_limited");
		});
	});

	describe("handleListInstanceGroupServers", () => {
		it("lists servers via /servers?group_id=", async () => {
			const page = { servers: [{ server_id: "srv-1" }], total_count: 1 };
			mockFetch.mockResolvedValue(page);
			const result = await handlers.handleListInstanceGroupServers({
				zone: ZONE,
				instanceGroupId: GROUP_ID,
				pageSize: 5,
				pageToken: "t",
			});
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({ method: "GET", path: SERVERS_PATH }),
			);
			const q = lastCall().urlParams as URLSearchParams;
			expect(q.get("group_id")).toBe(GROUP_ID);
			expect(q.get("page_size")).toBe("5");
			expect(q.get("page_token")).toBe("t");
			expect(parsed(result)).toEqual(page);
		});

		it("maps 404 to not_found", async () => {
			mockFetch.mockRejectedValue(scalewayError(404));
			const result: ToolResult = await handlers.handleListInstanceGroupServers({
				zone: ZONE,
				instanceGroupId: GROUP_ID,
			});
			expect(result.isError).toBe(true);
			expect(parsed(result).error.type).toBe("not_found");
		});
	});

	describe("handleListInstanceGroupAlerts", () => {
		it("scopes by group_id when instanceGroupId is given (wins over projectId)", async () => {
			const page = {
				alerts: [{ type: "out_of_stock", group_id: GROUP_ID, failing_quotas: [] }],
				total_count: 1,
			};
			mockFetch.mockResolvedValue(page);
			const result = await handlers.handleListInstanceGroupAlerts({
				zone: ZONE,
				instanceGroupId: GROUP_ID,
				projectId: OTHER_PROJECT_ID,
				pageSize: 20,
				pageToken: "tok",
			});
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({ method: "GET", path: ALERTS_PATH }),
			);
			const q = lastCall().urlParams as URLSearchParams;
			expect(q.get("group_id")).toBe(GROUP_ID);
			expect(q.has("project_id")).toBe(false);
			expect(q.get("page_size")).toBe("20");
			expect(q.get("page_token")).toBe("tok");
			expect(parsed(result)).toEqual(page);
		});

		it("scopes by explicit project_id when no group is given", async () => {
			mockFetch.mockResolvedValue({ alerts: [], total_count: 0 });
			await handlers.handleListInstanceGroupAlerts({ zone: ZONE, projectId: OTHER_PROJECT_ID });
			expect(lastCall().urlParams?.toString()).toBe(`project_id=${OTHER_PROJECT_ID}`);
		});

		it("falls back to the default project when neither scope is given", async () => {
			mockFetch.mockResolvedValue({ alerts: [], total_count: 0 });
			await handlers.handleListInstanceGroupAlerts({ zone: ZONE });
			expect(lastCall().urlParams?.toString()).toBe(`project_id=${PROJECT_ID}`);
		});

		it("maps 401 to permission_denied", async () => {
			mockFetch.mockRejectedValue(scalewayError(401));
			const result: ToolResult = await handlers.handleListInstanceGroupAlerts({ zone: ZONE });
			expect(result.isError).toBe(true);
			expect(parsed(result).error.type).toBe("permission_denied");
		});
	});
});

describe("autoscaling instance template handlers (Instance API v2alpha1)", () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	describe("handleListInstanceTemplates", () => {
		it("lists templates with the default project", async () => {
			const page = { templates: [{ id: TEMPLATE_ID }], next_page_token: null, total_count: 1 };
			mockFetch.mockResolvedValue(page);
			const result = await handlers.handleListInstanceTemplates({ zone: ZONE });
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({ method: "GET", path: TEMPLATES_PATH }),
			);
			expect(lastCall().urlParams?.toString()).toBe(`project_id=${PROJECT_ID}`);
			expect(parsed(result)).toEqual(page);
		});

		it("passes filters, repeated array params and token pagination", async () => {
			mockFetch.mockResolvedValue({ templates: [], total_count: 0 });
			await handlers.handleListInstanceTemplates({
				zone: ZONE,
				projectId: OTHER_PROJECT_ID,
				orderBy: "updated_at_desc",
				name: "web",
				tags: ["a", "b"],
				templateIds: [TEMPLATE_ID],
				pageSize: 10,
				pageToken: "tok-1",
			});
			const q = lastCall().urlParams as URLSearchParams;
			expect(q.get("project_id")).toBe(OTHER_PROJECT_ID);
			expect(q.get("order_by")).toBe("updated_at_desc");
			expect(q.get("name")).toBe("web");
			expect(q.getAll("tags")).toEqual(["a", "b"]);
			expect(q.getAll("template_ids")).toEqual([TEMPLATE_ID]);
			expect(q.get("page_size")).toBe("10");
			expect(q.get("page_token")).toBe("tok-1");
		});

		it("maps 500 to server_error", async () => {
			mockFetch.mockRejectedValue(scalewayError(500));
			const result: ToolResult = await handlers.handleListInstanceTemplates({ zone: ZONE });
			expect(result.isError).toBe(true);
			expect(parsed(result).error.type).toBe("server_error");
		});
	});

	describe("handleGetInstanceTemplate", () => {
		it("returns template details", async () => {
			mockFetch.mockResolvedValue({ id: TEMPLATE_ID, server_type: "PLAY2-NANO" });
			const result = await handlers.handleGetInstanceTemplate({
				zone: ZONE,
				instanceTemplateId: TEMPLATE_ID,
			});
			expect(mockFetch).toHaveBeenCalledWith({
				method: "GET",
				path: `${TEMPLATES_PATH}/${TEMPLATE_ID}`,
			});
			expect(parsed(result).server_type).toBe("PLAY2-NANO");
		});

		it("maps 404 to not_found", async () => {
			mockFetch.mockRejectedValue(scalewayError(404));
			const result: ToolResult = await handlers.handleGetInstanceTemplate({
				zone: ZONE,
				instanceTemplateId: TEMPLATE_ID,
			});
			expect(result.isError).toBe(true);
			expect(parsed(result).error.type).toBe("not_found");
		});
	});

	describe("handleCreateInstanceTemplate", () => {
		it("creates with full body", async () => {
			mockFetch.mockResolvedValue({ id: TEMPLATE_ID });
			const volumes = [
				{ volume_type: "sbs" as const, name: "boot", image_label: "ubuntu_noble", size: 20e9 },
				{ volume_type: "sbs" as const, name: "data", base_snapshot_id: SNAPSHOT_ID, tags: ["d"] },
			];
			await handlers.handleCreateInstanceTemplate({
				zone: ZONE,
				name: "tpl",
				serverType: "PLAY2-NANO",
				projectId: OTHER_PROJECT_ID,
				tags: ["web"],
				serverTags: ["srv"],
				securityGroupId: LB_ID,
				placementGroupId: BACKEND_ID,
				volumes,
				privateNetworks: [{ private_network_id: PN_ID }],
				filesystemIds: [SNAPSHOT_ID],
				publicIpV4Count: 1,
				publicIpV6Count: 0,
				windowsRdpSshKeyId: PN_ID,
			});
			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: TEMPLATES_PATH,
				body: JSON.stringify({
					project_id: OTHER_PROJECT_ID,
					name: "tpl",
					tags: ["web"],
					server_tags: ["srv"],
					server_type: "PLAY2-NANO",
					security_group_id: LB_ID,
					placement_group_id: BACKEND_ID,
					volumes,
					private_networks: [{ private_network_id: PN_ID }],
					filesystem_ids: [SNAPSHOT_ID],
					public_ip_v4_count: 1,
					public_ip_v6_count: 0,
					windows_rdp_ssh_key_id: PN_ID,
				}),
				headers: JSON_HEADERS,
			});
		});

		it("creates with minimal body and defaults project_id", async () => {
			mockFetch.mockResolvedValue({ id: TEMPLATE_ID });
			await handlers.handleCreateInstanceTemplate({
				zone: ZONE,
				name: "tpl",
				serverType: "DEV1-S",
			});
			const call = lastCall();
			expect(call.path).toBe(TEMPLATES_PATH);
			expect(JSON.parse(call.body as string)).toEqual({
				project_id: PROJECT_ID,
				name: "tpl",
				server_type: "DEV1-S",
			});
		});

		it("maps 400 to invalid_input", async () => {
			mockFetch.mockRejectedValue(scalewayError(400));
			const result: ToolResult = await handlers.handleCreateInstanceTemplate({
				zone: ZONE,
				name: "tpl",
				serverType: "DEV1-S",
			});
			expect(result.isError).toBe(true);
			expect(parsed(result).error.type).toBe("invalid_input");
		});
	});

	describe("handleUpdateInstanceTemplate", () => {
		it("wraps volumes and private networks in update_* envelopes", async () => {
			mockFetch.mockResolvedValue({ id: TEMPLATE_ID });
			const volumes = [{ volume_type: "l_ssd" as const, name: "boot", image_label: "debian_12" }];
			await handlers.handleUpdateInstanceTemplate({
				zone: ZONE,
				instanceTemplateId: TEMPLATE_ID,
				name: "new",
				serverType: "PLAY2-MICRO",
				tags: ["t"],
				serverTags: ["s"],
				securityGroupId: LB_ID,
				placementGroupId: BACKEND_ID,
				volumes,
				privateNetworks: [{ private_network_id: PN_ID }],
				filesystemIds: [],
				publicIpV4Count: 2,
				publicIpV6Count: 1,
				windowsRdpSshKeyId: PN_ID,
			});
			expect(mockFetch).toHaveBeenCalledWith({
				method: "PATCH",
				path: `${TEMPLATES_PATH}/${TEMPLATE_ID}`,
				body: JSON.stringify({
					name: "new",
					tags: ["t"],
					server_tags: ["s"],
					server_type: "PLAY2-MICRO",
					security_group_id: LB_ID,
					placement_group_id: BACKEND_ID,
					update_volumes: { volumes },
					update_private_networks: { private_networks: [{ private_network_id: PN_ID }] },
					filesystem_ids: [],
					public_ip_v4_count: 2,
					public_ip_v6_count: 1,
					windows_rdp_ssh_key_id: PN_ID,
				}),
				headers: JSON_HEADERS,
			});
		});

		it("omits update_* envelopes and sends an empty body when nothing is provided", async () => {
			mockFetch.mockResolvedValue({ id: TEMPLATE_ID });
			await handlers.handleUpdateInstanceTemplate({
				zone: ZONE,
				instanceTemplateId: TEMPLATE_ID,
			});
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({ method: "PATCH", body: JSON.stringify({}) }),
			);
		});

		it("maps 404 to not_found", async () => {
			mockFetch.mockRejectedValue(scalewayError(404));
			const result: ToolResult = await handlers.handleUpdateInstanceTemplate({
				zone: ZONE,
				instanceTemplateId: TEMPLATE_ID,
			});
			expect(result.isError).toBe(true);
			expect(parsed(result).error.type).toBe("not_found");
		});
	});

	describe("handleDeleteInstanceTemplate", () => {
		it("deletes with the required empty JSON body and confirms", async () => {
			mockFetch.mockResolvedValue(undefined);
			const result = await handlers.handleDeleteInstanceTemplate({
				zone: ZONE,
				instanceTemplateId: TEMPLATE_ID,
			});
			expect(mockFetch).toHaveBeenCalledWith({
				method: "DELETE",
				path: `${TEMPLATES_PATH}/${TEMPLATE_ID}`,
				body: "{}",
				headers: JSON_HEADERS,
			});
			expect(parsed(result)).toEqual({ deleted: true, id: TEMPLATE_ID });
		});

		it("maps 403 to permission_denied", async () => {
			mockFetch.mockRejectedValue(scalewayError(403));
			const result: ToolResult = await handlers.handleDeleteInstanceTemplate({
				zone: ZONE,
				instanceTemplateId: TEMPLATE_ID,
			});
			expect(result.isError).toBe(true);
			expect(parsed(result).error.type).toBe("permission_denied");
		});
	});

	describe("handleGetInstanceTemplateCloudInit", () => {
		it("returns the cloud-init user data", async () => {
			mockFetch.mockResolvedValue({ key: "cloud-init", content: "#cloud-config\n" });
			const result = await handlers.handleGetInstanceTemplateCloudInit({
				zone: ZONE,
				instanceTemplateId: TEMPLATE_ID,
			});
			expect(mockFetch).toHaveBeenCalledWith({
				method: "GET",
				path: `${TEMPLATES_PATH}/${TEMPLATE_ID}/user-data/cloud-init`,
			});
			expect(parsed(result)).toEqual({ key: "cloud-init", content: "#cloud-config\n" });
		});

		it("maps 404 to not_found", async () => {
			mockFetch.mockRejectedValue(scalewayError(404));
			const result: ToolResult = await handlers.handleGetInstanceTemplateCloudInit({
				zone: ZONE,
				instanceTemplateId: TEMPLATE_ID,
			});
			expect(result.isError).toBe(true);
			expect(parsed(result).error.type).toBe("not_found");
		});
	});

	describe("handleSetInstanceTemplateCloudInit", () => {
		it("PUTs the content and confirms on 204", async () => {
			mockFetch.mockResolvedValue(undefined);
			const result = await handlers.handleSetInstanceTemplateCloudInit({
				zone: ZONE,
				instanceTemplateId: TEMPLATE_ID,
				content: "#cloud-config\npackages: [nginx]",
			});
			expect(mockFetch).toHaveBeenCalledWith({
				method: "PUT",
				path: `${TEMPLATES_PATH}/${TEMPLATE_ID}/user-data/cloud-init`,
				body: JSON.stringify({ content: "#cloud-config\npackages: [nginx]" }),
				headers: JSON_HEADERS,
			});
			expect(parsed(result)).toEqual({ updated: true, id: TEMPLATE_ID, key: "cloud-init" });
		});

		it("maps 400 to invalid_input", async () => {
			mockFetch.mockRejectedValue(scalewayError(400));
			const result: ToolResult = await handlers.handleSetInstanceTemplateCloudInit({
				zone: ZONE,
				instanceTemplateId: TEMPLATE_ID,
				content: "",
			});
			expect(result.isError).toBe(true);
			expect(parsed(result).error.type).toBe("invalid_input");
		});
	});
});
