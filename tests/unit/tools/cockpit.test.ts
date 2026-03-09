import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { registerCockpitTools } from "../../../src/tools/cockpit/index.js";

describe("cockpit module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerCockpitTools(server)).not.toThrow();
	});
});
