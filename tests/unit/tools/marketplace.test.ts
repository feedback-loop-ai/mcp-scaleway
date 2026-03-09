import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { registerMarketplaceTools } from "../../../src/tools/marketplace/index.js";

describe("marketplace module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerMarketplaceTools(server)).not.toThrow();
	});
});
