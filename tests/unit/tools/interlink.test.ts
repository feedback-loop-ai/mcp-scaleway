import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerInterlinkTools } from "../../../src/tools/interlink/index.js";

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
const LINK_ID = "00000000-0000-0000-0000-000000000010";
const POLICY_ID = "00000000-0000-0000-0000-000000000020";
const PARTNER_ID = "00000000-0000-0000-0000-000000000030";
const POP_ID = "00000000-0000-0000-0000-000000000040";
const CONNECTION_ID = "00000000-0000-0000-0000-000000000050";
const VPC_ID = "00000000-0000-0000-0000-000000000060";
const PROJECT_ID = "00000000-0000-0000-0000-000000000001";

function makeError(statusCode?: number) {
	const err = new Error("boom");
	if (statusCode !== undefined) {
		(err as unknown as { statusCode: number }).statusCode = statusCode;
	}
	return err;
}

describe("interlink module registration", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerInterlinkTools(server)).not.toThrow();
	});

	it("registers all 23 InterLink tools", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");
		registerInterlinkTools(server);
		expect(toolSpy).toHaveBeenCalledTimes(23);

		const toolNames = toolSpy.mock.calls.map((call) => call[0]);
		for (const name of [
			"scaleway_interlink_list_links",
			"scaleway_interlink_get_link",
			"scaleway_interlink_create_link",
			"scaleway_interlink_update_link",
			"scaleway_interlink_delete_link",
			"scaleway_interlink_attach_vpc",
			"scaleway_interlink_detach_vpc",
			"scaleway_interlink_attach_routing_policy",
			"scaleway_interlink_detach_routing_policy",
			"scaleway_interlink_set_routing_policy",
			"scaleway_interlink_enable_route_propagation",
			"scaleway_interlink_disable_route_propagation",
			"scaleway_interlink_list_routing_policies",
			"scaleway_interlink_get_routing_policy",
			"scaleway_interlink_create_routing_policy",
			"scaleway_interlink_update_routing_policy",
			"scaleway_interlink_delete_routing_policy",
			"scaleway_interlink_list_partners",
			"scaleway_interlink_get_partner",
			"scaleway_interlink_list_pops",
			"scaleway_interlink_get_pop",
			"scaleway_interlink_list_dedicated_connections",
			"scaleway_interlink_get_dedicated_connection",
		]) {
			expect(toolNames).toContain(name);
		}
	});
});

