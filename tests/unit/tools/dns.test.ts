import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { registerDnsTools } from "../../../src/tools/dns/index.js";

describe("dns module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerDnsTools(server)).not.toThrow();
	});
});
