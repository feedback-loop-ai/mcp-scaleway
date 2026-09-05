import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadAuthConfig } from "../../../src/shared/auth.js";
import { createScalewayClient, resetClient } from "../../../src/shared/client.js";
import { createAppleSiliconHandlers } from "../../../src/tools/apple-silicon/handlers.js";
import { getHandlers, registerAppleSiliconTools } from "../../../src/tools/apple-silicon/index.js";

vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: vi.fn().mockReturnValue({
		accessKey: "SCWTEST",
		secretKey: "secret",
		defaultProjectId: "00000000-0000-0000-0000-000000000000",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	}),
}));

vi.mock("../../../src/shared/client.js", () => ({
	createScalewayClient: vi.fn().mockReturnValue({
		fetch: vi.fn().mockResolvedValue({ result: "ok" }),
		settings: {},
	}),
	resetClient: vi.fn(),
}));

const mockLoadAuthConfig = vi.mocked(loadAuthConfig);
const mockCreateScalewayClient = vi.mocked(createScalewayClient);

const TEST_ENV = {
	SCW_ACCESS_KEY: "SCWXXXXXXXXXXXXXXXXX",
	SCW_SECRET_KEY: "11111111-1111-1111-1111-111111111111",
	SCW_DEFAULT_PROJECT_ID: "22222222-2222-2222-2222-222222222222",
};

describe("apple-silicon module", () => {
	beforeEach(() => {
		Object.assign(process.env, TEST_ENV);
		mockLoadAuthConfig.mockClear();
		mockCreateScalewayClient.mockClear();
	});

	afterEach(() => {
		for (const key of Object.keys(TEST_ENV)) {
			delete process.env[key];
		}
		resetClient();
	});

	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerAppleSiliconTools(server)).not.toThrow();
	});

	it("does not resolve credentials or build a client at registration time", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		registerAppleSiliconTools(server);

		expect(mockLoadAuthConfig).not.toHaveBeenCalled();
		expect(mockCreateScalewayClient).not.toHaveBeenCalled();
	});

	it("registers without error when SCW_* credentials are absent", () => {
		for (const key of Object.keys(TEST_ENV)) {
			delete process.env[key];
		}
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerAppleSiliconTools(server)).not.toThrow();
		expect(mockLoadAuthConfig).not.toHaveBeenCalled();
	});

	it("registers all 13 Apple Silicon tools", () => {
		const names: string[] = [];
		const server = {
			tool: (name: string) => {
				names.push(name);
			},
		} as unknown as McpServer;

		registerAppleSiliconTools(server);

		expect(names).toContain("scaleway_apple_silicon_list_server_private_networks");
		expect(names).toContain("scaleway_apple_silicon_get_server_private_network");
		expect(names).toContain("scaleway_apple_silicon_add_server_private_network");
		expect(names).toContain("scaleway_apple_silicon_set_server_private_networks");
		expect(names).toContain("scaleway_apple_silicon_delete_server_private_network");
		expect(names).toHaveLength(13);
	});

	describe("getHandlers", () => {
		it("resolves credentials, builds the client, and returns the full handler set", () => {
			const handlers = getHandlers();

			expect(mockLoadAuthConfig).toHaveBeenCalledOnce();
			expect(mockCreateScalewayClient).toHaveBeenCalledOnce();
			expect(mockCreateScalewayClient).toHaveBeenCalledWith(
				expect.objectContaining({ accessKey: "SCWTEST", defaultZone: "fr-par-1" }),
			);

			const expectedKeys = Object.keys(
				createAppleSiliconHandlers(mockCreateScalewayClient.mock.results[0].value, "fr-par-1"),
			).sort();
			expect(Object.keys(handlers).sort()).toEqual(expectedKeys);
			expect(expectedKeys).toHaveLength(13);
		});
	});

	describe("tool callbacks", () => {
		let toolCallbacks: Map<string, (params: Record<string, unknown>) => Promise<unknown>>;

		beforeEach(() => {
			toolCallbacks = new Map();
			const server = {
				tool: (
					name: string,
					_desc: string,
					_schema: unknown,
					callback: (params: Record<string, unknown>) => Promise<unknown>,
				) => {
					toolCallbacks.set(name, callback);
				},
			} as unknown as McpServer;
			registerAppleSiliconTools(server);
		});

		it("resolves credentials lazily, on the first tool invocation", async () => {
			expect(mockLoadAuthConfig).not.toHaveBeenCalled();
			expect(mockCreateScalewayClient).not.toHaveBeenCalled();

			const cb = toolCallbacks.get("scaleway_apple_silicon_list_servers");
			expect(cb).toBeDefined();
			const result = await cb?.({});

			expect(result).toBeDefined();
			expect(mockLoadAuthConfig).toHaveBeenCalledOnce();
			expect(mockCreateScalewayClient).toHaveBeenCalledOnce();
		});

		it("uses the default zone from the resolved config", async () => {
			const cb = toolCallbacks.get("scaleway_apple_silicon_list_server_types");
			await cb?.({});

			const client = mockCreateScalewayClient.mock.results[0].value;
			expect(client.fetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "/apple-silicon/v1alpha1/zones/fr-par-1/server-types",
				}),
			);
		});

		it("list_server_private_networks callback executes", async () => {
			const cb = toolCallbacks.get("scaleway_apple_silicon_list_server_private_networks");
			expect(cb).toBeDefined();
			const result = await cb?.({});
			expect(result).toBeDefined();
		});

		it("get_server_private_network callback executes", async () => {
			const cb = toolCallbacks.get("scaleway_apple_silicon_get_server_private_network");
			const result = await cb?.({ server_id: "srv-1", private_network_id: "pn-1" });
			expect(result).toBeDefined();
		});

		it("add_server_private_network callback executes", async () => {
			const cb = toolCallbacks.get("scaleway_apple_silicon_add_server_private_network");
			const result = await cb?.({ server_id: "srv-1", private_network_id: "pn-1" });
			expect(result).toBeDefined();
		});

		it("set_server_private_networks callback executes", async () => {
			const cb = toolCallbacks.get("scaleway_apple_silicon_set_server_private_networks");
			const result = await cb?.({
				server_id: "srv-1",
				per_private_network_ipam_ip_ids: {},
			});
			expect(result).toBeDefined();
		});

		it("delete_server_private_network callback executes", async () => {
			const cb = toolCallbacks.get("scaleway_apple_silicon_delete_server_private_network");
			const result = await cb?.({ server_id: "srv-1", private_network_id: "pn-1" });
			expect(result).toBeDefined();
		});
	});
});
