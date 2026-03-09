import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { registerVpcTools } from "../../../src/tools/vpc/index.js";

describe("vpc module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerVpcTools(server)).not.toThrow();
	});
});
