import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { registerIotTools } from "../../../src/tools/iot/index.js";

describe("iot module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerIotTools(server)).not.toThrow();
	});
});
