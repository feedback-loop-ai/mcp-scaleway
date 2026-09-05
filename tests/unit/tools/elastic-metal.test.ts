import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Errors } from "@scaleway/sdk-client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerElasticMetalTools } from "../../../src/tools/elastic-metal/index.js";

const mockFetch = vi.fn();

vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: vi.fn(() => ({
		accessKey: "SCWXXXXXXXXXXXXXXXXX",
		secretKey: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
		defaultProjectId: "00000000-0000-0000-0000-000000000000",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	})),
}));

vi.mock("../../../src/shared/client.js", () => ({
	createScalewayClient: vi.fn(() => ({ fetch: mockFetch })),
	resetClient: vi.fn(),
}));

type ToolCallback = (params: Record<string, unknown>) => Promise<{
	content: { type: string; text: string }[];
	isError?: boolean;
}>;

interface CapturedRequest {
	method: string;
	path: string;
	headers?: Record<string, string>;
	body?: string;
	urlParams?: URLSearchParams;
}

const ZONE = "fr-par-1";
const BASE_PATH = `/baremetal/v1/zones/${ZONE}`;
const SERVER_ID = "11111111-1111-1111-1111-111111111111";
const PN_ID = "77777777-7777-7777-7777-777777777777";

const EXPECTED_TOOLS = [
	"scaleway_elastic_metal_list_servers",
	"scaleway_elastic_metal_get_server",
	"scaleway_elastic_metal_create_server",
	"scaleway_elastic_metal_delete_server",
	"scaleway_elastic_metal_install_server",
	"scaleway_elastic_metal_reboot_server",
	"scaleway_elastic_metal_start_server",
	"scaleway_elastic_metal_stop_server",
	"scaleway_elastic_metal_list_offers",
	"scaleway_elastic_metal_list_oss",
	"scaleway_elastic_metal_get_bmc_access",
	"scaleway_elastic_metal_list_ips",
	"scaleway_elastic_metal_create_ip",
	"scaleway_elastic_metal_delete_ip",
	"scaleway_elastic_metal_list_server_private_networks",
	"scaleway_elastic_metal_add_server_private_network",
	"scaleway_elastic_metal_set_server_private_networks",
	"scaleway_elastic_metal_delete_server_private_network",
];

function captureToolCallbacks(): Map<string, ToolCallback> {
	const callbacks = new Map<string, ToolCallback>();
	const server = {
		tool: (name: string, _desc: string, _schema: unknown, callback: ToolCallback) => {
			callbacks.set(name, callback);
		},
	} as unknown as McpServer;
	registerElasticMetalTools(server);
	return callbacks;
}

function capturedRequest(): CapturedRequest {
	return mockFetch.mock.calls[0][0] as CapturedRequest;
}

beforeEach(() => {
	mockFetch.mockReset();
});

describe("elastic-metal module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerElasticMetalTools(server)).not.toThrow();
	});

	it("registers exactly the 18 Elastic Metal tools by name", () => {
		const callbacks = captureToolCallbacks();
		expect([...callbacks.keys()].sort()).toEqual([...EXPECTED_TOOLS].sort());
		expect(callbacks.size).toBe(18);
	});

	it("does not touch the Scaleway client at registration time", async () => {
		const { createScalewayClient } = await import("../../../src/shared/client.js");
		vi.mocked(createScalewayClient).mockClear();
		captureToolCallbacks();
		expect(createScalewayClient).not.toHaveBeenCalled();
		expect(mockFetch).not.toHaveBeenCalled();
	});

	describe("registered tool callbacks issue ScwRequest objects through the SDK client", () => {
		it("list_servers sends GET with a relative /baremetal path and URLSearchParams", async () => {
			mockFetch.mockResolvedValueOnce({ servers: [], total_count: 0 });
			const callbacks = captureToolCallbacks();
			const result = await callbacks.get("scaleway_elastic_metal_list_servers")?.({
				zone: ZONE,
			});
			expect(result?.isError).toBeUndefined();
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({ method: "GET", path: `${BASE_PATH}/servers` }),
			);
			const request = capturedRequest();
			expect(request.urlParams).toBeInstanceOf(URLSearchParams);
			expect(request.urlParams?.toString()).toBe("page=1&page_size=50");
			expect(JSON.parse(result?.content[0].text ?? "")).toEqual({
				items: [],
				totalCount: 0,
				page: 1,
				pageSize: 50,
			});
		});

		it("add_server_private_network sends POST with a JSON string body", async () => {
			mockFetch.mockResolvedValueOnce({ id: "x", private_network_id: PN_ID });
			const callbacks = captureToolCallbacks();
			await callbacks.get("scaleway_elastic_metal_add_server_private_network")?.({
				zone: ZONE,
				server_id: SERVER_ID,
				private_network_id: PN_ID,
			});
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "POST",
					path: `${BASE_PATH}/servers/${SERVER_ID}/private-networks`,
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ private_network_id: PN_ID }),
				}),
			);
		});

		it("delete_server_private_network treats an SDK 204 (undefined) as {}", async () => {
			mockFetch.mockResolvedValueOnce(undefined);
			const callbacks = captureToolCallbacks();
			const result = await callbacks.get("scaleway_elastic_metal_delete_server_private_network")?.({
				zone: ZONE,
				server_id: SERVER_ID,
				private_network_id: PN_ID,
			});
			expect(result?.isError).toBeUndefined();
			expect(JSON.parse(result?.content[0].text ?? "")).toEqual({});
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "DELETE",
					path: `${BASE_PATH}/servers/${SERVER_ID}/private-networks/${PN_ID}`,
				}),
			);
		});

		it("maps a thrown ScalewayError status into the MCP error envelope", async () => {
			mockFetch.mockRejectedValueOnce(new Errors.ScalewayError(404, { message: "not found" }));
			const callbacks = captureToolCallbacks();
			const result = await callbacks.get("scaleway_elastic_metal_get_server")?.({
				zone: ZONE,
				server_id: SERVER_ID,
			});
			expect(result?.isError).toBe(true);
			const parsed = JSON.parse(result?.content[0].text ?? "");
			expect(parsed.error.type).toBe("not_found");
			expect(parsed.error.statusCode).toBe(404);
		});
	});
});
