import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerVpnTools } from "../../../src/tools/vpn/index.js";

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

const REGION = "fr-par";
const ID = "00000000-0000-0000-0000-000000000010";
const PROJECT = "00000000-0000-0000-0000-000000000001";

function statusErr(statusCode: number, message = "err") {
	const err = new Error(message);
	(err as unknown as { statusCode: number }).statusCode = statusCode;
	return err;
}

describe("vpn module registration", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerVpnTools(server)).not.toThrow();
	});

	it("registers all 27 VPN tools", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");
		registerVpnTools(server);
		expect(toolSpy).toHaveBeenCalledTimes(27);

		const toolNames = toolSpy.mock.calls.map((call) => call[0]);
		expect(toolNames).toEqual([
			"scaleway_vpn_list_gateways",
			"scaleway_vpn_get_gateway",
			"scaleway_vpn_create_gateway",
			"scaleway_vpn_update_gateway",
			"scaleway_vpn_delete_gateway",
			"scaleway_vpn_list_gateway_types",
			"scaleway_vpn_list_customer_gateways",
			"scaleway_vpn_get_customer_gateway",
			"scaleway_vpn_create_customer_gateway",
			"scaleway_vpn_update_customer_gateway",
			"scaleway_vpn_delete_customer_gateway",
			"scaleway_vpn_list_connections",
			"scaleway_vpn_get_connection",
			"scaleway_vpn_create_connection",
			"scaleway_vpn_update_connection",
			"scaleway_vpn_delete_connection",
			"scaleway_vpn_renew_connection_psk",
			"scaleway_vpn_change_connection_psk",
			"scaleway_vpn_set_connection_routing_policy",
			"scaleway_vpn_detach_connection_routing_policy",
			"scaleway_vpn_enable_route_propagation",
			"scaleway_vpn_disable_route_propagation",
			"scaleway_vpn_list_routing_policies",
			"scaleway_vpn_get_routing_policy",
			"scaleway_vpn_create_routing_policy",
			"scaleway_vpn_update_routing_policy",
			"scaleway_vpn_delete_routing_policy",
		]);
	});
});

