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

// Registration never issues a request; provide the same `{ fetch }` client shape
// the handlers rely on so an accidental call fails loudly instead of hitting the network.
vi.mock("../../../src/shared/client.js", () => ({
	createScalewayClient: vi.fn(() => ({ fetch: vi.fn() })),
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
	"scaleway_containers_list_crons",
	"scaleway_containers_create_cron",
	"scaleway_containers_update_cron",
	"scaleway_containers_delete_cron",
	"scaleway_containers_list_domains",
	"scaleway_containers_create_domain",
	"scaleway_containers_delete_domain",
];

describe("containers/index", () => {
	it("registers exactly the 17 supported container tools", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");

		registerContainersTools(server);

		expect(toolSpy).toHaveBeenCalledTimes(17);

		const registeredNames = toolSpy.mock.calls.map((call) => call[0]);
		expect(registeredNames).toEqual(EXPECTED_TOOLS);
		for (const op of ["deploy_container", "create_token", "delete_token", "redeploy_container"]) {
			expect(registeredNames).not.toContain(`scaleway_containers_${op}`);
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
