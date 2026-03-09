import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { registerGenerativeApisTools } from "../../../src/tools/generative-apis/index.js";

describe("generative-apis module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerGenerativeApisTools(server)).not.toThrow();
	});
});
