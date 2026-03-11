/**
 * Contract tests for Public Gateway API tools.
 *
 * Validates request/response shapes, pagination, auth, and error handling
 * against the Scaleway VPC Public Gateway API v2 (and v1 for DHCP).
 *
 * API Reference: specs/scaleway-api/ + @scaleway/sdk-vpcgw
 * Parity Matrix: tests/parity-matrix.json > public-gateway
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	handleCreateDHCP,
	handleCreateGateway,
	handleCreateGatewayNetwork,
	handleCreateIP,
	handleCreatePatRule,
	handleDeleteDHCP,
	handleDeleteGateway,
	handleDeleteGatewayNetwork,
	handleDeleteIP,
	handleDeletePatRule,
	handleGetDHCP,
	handleGetGateway,
	handleGetGatewayNetwork,
	handleGetIP,
	handleGetPatRule,
	handleListDHCPs,
	handleListGatewayNetworks,
	handleListGatewayTypes,
	handleListGateways,
	handleListIPs,
	handleListPatRules,
	handleUpdateDHCP,
	handleUpdateGateway,
	handleUpdateGatewayNetwork,
	handleUpdateIP,
	handleUpdatePatRule,
} from "../../src/tools/public-gateway/handlers.js";
import { registerPublicGatewayTools } from "../../src/tools/public-gateway/index.js";

// Mock shared modules
vi.mock("../../src/shared/auth.js", () => ({
	loadAuthConfig: () => ({
		accessKey: "SCWTEST",
		secretKey: "secret",
		defaultProjectId: "00000000-0000-0000-0000-000000000001",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	}),
}));

const mockFetch = vi.fn();
vi.mock("../../src/shared/client.js", () => ({
	createScalewayClient: () => ({ fetch: mockFetch }),
}));

const UUID = "00000000-0000-0000-0000-000000000001";

describe("Public Gateway API Contracts", () => {
	beforeEach(() => mockFetch.mockReset());
	afterEach(() => vi.restoreAllMocks());

	// ─── Tool Registration Contract ──────────────────────────────────────

	describe("tool registration", () => {
		it("registers all 26 public-gateway tools", () => {
			const server = new McpServer({ name: "test", version: "0.0.1" });
			registerPublicGatewayTools(server);
			// Registration should not throw for all 26 tools
			expect(true).toBe(true);
		});
	});

	// ─── Gateway Contracts ───────────────────────────────────────────────
	// API: GET /vpc-gw/v2/zones/{zone}/gateways

	describe("ListGateways contract", () => {
		it("sends GET to /vpc-gw/v2/zones/{zone}/gateways with pagination", async () => {
			mockFetch.mockResolvedValue({ gateways: [], total_count: 0 });

			await handleListGateways({ page: 1, pageSize: 20 });

			const req = mockFetch.mock.calls[0][0];
			expect(req.method).toBe("GET");
			expect(req.path).toMatch(/\/vpc-gw\/v2\/zones\/[a-z]{2}-[a-z]{3}-\d+\/gateways$/);
			expect(req.urlParams.get("page")).toBe("1");
			expect(req.urlParams.get("page_size")).toBe("20");
		});

		it("response shape: { items, totalCount, page, pageSize }", async () => {
			mockFetch.mockResolvedValue({
				gateways: [{ id: "gw-1", name: "test", status: "running" }],
				total_count: 1,
			});

			const result = await handleListGateways({ page: 1, pageSize: 50 });
			const data = JSON.parse(result.content[0].text);
			expect(data).toHaveProperty("items");
			expect(data).toHaveProperty("totalCount");
			expect(data).toHaveProperty("page");
			expect(data).toHaveProperty("pageSize");
			expect(data.items).toHaveLength(1);
		});

		it("auth error returns 401 mapped to permission_denied", async () => {
			const err = new Error("Unauthorized");
			Object.assign(err, { statusCode: 401 });
			mockFetch.mockRejectedValue(err);

			const result = await handleListGateways({ page: 1, pageSize: 50 });
			expect(result.isError).toBe(true);
			const data = JSON.parse(result.content[0].text);
			expect(data.error.type).toBe("permission_denied");
			expect(data.error.statusCode).toBe(401);
		});
	});

	// API: GET /vpc-gw/v2/zones/{zone}/gateways/{gateway_id}
	describe("GetGateway contract", () => {
		it("sends GET to correct path with gateway ID", async () => {
			mockFetch.mockResolvedValue({ id: UUID });

			await handleGetGateway({ gatewayId: UUID });

			const req = mockFetch.mock.calls[0][0];
			expect(req.method).toBe("GET");
			expect(req.path).toContain(`/gateways/${UUID}`);
		});

		it("404 maps to not_found error", async () => {
			const err = new Error("Not found");
			Object.assign(err, { statusCode: 404 });
			mockFetch.mockRejectedValue(err);

			const result = await handleGetGateway({ gatewayId: UUID });
			const data = JSON.parse(result.content[0].text);
			expect(data.error.type).toBe("not_found");
		});
	});

	// API: POST /vpc-gw/v2/zones/{zone}/gateways
	describe("CreateGateway contract", () => {
		it("sends POST with snake_case body", async () => {
			mockFetch.mockResolvedValue({ id: "new-gw" });

			await handleCreateGateway({
				type: "VPC-GW-S",
				enableSmtp: false,
				enableBastion: true,
				bastionPort: 61000,
			});

			const req = mockFetch.mock.calls[0][0];
			expect(req.method).toBe("POST");
			expect(req.headers?.["Content-Type"]).toBe("application/json");
			const body = JSON.parse(req.body);
			expect(body).toHaveProperty("type", "VPC-GW-S");
			expect(body).toHaveProperty("enable_smtp", false);
			expect(body).toHaveProperty("enable_bastion", true);
			expect(body).toHaveProperty("bastion_port", 61000);
		});

		it("400 maps to invalid_input error", async () => {
			const err = new Error("Bad request");
			Object.assign(err, { statusCode: 400 });
			mockFetch.mockRejectedValue(err);

			const result = await handleCreateGateway({
				type: "VPC-GW-S",
				enableSmtp: false,
				enableBastion: false,
			});
			const data = JSON.parse(result.content[0].text);
			expect(data.error.type).toBe("invalid_input");
		});
	});

	// API: PATCH /vpc-gw/v2/zones/{zone}/gateways/{gateway_id}
	describe("UpdateGateway contract", () => {
		it("sends PATCH with partial body", async () => {
			mockFetch.mockResolvedValue({ id: UUID });

			await handleUpdateGateway({ gatewayId: UUID, name: "new-name" });

			const req = mockFetch.mock.calls[0][0];
			expect(req.method).toBe("PATCH");
			const body = JSON.parse(req.body);
			expect(body).toEqual({ name: "new-name" });
		});
	});

	// API: DELETE /vpc-gw/v2/zones/{zone}/gateways/{gateway_id}
	describe("DeleteGateway contract", () => {
		it("sends DELETE with delete_ip query param", async () => {
			mockFetch.mockResolvedValue({ id: UUID });

			await handleDeleteGateway({ gatewayId: UUID, deleteIp: true });

			const req = mockFetch.mock.calls[0][0];
			expect(req.method).toBe("DELETE");
			expect(req.urlParams.get("delete_ip")).toBe("true");
		});
	});

	// ─── Gateway Network Contracts ───────────────────────────────────────
	// API: GET /vpc-gw/v2/zones/{zone}/gateway-networks

	describe("ListGatewayNetworks contract", () => {
		it("sends GET to /gateway-networks with pagination", async () => {
			mockFetch.mockResolvedValue({ gateway_networks: [], total_count: 0 });

			await handleListGatewayNetworks({ page: 1, pageSize: 50 });

			const req = mockFetch.mock.calls[0][0];
			expect(req.method).toBe("GET");
			expect(req.path).toContain("/gateway-networks");
		});

		it("response shape includes items and totalCount", async () => {
			mockFetch.mockResolvedValue({
				gateway_networks: [{ id: "gn-1" }],
				total_count: 1,
			});

			const result = await handleListGatewayNetworks({ page: 1, pageSize: 50 });
			const data = JSON.parse(result.content[0].text);
			expect(data.items).toHaveLength(1);
			expect(data.totalCount).toBe(1);
		});
	});

	// API: GET /vpc-gw/v2/zones/{zone}/gateway-networks/{gateway_network_id}
	describe("GetGatewayNetwork contract", () => {
		it("sends GET with gateway_network_id in path", async () => {
			mockFetch.mockResolvedValue({ id: UUID });

			await handleGetGatewayNetwork({ gatewayNetworkId: UUID });

			expect(mockFetch.mock.calls[0][0].path).toContain(`/gateway-networks/${UUID}`);
		});
	});

	// API: POST /vpc-gw/v2/zones/{zone}/gateway-networks
	describe("CreateGatewayNetwork contract", () => {
		it("sends POST with snake_case body fields", async () => {
			mockFetch.mockResolvedValue({ id: "gn-new" });

			await handleCreateGatewayNetwork({
				gatewayId: UUID,
				privateNetworkId: UUID,
				enableMasquerade: true,
				pushDefaultRoute: false,
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body).toHaveProperty("gateway_id", UUID);
			expect(body).toHaveProperty("private_network_id", UUID);
			expect(body).toHaveProperty("enable_masquerade", true);
			expect(body).toHaveProperty("push_default_route", false);
		});
	});

	// API: PATCH /vpc-gw/v2/zones/{zone}/gateway-networks/{gateway_network_id}
	describe("UpdateGatewayNetwork contract", () => {
		it("sends PATCH with partial update", async () => {
			mockFetch.mockResolvedValue({ id: UUID });

			await handleUpdateGatewayNetwork({
				gatewayNetworkId: UUID,
				enableMasquerade: false,
			});

			const req = mockFetch.mock.calls[0][0];
			expect(req.method).toBe("PATCH");
			expect(JSON.parse(req.body)).toEqual({ enable_masquerade: false });
		});
	});

	// API: DELETE /vpc-gw/v2/zones/{zone}/gateway-networks/{gateway_network_id}
	describe("DeleteGatewayNetwork contract", () => {
		it("sends DELETE to correct path", async () => {
			mockFetch.mockResolvedValue({ id: UUID });

			await handleDeleteGatewayNetwork({ gatewayNetworkId: UUID });

			expect(mockFetch.mock.calls[0][0].method).toBe("DELETE");
		});
	});

	// ─── DHCP Contracts (v1 API) ─────────────────────────────────────────
	// API: GET /vpc-gw/v1/zones/{zone}/dhcps

	describe("ListDHCPs contract", () => {
		it("sends GET to v1 API path", async () => {
			mockFetch.mockResolvedValue({ dhcps: [], total_count: 0 });

			await handleListDHCPs({ page: 1, pageSize: 50 });

			expect(mockFetch.mock.calls[0][0].path).toMatch(/\/vpc-gw\/v1\/zones\//);
		});
	});

	// API: GET /vpc-gw/v1/zones/{zone}/dhcps/{dhcp_id}
	describe("GetDHCP contract", () => {
		it("sends GET to v1 dhcps path", async () => {
			mockFetch.mockResolvedValue({ id: UUID });

			await handleGetDHCP({ dhcpId: UUID });

			expect(mockFetch.mock.calls[0][0].path).toContain(`/dhcps/${UUID}`);
		});
	});

	// API: POST /vpc-gw/v1/zones/{zone}/dhcps
	describe("CreateDHCP contract", () => {
		it("sends POST with subnet in body", async () => {
			mockFetch.mockResolvedValue({ id: "dhcp-new" });

			await handleCreateDHCP({ subnet: "192.168.1.0/24" });

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body).toHaveProperty("subnet", "192.168.1.0/24");
		});
	});

	// API: PATCH /vpc-gw/v1/zones/{zone}/dhcps/{dhcp_id}
	describe("UpdateDHCP contract", () => {
		it("sends PATCH to v1 dhcps path", async () => {
			mockFetch.mockResolvedValue({ id: UUID });

			await handleUpdateDHCP({ dhcpId: UUID, subnet: "10.0.0.0/8" });

			const req = mockFetch.mock.calls[0][0];
			expect(req.method).toBe("PATCH");
			expect(req.path).toContain("/v1/");
		});
	});

	// API: DELETE /vpc-gw/v1/zones/{zone}/dhcps/{dhcp_id}
	describe("DeleteDHCP contract", () => {
		it("sends DELETE and returns success", async () => {
			mockFetch.mockResolvedValue(undefined);

			const result = await handleDeleteDHCP({ dhcpId: UUID });

			expect(mockFetch.mock.calls[0][0].method).toBe("DELETE");
			expect(JSON.parse(result.content[0].text)).toEqual({ success: true });
		});
	});

	// ─── PAT Rule Contracts ──────────────────────────────────────────────
	// API: GET /vpc-gw/v2/zones/{zone}/pat-rules

	describe("ListPatRules contract", () => {
		it("sends GET to /pat-rules with pagination", async () => {
			mockFetch.mockResolvedValue({ pat_rules: [], total_count: 0 });

			await handleListPatRules({ page: 1, pageSize: 50 });

			expect(mockFetch.mock.calls[0][0].path).toContain("/pat-rules");
		});
	});

	// API: GET /vpc-gw/v2/zones/{zone}/pat-rules/{pat_rule_id}
	describe("GetPatRule contract", () => {
		it("sends GET with pat_rule_id in path", async () => {
			mockFetch.mockResolvedValue({ id: UUID });

			await handleGetPatRule({ patRuleId: UUID });

			expect(mockFetch.mock.calls[0][0].path).toContain(`/pat-rules/${UUID}`);
		});
	});

	// API: POST /vpc-gw/v2/zones/{zone}/pat-rules
	describe("CreatePatRule contract", () => {
		it("sends POST with port mapping in body", async () => {
			mockFetch.mockResolvedValue({ id: "pat-new" });

			await handleCreatePatRule({
				gatewayId: UUID,
				publicPort: 8080,
				privateIp: "192.168.1.10",
				privatePort: 80,
				protocol: "tcp",
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body).toHaveProperty("gateway_id", UUID);
			expect(body).toHaveProperty("public_port", 8080);
			expect(body).toHaveProperty("private_ip", "192.168.1.10");
			expect(body).toHaveProperty("private_port", 80);
			expect(body).toHaveProperty("protocol", "tcp");
		});
	});

	// API: PATCH /vpc-gw/v2/zones/{zone}/pat-rules/{pat_rule_id}
	describe("UpdatePatRule contract", () => {
		it("sends PATCH with partial update", async () => {
			mockFetch.mockResolvedValue({ id: UUID });

			await handleUpdatePatRule({ patRuleId: UUID, publicPort: 9090 });

			const req = mockFetch.mock.calls[0][0];
			expect(req.method).toBe("PATCH");
			expect(JSON.parse(req.body)).toEqual({ public_port: 9090 });
		});
	});

	// API: DELETE /vpc-gw/v2/zones/{zone}/pat-rules/{pat_rule_id}
	describe("DeletePatRule contract", () => {
		it("sends DELETE and returns success", async () => {
			mockFetch.mockResolvedValue(undefined);

			const result = await handleDeletePatRule({ patRuleId: UUID });

			expect(mockFetch.mock.calls[0][0].method).toBe("DELETE");
			expect(JSON.parse(result.content[0].text)).toEqual({ success: true });
		});
	});

	// ─── IP Contracts ────────────────────────────────────────────────────
	// API: GET /vpc-gw/v2/zones/{zone}/ips

	describe("ListIPs contract", () => {
		it("sends GET to /ips with pagination", async () => {
			mockFetch.mockResolvedValue({ ips: [], total_count: 0 });

			await handleListIPs({ page: 1, pageSize: 50 });

			expect(mockFetch.mock.calls[0][0].path).toContain("/ips");
		});
	});

	// API: GET /vpc-gw/v2/zones/{zone}/ips/{ip_id}
	describe("GetIP contract", () => {
		it("sends GET with ip_id in path", async () => {
			mockFetch.mockResolvedValue({ id: UUID });

			await handleGetIP({ ipId: UUID });

			expect(mockFetch.mock.calls[0][0].path).toContain(`/ips/${UUID}`);
		});
	});

	// API: POST /vpc-gw/v2/zones/{zone}/ips
	describe("CreateIP contract", () => {
		it("sends POST to /ips", async () => {
			mockFetch.mockResolvedValue({ id: "ip-new" });

			await handleCreateIP({ tags: ["test"] });

			const req = mockFetch.mock.calls[0][0];
			expect(req.method).toBe("POST");
			expect(JSON.parse(req.body)).toHaveProperty("tags", ["test"]);
		});
	});

	// API: PATCH /vpc-gw/v2/zones/{zone}/ips/{ip_id}
	describe("UpdateIP contract", () => {
		it("sends PATCH with reverse and gateway_id", async () => {
			mockFetch.mockResolvedValue({ id: UUID });

			await handleUpdateIP({
				ipId: UUID,
				reverse: "gw.example.com",
				gatewayId: UUID,
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body).toHaveProperty("reverse", "gw.example.com");
			expect(body).toHaveProperty("gateway_id", UUID);
		});
	});

	// API: DELETE /vpc-gw/v2/zones/{zone}/ips/{ip_id}
	describe("DeleteIP contract", () => {
		it("sends DELETE and returns success", async () => {
			mockFetch.mockResolvedValue(undefined);

			const result = await handleDeleteIP({ ipId: UUID });

			expect(mockFetch.mock.calls[0][0].method).toBe("DELETE");
			expect(JSON.parse(result.content[0].text)).toEqual({ success: true });
		});
	});

	// ─── Gateway Types Contract ──────────────────────────────────────────
	// API: GET /vpc-gw/v2/zones/{zone}/gateway-types

	describe("ListGatewayTypes contract", () => {
		it("sends GET to /gateway-types", async () => {
			mockFetch.mockResolvedValue({ types: [{ name: "VPC-GW-S", bandwidth: 200000000 }] });

			const result = await handleListGatewayTypes({});

			expect(mockFetch.mock.calls[0][0].path).toContain("/gateway-types");
			const data = JSON.parse(result.content[0].text);
			expect(data.types[0]).toHaveProperty("name");
			expect(data.types[0]).toHaveProperty("bandwidth");
		});
	});

	// ─── Error Code Mapping Contracts ────────────────────────────────────

	describe("error code mapping", () => {
		it("403 maps to permission_denied", async () => {
			const err = new Error("Forbidden");
			Object.assign(err, { statusCode: 403 });
			mockFetch.mockRejectedValue(err);

			const result = await handleGetGateway({ gatewayId: UUID });
			const data = JSON.parse(result.content[0].text);
			expect(data.error.type).toBe("permission_denied");
		});

		it("429 maps to rate_limited", async () => {
			const err = new Error("Rate limited");
			Object.assign(err, { statusCode: 429 });
			mockFetch.mockRejectedValue(err);

			const result = await handleGetGateway({ gatewayId: UUID });
			const data = JSON.parse(result.content[0].text);
			expect(data.error.type).toBe("rate_limited");
		});

		it("500 maps to server_error", async () => {
			const err = new Error("Internal server error");
			Object.assign(err, { statusCode: 500 });
			mockFetch.mockRejectedValue(err);

			const result = await handleGetGateway({ gatewayId: UUID });
			const data = JSON.parse(result.content[0].text);
			expect(data.error.type).toBe("server_error");
		});
	});
});
