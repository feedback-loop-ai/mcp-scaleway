import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	handleCreateGateway,
	handleCreateGatewayNetwork,
	handleCreateIP,
	handleCreatePatRule,
	handleDeleteGateway,
	handleDeleteGatewayNetwork,
	handleDeleteIP,
	handleDeletePatRule,
	handleGetGateway,
	handleGetGatewayNetwork,
	handleGetIP,
	handleGetPatRule,
	handleListGatewayNetworks,
	handleListGatewayTypes,
	handleListGateways,
	handleListIPs,
	handleListPatRules,
	handleUpdateGateway,
	handleUpdateGatewayNetwork,
	handleUpdateIP,
	handleUpdatePatRule,
	toURLSearchParams,
} from "../../../src/tools/public-gateway/handlers.js";
import { registerPublicGatewayTools } from "../../../src/tools/public-gateway/index.js";
import {
	CreateGatewayNetworkParams,
	CreateGatewayParams,
	CreateIPParams,
	CreatePatRuleParams,
	DeleteGatewayNetworkParams,
	DeleteGatewayParams,
	DeleteIPParams,
	DeletePatRuleParams,
	GatewayNetworkStatus,
	GatewayStatus,
	GetGatewayNetworkParams,
	GetGatewayParams,
	GetIPParams,
	GetPatRuleParams,
	ListGatewayNetworksOrderBy,
	ListGatewayNetworksParams,
	ListGatewayTypesParams,
	ListGatewaysOrderBy,
	ListGatewaysParams,
	ListIPsOrderBy,
	ListIPsParams,
	ListPatRulesOrderBy,
	ListPatRulesParams,
	PatRuleProtocol,
	UpdateGatewayNetworkParams,
	UpdateGatewayParams,
	UpdateIPParams,
	UpdatePatRuleParams,
} from "../../../src/tools/public-gateway/types.js";

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

describe("public-gateway module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerPublicGatewayTools(server)).not.toThrow();
	});
});

// ─── Type/Schema Tests ───────────────────────────────────────────────────────

