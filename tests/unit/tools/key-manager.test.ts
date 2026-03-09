import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { registerKeyManagerTools } from "../../../src/tools/key-manager/index.js";

describe("key-manager module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerKeyManagerTools(server)).not.toThrow();
	});
});
