import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { registerMongodbTools } from "../../../src/tools/mongodb/index.js";

describe("mongodb module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerMongodbTools(server)).not.toThrow();
	});
});
