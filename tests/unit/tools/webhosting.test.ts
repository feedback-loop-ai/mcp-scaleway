import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { registerWebhostingTools } from "../../../src/tools/webhosting/index.js";

describe("webhosting module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerWebhostingTools(server)).not.toThrow();
	});
});
