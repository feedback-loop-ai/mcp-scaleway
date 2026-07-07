import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetClient } from "../../../src/shared/client.js";
import { registerAppleSiliconTools } from "../../../src/tools/apple-silicon/index.js";

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

const TEST_ENV = {
	SCW_ACCESS_KEY: "SCWXXXXXXXXXXXXXXXXX",
	SCW_SECRET_KEY: "11111111-1111-1111-1111-111111111111",
	SCW_DEFAULT_PROJECT_ID: "22222222-2222-2222-2222-222222222222",
};

describe("apple-silicon module", () => {
	beforeEach(() => {
		Object.assign(process.env, TEST_ENV);
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

	describe("Private Network tool callbacks", () => {
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