describe("interlink handlers", () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	// --- Links ---

	describe("handleListLinks", () => {
		it("returns paginated links", async () => {
			const { handleListLinks } = await import("../../../src/tools/interlink/handlers.js");
			mockFetch.mockResolvedValue({ links: [{ id: LINK_ID }], total_count: 1 });

			const result = await handleListLinks({ region: REGION, page: 1, pageSize: 50 });

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "interlink/v1beta1/regions/fr-par/links",
					urlParams: expect.any(URLSearchParams),
				}),
			);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.totalCount).toBe(1);
			expect(parsed.items).toHaveLength(1);
		});

		it("passes all optional filters", async () => {
			const { handleListLinks } = await import("../../../src/tools/interlink/handlers.js");
			mockFetch.mockResolvedValue({ links: [], total_count: 0 });

			await handleListLinks({
				region: REGION,
				page: 2,
				pageSize: 10,
				projectId: PROJECT_ID,
				organizationId: PROJECT_ID,
				name: "my-link",
				tags: ["prod", "net"],
				status: "active",
				bgpV4Status: "up",
				bgpV6Status: "down",
				popId: POP_ID,
				bandwidthMbps: 1000,
				partnerId: PARTNER_ID,
				vpcId: VPC_ID,
				routingPolicyId: POLICY_ID,
				pairingKey: "pk-123",
				kind: "hosted",
				connectionId: CONNECTION_ID,
				orderBy: "name_asc",
			});

			const p = mockFetch.mock.calls[0][0].urlParams;
			expect(p.get("page")).toBe("2");
			expect(p.get("page_size")).toBe("10");
			expect(p.get("project_id")).toBe(PROJECT_ID);
			expect(p.get("organization_id")).toBe(PROJECT_ID);
			expect(p.get("name")).toBe("my-link");
			expect(p.getAll("tags")).toEqual(["prod", "net"]);
			expect(p.get("status")).toBe("active");
			expect(p.get("bgp_v4_status")).toBe("up");
			expect(p.get("bgp_v6_status")).toBe("down");
			expect(p.get("pop_id")).toBe(POP_ID);
			expect(p.get("bandwidth_mbps")).toBe("1000");
			expect(p.get("partner_id")).toBe(PARTNER_ID);
			expect(p.get("vpc_id")).toBe(VPC_ID);
			expect(p.get("routing_policy_id")).toBe(POLICY_ID);
			expect(p.get("pairing_key")).toBe("pk-123");
			expect(p.get("kind")).toBe("hosted");
			expect(p.get("connection_id")).toBe(CONNECTION_ID);
			expect(p.get("order_by")).toBe("name_asc");
		});

		it("returns error on failure", async () => {
			const { handleListLinks } = await import("../../../src/tools/interlink/handlers.js");
			mockFetch.mockRejectedValue(makeError(401));
			const result: ErrorResult = await handleListLinks({ region: REGION, page: 1, pageSize: 50 });
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("permission_denied");
		});
	});

	describe("handleGetLink", () => {
		it("returns link details", async () => {
			const { handleGetLink } = await import("../../../src/tools/interlink/handlers.js");
			mockFetch.mockResolvedValue({ id: LINK_ID, status: "active" });
			const result = await handleGetLink({ region: REGION, linkId: LINK_ID });
			expect(mockFetch).toHaveBeenCalledWith({
				method: "GET",
				path: `interlink/v1beta1/regions/fr-par/links/${LINK_ID}`,
			});
			expect(JSON.parse(result.content[0].text).status).toBe("active");
		});

		it("returns error on 404", async () => {
			const { handleGetLink } = await import("../../../src/tools/interlink/handlers.js");
			mockFetch.mockRejectedValue(makeError(404));
			const result: ErrorResult = await handleGetLink({ region: REGION, linkId: LINK_ID });
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("not_found");
		});
	});

	describe("handleCreateLink", () => {
		it("creates a link with all fields", async () => {
			const { handleCreateLink } = await import("../../../src/tools/interlink/handlers.js");
			mockFetch.mockResolvedValue({ id: LINK_ID, name: "new-link" });
			const result = await handleCreateLink({
				region: REGION,
				name: "new-link",
				popId: POP_ID,
				bandwidthMbps: 1000,
				projectId: PROJECT_ID,
				tags: ["prod"],
				connectionId: CONNECTION_ID,
				partnerId: PARTNER_ID,
				peerAsn: 65000,
				vlan: 100,
				routingPolicyV4Id: POLICY_ID,
				routingPolicyV6Id: POLICY_ID,
			});
			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: "interlink/v1beta1/regions/fr-par/links",
				body: JSON.stringify({
					name: "new-link",
					pop_id: POP_ID,
					bandwidth_mbps: 1000,
					project_id: PROJECT_ID,
					tags: ["prod"],
					connection_id: CONNECTION_ID,
					partner_id: PARTNER_ID,
					peer_asn: 65000,
					vlan: 100,
					routing_policy_v4_id: POLICY_ID,
					routing_policy_v6_id: POLICY_ID,
				}),
				headers: { "Content-Type": "application/json" },
			});
			expect(JSON.parse(result.content[0].text).name).toBe("new-link");
		});

		it("creates a link with only required fields", async () => {
			const { handleCreateLink } = await import("../../../src/tools/interlink/handlers.js");
			mockFetch.mockResolvedValue({ id: LINK_ID });
			await handleCreateLink({
				region: REGION,
				name: "min-link",
				popId: POP_ID,
				bandwidthMbps: 500,
			});
			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: "interlink/v1beta1/regions/fr-par/links",
				body: JSON.stringify({
					name: "min-link",
					pop_id: POP_ID,
					bandwidth_mbps: 500,
				}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleCreateLink } = await import("../../../src/tools/interlink/handlers.js");
			mockFetch.mockRejectedValue(makeError(400));
			const result: ErrorResult = await handleCreateLink({
				region: REGION,
				name: "x",
				popId: POP_ID,
				bandwidthMbps: 500,
			});
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("invalid_input");
		});
	});

	describe("handleUpdateLink", () => {
		it("updates link fields", async () => {
			const { handleUpdateLink } = await import("../../../src/tools/interlink/handlers.js");
			mockFetch.mockResolvedValue({ id: LINK_ID, name: "renamed" });
			await handleUpdateLink({
				region: REGION,
				linkId: LINK_ID,
				name: "renamed",
				tags: ["a"],
				peerAsn: 64500,
			});
			expect(mockFetch).toHaveBeenCalledWith({
				method: "PATCH",
				path: `interlink/v1beta1/regions/fr-par/links/${LINK_ID}`,
				body: JSON.stringify({ name: "renamed", tags: ["a"], peer_asn: 64500 }),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("sends empty body when no fields provided", async () => {
			const { handleUpdateLink } = await import("../../../src/tools/interlink/handlers.js");
			mockFetch.mockResolvedValue({ id: LINK_ID });
			await handleUpdateLink({ region: REGION, linkId: LINK_ID });
			expect(mockFetch).toHaveBeenCalledWith({
				method: "PATCH",
				path: `interlink/v1beta1/regions/fr-par/links/${LINK_ID}`,
				body: JSON.stringify({}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleUpdateLink } = await import("../../../src/tools/interlink/handlers.js");
			mockFetch.mockRejectedValue(makeError());
			const result: ErrorResult = await handleUpdateLink({ region: REGION, linkId: LINK_ID });
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("server_error");
		});
	});

	describe("handleDeleteLink", () => {
		it("deletes a link", async () => {
			const { handleDeleteLink } = await import("../../../src/tools/interlink/handlers.js");
			mockFetch.mockResolvedValue({ id: LINK_ID, status: "deleting" });
			const result = await handleDeleteLink({ region: REGION, linkId: LINK_ID });
			expect(mockFetch).toHaveBeenCalledWith({
				method: "DELETE",
				path: `interlink/v1beta1/regions/fr-par/links/${LINK_ID}`,
			});
			expect(JSON.parse(result.content[0].text).status).toBe("deleting");
		});

		it("returns error on failure", async () => {
			const { handleDeleteLink } = await import("../../../src/tools/interlink/handlers.js");
			mockFetch.mockRejectedValue(makeError(403));
			const result: ErrorResult = await handleDeleteLink({ region: REGION, linkId: LINK_ID });
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("permission_denied");
		});
	});

	describe("handleAttachVpc", () => {
		it("attaches a VPC", async () => {
			const { handleAttachVpc } = await import("../../../src/tools/interlink/handlers.js");
			mockFetch.mockResolvedValue({ id: LINK_ID, vpc_id: VPC_ID });
			await handleAttachVpc({ region: REGION, linkId: LINK_ID, vpcId: VPC_ID });
			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: `interlink/v1beta1/regions/fr-par/links/${LINK_ID}/attach-vpc`,
				body: JSON.stringify({ vpc_id: VPC_ID }),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleAttachVpc } = await import("../../../src/tools/interlink/handlers.js");
			mockFetch.mockRejectedValue(makeError(409));
			const result: ErrorResult = await handleAttachVpc({
				region: REGION,
				linkId: LINK_ID,
				vpcId: VPC_ID,
			});
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("server_error");
		});
	});

	describe("handleDetachVpc", () => {
		it("detaches the VPC", async () => {
			const { handleDetachVpc } = await import("../../../src/tools/interlink/handlers.js");
			mockFetch.mockResolvedValue({ id: LINK_ID });
			await handleDetachVpc({ region: REGION, linkId: LINK_ID });
			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: `interlink/v1beta1/regions/fr-par/links/${LINK_ID}/detach-vpc`,
				body: JSON.stringify({}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleDetachVpc } = await import("../../../src/tools/interlink/handlers.js");
			mockFetch.mockRejectedValue(makeError(404));
			const result: ErrorResult = await handleDetachVpc({ region: REGION, linkId: LINK_ID });
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("not_found");
		});
	});

	describe("handleAttachRoutingPolicy", () => {
		it("attaches a routing policy", async () => {
			const { handleAttachRoutingPolicy } = await import(
				"../../../src/tools/interlink/handlers.js"
			);
			mockFetch.mockResolvedValue({ id: LINK_ID });
			await handleAttachRoutingPolicy({
				region: REGION,
				linkId: LINK_ID,
				routingPolicyId: POLICY_ID,
			});
			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: `interlink/v1beta1/regions/fr-par/links/${LINK_ID}/attach-routing-policy`,
				body: JSON.stringify({ routing_policy_id: POLICY_ID }),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleAttachRoutingPolicy } = await import(
				"../../../src/tools/interlink/handlers.js"
			);
			mockFetch.mockRejectedValue(makeError(400));
			const result: ErrorResult = await handleAttachRoutingPolicy({
				region: REGION,
				linkId: LINK_ID,
				routingPolicyId: POLICY_ID,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleDetachRoutingPolicy", () => {
		it("detaches a routing policy", async () => {
			const { handleDetachRoutingPolicy } = await import(
				"../../../src/tools/interlink/handlers.js"
			);
			mockFetch.mockResolvedValue({ id: LINK_ID });
			await handleDetachRoutingPolicy({
				region: REGION,
				linkId: LINK_ID,
				routingPolicyId: POLICY_ID,
			});
			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: `interlink/v1beta1/regions/fr-par/links/${LINK_ID}/detach-routing-policy`,
				body: JSON.stringify({ routing_policy_id: POLICY_ID }),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleDetachRoutingPolicy } = await import(
				"../../../src/tools/interlink/handlers.js"
			);
			mockFetch.mockRejectedValue(makeError(500));
			const result: ErrorResult = await handleDetachRoutingPolicy({
				region: REGION,
				linkId: LINK_ID,
				routingPolicyId: POLICY_ID,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleSetRoutingPolicy", () => {
		it("sets a routing policy", async () => {
			const { handleSetRoutingPolicy } = await import("../../../src/tools/interlink/handlers.js");
			mockFetch.mockResolvedValue({ id: LINK_ID });
			await handleSetRoutingPolicy({
				region: REGION,
				linkId: LINK_ID,
				routingPolicyId: POLICY_ID,
			});
			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: `interlink/v1beta1/regions/fr-par/links/${LINK_ID}/set-routing-policy`,
				body: JSON.stringify({ routing_policy_id: POLICY_ID }),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleSetRoutingPolicy } = await import("../../../src/tools/interlink/handlers.js");
			mockFetch.mockRejectedValue(makeError(400));
			const result: ErrorResult = await handleSetRoutingPolicy({
				region: REGION,
				linkId: LINK_ID,
				routingPolicyId: POLICY_ID,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleEnableRoutePropagation", () => {
		it("enables route propagation", async () => {
			const { handleEnableRoutePropagation } = await import(
				"../../../src/tools/interlink/handlers.js"
			);
			mockFetch.mockResolvedValue({ id: LINK_ID, enable_route_propagation: true });
			await handleEnableRoutePropagation({ region: REGION, linkId: LINK_ID });
			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: `interlink/v1beta1/regions/fr-par/links/${LINK_ID}/enable-route-propagation`,
				body: JSON.stringify({}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleEnableRoutePropagation } = await import(
				"../../../src/tools/interlink/handlers.js"
			);
			mockFetch.mockRejectedValue(makeError(400));
			const result: ErrorResult = await handleEnableRoutePropagation({
				region: REGION,
				linkId: LINK_ID,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleDisableRoutePropagation", () => {
		it("disables route propagation", async () => {
			const { handleDisableRoutePropagation } = await import(
				"../../../src/tools/interlink/handlers.js"
			);
			mockFetch.mockResolvedValue({ id: LINK_ID, enable_route_propagation: false });
			await handleDisableRoutePropagation({ region: REGION, linkId: LINK_ID });
			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: `interlink/v1beta1/regions/fr-par/links/${LINK_ID}/disable-route-propagation`,
				body: JSON.stringify({}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleDisableRoutePropagation } = await import(
				"../../../src/tools/interlink/handlers.js"
			);
			mockFetch.mockRejectedValue(makeError(429));
			const result: ErrorResult = await handleDisableRoutePropagation({
				region: REGION,
				linkId: LINK_ID,
			});
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("rate_limited");
		});
	});

	// --- Routing policies ---

	describe("handleListRoutingPolicies", () => {
		it("returns paginated policies", async () => {
			const { handleListRoutingPolicies } = await import(
				"../../../src/tools/interlink/handlers.js"
			);
			mockFetch.mockResolvedValue({ routing_policies: [{ id: POLICY_ID }], total_count: 1 });
			const result = await handleListRoutingPolicies({ region: REGION, page: 1, pageSize: 50 });
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "interlink/v1beta1/regions/fr-par/routing-policies",
				}),
			);
			expect(JSON.parse(result.content[0].text).items).toHaveLength(1);
		});

		it("passes optional filters", async () => {
			const { handleListRoutingPolicies } = await import(
				"../../../src/tools/interlink/handlers.js"
			);
			mockFetch.mockResolvedValue({ routing_policies: [], total_count: 0 });
			await handleListRoutingPolicies({
				region: REGION,
				page: 1,
				pageSize: 25,
				projectId: PROJECT_ID,
				organizationId: PROJECT_ID,
				name: "rp",
				tags: ["x"],
				ipv6: true,
				orderBy: "created_at_desc",
			});
			const p = mockFetch.mock.calls[0][0].urlParams;
			expect(p.get("project_id")).toBe(PROJECT_ID);
			expect(p.get("organization_id")).toBe(PROJECT_ID);
			expect(p.get("name")).toBe("rp");
			expect(p.getAll("tags")).toEqual(["x"]);
			expect(p.get("ipv6")).toBe("true");
			expect(p.get("order_by")).toBe("created_at_desc");
		});

		it("returns error on failure", async () => {
			const { handleListRoutingPolicies } = await import(
				"../../../src/tools/interlink/handlers.js"
			);
			mockFetch.mockRejectedValue(makeError(500));
			const result: ErrorResult = await handleListRoutingPolicies({
				region: REGION,
				page: 1,
				pageSize: 50,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleGetRoutingPolicy", () => {
		it("returns policy details", async () => {
			const { handleGetRoutingPolicy } = await import("../../../src/tools/interlink/handlers.js");
			mockFetch.mockResolvedValue({ id: POLICY_ID, is_ipv6: false });
			const result = await handleGetRoutingPolicy({
				region: REGION,
				routingPolicyId: POLICY_ID,
			});
			expect(mockFetch).toHaveBeenCalledWith({
				method: "GET",
				path: `interlink/v1beta1/regions/fr-par/routing-policies/${POLICY_ID}`,
			});
			expect(JSON.parse(result.content[0].text).id).toBe(POLICY_ID);
		});

		it("returns error on failure", async () => {
			const { handleGetRoutingPolicy } = await import("../../../src/tools/interlink/handlers.js");
			mockFetch.mockRejectedValue(makeError(404));
			const result: ErrorResult = await handleGetRoutingPolicy({
				region: REGION,
				routingPolicyId: POLICY_ID,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleCreateRoutingPolicy", () => {
		it("creates a policy with all fields", async () => {
			const { handleCreateRoutingPolicy } = await import(
				"../../../src/tools/interlink/handlers.js"
			);
			mockFetch.mockResolvedValue({ id: POLICY_ID });
			await handleCreateRoutingPolicy({
				region: REGION,
				name: "rp",
				isIpv6: true,
				projectId: PROJECT_ID,
				tags: ["net"],
				prefixFilterIn: ["10.0.0.0/8"],
				prefixFilterOut: ["192.168.0.0/16"],
			});
			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: "interlink/v1beta1/regions/fr-par/routing-policies",
				body: JSON.stringify({
					name: "rp",
					is_ipv6: true,
					project_id: PROJECT_ID,
					tags: ["net"],
					prefix_filter_in: ["10.0.0.0/8"],
					prefix_filter_out: ["192.168.0.0/16"],
				}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("creates a policy with only required fields", async () => {
			const { handleCreateRoutingPolicy } = await import(
				"../../../src/tools/interlink/handlers.js"
			);
			mockFetch.mockResolvedValue({ id: POLICY_ID });
			await handleCreateRoutingPolicy({ region: REGION, name: "rp", isIpv6: false });
			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: "interlink/v1beta1/regions/fr-par/routing-policies",
				body: JSON.stringify({ name: "rp", is_ipv6: false }),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleCreateRoutingPolicy } = await import(
				"../../../src/tools/interlink/handlers.js"
			);
			mockFetch.mockRejectedValue(makeError(400));
			const result: ErrorResult = await handleCreateRoutingPolicy({
				region: REGION,
				name: "rp",
				isIpv6: false,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleUpdateRoutingPolicy", () => {
		it("updates a policy", async () => {
			const { handleUpdateRoutingPolicy } = await import(
				"../../../src/tools/interlink/handlers.js"
			);
			mockFetch.mockResolvedValue({ id: POLICY_ID });
			await handleUpdateRoutingPolicy({
				region: REGION,
				routingPolicyId: POLICY_ID,
				name: "rp2",
				tags: ["y"],
				prefixFilterIn: ["10.0.0.0/8"],
				prefixFilterOut: ["0.0.0.0/0"],
			});
			expect(mockFetch).toHaveBeenCalledWith({
				method: "PATCH",
				path: `interlink/v1beta1/regions/fr-par/routing-policies/${POLICY_ID}`,
				body: JSON.stringify({
					name: "rp2",
					tags: ["y"],
					prefix_filter_in: ["10.0.0.0/8"],
					prefix_filter_out: ["0.0.0.0/0"],
				}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("sends empty body when no fields provided", async () => {
			const { handleUpdateRoutingPolicy } = await import(
				"../../../src/tools/interlink/handlers.js"
			);
			mockFetch.mockResolvedValue({ id: POLICY_ID });
			await handleUpdateRoutingPolicy({ region: REGION, routingPolicyId: POLICY_ID });
			expect(mockFetch).toHaveBeenCalledWith({
				method: "PATCH",
				path: `interlink/v1beta1/regions/fr-par/routing-policies/${POLICY_ID}`,
				body: JSON.stringify({}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleUpdateRoutingPolicy } = await import(
				"../../../src/tools/interlink/handlers.js"
			);
			mockFetch.mockRejectedValue(makeError(400));
			const result: ErrorResult = await handleUpdateRoutingPolicy({
				region: REGION,
				routingPolicyId: POLICY_ID,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleDeleteRoutingPolicy", () => {
		it("deletes a policy", async () => {
			const { handleDeleteRoutingPolicy } = await import(
				"../../../src/tools/interlink/handlers.js"
			);
			mockFetch.mockResolvedValue({ id: POLICY_ID });
			const result = await handleDeleteRoutingPolicy({
				region: REGION,
				routingPolicyId: POLICY_ID,
			});
			expect(mockFetch).toHaveBeenCalledWith({
				method: "DELETE",
				path: `interlink/v1beta1/regions/fr-par/routing-policies/${POLICY_ID}`,
			});
			expect(JSON.parse(result.content[0].text).id).toBe(POLICY_ID);
		});

		it("returns error on failure", async () => {
			const { handleDeleteRoutingPolicy } = await import(
				"../../../src/tools/interlink/handlers.js"
			);
			mockFetch.mockRejectedValue(makeError(403));
			const result: ErrorResult = await handleDeleteRoutingPolicy({
				region: REGION,
				routingPolicyId: POLICY_ID,
			});
			expect(result.isError).toBe(true);
		});
	});

	// --- Partners ---

	describe("handleListPartners", () => {
		it("returns paginated partners", async () => {
			const { handleListPartners } = await import("../../../src/tools/interlink/handlers.js");
			mockFetch.mockResolvedValue({ partners: [{ id: PARTNER_ID }], total_count: 1 });
			const result = await handleListPartners({ region: REGION, page: 1, pageSize: 50 });
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "interlink/v1beta1/regions/fr-par/partners",
				}),
			);
			expect(JSON.parse(result.content[0].text).totalCount).toBe(1);
		});

		it("passes optional filters", async () => {
			const { handleListPartners } = await import("../../../src/tools/interlink/handlers.js");
			mockFetch.mockResolvedValue({ partners: [], total_count: 0 });
			await handleListPartners({
				region: REGION,
				page: 1,
				pageSize: 50,
				popIds: [POP_ID],
				orderBy: "name_desc",
			});
			const p = mockFetch.mock.calls[0][0].urlParams;
			expect(p.getAll("pop_ids")).toEqual([POP_ID]);
			expect(p.get("order_by")).toBe("name_desc");
		});

		it("returns error on failure", async () => {
			const { handleListPartners } = await import("../../../src/tools/interlink/handlers.js");
			mockFetch.mockRejectedValue(makeError(500));
			const result: ErrorResult = await handleListPartners({
				region: REGION,
				page: 1,
				pageSize: 50,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleGetPartner", () => {
		it("returns partner details", async () => {
			const { handleGetPartner } = await import("../../../src/tools/interlink/handlers.js");
			mockFetch.mockResolvedValue({ id: PARTNER_ID, name: "Equinix" });
			const result = await handleGetPartner({ region: REGION, partnerId: PARTNER_ID });
			expect(mockFetch).toHaveBeenCalledWith({
				method: "GET",
				path: `interlink/v1beta1/regions/fr-par/partners/${PARTNER_ID}`,
			});
			expect(JSON.parse(result.content[0].text).name).toBe("Equinix");
		});

		it("returns error on failure", async () => {
			const { handleGetPartner } = await import("../../../src/tools/interlink/handlers.js");
			mockFetch.mockRejectedValue(makeError(404));
			const result: ErrorResult = await handleGetPartner({
				region: REGION,
				partnerId: PARTNER_ID,
			});
			expect(result.isError).toBe(true);
		});
	});

	// --- PoPs ---

	describe("handleListPops", () => {
		it("returns paginated pops", async () => {
			const { handleListPops } = await import("../../../src/tools/interlink/handlers.js");
			mockFetch.mockResolvedValue({ pops: [{ id: POP_ID }], total_count: 1 });
			const result = await handleListPops({ region: REGION, page: 1, pageSize: 50 });
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "interlink/v1beta1/regions/fr-par/pops",
				}),
			);
			expect(JSON.parse(result.content[0].text).items).toHaveLength(1);
		});

		it("passes optional filters", async () => {
			const { handleListPops } = await import("../../../src/tools/interlink/handlers.js");
			mockFetch.mockResolvedValue({ pops: [], total_count: 0 });
			await handleListPops({
				region: REGION,
				page: 1,
				pageSize: 50,
				name: "PAR1",
				hostingProviderName: "Equinix",
				partnerId: PARTNER_ID,
				linkBandwidthMbps: 1000,
				dedicatedAvailable: true,
				orderBy: "name_asc",
			});
			const p = mockFetch.mock.calls[0][0].urlParams;
			expect(p.get("name")).toBe("PAR1");
			expect(p.get("hosting_provider_name")).toBe("Equinix");
			expect(p.get("partner_id")).toBe(PARTNER_ID);
			expect(p.get("link_bandwidth_mbps")).toBe("1000");
			expect(p.get("dedicated_available")).toBe("true");
			expect(p.get("order_by")).toBe("name_asc");
		});

		it("returns error on failure", async () => {
			const { handleListPops } = await import("../../../src/tools/interlink/handlers.js");
			mockFetch.mockRejectedValue(makeError(500));
			const result: ErrorResult = await handleListPops({ region: REGION, page: 1, pageSize: 50 });
			expect(result.isError).toBe(true);
		});
	});

	describe("handleGetPop", () => {
		it("returns pop details", async () => {
			const { handleGetPop } = await import("../../../src/tools/interlink/handlers.js");
			mockFetch.mockResolvedValue({ id: POP_ID, name: "PAR1" });
			const result = await handleGetPop({ region: REGION, popId: POP_ID });
			expect(mockFetch).toHaveBeenCalledWith({
				method: "GET",
				path: `interlink/v1beta1/regions/fr-par/pops/${POP_ID}`,
			});
			expect(JSON.parse(result.content[0].text).name).toBe("PAR1");
		});

		it("returns error on failure", async () => {
			const { handleGetPop } = await import("../../../src/tools/interlink/handlers.js");
			mockFetch.mockRejectedValue(makeError(404));
			const result: ErrorResult = await handleGetPop({ region: REGION, popId: POP_ID });
			expect(result.isError).toBe(true);
		});
	});

	// --- Dedicated connections ---

	describe("handleListDedicatedConnections", () => {
		it("returns paginated connections", async () => {
			const { handleListDedicatedConnections } = await import(
				"../../../src/tools/interlink/handlers.js"
			);
			mockFetch.mockResolvedValue({ connections: [{ id: CONNECTION_ID }], total_count: 1 });
			const result = await handleListDedicatedConnections({
				region: REGION,
				page: 1,
				pageSize: 50,
			});
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "interlink/v1beta1/regions/fr-par/dedicated-connections",
				}),
			);
			expect(JSON.parse(result.content[0].text).items).toHaveLength(1);
		});

		it("passes optional filters", async () => {
			const { handleListDedicatedConnections } = await import(
				"../../../src/tools/interlink/handlers.js"
			);
			mockFetch.mockResolvedValue({ connections: [], total_count: 0 });
			await handleListDedicatedConnections({
				region: REGION,
				page: 1,
				pageSize: 50,
				projectId: PROJECT_ID,
				organizationId: PROJECT_ID,
				name: "conn",
				tags: ["z"],
				status: "active",
				bandwidthMbps: 10000,
				popId: POP_ID,
				orderBy: "status_desc",
			});
			const p = mockFetch.mock.calls[0][0].urlParams;
			expect(p.get("project_id")).toBe(PROJECT_ID);
			expect(p.get("organization_id")).toBe(PROJECT_ID);
			expect(p.get("name")).toBe("conn");
			expect(p.getAll("tags")).toEqual(["z"]);
			expect(p.get("status")).toBe("active");
			expect(p.get("bandwidth_mbps")).toBe("10000");
			expect(p.get("pop_id")).toBe(POP_ID);
			expect(p.get("order_by")).toBe("status_desc");
		});

		it("returns error on failure", async () => {
			const { handleListDedicatedConnections } = await import(
				"../../../src/tools/interlink/handlers.js"
			);
			mockFetch.mockRejectedValue(makeError(500));
			const result: ErrorResult = await handleListDedicatedConnections({
				region: REGION,
				page: 1,
				pageSize: 50,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleGetDedicatedConnection", () => {
		it("returns connection details", async () => {
			const { handleGetDedicatedConnection } = await import(
				"../../../src/tools/interlink/handlers.js"
			);
			mockFetch.mockResolvedValue({ id: CONNECTION_ID, status: "active" });
			const result = await handleGetDedicatedConnection({
				region: REGION,
				connectionId: CONNECTION_ID,
			});
			expect(mockFetch).toHaveBeenCalledWith({
				method: "GET",
				path: `interlink/v1beta1/regions/fr-par/dedicated-connections/${CONNECTION_ID}`,
			});
			expect(JSON.parse(result.content[0].text).status).toBe("active");
		});

		it("returns error on failure", async () => {
			const { handleGetDedicatedConnection } = await import(
				"../../../src/tools/interlink/handlers.js"
			);
			mockFetch.mockRejectedValue(makeError(404));
			const result: ErrorResult = await handleGetDedicatedConnection({
				region: REGION,
				connectionId: CONNECTION_ID,
			});
			expect(result.isError).toBe(true);
		});
	});
});
