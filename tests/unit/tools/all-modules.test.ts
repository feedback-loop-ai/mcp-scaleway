import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { registerAllTools } from "../../../src/tools/index.js";

describe("registerAllTools", () => {
	it("registers all 36 modules on a single McpServer without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerAllTools(server)).not.toThrow();
	});
});