describe("public-gateway types", () => {
	describe("GatewayStatus enum", () => {
		it("accepts valid statuses", () => {
			expect(GatewayStatus.parse("running")).toBe("running");
			expect(GatewayStatus.parse("stopped")).toBe("stopped");
			expect(GatewayStatus.parse("unknown_status")).toBe("unknown_status");
			expect(GatewayStatus.parse("allocating")).toBe("allocating");
			expect(GatewayStatus.parse("configuring")).toBe("configuring");
			expect(GatewayStatus.parse("stopping")).toBe("stopping");
			expect(GatewayStatus.parse("failed")).toBe("failed");
			expect(GatewayStatus.parse("deleting")).toBe("deleting");
			expect(GatewayStatus.parse("locked")).toBe("locked");
		});

		it("rejects invalid status", () => {
			expect(() => GatewayStatus.parse("invalid")).toThrow();
		});
	});

	describe("GatewayNetworkStatus enum", () => {
		it("accepts valid statuses", () => {
			expect(GatewayNetworkStatus.parse("ready")).toBe("ready");
			expect(GatewayNetworkStatus.parse("unknown_status")).toBe("unknown_status");
			expect(GatewayNetworkStatus.parse("created")).toBe("created");
			expect(GatewayNetworkStatus.parse("attaching")).toBe("attaching");
			expect(GatewayNetworkStatus.parse("configuring")).toBe("configuring");
			expect(GatewayNetworkStatus.parse("detaching")).toBe("detaching");
		});

		it("rejects invalid status", () => {
			expect(() => GatewayNetworkStatus.parse("invalid")).toThrow();
		});
	});

	describe("PatRuleProtocol enum", () => {
		it("accepts valid protocols", () => {
			expect(PatRuleProtocol.parse("tcp")).toBe("tcp");
			expect(PatRuleProtocol.parse("udp")).toBe("udp");
			expect(PatRuleProtocol.parse("both")).toBe("both");
			expect(PatRuleProtocol.parse("unknown_protocol")).toBe("unknown_protocol");
		});

		it("rejects invalid protocol", () => {
			expect(() => PatRuleProtocol.parse("invalid")).toThrow();
		});
	});

	describe("OrderBy enums", () => {
		it("ListGatewaysOrderBy accepts valid values", () => {
			expect(ListGatewaysOrderBy.parse("created_at_asc")).toBe("created_at_asc");
			expect(ListGatewaysOrderBy.parse("name_desc")).toBe("name_desc");
			expect(ListGatewaysOrderBy.parse("type_asc")).toBe("type_asc");
			expect(ListGatewaysOrderBy.parse("status_desc")).toBe("status_desc");
		});

		it("ListGatewayNetworksOrderBy accepts valid values", () => {
			expect(ListGatewayNetworksOrderBy.parse("created_at_asc")).toBe("created_at_asc");
			expect(ListGatewayNetworksOrderBy.parse("status_desc")).toBe("status_desc");
		});

		it("ListPatRulesOrderBy accepts valid values", () => {
			expect(ListPatRulesOrderBy.parse("created_at_asc")).toBe("created_at_asc");
			expect(ListPatRulesOrderBy.parse("public_port_desc")).toBe("public_port_desc");
		});

		it("ListIPsOrderBy accepts valid values", () => {
			expect(ListIPsOrderBy.parse("address_asc")).toBe("address_asc");
			expect(ListIPsOrderBy.parse("reverse_desc")).toBe("reverse_desc");
		});
	});

	describe("ListGatewaysParams", () => {
		it("parses minimal params with defaults", () => {
			const result = ListGatewaysParams.parse({});
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});

		it("parses all filters", () => {
			const result = ListGatewaysParams.parse({
				zone: "fr-par-1",
				page: 2,
				pageSize: 10,
				orderBy: "name_asc",
				organizationId: "00000000-0000-0000-0000-000000000001",
				projectId: "00000000-0000-0000-0000-000000000002",
				name: "my-gw",
				tags: ["prod"],
				types: ["VPC-GW-S"],
				status: ["running"],
				privateNetworkIds: ["00000000-0000-0000-0000-000000000003"],
				includeLegacy: true,
			});
			expect(result.name).toBe("my-gw");
			expect(result.includeLegacy).toBe(true);
		});
	});

	describe("GetGatewayParams", () => {
		it("requires gatewayId as UUID", () => {
			expect(() => GetGatewayParams.parse({})).toThrow();
			expect(() => GetGatewayParams.parse({ gatewayId: "not-uuid" })).toThrow();
			expect(
				GetGatewayParams.parse({ gatewayId: "00000000-0000-0000-0000-000000000001" }),
			).toBeTruthy();
		});
	});

	describe("CreateGatewayParams", () => {
		it("requires type, enableSmtp, enableBastion", () => {
			expect(() => CreateGatewayParams.parse({})).toThrow();
			const result = CreateGatewayParams.parse({
				type: "VPC-GW-S",
				enableSmtp: false,
				enableBastion: true,
			});
			expect(result.type).toBe("VPC-GW-S");
		});

		it("accepts optional fields", () => {
			const result = CreateGatewayParams.parse({
				type: "VPC-GW-S",
				enableSmtp: false,
				enableBastion: true,
				zone: "nl-ams-1",
				projectId: "00000000-0000-0000-0000-000000000001",
				name: "my-gw",
				tags: ["prod"],
				ipId: "00000000-0000-0000-0000-000000000002",
				bastionPort: 61000,
			});
			expect(result.bastionPort).toBe(61000);
		});
	});

	describe("UpdateGatewayParams", () => {
		it("requires gatewayId", () => {
			expect(() => UpdateGatewayParams.parse({})).toThrow();
		});

		it("accepts optional update fields", () => {
			const result = UpdateGatewayParams.parse({
				gatewayId: "00000000-0000-0000-0000-000000000001",
				name: "new-name",
				tags: ["updated"],
				enableBastion: false,
				bastionPort: 22,
				enableSmtp: true,
			});
			expect(result.name).toBe("new-name");
		});
	});

	describe("DeleteGatewayParams", () => {
		it("requires gatewayId and deleteIp", () => {
			expect(() => DeleteGatewayParams.parse({})).toThrow();
			const result = DeleteGatewayParams.parse({
				gatewayId: "00000000-0000-0000-0000-000000000001",
				deleteIp: true,
			});
			expect(result.deleteIp).toBe(true);
		});
	});

	describe("Gateway Network Params", () => {
		it("ListGatewayNetworksParams parses with defaults", () => {
			const result = ListGatewayNetworksParams.parse({});
			expect(result.page).toBe(1);
		});

		it("ListGatewayNetworksParams accepts all filters", () => {
			const result = ListGatewayNetworksParams.parse({
				status: ["ready"],
				gatewayIds: ["00000000-0000-0000-0000-000000000001"],
				privateNetworkIds: ["00000000-0000-0000-0000-000000000002"],
				masqueradeEnabled: true,
				orderBy: "created_at_desc",
			});
			expect(result.masqueradeEnabled).toBe(true);
		});

		it("GetGatewayNetworkParams requires gatewayNetworkId", () => {
			expect(() => GetGatewayNetworkParams.parse({})).toThrow();
			expect(
				GetGatewayNetworkParams.parse({
					gatewayNetworkId: "00000000-0000-0000-0000-000000000001",
				}),
			).toBeTruthy();
		});

		it("CreateGatewayNetworkParams requires fields", () => {
			expect(() => CreateGatewayNetworkParams.parse({})).toThrow();
			const result = CreateGatewayNetworkParams.parse({
				gatewayId: "00000000-0000-0000-0000-000000000001",
				privateNetworkId: "00000000-0000-0000-0000-000000000002",
				enableMasquerade: true,
				pushDefaultRoute: false,
			});
			expect(result.enableMasquerade).toBe(true);
		});

		it("CreateGatewayNetworkParams accepts ipamIpId", () => {
			const result = CreateGatewayNetworkParams.parse({
				gatewayId: "00000000-0000-0000-0000-000000000001",
				privateNetworkId: "00000000-0000-0000-0000-000000000002",
				enableMasquerade: true,
				pushDefaultRoute: false,
				ipamIpId: "00000000-0000-0000-0000-000000000003",
			});
			expect(result.ipamIpId).toBe("00000000-0000-0000-0000-000000000003");
		});

		it("UpdateGatewayNetworkParams requires gatewayNetworkId", () => {
			expect(() => UpdateGatewayNetworkParams.parse({})).toThrow();
			const result = UpdateGatewayNetworkParams.parse({
				gatewayNetworkId: "00000000-0000-0000-0000-000000000001",
				enableMasquerade: false,
				pushDefaultRoute: true,
				ipamIpId: "00000000-0000-0000-0000-000000000002",
			});
			expect(result.pushDefaultRoute).toBe(true);
		});

		it("DeleteGatewayNetworkParams requires gatewayNetworkId", () => {
			expect(() => DeleteGatewayNetworkParams.parse({})).toThrow();
		});
	});

	describe("PAT Rule Params", () => {
		it("ListPatRulesParams parses with defaults", () => {
			const result = ListPatRulesParams.parse({});
			expect(result.page).toBe(1);
		});

		it("ListPatRulesParams accepts all filters", () => {
			const result = ListPatRulesParams.parse({
				gatewayIds: ["00000000-0000-0000-0000-000000000001"],
				privateIps: ["192.168.1.10"],
				protocol: "tcp",
				orderBy: "public_port_asc",
			});
			expect(result.protocol).toBe("tcp");
		});

		it("GetPatRuleParams requires patRuleId", () => {
			expect(() => GetPatRuleParams.parse({})).toThrow();
		});

		it("CreatePatRuleParams requires all fields", () => {
			expect(() => CreatePatRuleParams.parse({})).toThrow();
			const result = CreatePatRuleParams.parse({
				gatewayId: "00000000-0000-0000-0000-000000000001",
				publicPort: 8080,
				privateIp: "192.168.1.10",
				privatePort: 80,
				protocol: "tcp",
			});
			expect(result.publicPort).toBe(8080);
		});

		it("CreatePatRuleParams rejects invalid ports", () => {
			expect(() =>
				CreatePatRuleParams.parse({
					gatewayId: "00000000-0000-0000-0000-000000000001",
					publicPort: 0,
					privateIp: "192.168.1.10",
					privatePort: 80,
				}),
			).toThrow();
			expect(() =>
				CreatePatRuleParams.parse({
					gatewayId: "00000000-0000-0000-0000-000000000001",
					publicPort: 80,
					privateIp: "192.168.1.10",
					privatePort: 70000,
				}),
			).toThrow();
		});

		it("UpdatePatRuleParams requires patRuleId", () => {
			expect(() => UpdatePatRuleParams.parse({})).toThrow();
			const result = UpdatePatRuleParams.parse({
				patRuleId: "00000000-0000-0000-0000-000000000001",
				publicPort: 443,
				privateIp: "10.0.0.1",
				privatePort: 8443,
				protocol: "udp",
			});
			expect(result.publicPort).toBe(443);
		});

		it("DeletePatRuleParams requires patRuleId", () => {
			expect(() => DeletePatRuleParams.parse({})).toThrow();
		});
	});

	describe("IP Params", () => {
		it("ListIPsParams parses with defaults", () => {
			const result = ListIPsParams.parse({});
			expect(result.page).toBe(1);
		});

		it("ListIPsParams accepts all filters", () => {
			const result = ListIPsParams.parse({
				organizationId: "00000000-0000-0000-0000-000000000001",
				projectId: "00000000-0000-0000-0000-000000000002",
				tags: ["prod"],
				reverse: "gw.example.com",
				isFree: true,
				orderBy: "address_asc",
			});
			expect(result.isFree).toBe(true);
		});

		it("GetIPParams requires ipId", () => {
			expect(() => GetIPParams.parse({})).toThrow();
		});

		it("CreateIPParams accepts optional fields", () => {
			const result = CreateIPParams.parse({
				projectId: "00000000-0000-0000-0000-000000000001",
				tags: ["test"],
			});
			expect(result.tags).toEqual(["test"]);
		});

		it("CreateIPParams parses empty object", () => {
			const result = CreateIPParams.parse({});
			expect(result).toBeTruthy();
		});

		it("UpdateIPParams requires ipId", () => {
			expect(() => UpdateIPParams.parse({})).toThrow();
			const result = UpdateIPParams.parse({
				ipId: "00000000-0000-0000-0000-000000000001",
				tags: ["updated"],
				reverse: "new.example.com",
				gatewayId: "",
			});
			expect(result.reverse).toBe("new.example.com");
		});

		it("DeleteIPParams requires ipId", () => {
			expect(() => DeleteIPParams.parse({})).toThrow();
		});
	});

	describe("ListGatewayTypesParams", () => {
		it("parses empty object", () => {
			const result = ListGatewayTypesParams.parse({});
			expect(result).toBeTruthy();
		});

		it("accepts zone", () => {
			const result = ListGatewayTypesParams.parse({ zone: "fr-par-1" });
			expect(result.zone).toBe("fr-par-1");
		});
	});
});

