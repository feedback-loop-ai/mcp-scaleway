import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { registerInstancesTools } from "../../../src/tools/instances/index.js";

describe("instances module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerInstancesTools(server)).not.toThrow();
	});
});
