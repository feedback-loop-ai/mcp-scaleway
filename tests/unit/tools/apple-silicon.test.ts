import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { registerAppleSiliconTools } from "../../../src/tools/apple-silicon/index.js";

describe("apple-silicon module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerAppleSiliconTools(server)).not.toThrow();
	});
});
