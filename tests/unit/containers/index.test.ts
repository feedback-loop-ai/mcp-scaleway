import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it, vi } from "vitest";
import { registerContainersTools } from "../../../src/tools/containers/index.js";

vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: () => ({
		accessKey: "SCWXXXXXXXXXXXXXXXXX",
		secretKey: "00000000-0000-0000-0000-000000000000",
		defaultProjectId: "00000000-0000-0000-0000-000000000001",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	}),
}));

vi.mock("../../../src/shared/client.js", () => ({
	createScalewayClient: () => ({}),
}));

const EXPECTED_TOOLS = [
	"scaleway_containers_list_namespaces",
	"scaleway_containers_get_namespace",
	"scaleway_containers_create_namespace",
	"scaleway_containers_update_namespace",
	"scaleway_containers_delete_namespace",
	"scaleway_containers_list_containers",
	"scaleway_containers_get_container",
	"scaleway_containers_create_container",
	"scaleway_containers_update_container",
	"scaleway_containers_delete_container",
	"scaleway_containers_deploy_container",
	"scaleway_containers_list_crons",
	"scaleway_containers_create_cron",
	"scaleway_containers_update_cron",
	"scaleway_containers_delete_cron",
	"scaleway_containers_list_domains",
	"scaleway_containers_create_domain",
	"scaleway_containers_delete_domain",
	"scaleway_containers_create_token",
	"scaleway_containers_delete_token",
];

describe("containers/index", () => {
	it("registers all 20 container tools", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");

		registerContainersTools(server);

		expect(toolSpy).toHaveBeenCalledTimes(20);

		const registeredNames = toolSpy.mock.calls.map((call) => call[0]);
		for (const name of EXPECTED_TOOLS) {
			expect(registeredNames).toContain(name);
		}
	});

	it("registers tools with descriptions", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");

		registerContainersTools(server);

		for (const call of toolSpy.mock.calls) {
			const description = call[1] as string;
			expect(description.length).toBeGreaterThan(10);
		}
	});

	it("registers tools with schemas and handlers", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");

		registerContainersTools(server);

		for (const call of toolSpy.mock.calls) {
			const schema = call[2];
			const handler = call[3];
			expect(schema).toBeDefined();
			expect(typeof handler).toBe("function");
		}
	});
});
