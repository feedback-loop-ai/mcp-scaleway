import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { registerVpcTools } from "../../../src/tools/vpc/index.js";

// Mock shared modules
vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: () => ({
		accessKey: "SCW-ACCESS-KEY",
		secretKey: "SCW-SECRET-KEY",
		defaultProjectId: "11111111-1111-1111-1111-111111111111",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	}),
}));

const mockFetch = vi.fn();
vi.mock("../../../src/shared/client.js", () => ({
	createScalewayClient: () => ({ fetch: mockFetch }),
	resetClient: vi.fn(),
}));

interface ScwRequest {
	method: string;
	path: string;
	headers?: Record<string, string>;
	body?: string;
	urlParams?: URLSearchParams;
}

function getRequest(): ScwRequest {
	return mockFetch.mock.calls[0][0] as ScwRequest;
}

const SAMPLE_VPC = {
	id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
	name: "my-vpc",
	region: "fr-par",
	project_id: "11111111-1111-1111-1111-111111111111",
	tags: ["env:test"],
	is_default: false,
	private_network_count: 2,
	created_at: "2026-01-01T00:00:00.000Z",
	updated_at: "2026-01-01T00:00:00.000Z",
};

const SAMPLE_PRIVATE_NETWORK = {
	id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
	name: "my-pn",
	vpc_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
	region: "fr-par",
	project_id: "11111111-1111-1111-1111-111111111111",
	tags: ["env:test"],
	subnets: [
		{
			id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
			subnet: "192.168.1.0/24",
			created_at: "2026-01-01T00:00:00.000Z",
			updated_at: "2026-01-01T00:00:00.000Z",
		},
	],
	created_at: "2026-01-01T00:00:00.000Z",
	updated_at: "2026-01-01T00:00:00.000Z",
};

// biome-ignore lint/suspicious/noExplicitAny: test helper accessing internal MCP server structure
function getToolHandler(server: McpServer, toolName: string): (params: any) => Promise<any> {
	// biome-ignore lint/suspicious/noExplicitAny: accessing private _registeredTools for testing
	const tool = (server as any)._registeredTools[toolName];
	if (!tool) {
		throw new Error(`Tool ${toolName} not registered`);
	}
	return tool.handler;
}

