import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { registerSnsTools } from "../../../src/tools/sns/index.js";

describe("sns module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerSnsTools(server)).not.toThrow();
	});
});
