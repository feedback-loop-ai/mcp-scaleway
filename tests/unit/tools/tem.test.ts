import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { registerTemTools } from "../../../src/tools/tem/index.js";

describe("tem module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerTemTools(server)).not.toThrow();
	});
});
