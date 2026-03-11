import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerRegistryTools } from "../../../src/tools/registry/index.js";

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
}));

const VALID_UUID = "11111111-1111-1111-1111-111111111111";

describe("registry module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerRegistryTools(server)).not.toThrow();
	});

	describe("tool callbacks", () => {
		let toolCallbacks: Map<string, (input: Record<string, unknown>) => Promise<unknown>>;

		beforeEach(() => {
			toolCallbacks = new Map();
			const server = {
				tool: vi.fn(
					(
						name: string,
						_desc: string,
						_schema: unknown,
						callback: (input: Record<string, unknown>) => Promise<unknown>,
					) => {
						toolCallbacks.set(name, callback);
					},
				),
			} as unknown as McpServer;
			registerRegistryTools(server);
		});

		it("registers 12 tools", () => {
			expect(toolCallbacks.size).toBe(12);
		});

		it("scaleway_registry_list_namespaces callback executes", async () => {
			const cb = toolCallbacks.get("scaleway_registry_list_namespaces");
			expect(cb).toBeDefined();
			const result = await cb?.({ region: "fr-par" });
			expect(result).toBeDefined();
		});

		it("scaleway_registry_get_namespace callback executes", async () => {
			const cb = toolCallbacks.get("scaleway_registry_get_namespace");
			const result = await cb?.({ region: "fr-par", namespace_id: VALID_UUID });
			expect(result).toBeDefined();
		});

		it("scaleway_registry_create_namespace callback executes", async () => {
			const cb = toolCallbacks.get("scaleway_registry_create_namespace");
			const result = await cb?.({ region: "fr-par", name: "test-ns" });
			expect(result).toBeDefined();
		});

		it("scaleway_registry_update_namespace callback executes", async () => {
			const cb = toolCallbacks.get("scaleway_registry_update_namespace");
			const result = await cb?.({
				region: "fr-par",
				namespace_id: VALID_UUID,
				description: "updated",
			});
			expect(result).toBeDefined();
		});

		it("scaleway_registry_delete_namespace callback executes", async () => {
			const cb = toolCallbacks.get("scaleway_registry_delete_namespace");
			const result = await cb?.({ region: "fr-par", namespace_id: VALID_UUID });
			expect(result).toBeDefined();
		});

		it("scaleway_registry_list_images callback executes", async () => {
			const cb = toolCallbacks.get("scaleway_registry_list_images");
			const result = await cb?.({ region: "fr-par" });
			expect(result).toBeDefined();
		});

		it("scaleway_registry_get_image callback executes", async () => {
			const cb = toolCallbacks.get("scaleway_registry_get_image");
			const result = await cb?.({ region: "fr-par", image_id: VALID_UUID });
			expect(result).toBeDefined();
		});

		it("scaleway_registry_update_image callback executes", async () => {
			const cb = toolCallbacks.get("scaleway_registry_update_image");
			const result = await cb?.({ region: "fr-par", image_id: VALID_UUID });
			expect(result).toBeDefined();
		});

		it("scaleway_registry_delete_image callback executes", async () => {
			const cb = toolCallbacks.get("scaleway_registry_delete_image");
			const result = await cb?.({ region: "fr-par", image_id: VALID_UUID });
			expect(result).toBeDefined();
		});

		it("scaleway_registry_list_tags callback executes", async () => {
			const cb = toolCallbacks.get("scaleway_registry_list_tags");
			const result = await cb?.({ region: "fr-par", image_id: VALID_UUID });
			expect(result).toBeDefined();
		});

		it("scaleway_registry_get_tag callback executes", async () => {
			const cb = toolCallbacks.get("scaleway_registry_get_tag");
			const result = await cb?.({ region: "fr-par", tag_id: VALID_UUID });
			expect(result).toBeDefined();
		});

		it("scaleway_registry_delete_tag callback executes", async () => {
			const cb = toolCallbacks.get("scaleway_registry_delete_tag");
			const result = await cb?.({ region: "fr-par", tag_id: VALID_UUID });
			expect(result).toBeDefined();
		});
	});
});
