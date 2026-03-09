import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { registerElasticMetalTools } from "../../../src/tools/elastic-metal/index.js";

describe("elastic-metal module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerElasticMetalTools(server)).not.toThrow();
	});
});