describe("vpc module", () => {
	let server: McpServer;

	beforeEach(() => {
		server = new McpServer({ name: "test", version: "0.0.1" });
		mockFetch.mockReset();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("registers without error", () => {
		expect(() => registerVpcTools(server)).not.toThrow();
	});

	it("registers all 10 VPC tools", () => {
		registerVpcTools(server);
		const tools = [
			"scaleway_vpc_list_vpcs",
			"scaleway_vpc_get_vpc",
			"scaleway_vpc_create_vpc",
			"scaleway_vpc_update_vpc",
			"scaleway_vpc_delete_vpc",
			"scaleway_vpc_list_private_networks",
			"scaleway_vpc_get_private_network",
			"scaleway_vpc_create_private_network",
			"scaleway_vpc_update_private_network",
			"scaleway_vpc_delete_private_network",
		];
		for (const name of tools) {
			// biome-ignore lint/suspicious/noExplicitAny: accessing private _registeredTools for testing
			expect((server as any)._registeredTools[name]).toBeDefined();
		}
	});

	// --- VPC Tools ---

	describe("scaleway_vpc_list_vpcs", () => {
		it("returns paginated VPCs", async () => {
			registerVpcTools(server);
			mockFetch.mockResolvedValueOnce({ vpcs: [SAMPLE_VPC], total_count: 1 });

			const handler = getToolHandler(server, "scaleway_vpc_list_vpcs");
			const result = await handler({ region: "fr-par" });

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.items).toHaveLength(1);
			expect(parsed.items[0].id).toBe(SAMPLE_VPC.id);
			expect(parsed.totalCount).toBe(1);
			expect(parsed.page).toBe(1);
			expect(parsed.pageSize).toBe(50);
		});

		it("handles empty response", async () => {
			registerVpcTools(server);
			mockFetch.mockResolvedValueOnce({ vpcs: [], total_count: 0 });

			const handler = getToolHandler(server, "scaleway_vpc_list_vpcs");
			const result = await handler({ region: "fr-par" });

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.items).toHaveLength(0);
			expect(parsed.totalCount).toBe(0);
		});

		it("passes name filter", async () => {
			registerVpcTools(server);
			mockFetch.mockResolvedValueOnce({ vpcs: [], total_count: 0 });

			const handler = getToolHandler(server, "scaleway_vpc_list_vpcs");
			await handler({ region: "fr-par", name: "test-vpc" });

			const req = getRequest();
			expect(req.urlParams?.get("name")).toBe("test-vpc");
		});

		it("passes tags filter", async () => {
			registerVpcTools(server);
			mockFetch.mockResolvedValueOnce({ vpcs: [], total_count: 0 });

			const handler = getToolHandler(server, "scaleway_vpc_list_vpcs");
			await handler({
				region: "fr-par",
				tags: ["env:prod", "team:infra"],
			});

			const req = getRequest();
			expect(req.urlParams?.getAll("tags")).toEqual(["env:prod", "team:infra"]);
		});

		it("passes project filter", async () => {
			registerVpcTools(server);
			mockFetch.mockResolvedValueOnce({ vpcs: [], total_count: 0 });

			const handler = getToolHandler(server, "scaleway_vpc_list_vpcs");
			await handler({
				region: "fr-par",
				project_id: "11111111-1111-1111-1111-111111111111",
			});

			const req = getRequest();
			expect(req.urlParams?.get("project_id")).toBe("11111111-1111-1111-1111-111111111111");
		});

		it("handles API errors", async () => {
			registerVpcTools(server);
			const err = new Error("forbidden");
			(err as Error & { statusCode: number }).statusCode = 403;
			mockFetch.mockRejectedValueOnce(err);

			const handler = getToolHandler(server, "scaleway_vpc_list_vpcs");
			const result = await handler({ region: "fr-par" });

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("permission_denied");
			expect(parsed.error.statusCode).toBe(403);
		});

		it("handles null vpcs in response", async () => {
			registerVpcTools(server);
			mockFetch.mockResolvedValueOnce({ total_count: 0 });

			const handler = getToolHandler(server, "scaleway_vpc_list_vpcs");
			const result = await handler({ region: "fr-par" });

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.items).toHaveLength(0);
		});

		it("handles null total_count in response", async () => {
			registerVpcTools(server);
			mockFetch.mockResolvedValueOnce({ vpcs: [SAMPLE_VPC] });

			const handler = getToolHandler(server, "scaleway_vpc_list_vpcs");
			const result = await handler({ region: "fr-par" });

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.items).toHaveLength(1);
			expect(parsed.totalCount).toBe(0);
		});
	});

	describe("scaleway_vpc_get_vpc", () => {
		it("returns VPC details", async () => {
			registerVpcTools(server);
			mockFetch.mockResolvedValueOnce(SAMPLE_VPC);

			const handler = getToolHandler(server, "scaleway_vpc_get_vpc");
			const result = await handler({
				region: "fr-par",
				vpc_id: SAMPLE_VPC.id,
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.id).toBe(SAMPLE_VPC.id);
			expect(parsed.name).toBe("my-vpc");
		});

		it("calls correct path", async () => {
			registerVpcTools(server);
			mockFetch.mockResolvedValueOnce(SAMPLE_VPC);

			const handler = getToolHandler(server, "scaleway_vpc_get_vpc");
			await handler({ region: "fr-par", vpc_id: SAMPLE_VPC.id });

			const req = getRequest();
			expect(req.path).toContain(`/fr-par/vpcs/${SAMPLE_VPC.id}`);
			expect(req.method).toBe("GET");
		});

		it("handles 404 error", async () => {
			registerVpcTools(server);
			const err = new Error("not found");
			(err as Error & { statusCode: number }).statusCode = 404;
			mockFetch.mockRejectedValueOnce(err);

			const handler = getToolHandler(server, "scaleway_vpc_get_vpc");
			const result = await handler({
				region: "fr-par",
				vpc_id: "aaaaaaaa-aaaa-aaaa-aaaa-000000000000",
			});

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("not_found");
		});
	});

	describe("scaleway_vpc_create_vpc", () => {
		it("creates a VPC", async () => {
			registerVpcTools(server);
			mockFetch.mockResolvedValueOnce(SAMPLE_VPC);

			const handler = getToolHandler(server, "scaleway_vpc_create_vpc");
			const result = await handler({
				region: "fr-par",
				name: "my-vpc",
				project_id: "11111111-1111-1111-1111-111111111111",
				tags: ["env:test"],
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.id).toBe(SAMPLE_VPC.id);
		});

		it("sends POST with correct body", async () => {
			registerVpcTools(server);
			mockFetch.mockResolvedValueOnce(SAMPLE_VPC);

			const handler = getToolHandler(server, "scaleway_vpc_create_vpc");
			await handler({
				region: "fr-par",
				name: "my-vpc",
				project_id: "11111111-1111-1111-1111-111111111111",
				tags: ["env:test"],
			});

			const req = getRequest();
			expect(req.path).toContain("/fr-par/vpcs");
			expect(req.method).toBe("POST");
			const body = JSON.parse(req.body as string);
			expect(body.name).toBe("my-vpc");
			expect(body.project_id).toBe("11111111-1111-1111-1111-111111111111");
			expect(body.tags).toEqual(["env:test"]);
		});

		it("defaults tags to empty array when not provided", async () => {
			registerVpcTools(server);
			mockFetch.mockResolvedValueOnce(SAMPLE_VPC);

			const handler = getToolHandler(server, "scaleway_vpc_create_vpc");
			await handler({
				region: "fr-par",
				name: "my-vpc",
				project_id: "11111111-1111-1111-1111-111111111111",
			});

			const body = JSON.parse(getRequest().body as string);
			expect(body.tags).toEqual([]);
		});

		it("handles creation errors", async () => {
			registerVpcTools(server);
			const err = new Error("bad request");
			(err as Error & { statusCode: number }).statusCode = 400;
			mockFetch.mockRejectedValueOnce(err);

			const handler = getToolHandler(server, "scaleway_vpc_create_vpc");
			const result = await handler({
				region: "fr-par",
				name: "my-vpc",
				project_id: "11111111-1111-1111-1111-111111111111",
			});

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("invalid_input");
		});
	});

	describe("scaleway_vpc_update_vpc", () => {
		it("updates a VPC name", async () => {
			registerVpcTools(server);
			const updated = { ...SAMPLE_VPC, name: "updated-vpc" };
			mockFetch.mockResolvedValueOnce(updated);

			const handler = getToolHandler(server, "scaleway_vpc_update_vpc");
			const result = await handler({
				region: "fr-par",
				vpc_id: SAMPLE_VPC.id,
				name: "updated-vpc",
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.name).toBe("updated-vpc");
		});

		it("sends PATCH with correct body", async () => {
			registerVpcTools(server);
			mockFetch.mockResolvedValueOnce(SAMPLE_VPC);

			const handler = getToolHandler(server, "scaleway_vpc_update_vpc");
			await handler({
				region: "fr-par",
				vpc_id: SAMPLE_VPC.id,
				name: "updated-vpc",
				tags: ["new-tag"],
			});

			const req = getRequest();
			expect(req.path).toContain(`/fr-par/vpcs/${SAMPLE_VPC.id}`);
			expect(req.method).toBe("PATCH");
			const body = JSON.parse(req.body as string);
			expect(body.name).toBe("updated-vpc");
			expect(body.tags).toEqual(["new-tag"]);
		});

		it("handles update errors", async () => {
			registerVpcTools(server);
			const err = new Error("not found");
			(err as Error & { statusCode: number }).statusCode = 404;
			mockFetch.mockRejectedValueOnce(err);

			const handler = getToolHandler(server, "scaleway_vpc_update_vpc");
			const result = await handler({
				region: "fr-par",
				vpc_id: SAMPLE_VPC.id,
				name: "updated-vpc",
			});

			expect(result.isError).toBe(true);
		});
	});

	describe("scaleway_vpc_delete_vpc", () => {
		it("deletes a VPC", async () => {
			registerVpcTools(server);
			mockFetch.mockResolvedValueOnce(undefined);

			const handler = getToolHandler(server, "scaleway_vpc_delete_vpc");
			const result = await handler({
				region: "fr-par",
				vpc_id: SAMPLE_VPC.id,
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.success).toBe(true);
			expect(parsed.vpc_id).toBe(SAMPLE_VPC.id);
		});

		it("sends DELETE to correct path", async () => {
			registerVpcTools(server);
			mockFetch.mockResolvedValueOnce(undefined);

			const handler = getToolHandler(server, "scaleway_vpc_delete_vpc");
			await handler({ region: "fr-par", vpc_id: SAMPLE_VPC.id });

			const req = getRequest();
			expect(req.path).toContain(`/fr-par/vpcs/${SAMPLE_VPC.id}`);
			expect(req.method).toBe("DELETE");
		});

		it("handles delete errors", async () => {
			registerVpcTools(server);
			const err = new Error("conflict");
			(err as Error & { statusCode: number }).statusCode = 400;
			mockFetch.mockRejectedValueOnce(err);

			const handler = getToolHandler(server, "scaleway_vpc_delete_vpc");
			const result = await handler({
				region: "fr-par",
				vpc_id: SAMPLE_VPC.id,
			});

			expect(result.isError).toBe(true);
		});
	});

	// --- Private Network Tools ---

	describe("scaleway_vpc_list_private_networks", () => {
		it("returns paginated private networks", async () => {
			registerVpcTools(server);
			mockFetch.mockResolvedValueOnce({
				private_networks: [SAMPLE_PRIVATE_NETWORK],
				total_count: 1,
			});

			const handler = getToolHandler(server, "scaleway_vpc_list_private_networks");
			const result = await handler({ region: "fr-par" });

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.items).toHaveLength(1);
			expect(parsed.items[0].id).toBe(SAMPLE_PRIVATE_NETWORK.id);
			expect(parsed.totalCount).toBe(1);
		});

		it("passes vpc_id filter", async () => {
			registerVpcTools(server);
			mockFetch.mockResolvedValueOnce({ private_networks: [], total_count: 0 });

			const handler = getToolHandler(server, "scaleway_vpc_list_private_networks");
			await handler({ region: "fr-par", vpc_id: SAMPLE_VPC.id });

			const req = getRequest();
			expect(req.urlParams?.get("vpc_id")).toBe(SAMPLE_VPC.id);
		});

		it("passes name filter", async () => {
			registerVpcTools(server);
			mockFetch.mockResolvedValueOnce({ private_networks: [], total_count: 0 });

			const handler = getToolHandler(server, "scaleway_vpc_list_private_networks");
			await handler({ region: "fr-par", name: "my-pn" });

			const req = getRequest();
			expect(req.urlParams?.get("name")).toBe("my-pn");
		});

		it("passes project_id filter", async () => {
			registerVpcTools(server);
			mockFetch.mockResolvedValueOnce({ private_networks: [], total_count: 0 });

			const handler = getToolHandler(server, "scaleway_vpc_list_private_networks");
			await handler({
				region: "fr-par",
				project_id: "11111111-1111-1111-1111-111111111111",
			});

			const req = getRequest();
			expect(req.urlParams?.get("project_id")).toBe("11111111-1111-1111-1111-111111111111");
		});

		it("passes tags filter", async () => {
			registerVpcTools(server);
			mockFetch.mockResolvedValueOnce({ private_networks: [], total_count: 0 });

			const handler = getToolHandler(server, "scaleway_vpc_list_private_networks");
			await handler({ region: "fr-par", tags: ["env:prod"] });

			const req = getRequest();
			expect(req.urlParams?.getAll("tags")).toEqual(["env:prod"]);
		});

		it("handles null private_networks in response", async () => {
			registerVpcTools(server);
			mockFetch.mockResolvedValueOnce({ total_count: 0 });

			const handler = getToolHandler(server, "scaleway_vpc_list_private_networks");
			const result = await handler({ region: "fr-par" });

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.items).toHaveLength(0);
		});

		it("handles null total_count in response", async () => {
			registerVpcTools(server);
			mockFetch.mockResolvedValueOnce({ private_networks: [SAMPLE_PRIVATE_NETWORK] });

			const handler = getToolHandler(server, "scaleway_vpc_list_private_networks");
			const result = await handler({ region: "fr-par" });

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.items).toHaveLength(1);
			expect(parsed.totalCount).toBe(0);
		});

		it("handles API errors", async () => {
			registerVpcTools(server);
			const err = new Error("rate limited");
			(err as Error & { statusCode: number }).statusCode = 429;
			mockFetch.mockRejectedValueOnce(err);

			const handler = getToolHandler(server, "scaleway_vpc_list_private_networks");
			const result = await handler({ region: "fr-par" });

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("rate_limited");
		});
	});

	describe("scaleway_vpc_get_private_network", () => {
		it("returns private network details", async () => {
			registerVpcTools(server);
			mockFetch.mockResolvedValueOnce(SAMPLE_PRIVATE_NETWORK);

			const handler = getToolHandler(server, "scaleway_vpc_get_private_network");
			const result = await handler({
				region: "fr-par",
				private_network_id: SAMPLE_PRIVATE_NETWORK.id,
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.id).toBe(SAMPLE_PRIVATE_NETWORK.id);
			expect(parsed.vpc_id).toBe(SAMPLE_PRIVATE_NETWORK.vpc_id);
			expect(parsed.subnets).toHaveLength(1);
		});

		it("calls correct path", async () => {
			registerVpcTools(server);
			mockFetch.mockResolvedValueOnce(SAMPLE_PRIVATE_NETWORK);

			const handler = getToolHandler(server, "scaleway_vpc_get_private_network");
			await handler({
				region: "fr-par",
				private_network_id: SAMPLE_PRIVATE_NETWORK.id,
			});

			const req = getRequest();
			expect(req.path).toContain(`/fr-par/private-networks/${SAMPLE_PRIVATE_NETWORK.id}`);
			expect(req.method).toBe("GET");
		});

		it("handles 404 error", async () => {
			registerVpcTools(server);
			const err = new Error("not found");
			(err as Error & { statusCode: number }).statusCode = 404;
			mockFetch.mockRejectedValueOnce(err);

			const handler = getToolHandler(server, "scaleway_vpc_get_private_network");
			const result = await handler({
				region: "fr-par",
				private_network_id: "aaaaaaaa-aaaa-aaaa-aaaa-000000000000",
			});

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("not_found");
		});
	});

	describe("scaleway_vpc_create_private_network", () => {
		it("creates a private network", async () => {
			registerVpcTools(server);
			mockFetch.mockResolvedValueOnce(SAMPLE_PRIVATE_NETWORK);

			const handler = getToolHandler(server, "scaleway_vpc_create_private_network");
			const result = await handler({
				region: "fr-par",
				name: "my-pn",
				project_id: "11111111-1111-1111-1111-111111111111",
				vpc_id: SAMPLE_VPC.id,
				tags: ["env:test"],
				subnets: ["192.168.1.0/24"],
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.id).toBe(SAMPLE_PRIVATE_NETWORK.id);
		});

		it("sends POST with correct body", async () => {
			registerVpcTools(server);
			mockFetch.mockResolvedValueOnce(SAMPLE_PRIVATE_NETWORK);

			const handler = getToolHandler(server, "scaleway_vpc_create_private_network");
			await handler({
				region: "fr-par",
				name: "my-pn",
				project_id: "11111111-1111-1111-1111-111111111111",
				vpc_id: SAMPLE_VPC.id,
				tags: ["env:test"],
				subnets: ["192.168.1.0/24"],
			});

			const req = getRequest();
			expect(req.path).toContain("/fr-par/private-networks");
			expect(req.method).toBe("POST");
			const body = JSON.parse(req.body as string);
			expect(body.name).toBe("my-pn");
			expect(body.vpc_id).toBe(SAMPLE_VPC.id);
			expect(body.subnets).toEqual(["192.168.1.0/24"]);
		});

		it("defaults tags and subnets to empty arrays", async () => {
			registerVpcTools(server);
			mockFetch.mockResolvedValueOnce(SAMPLE_PRIVATE_NETWORK);

			const handler = getToolHandler(server, "scaleway_vpc_create_private_network");
			await handler({
				region: "fr-par",
				name: "my-pn",
				project_id: "11111111-1111-1111-1111-111111111111",
				vpc_id: SAMPLE_VPC.id,
			});

			const body = JSON.parse(getRequest().body as string);
			expect(body.tags).toEqual([]);
			expect(body.subnets).toEqual([]);
		});

		it("handles creation errors", async () => {
			registerVpcTools(server);
			const err = new Error("bad request");
			(err as Error & { statusCode: number }).statusCode = 400;
			mockFetch.mockRejectedValueOnce(err);

			const handler = getToolHandler(server, "scaleway_vpc_create_private_network");
			const result = await handler({
				region: "fr-par",
				name: "my-pn",
				project_id: "11111111-1111-1111-1111-111111111111",
				vpc_id: SAMPLE_VPC.id,
			});

			expect(result.isError).toBe(true);
		});
	});

	describe("scaleway_vpc_update_private_network", () => {
		it("updates a private network", async () => {
			registerVpcTools(server);
			const updated = { ...SAMPLE_PRIVATE_NETWORK, name: "updated-pn" };
			mockFetch.mockResolvedValueOnce(updated);

			const handler = getToolHandler(server, "scaleway_vpc_update_private_network");
			const result = await handler({
				region: "fr-par",
				private_network_id: SAMPLE_PRIVATE_NETWORK.id,
				name: "updated-pn",
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.name).toBe("updated-pn");
		});

		it("sends PATCH with correct body", async () => {
			registerVpcTools(server);
			mockFetch.mockResolvedValueOnce(SAMPLE_PRIVATE_NETWORK);

			const handler = getToolHandler(server, "scaleway_vpc_update_private_network");
			await handler({
				region: "fr-par",
				private_network_id: SAMPLE_PRIVATE_NETWORK.id,
				name: "updated-pn",
				tags: ["new-tag"],
				subnets: ["10.0.0.0/16"],
			});

			const req = getRequest();
			expect(req.path).toContain(`/fr-par/private-networks/${SAMPLE_PRIVATE_NETWORK.id}`);
			expect(req.method).toBe("PATCH");
			const body = JSON.parse(req.body as string);
			expect(body.name).toBe("updated-pn");
			expect(body.tags).toEqual(["new-tag"]);
			expect(body.subnets).toEqual(["10.0.0.0/16"]);
		});

		it("handles update errors", async () => {
			registerVpcTools(server);
			const err = new Error("not found");
			(err as Error & { statusCode: number }).statusCode = 404;
			mockFetch.mockRejectedValueOnce(err);

			const handler = getToolHandler(server, "scaleway_vpc_update_private_network");
			const result = await handler({
				region: "fr-par",
				private_network_id: SAMPLE_PRIVATE_NETWORK.id,
				name: "updated-pn",
			});

			expect(result.isError).toBe(true);
		});
	});

	describe("scaleway_vpc_delete_private_network", () => {
		it("deletes a private network", async () => {
			registerVpcTools(server);
			mockFetch.mockResolvedValueOnce(undefined);

			const handler = getToolHandler(server, "scaleway_vpc_delete_private_network");
			const result = await handler({
				region: "fr-par",
				private_network_id: SAMPLE_PRIVATE_NETWORK.id,
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.success).toBe(true);
			expect(parsed.private_network_id).toBe(SAMPLE_PRIVATE_NETWORK.id);
		});

		it("sends DELETE to correct path", async () => {
			registerVpcTools(server);
			mockFetch.mockResolvedValueOnce(undefined);

			const handler = getToolHandler(server, "scaleway_vpc_delete_private_network");
			await handler({
				region: "fr-par",
				private_network_id: SAMPLE_PRIVATE_NETWORK.id,
			});

			const req = getRequest();
			expect(req.path).toContain(`/fr-par/private-networks/${SAMPLE_PRIVATE_NETWORK.id}`);
			expect(req.method).toBe("DELETE");
		});

		it("handles delete errors", async () => {
			registerVpcTools(server);
			const err = new Error("conflict");
			(err as Error & { statusCode: number }).statusCode = 400;
			mockFetch.mockRejectedValueOnce(err);

			const handler = getToolHandler(server, "scaleway_vpc_delete_private_network");
			const result = await handler({
				region: "fr-par",
				private_network_id: SAMPLE_PRIVATE_NETWORK.id,
			});

			expect(result.isError).toBe(true);
		});
	});
});
