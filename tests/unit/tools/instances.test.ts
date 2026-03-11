import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it, vi } from "vitest";
import { registerInstancesTools } from "../../../src/tools/instances/index.js";

describe("instances module", () => {
	it("registers all 20 tools without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");
		expect(() => registerInstancesTools(server)).not.toThrow();
		expect(toolSpy).toHaveBeenCalledTimes(20);
		vi.restoreAllMocks();
	});
});
