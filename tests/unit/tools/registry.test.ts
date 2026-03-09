import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { registerRegistryTools } from "../../../src/tools/registry/index.js";

describe("registry module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerRegistryTools(server)).not.toThrow();
	});
});
