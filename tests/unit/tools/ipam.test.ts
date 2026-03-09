import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { registerIpamTools } from "../../../src/tools/ipam/index.js";

describe("ipam module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerIpamTools(server)).not.toThrow();
	});
});
