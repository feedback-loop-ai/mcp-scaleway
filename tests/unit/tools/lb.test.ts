import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { registerLbTools } from "../../../src/tools/lb/index.js";

describe("lb module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerLbTools(server)).not.toThrow();
	});
});
