import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { registerFunctionsTools } from "../../../src/tools/functions/index.js";

describe("functions module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerFunctionsTools(server)).not.toThrow();
	});
});
