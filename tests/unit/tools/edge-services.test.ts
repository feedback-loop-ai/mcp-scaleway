import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { registerEdgeServicesTools } from "../../../src/tools/edge-services/index.js";

describe("edge-services module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerEdgeServicesTools(server)).not.toThrow();
	});
});