// ─── Handler Tests ───────────────────────────────────────────────────────────

describe("public-gateway handlers", () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	// ─── Gateway Handlers ────────────────────────────────────────────────

	describe("handleListGateways", () => {
		it("returns paginated gateways", async () => {
			mockFetch.mockResolvedValue({
				gateways: [{ id: "gw-1", name: "test-gw" }],
				total_count: 1,
			});

			const result = await handleListGateways({ page: 1, pageSize: 50 });
			expect(result.content[0].text).toContain("gw-1");
			expect(mockFetch).toHaveBeenCalledWith(expect.objectContaining({ method: "GET" }));
		});

		it("passes all filters as URL params", async () => {
			mockFetch.mockResolvedValue({ gateways: [], total_count: 0 });

			await handleListGateways({
				page: 2,
				pageSize: 10,
				zone: "nl-ams-1",
				orderBy: "name_asc",
				organizationId: "00000000-0000-0000-0000-000000000001",
				projectId: "00000000-0000-0000-0000-000000000002",
				name: "my-gw",
				tags: ["prod"],
				types: ["VPC-GW-S"],
				status: ["running"],
				privateNetworkIds: ["00000000-0000-0000-0000-000000000003"],
				includeLegacy: false,
			});

			const call = mockFetch.mock.calls[0][0];
			expect(call.path).toContain("nl-ams-1");
			expect(call.urlParams.get("order_by")).toBe("name_asc");
			expect(call.urlParams.get("name")).toBe("my-gw");
			expect(call.urlParams.get("include_legacy")).toBe("false");
		});

		it("handles API errors", async () => {
			const error = new Error("Unauthorized");
			Object.assign(error, { statusCode: 401 });
			mockFetch.mockRejectedValue(error);

			const result = await handleListGateways({ page: 1, pageSize: 50 });
			expect(result.isError).toBe(true);
			expect(result.content[0].text).toContain("permission_denied");
		});
	});

	describe("handleGetGateway", () => {
		it("returns gateway details", async () => {
			mockFetch.mockResolvedValue({ id: "gw-1", name: "test-gw", status: "running" });

			const result = await handleGetGateway({
				gatewayId: "00000000-0000-0000-0000-000000000001",
			});
			expect(result.content[0].text).toContain("running");
		});

		it("passes zone to URL", async () => {
			mockFetch.mockResolvedValue({ id: "gw-1" });

			await handleGetGateway({
				zone: "nl-ams-1",
				gatewayId: "00000000-0000-0000-0000-000000000001",
			});
			expect(mockFetch.mock.calls[0][0].path).toContain("nl-ams-1");
		});

		it("handles not found errors", async () => {
			const error = new Error("Not found");
			Object.assign(error, { statusCode: 404 });
			mockFetch.mockRejectedValue(error);

			const result = await handleGetGateway({
				gatewayId: "00000000-0000-0000-0000-000000000001",
			});
			expect(result.isError).toBe(true);
			expect(result.content[0].text).toContain("not_found");
		});
	});

	describe("handleCreateGateway", () => {
		it("creates a gateway with required fields", async () => {
			mockFetch.mockResolvedValue({ id: "gw-new", status: "allocating" });

			const result = await handleCreateGateway({
				type: "VPC-GW-S",
				enableSmtp: false,
				enableBastion: true,
			});
			expect(result.content[0].text).toContain("gw-new");

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.type).toBe("VPC-GW-S");
			expect(body.enable_bastion).toBe(true);
		});

		it("creates a gateway with all optional fields", async () => {
			mockFetch.mockResolvedValue({ id: "gw-new" });

			await handleCreateGateway({
				type: "VPC-GW-S",
				enableSmtp: true,
				enableBastion: true,
				zone: "fr-par-1",
				projectId: "00000000-0000-0000-0000-000000000001",
				name: "my-gw",
				tags: ["prod"],
				ipId: "00000000-0000-0000-0000-000000000002",
				bastionPort: 61000,
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.name).toBe("my-gw");
			expect(body.project_id).toBe("00000000-0000-0000-0000-000000000001");
			expect(body.ip_id).toBe("00000000-0000-0000-0000-000000000002");
			expect(body.bastion_port).toBe(61000);
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("Server error"));

			const result = await handleCreateGateway({
				type: "VPC-GW-S",
				enableSmtp: false,
				enableBastion: false,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleUpdateGateway", () => {
		it("updates gateway with all fields", async () => {
			mockFetch.mockResolvedValue({ id: "gw-1", name: "updated" });

			await handleUpdateGateway({
				gatewayId: "00000000-0000-0000-0000-000000000001",
				name: "updated",
				tags: ["new-tag"],
				enableBastion: true,
				bastionPort: 22,
				enableSmtp: false,
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.name).toBe("updated");
			expect(body.enable_bastion).toBe(true);
			expect(body.bastion_port).toBe(22);
			expect(body.enable_smtp).toBe(false);
		});

		it("sends empty body when no updates", async () => {
			mockFetch.mockResolvedValue({ id: "gw-1" });

			await handleUpdateGateway({
				gatewayId: "00000000-0000-0000-0000-000000000001",
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body).toEqual({});
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleUpdateGateway({
				gatewayId: "00000000-0000-0000-0000-000000000001",
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleDeleteGateway", () => {
		it("deletes gateway with deleteIp", async () => {
			mockFetch.mockResolvedValue({ id: "gw-1" });

			const result = await handleDeleteGateway({
				gatewayId: "00000000-0000-0000-0000-000000000001",
				deleteIp: true,
			});
			expect(result.content[0].text).toContain("gw-1");

			const call = mockFetch.mock.calls[0][0];
			expect(call.urlParams.get("delete_ip")).toBe("true");
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleDeleteGateway({
				gatewayId: "00000000-0000-0000-0000-000000000001",
				deleteIp: false,
			});
			expect(result.isError).toBe(true);
		});
	});

	// ─── Gateway Network Handlers ────────────────────────────────────────

	describe("handleListGatewayNetworks", () => {
		it("returns paginated results", async () => {
			mockFetch.mockResolvedValue({
				gateway_networks: [{ id: "gn-1" }],
				total_count: 1,
			});

			const result = await handleListGatewayNetworks({ page: 1, pageSize: 50 });
			expect(result.content[0].text).toContain("gn-1");
		});

		it("passes all filters", async () => {
			mockFetch.mockResolvedValue({ gateway_networks: [], total_count: 0 });

			await handleListGatewayNetworks({
				page: 1,
				pageSize: 50,
				zone: "fr-par-1",
				orderBy: "status_asc",
				status: ["ready"],
				gatewayIds: ["00000000-0000-0000-0000-000000000001"],
				privateNetworkIds: ["00000000-0000-0000-0000-000000000002"],
				masqueradeEnabled: true,
			});

			const call = mockFetch.mock.calls[0][0];
			expect(call.urlParams.get("masquerade_enabled")).toBe("true");
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleListGatewayNetworks({ page: 1, pageSize: 50 });
			expect(result.isError).toBe(true);
		});
	});

	describe("handleGetGatewayNetwork", () => {
		it("returns gateway network details", async () => {
			mockFetch.mockResolvedValue({ id: "gn-1", status: "ready" });

			const result = await handleGetGatewayNetwork({
				gatewayNetworkId: "00000000-0000-0000-0000-000000000001",
			});
			expect(result.content[0].text).toContain("ready");
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleGetGatewayNetwork({
				gatewayNetworkId: "00000000-0000-0000-0000-000000000001",
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleCreateGatewayNetwork", () => {
		it("creates with required fields", async () => {
			mockFetch.mockResolvedValue({ id: "gn-new" });

			await handleCreateGatewayNetwork({
				gatewayId: "00000000-0000-0000-0000-000000000001",
				privateNetworkId: "00000000-0000-0000-0000-000000000002",
				enableMasquerade: true,
				pushDefaultRoute: false,
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.gateway_id).toBe("00000000-0000-0000-0000-000000000001");
			expect(body.enable_masquerade).toBe(true);
		});

		it("creates with ipamIpId", async () => {
			mockFetch.mockResolvedValue({ id: "gn-new" });

			await handleCreateGatewayNetwork({
				gatewayId: "00000000-0000-0000-0000-000000000001",
				privateNetworkId: "00000000-0000-0000-0000-000000000002",
				enableMasquerade: true,
				pushDefaultRoute: true,
				ipamIpId: "00000000-0000-0000-0000-000000000003",
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.ipam_ip_id).toBe("00000000-0000-0000-0000-000000000003");
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleCreateGatewayNetwork({
				gatewayId: "00000000-0000-0000-0000-000000000001",
				privateNetworkId: "00000000-0000-0000-0000-000000000002",
				enableMasquerade: true,
				pushDefaultRoute: false,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleUpdateGatewayNetwork", () => {
		it("updates with all fields", async () => {
			mockFetch.mockResolvedValue({ id: "gn-1" });

			await handleUpdateGatewayNetwork({
				gatewayNetworkId: "00000000-0000-0000-0000-000000000001",
				enableMasquerade: false,
				pushDefaultRoute: true,
				ipamIpId: "00000000-0000-0000-0000-000000000002",
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.enable_masquerade).toBe(false);
			expect(body.ipam_ip_id).toBe("00000000-0000-0000-0000-000000000002");
		});

		it("sends empty body when no updates", async () => {
			mockFetch.mockResolvedValue({ id: "gn-1" });

			await handleUpdateGatewayNetwork({
				gatewayNetworkId: "00000000-0000-0000-0000-000000000001",
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body).toEqual({});
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleUpdateGatewayNetwork({
				gatewayNetworkId: "00000000-0000-0000-0000-000000000001",
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleDeleteGatewayNetwork", () => {
		it("deletes gateway network", async () => {
			mockFetch.mockResolvedValue({ id: "gn-1" });

			const result = await handleDeleteGatewayNetwork({
				gatewayNetworkId: "00000000-0000-0000-0000-000000000001",
			});
			expect(result.content[0].text).toContain("gn-1");
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleDeleteGatewayNetwork({
				gatewayNetworkId: "00000000-0000-0000-0000-000000000001",
			});
			expect(result.isError).toBe(true);
		});
	});

	// ─── PAT Rule Handlers ───────────────────────────────────────────────

	describe("handleListPatRules", () => {
		it("returns paginated PAT rules", async () => {
			mockFetch.mockResolvedValue({
				pat_rules: [{ id: "pat-1", public_port: 8080 }],
				total_count: 1,
			});

			const result = await handleListPatRules({ page: 1, pageSize: 50 });
			expect(result.content[0].text).toContain("pat-1");
		});

		it("passes all filters", async () => {
			mockFetch.mockResolvedValue({ pat_rules: [], total_count: 0 });

			await handleListPatRules({
				page: 1,
				pageSize: 50,
				orderBy: "public_port_asc",
				gatewayIds: ["00000000-0000-0000-0000-000000000001"],
				privateIps: ["192.168.1.10"],
				protocol: "tcp",
			});

			const call = mockFetch.mock.calls[0][0];
			expect(call.urlParams.get("protocol")).toBe("tcp");
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleListPatRules({ page: 1, pageSize: 50 });
			expect(result.isError).toBe(true);
		});
	});

	describe("handleGetPatRule", () => {
		it("returns PAT rule details", async () => {
			mockFetch.mockResolvedValue({ id: "pat-1", protocol: "tcp" });

			const result = await handleGetPatRule({
				patRuleId: "00000000-0000-0000-0000-000000000001",
			});
			expect(result.content[0].text).toContain("tcp");
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleGetPatRule({
				patRuleId: "00000000-0000-0000-0000-000000000001",
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleCreatePatRule", () => {
		it("creates with required fields", async () => {
			mockFetch.mockResolvedValue({ id: "pat-new" });

			await handleCreatePatRule({
				gatewayId: "00000000-0000-0000-0000-000000000001",
				publicPort: 8080,
				privateIp: "192.168.1.10",
				privatePort: 80,
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.public_port).toBe(8080);
			expect(body.protocol).toBeUndefined();
		});

		it("creates with protocol", async () => {
			mockFetch.mockResolvedValue({ id: "pat-new" });

			await handleCreatePatRule({
				gatewayId: "00000000-0000-0000-0000-000000000001",
				publicPort: 443,
				privateIp: "10.0.0.1",
				privatePort: 8443,
				protocol: "tcp",
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.protocol).toBe("tcp");
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleCreatePatRule({
				gatewayId: "00000000-0000-0000-0000-000000000001",
				publicPort: 80,
				privateIp: "10.0.0.1",
				privatePort: 80,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleUpdatePatRule", () => {
		it("updates with all fields", async () => {
			mockFetch.mockResolvedValue({ id: "pat-1" });

			await handleUpdatePatRule({
				patRuleId: "00000000-0000-0000-0000-000000000001",
				publicPort: 9090,
				privateIp: "10.0.0.2",
				privatePort: 90,
				protocol: "udp",
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.public_port).toBe(9090);
			expect(body.protocol).toBe("udp");
		});

		it("sends empty body when no updates", async () => {
			mockFetch.mockResolvedValue({ id: "pat-1" });

			await handleUpdatePatRule({
				patRuleId: "00000000-0000-0000-0000-000000000001",
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body).toEqual({});
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleUpdatePatRule({
				patRuleId: "00000000-0000-0000-0000-000000000001",
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleDeletePatRule", () => {
		it("deletes PAT rule and returns success", async () => {
			mockFetch.mockResolvedValue(undefined);

			const result = await handleDeletePatRule({
				patRuleId: "00000000-0000-0000-0000-000000000001",
			});
			expect(result.content[0].text).toContain("success");
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleDeletePatRule({
				patRuleId: "00000000-0000-0000-0000-000000000001",
			});
			expect(result.isError).toBe(true);
		});
	});

	// ─── IP Handlers ─────────────────────────────────────────────────────

	describe("handleListIPs", () => {
		it("returns paginated IPs", async () => {
			mockFetch.mockResolvedValue({
				ips: [{ id: "ip-1", address: "1.2.3.4" }],
				total_count: 1,
			});

			const result = await handleListIPs({ page: 1, pageSize: 50 });
			expect(result.content[0].text).toContain("1.2.3.4");
		});

		it("passes all filters", async () => {
			mockFetch.mockResolvedValue({ ips: [], total_count: 0 });

			await handleListIPs({
				page: 1,
				pageSize: 50,
				orderBy: "address_asc",
				organizationId: "00000000-0000-0000-0000-000000000001",
				projectId: "00000000-0000-0000-0000-000000000002",
				tags: ["prod"],
				reverse: "gw.example.com",
				isFree: true,
			});

			const call = mockFetch.mock.calls[0][0];
			expect(call.urlParams.get("is_free")).toBe("true");
			expect(call.urlParams.get("reverse")).toBe("gw.example.com");
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleListIPs({ page: 1, pageSize: 50 });
			expect(result.isError).toBe(true);
		});
	});

	describe("handleGetIP", () => {
		it("returns IP details", async () => {
			mockFetch.mockResolvedValue({ id: "ip-1", address: "1.2.3.4" });

			const result = await handleGetIP({
				ipId: "00000000-0000-0000-0000-000000000001",
			});
			expect(result.content[0].text).toContain("1.2.3.4");
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleGetIP({
				ipId: "00000000-0000-0000-0000-000000000001",
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleCreateIP", () => {
		it("creates IP with optional fields", async () => {
			mockFetch.mockResolvedValue({ id: "ip-new" });

			await handleCreateIP({
				projectId: "00000000-0000-0000-0000-000000000001",
				tags: ["test"],
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.project_id).toBe("00000000-0000-0000-0000-000000000001");
			expect(body.tags).toEqual(["test"]);
		});

		it("creates IP with empty body", async () => {
			mockFetch.mockResolvedValue({ id: "ip-new" });

			await handleCreateIP({});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body).toEqual({});
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleCreateIP({});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleUpdateIP", () => {
		it("updates with all fields", async () => {
			mockFetch.mockResolvedValue({ id: "ip-1" });

			await handleUpdateIP({
				ipId: "00000000-0000-0000-0000-000000000001",
				tags: ["updated"],
				reverse: "new.example.com",
				gatewayId: "00000000-0000-0000-0000-000000000002",
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.reverse).toBe("new.example.com");
			expect(body.gateway_id).toBe("00000000-0000-0000-0000-000000000002");
		});

		it("sends empty body when no updates", async () => {
			mockFetch.mockResolvedValue({ id: "ip-1" });

			await handleUpdateIP({
				ipId: "00000000-0000-0000-0000-000000000001",
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body).toEqual({});
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleUpdateIP({
				ipId: "00000000-0000-0000-0000-000000000001",
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleDeleteIP", () => {
		it("deletes IP and returns success", async () => {
			mockFetch.mockResolvedValue(undefined);

			const result = await handleDeleteIP({
				ipId: "00000000-0000-0000-0000-000000000001",
			});
			expect(result.content[0].text).toContain("success");
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleDeleteIP({
				ipId: "00000000-0000-0000-0000-000000000001",
			});
			expect(result.isError).toBe(true);
		});
	});

	// ─── Gateway Types Handler ───────────────────────────────────────────

	describe("handleListGatewayTypes", () => {
		it("returns gateway types", async () => {
			mockFetch.mockResolvedValue({
				types: [{ name: "VPC-GW-S", bandwidth: 200000000 }],
			});

			const result = await handleListGatewayTypes({});
			expect(result.content[0].text).toContain("VPC-GW-S");
		});

		it("passes zone", async () => {
			mockFetch.mockResolvedValue({ types: [] });

			await handleListGatewayTypes({ zone: "nl-ams-1" });
			expect(mockFetch.mock.calls[0][0].path).toContain("nl-ams-1");
		});

		it("handles errors", async () => {
			mockFetch.mockRejectedValue(new Error("fail"));
			const result = await handleListGatewayTypes({});
			expect(result.isError).toBe(true);
		});
	});

	// ─── Default zone fallback ───────────────────────────────────────────

	describe("default zone resolution", () => {
		it("uses default zone when none provided", async () => {
			mockFetch.mockResolvedValue({ id: "gw-1" });

			await handleGetGateway({
				gatewayId: "00000000-0000-0000-0000-000000000001",
			});

			expect(mockFetch.mock.calls[0][0].path).toContain("fr-par-1");
		});
	});

	// ─── Non-Error exceptions ────────────────────────────────────────────

	describe("non-Error exception handling", () => {
		it("handles non-Error thrown values", async () => {
			mockFetch.mockRejectedValue("string-error");

			const result = await handleGetGateway({
				gatewayId: "00000000-0000-0000-0000-000000000001",
			});
			expect(result.isError).toBe(true);
			expect(result.content[0].text).toContain("server_error");
		});
	});

	// ─── toURLSearchParams utility ───────────────────────────────────────

	describe("toURLSearchParams", () => {
		it("skips undefined values", () => {
			const result = toURLSearchParams({ a: "1", b: undefined, c: "3" });
			expect(result.get("a")).toBe("1");
			expect(result.has("b")).toBe(false);
			expect(result.get("c")).toBe("3");
		});

		it("handles arrays by appending", () => {
			const result = toURLSearchParams({ tags: ["a", "b", "c"] });
			expect(result.getAll("tags")).toEqual(["a", "b", "c"]);
		});

		it("handles empty object", () => {
			const result = toURLSearchParams({});
			expect(result.toString()).toBe("");
		});

		it("converts numbers and booleans to strings", () => {
			const result = toURLSearchParams({ num: 42, flag: true });
			expect(result.get("num")).toBe("42");
			expect(result.get("flag")).toBe("true");
		});
	});
});