describe("vpn handlers", () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	it("wires registered tool callbacks to their handlers", async () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");
		registerVpnTools(server);
		mockFetch.mockResolvedValue({ id: ID });

		const invoke = async (name: string) => {
			const call = toolSpy.mock.calls.find((c) => c[0] === name);
			const callback = call?.[3] as (p: unknown) => Promise<unknown>;
			return callback({ region: REGION, connectionId: ID });
		};

		await invoke("scaleway_vpn_set_connection_routing_policy");
		await invoke("scaleway_vpn_detach_connection_routing_policy");
		expect(mockFetch).toHaveBeenCalledTimes(2);
	});

	// --- VPN Gateways ---
	describe("handleListVpnGateways", () => {
		it("returns paginated list with filters", async () => {
			const { handleListVpnGateways } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockResolvedValue({ vpn_gateways: [{ id: ID }], total_count: 1 });

			const result = await handleListVpnGateways({
				region: REGION,
				page: 2,
				pageSize: 10,
				projectId: PROJECT,
				name: "gw",
				orderBy: "name_asc",
			});

			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.method).toBe("GET");
			expect(callArgs.path).toBe("s2s-vpn/v1alpha1/regions/fr-par/vpn-gateways");
			expect(callArgs.urlParams.get("page")).toBe("2");
			expect(callArgs.urlParams.get("page_size")).toBe("10");
			expect(callArgs.urlParams.get("project_id")).toBe(PROJECT);
			expect(callArgs.urlParams.get("name")).toBe("gw");
			expect(callArgs.urlParams.get("order_by")).toBe("name_asc");
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.totalCount).toBe(1);
			expect(parsed.items).toHaveLength(1);
		});

		it("returns error on failure", async () => {
			const { handleListVpnGateways } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockRejectedValue(statusErr(401));
			const result: ErrorResult = await handleListVpnGateways({
				region: REGION,
				page: 1,
				pageSize: 50,
			});
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("permission_denied");
		});
	});

	describe("handleGetVpnGateway", () => {
		it("returns gateway details", async () => {
			const { handleGetVpnGateway } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockResolvedValue({ id: ID, name: "gw" });
			const result = await handleGetVpnGateway({ region: REGION, gatewayId: ID });
			expect(mockFetch).toHaveBeenCalledWith({
				method: "GET",
				path: `s2s-vpn/v1alpha1/regions/fr-par/vpn-gateways/${ID}`,
			});
			expect(JSON.parse(result.content[0].text).name).toBe("gw");
		});

		it("returns error on 404", async () => {
			const { handleGetVpnGateway } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockRejectedValue(statusErr(404));
			const result: ErrorResult = await handleGetVpnGateway({ region: REGION, gatewayId: ID });
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("not_found");
		});
	});

	describe("handleCreateVpnGateway", () => {
		it("creates with all optional fields", async () => {
			const { handleCreateVpnGateway } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockResolvedValue({ id: ID });
			await handleCreateVpnGateway({
				region: REGION,
				name: "gw",
				gatewayType: "VGW-S",
				privateNetworkId: ID,
				projectId: PROJECT,
				tags: ["a"],
				zone: "fr-par-1",
				ipamPrivateIpv4Id: ID,
				ipamPrivateIpv6Id: ID,
			});
			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: "s2s-vpn/v1alpha1/regions/fr-par/vpn-gateways",
				body: JSON.stringify({
					name: "gw",
					gateway_type: "VGW-S",
					private_network_id: ID,
					project_id: PROJECT,
					tags: ["a"],
					zone: "fr-par-1",
					ipam_private_ipv4_id: ID,
					ipam_private_ipv6_id: ID,
				}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("creates with only required fields", async () => {
			const { handleCreateVpnGateway } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockResolvedValue({ id: ID });
			await handleCreateVpnGateway({
				region: REGION,
				name: "gw",
				gatewayType: "VGW-S",
				privateNetworkId: ID,
			});
			const callArgs = mockFetch.mock.calls[0][0];
			expect(JSON.parse(callArgs.body)).toEqual({
				name: "gw",
				gateway_type: "VGW-S",
				private_network_id: ID,
			});
		});

		it("returns error on failure", async () => {
			const { handleCreateVpnGateway } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockRejectedValue(statusErr(400));
			const result: ErrorResult = await handleCreateVpnGateway({
				region: REGION,
				name: "gw",
				gatewayType: "VGW-S",
				privateNetworkId: ID,
			});
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("invalid_input");
		});
	});

	describe("handleUpdateVpnGateway", () => {
		it("updates name and tags", async () => {
			const { handleUpdateVpnGateway } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockResolvedValue({ id: ID });
			await handleUpdateVpnGateway({ region: REGION, gatewayId: ID, name: "new", tags: ["t"] });
			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.method).toBe("PATCH");
			expect(JSON.parse(callArgs.body)).toEqual({ name: "new", tags: ["t"] });
		});

		it("sends empty body when nothing provided", async () => {
			const { handleUpdateVpnGateway } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockResolvedValue({ id: ID });
			await handleUpdateVpnGateway({ region: REGION, gatewayId: ID });
			expect(JSON.parse(mockFetch.mock.calls[0][0].body)).toEqual({});
		});

		it("returns error on failure", async () => {
			const { handleUpdateVpnGateway } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockRejectedValue(new Error("boom"));
			const result: ErrorResult = await handleUpdateVpnGateway({ region: REGION, gatewayId: ID });
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("server_error");
		});
	});

	describe("handleDeleteVpnGateway", () => {
		it("deletes and confirms", async () => {
			const { handleDeleteVpnGateway } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockResolvedValue(undefined);
			const result = await handleDeleteVpnGateway({ region: REGION, gatewayId: ID });
			expect(mockFetch).toHaveBeenCalledWith({
				method: "DELETE",
				path: `s2s-vpn/v1alpha1/regions/fr-par/vpn-gateways/${ID}`,
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.deleted).toBe(true);
			expect(parsed.id).toBe(ID);
		});

		it("returns error on failure", async () => {
			const { handleDeleteVpnGateway } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockRejectedValue(statusErr(403));
			const result: ErrorResult = await handleDeleteVpnGateway({ region: REGION, gatewayId: ID });
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("permission_denied");
		});
	});

	describe("handleListVpnGatewayTypes", () => {
		it("returns paginated types", async () => {
			const { handleListVpnGatewayTypes } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockResolvedValue({ gateway_types: [{ name: "VGW-S" }], total_count: 1 });
			const result = await handleListVpnGatewayTypes({ region: REGION, page: 1, pageSize: 50 });
			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.path).toBe("s2s-vpn/v1alpha1/regions/fr-par/vpn-gateway-types");
			expect(callArgs.urlParams.get("page")).toBe("1");
			expect(JSON.parse(result.content[0].text).items[0].name).toBe("VGW-S");
		});

		it("returns error on failure", async () => {
			const { handleListVpnGatewayTypes } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockRejectedValue(statusErr(429));
			const result: ErrorResult = await handleListVpnGatewayTypes({
				region: REGION,
				page: 1,
				pageSize: 50,
			});
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("rate_limited");
		});
	});

	// --- Customer Gateways ---
	describe("handleListCustomerGateways", () => {
		it("returns paginated list with filters", async () => {
			const { handleListCustomerGateways } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockResolvedValue({ customer_gateways: [{ id: ID }], total_count: 1 });
			const result = await handleListCustomerGateways({
				region: REGION,
				page: 1,
				pageSize: 50,
				projectId: PROJECT,
				name: "cg",
				orderBy: "created_at_desc",
			});
			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.path).toBe("s2s-vpn/v1alpha1/regions/fr-par/customer-gateways");
			expect(callArgs.urlParams.get("order_by")).toBe("created_at_desc");
			expect(JSON.parse(result.content[0].text).totalCount).toBe(1);
		});

		it("returns error on failure", async () => {
			const { handleListCustomerGateways } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockRejectedValue(statusErr(500));
			const result: ErrorResult = await handleListCustomerGateways({
				region: REGION,
				page: 1,
				pageSize: 50,
			});
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("server_error");
		});
	});

	describe("handleGetCustomerGateway", () => {
		it("returns details", async () => {
			const { handleGetCustomerGateway } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockResolvedValue({ id: ID, name: "cg" });
			const result = await handleGetCustomerGateway({ region: REGION, customerGatewayId: ID });
			expect(mockFetch).toHaveBeenCalledWith({
				method: "GET",
				path: `s2s-vpn/v1alpha1/regions/fr-par/customer-gateways/${ID}`,
			});
			expect(JSON.parse(result.content[0].text).name).toBe("cg");
		});

		it("returns error on failure", async () => {
			const { handleGetCustomerGateway } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockRejectedValue(statusErr(404));
			const result: ErrorResult = await handleGetCustomerGateway({
				region: REGION,
				customerGatewayId: ID,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleCreateCustomerGateway", () => {
		it("creates with all optional fields", async () => {
			const { handleCreateCustomerGateway } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockResolvedValue({ id: ID });
			await handleCreateCustomerGateway({
				region: REGION,
				name: "cg",
				asn: 65000,
				projectId: PROJECT,
				tags: ["t"],
				ipv4Public: "1.2.3.4",
				ipv6Public: "2001:db8::1",
			});
			expect(JSON.parse(mockFetch.mock.calls[0][0].body)).toEqual({
				name: "cg",
				asn: 65000,
				project_id: PROJECT,
				tags: ["t"],
				ipv4_public: "1.2.3.4",
				ipv6_public: "2001:db8::1",
			});
		});

		it("creates with only required fields", async () => {
			const { handleCreateCustomerGateway } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockResolvedValue({ id: ID });
			await handleCreateCustomerGateway({ region: REGION, name: "cg", asn: 65000 });
			expect(JSON.parse(mockFetch.mock.calls[0][0].body)).toEqual({ name: "cg", asn: 65000 });
		});

		it("returns error on failure", async () => {
			const { handleCreateCustomerGateway } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockRejectedValue(statusErr(400));
			const result: ErrorResult = await handleCreateCustomerGateway({
				region: REGION,
				name: "cg",
				asn: 65000,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleUpdateCustomerGateway", () => {
		it("updates all fields", async () => {
			const { handleUpdateCustomerGateway } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockResolvedValue({ id: ID });
			await handleUpdateCustomerGateway({
				region: REGION,
				customerGatewayId: ID,
				name: "new",
				tags: ["t"],
				ipv4Public: "1.2.3.4",
				ipv6Public: "2001:db8::1",
				asn: 65001,
			});
			expect(JSON.parse(mockFetch.mock.calls[0][0].body)).toEqual({
				name: "new",
				tags: ["t"],
				ipv4_public: "1.2.3.4",
				ipv6_public: "2001:db8::1",
				asn: 65001,
			});
		});

		it("sends empty body when nothing provided", async () => {
			const { handleUpdateCustomerGateway } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockResolvedValue({ id: ID });
			await handleUpdateCustomerGateway({ region: REGION, customerGatewayId: ID });
			expect(JSON.parse(mockFetch.mock.calls[0][0].body)).toEqual({});
		});

		it("returns error on failure", async () => {
			const { handleUpdateCustomerGateway } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockRejectedValue(statusErr(400));
			const result: ErrorResult = await handleUpdateCustomerGateway({
				region: REGION,
				customerGatewayId: ID,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleDeleteCustomerGateway", () => {
		it("deletes and confirms", async () => {
			const { handleDeleteCustomerGateway } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockResolvedValue(undefined);
			const result = await handleDeleteCustomerGateway({ region: REGION, customerGatewayId: ID });
			expect(mockFetch).toHaveBeenCalledWith({
				method: "DELETE",
				path: `s2s-vpn/v1alpha1/regions/fr-par/customer-gateways/${ID}`,
			});
			expect(JSON.parse(result.content[0].text).deleted).toBe(true);
		});

		it("returns error on failure", async () => {
			const { handleDeleteCustomerGateway } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockRejectedValue(statusErr(403));
			const result: ErrorResult = await handleDeleteCustomerGateway({
				region: REGION,
				customerGatewayId: ID,
			});
			expect(result.isError).toBe(true);
		});
	});

	// --- Connections ---
	describe("handleListConnections", () => {
		it("returns paginated list with filters", async () => {
			const { handleListConnections } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockResolvedValue({ connections: [{ id: ID }], total_count: 1 });
			const result = await handleListConnections({
				region: REGION,
				page: 1,
				pageSize: 50,
				projectId: PROJECT,
				name: "conn",
				isIpv6: true,
				vpnGatewayId: ID,
				customerGatewayId: ID,
				orderBy: "status_desc",
			});
			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.path).toBe("s2s-vpn/v1alpha1/regions/fr-par/connections");
			expect(callArgs.urlParams.get("is_ipv6")).toBe("true");
			expect(callArgs.urlParams.get("vpn_gateway_ids")).toBe(ID);
			expect(callArgs.urlParams.get("customer_gateway_ids")).toBe(ID);
			expect(callArgs.urlParams.get("order_by")).toBe("status_desc");
			expect(JSON.parse(result.content[0].text).totalCount).toBe(1);
		});

		it("returns error on failure", async () => {
			const { handleListConnections } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockRejectedValue(statusErr(401));
			const result: ErrorResult = await handleListConnections({
				region: REGION,
				page: 1,
				pageSize: 50,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleGetConnection", () => {
		it("returns details", async () => {
			const { handleGetConnection } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockResolvedValue({ id: ID, name: "conn" });
			const result = await handleGetConnection({ region: REGION, connectionId: ID });
			expect(mockFetch).toHaveBeenCalledWith({
				method: "GET",
				path: `s2s-vpn/v1alpha1/regions/fr-par/connections/${ID}`,
			});
			expect(JSON.parse(result.content[0].text).name).toBe("conn");
		});

		it("returns error on failure", async () => {
			const { handleGetConnection } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockRejectedValue(statusErr(404));
			const result: ErrorResult = await handleGetConnection({ region: REGION, connectionId: ID });
			expect(result.isError).toBe(true);
		});
	});

	describe("handleCreateConnection", () => {
		const cipher = { encryption: "aes256" as const, integrity: "sha256" as const };

		it("creates with all optional fields", async () => {
			const { handleCreateConnection } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockResolvedValue({ id: ID });
			await handleCreateConnection({
				region: REGION,
				name: "conn",
				initiationPolicy: "vpn_gateway",
				ikev2Ciphers: [cipher],
				espCiphers: [cipher],
				vpnGatewayId: ID,
				customerGatewayId: ID,
				projectId: PROJECT,
				tags: ["t"],
				isIpv6: true,
				enableRoutePropagation: true,
				bgpConfigIpv4: { routing_policy_id: ID },
				bgpConfigIpv6: { routing_policy_id: ID, private_ip: "10.0.0.1/32" },
			});
			expect(JSON.parse(mockFetch.mock.calls[0][0].body)).toEqual({
				name: "conn",
				initiation_policy: "vpn_gateway",
				ikev2_ciphers: [cipher],
				esp_ciphers: [cipher],
				vpn_gateway_id: ID,
				customer_gateway_id: ID,
				project_id: PROJECT,
				tags: ["t"],
				is_ipv6: true,
				enable_route_propagation: true,
				bgp_config_ipv4: { routing_policy_id: ID },
				bgp_config_ipv6: { routing_policy_id: ID, private_ip: "10.0.0.1/32" },
			});
		});

		it("creates with only required fields", async () => {
			const { handleCreateConnection } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockResolvedValue({ id: ID });
			await handleCreateConnection({
				region: REGION,
				name: "conn",
				initiationPolicy: "customer_gateway",
				ikev2Ciphers: [cipher],
				espCiphers: [cipher],
				vpnGatewayId: ID,
				customerGatewayId: ID,
			});
			expect(JSON.parse(mockFetch.mock.calls[0][0].body)).toEqual({
				name: "conn",
				initiation_policy: "customer_gateway",
				ikev2_ciphers: [cipher],
				esp_ciphers: [cipher],
				vpn_gateway_id: ID,
				customer_gateway_id: ID,
			});
		});

		it("returns error on failure", async () => {
			const { handleCreateConnection } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockRejectedValue(statusErr(400));
			const result: ErrorResult = await handleCreateConnection({
				region: REGION,
				name: "conn",
				initiationPolicy: "vpn_gateway",
				ikev2Ciphers: [cipher],
				espCiphers: [cipher],
				vpnGatewayId: ID,
				customerGatewayId: ID,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleUpdateConnection", () => {
		it("updates name and tags", async () => {
			const { handleUpdateConnection } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockResolvedValue({ id: ID });
			await handleUpdateConnection({ region: REGION, connectionId: ID, name: "new", tags: ["t"] });
			expect(JSON.parse(mockFetch.mock.calls[0][0].body)).toEqual({ name: "new", tags: ["t"] });
		});

		it("sends empty body when nothing provided", async () => {
			const { handleUpdateConnection } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockResolvedValue({ id: ID });
			await handleUpdateConnection({ region: REGION, connectionId: ID });
			expect(JSON.parse(mockFetch.mock.calls[0][0].body)).toEqual({});
		});

		it("returns error on failure", async () => {
			const { handleUpdateConnection } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockRejectedValue(statusErr(400));
			const result: ErrorResult = await handleUpdateConnection({
				region: REGION,
				connectionId: ID,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleDeleteConnection", () => {
		it("deletes and confirms", async () => {
			const { handleDeleteConnection } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockResolvedValue(undefined);
			const result = await handleDeleteConnection({ region: REGION, connectionId: ID });
			expect(mockFetch).toHaveBeenCalledWith({
				method: "DELETE",
				path: `s2s-vpn/v1alpha1/regions/fr-par/connections/${ID}`,
			});
			expect(JSON.parse(result.content[0].text).deleted).toBe(true);
		});

		it("returns error on failure", async () => {
			const { handleDeleteConnection } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockRejectedValue(statusErr(403));
			const result: ErrorResult = await handleDeleteConnection({
				region: REGION,
				connectionId: ID,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleRenewConnectionPsk", () => {
		it("renews psk", async () => {
			const { handleRenewConnectionPsk } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockResolvedValue({ id: ID });
			await handleRenewConnectionPsk({ region: REGION, connectionId: ID });
			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: `s2s-vpn/v1alpha1/regions/fr-par/connections/${ID}/renew-psk`,
				body: JSON.stringify({}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleRenewConnectionPsk } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockRejectedValue(statusErr(400));
			const result: ErrorResult = await handleRenewConnectionPsk({
				region: REGION,
				connectionId: ID,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleChangeConnectionPsk", () => {
		it("changes psk with revision", async () => {
			const { handleChangeConnectionPsk } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockResolvedValue({ id: ID });
			await handleChangeConnectionPsk({
				region: REGION,
				connectionId: ID,
				secretId: ID,
				secretRevision: 3,
			});
			expect(JSON.parse(mockFetch.mock.calls[0][0].body)).toEqual({
				secret: { id: ID, revision: 3 },
			});
			expect(mockFetch.mock.calls[0][0].path).toBe(
				`s2s-vpn/v1alpha1/regions/fr-par/connections/${ID}/change-psk`,
			);
		});

		it("changes psk without revision", async () => {
			const { handleChangeConnectionPsk } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockResolvedValue({ id: ID });
			await handleChangeConnectionPsk({ region: REGION, connectionId: ID, secretId: ID });
			expect(JSON.parse(mockFetch.mock.calls[0][0].body)).toEqual({ secret: { id: ID } });
		});

		it("returns error on failure", async () => {
			const { handleChangeConnectionPsk } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockRejectedValue(statusErr(400));
			const result: ErrorResult = await handleChangeConnectionPsk({
				region: REGION,
				connectionId: ID,
				secretId: ID,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleSetConnectionRoutingPolicy", () => {
		it("sets both v4 and v6 policies", async () => {
			const { handleSetConnectionRoutingPolicy } = await import(
				"../../../src/tools/vpn/handlers.js"
			);
			mockFetch.mockResolvedValue({ id: ID });
			await handleSetConnectionRoutingPolicy({
				region: REGION,
				connectionId: ID,
				routingPolicyV4: ID,
				routingPolicyV6: ID,
			});
			expect(JSON.parse(mockFetch.mock.calls[0][0].body)).toEqual({
				routing_policy_v4: ID,
				routing_policy_v6: ID,
			});
			expect(mockFetch.mock.calls[0][0].path).toBe(
				`s2s-vpn/v1alpha1/regions/fr-par/connections/${ID}/set-routing-policy`,
			);
		});

		it("sends empty body when no policy provided", async () => {
			const { handleSetConnectionRoutingPolicy } = await import(
				"../../../src/tools/vpn/handlers.js"
			);
			mockFetch.mockResolvedValue({ id: ID });
			await handleSetConnectionRoutingPolicy({ region: REGION, connectionId: ID });
			expect(JSON.parse(mockFetch.mock.calls[0][0].body)).toEqual({});
		});

		it("returns error on failure", async () => {
			const { handleSetConnectionRoutingPolicy } = await import(
				"../../../src/tools/vpn/handlers.js"
			);
			mockFetch.mockRejectedValue(statusErr(400));
			const result: ErrorResult = await handleSetConnectionRoutingPolicy({
				region: REGION,
				connectionId: ID,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleDetachConnectionRoutingPolicy", () => {
		it("detaches both v4 and v6 policies", async () => {
			const { handleDetachConnectionRoutingPolicy } = await import(
				"../../../src/tools/vpn/handlers.js"
			);
			mockFetch.mockResolvedValue({ id: ID });
			await handleDetachConnectionRoutingPolicy({
				region: REGION,
				connectionId: ID,
				routingPolicyV4: ID,
				routingPolicyV6: ID,
			});
			expect(JSON.parse(mockFetch.mock.calls[0][0].body)).toEqual({
				routing_policy_v4: ID,
				routing_policy_v6: ID,
			});
			expect(mockFetch.mock.calls[0][0].path).toBe(
				`s2s-vpn/v1alpha1/regions/fr-par/connections/${ID}/detach-routing-policy`,
			);
		});

		it("sends empty body when no policy provided", async () => {
			const { handleDetachConnectionRoutingPolicy } = await import(
				"../../../src/tools/vpn/handlers.js"
			);
			mockFetch.mockResolvedValue({ id: ID });
			await handleDetachConnectionRoutingPolicy({ region: REGION, connectionId: ID });
			expect(JSON.parse(mockFetch.mock.calls[0][0].body)).toEqual({});
		});

		it("returns error on failure", async () => {
			const { handleDetachConnectionRoutingPolicy } = await import(
				"../../../src/tools/vpn/handlers.js"
			);
			mockFetch.mockRejectedValue(statusErr(400));
			const result: ErrorResult = await handleDetachConnectionRoutingPolicy({
				region: REGION,
				connectionId: ID,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleEnableRoutePropagation", () => {
		it("enables propagation", async () => {
			const { handleEnableRoutePropagation } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockResolvedValue({ id: ID });
			await handleEnableRoutePropagation({ region: REGION, connectionId: ID });
			expect(mockFetch.mock.calls[0][0].path).toBe(
				`s2s-vpn/v1alpha1/regions/fr-par/connections/${ID}/enable-route-propagation`,
			);
		});

		it("returns error on failure", async () => {
			const { handleEnableRoutePropagation } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockRejectedValue(statusErr(400));
			const result: ErrorResult = await handleEnableRoutePropagation({
				region: REGION,
				connectionId: ID,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleDisableRoutePropagation", () => {
		it("disables propagation", async () => {
			const { handleDisableRoutePropagation } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockResolvedValue({ id: ID });
			await handleDisableRoutePropagation({ region: REGION, connectionId: ID });
			expect(mockFetch.mock.calls[0][0].path).toBe(
				`s2s-vpn/v1alpha1/regions/fr-par/connections/${ID}/disable-route-propagation`,
			);
		});

		it("returns error on failure", async () => {
			const { handleDisableRoutePropagation } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockRejectedValue(statusErr(400));
			const result: ErrorResult = await handleDisableRoutePropagation({
				region: REGION,
				connectionId: ID,
			});
			expect(result.isError).toBe(true);
		});
	});

	// --- Routing Policies ---
	describe("handleListRoutingPolicies", () => {
		it("returns paginated list with filters", async () => {
			const { handleListRoutingPolicies } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockResolvedValue({ routing_policies: [{ id: ID }], total_count: 1 });
			const result = await handleListRoutingPolicies({
				region: REGION,
				page: 1,
				pageSize: 50,
				projectId: PROJECT,
				name: "rp",
				isIpv6: false,
			});
			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.path).toBe("s2s-vpn/v1alpha1/regions/fr-par/routing-policies");
			expect(callArgs.urlParams.get("is_ipv6")).toBe("false");
			expect(JSON.parse(result.content[0].text).totalCount).toBe(1);
		});

		it("returns error on failure", async () => {
			const { handleListRoutingPolicies } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockRejectedValue(statusErr(500));
			const result: ErrorResult = await handleListRoutingPolicies({
				region: REGION,
				page: 1,
				pageSize: 50,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleGetRoutingPolicy", () => {
		it("returns details", async () => {
			const { handleGetRoutingPolicy } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockResolvedValue({ id: ID, name: "rp" });
			const result = await handleGetRoutingPolicy({ region: REGION, routingPolicyId: ID });
			expect(mockFetch).toHaveBeenCalledWith({
				method: "GET",
				path: `s2s-vpn/v1alpha1/regions/fr-par/routing-policies/${ID}`,
			});
			expect(JSON.parse(result.content[0].text).name).toBe("rp");
		});

		it("returns error on failure", async () => {
			const { handleGetRoutingPolicy } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockRejectedValue(statusErr(404));
			const result: ErrorResult = await handleGetRoutingPolicy({
				region: REGION,
				routingPolicyId: ID,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleCreateRoutingPolicy", () => {
		it("creates with all optional fields", async () => {
			const { handleCreateRoutingPolicy } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockResolvedValue({ id: ID });
			await handleCreateRoutingPolicy({
				region: REGION,
				name: "rp",
				isIpv6: false,
				prefixFilterIn: ["10.0.0.0/8"],
				prefixFilterOut: ["192.168.0.0/16"],
				projectId: PROJECT,
				tags: ["t"],
			});
			expect(JSON.parse(mockFetch.mock.calls[0][0].body)).toEqual({
				name: "rp",
				is_ipv6: false,
				prefix_filter_in: ["10.0.0.0/8"],
				prefix_filter_out: ["192.168.0.0/16"],
				project_id: PROJECT,
				tags: ["t"],
			});
		});

		it("creates with only required fields", async () => {
			const { handleCreateRoutingPolicy } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockResolvedValue({ id: ID });
			await handleCreateRoutingPolicy({
				region: REGION,
				name: "rp",
				isIpv6: true,
				prefixFilterIn: [],
				prefixFilterOut: [],
			});
			expect(JSON.parse(mockFetch.mock.calls[0][0].body)).toEqual({
				name: "rp",
				is_ipv6: true,
				prefix_filter_in: [],
				prefix_filter_out: [],
			});
		});

		it("returns error on failure", async () => {
			const { handleCreateRoutingPolicy } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockRejectedValue(statusErr(400));
			const result: ErrorResult = await handleCreateRoutingPolicy({
				region: REGION,
				name: "rp",
				isIpv6: true,
				prefixFilterIn: [],
				prefixFilterOut: [],
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleUpdateRoutingPolicy", () => {
		it("updates all fields", async () => {
			const { handleUpdateRoutingPolicy } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockResolvedValue({ id: ID });
			await handleUpdateRoutingPolicy({
				region: REGION,
				routingPolicyId: ID,
				name: "new",
				tags: ["t"],
				prefixFilterIn: ["10.0.0.0/8"],
				prefixFilterOut: ["192.168.0.0/16"],
			});
			expect(JSON.parse(mockFetch.mock.calls[0][0].body)).toEqual({
				name: "new",
				tags: ["t"],
				prefix_filter_in: ["10.0.0.0/8"],
				prefix_filter_out: ["192.168.0.0/16"],
			});
		});

		it("sends empty body when nothing provided", async () => {
			const { handleUpdateRoutingPolicy } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockResolvedValue({ id: ID });
			await handleUpdateRoutingPolicy({ region: REGION, routingPolicyId: ID });
			expect(JSON.parse(mockFetch.mock.calls[0][0].body)).toEqual({});
		});

		it("returns error on failure", async () => {
			const { handleUpdateRoutingPolicy } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockRejectedValue(statusErr(400));
			const result: ErrorResult = await handleUpdateRoutingPolicy({
				region: REGION,
				routingPolicyId: ID,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleDeleteRoutingPolicy", () => {
		it("deletes and confirms", async () => {
			const { handleDeleteRoutingPolicy } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockResolvedValue(undefined);
			const result = await handleDeleteRoutingPolicy({ region: REGION, routingPolicyId: ID });
			expect(mockFetch).toHaveBeenCalledWith({
				method: "DELETE",
				path: `s2s-vpn/v1alpha1/regions/fr-par/routing-policies/${ID}`,
			});
			expect(JSON.parse(result.content[0].text).id).toBe(ID);
		});

		it("returns error on failure", async () => {
			const { handleDeleteRoutingPolicy } = await import("../../../src/tools/vpn/handlers.js");
			mockFetch.mockRejectedValue(statusErr(403));
			const result: ErrorResult = await handleDeleteRoutingPolicy({
				region: REGION,
				routingPolicyId: ID,
			});
			expect(result.isError).toBe(true);
		});
	});
});
