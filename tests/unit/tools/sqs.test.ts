import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { registerSqsTools } from "../../../src/tools/sqs/index.js";

describe("sqs module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerSqsTools(server)).not.toThrow();
	});
});
