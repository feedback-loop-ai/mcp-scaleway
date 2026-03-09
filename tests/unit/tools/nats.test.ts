import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { registerNatsTools } from "../../../src/tools/nats/index.js";

describe("nats module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerNatsTools(server)).not.toThrow();
	});
});
