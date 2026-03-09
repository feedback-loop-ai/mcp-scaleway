import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { registerAccountTools } from "../../../src/tools/account/index.js";

describe("account module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerAccountTools(server)).not.toThrow();
	});
});
