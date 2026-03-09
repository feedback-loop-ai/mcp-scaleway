import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { registerPublicGatewayTools } from "../../../src/tools/public-gateway/index.js";

describe("public-gateway module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerPublicGatewayTools(server)).not.toThrow();
	});
});
