import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { registerRdbTools } from "../../../src/tools/rdb/index.js";

describe("rdb module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerRdbTools(server)).not.toThrow();
	});
});
